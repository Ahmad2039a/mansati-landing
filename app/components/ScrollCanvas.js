"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";

/* =====================================================
   📌 FRAME STOPS CONFIGURATION
   =====================================================
   عدّل هذا الأوبجكت عشان تحدد أي فريم يتوقف عنده كل قسم.
   المفتاح = اسم القسم | القيمة = رقم الفريم (1 إلى 365)
   
   مثال: hero: 1 يعني قسم البطل يبدأ عند الفريم الأول
   ===================================================== */
const FRAME_STOPS = {
  hero: 1,        // قسم البطل - الفريم 1
  features: 153,  // قسم المميزات - الفريم 122
  pricing: 208,   // قسم الأسعار - الفريم 244
  cta: 365,       // قسم التسجيل - الفريم 365
};

/* =====================================================
   📌 TOTAL FRAMES & IMAGE PATH CONFIGURATION
   =====================================================
   عدد الفريمات الكلي ومسار الصور
   ===================================================== */
const TOTAL_FRAMES = 365;

// 🖼️ مسار مجلد الصور - غيّره إذا غيرت مكان الصور
const FRAME_PATH = "/frames/frame_";

// دالة تولد اسم ملف الصورة حسب رقم الفريم
function getFrameSrc(frameNumber) {
  const paddedNum = String(frameNumber).padStart(3, "0");
  return `${FRAME_PATH}${paddedNum}.webp`;
}

/* =====================================================
   📌 SCROLL HIJACK SETTINGS
   =====================================================
   إعدادات اختطاف السكرول
   ===================================================== */
const ANIMATION_DURATION = 1.4;  // مدة الانتقال - توازن بين السرعة والسلاسة
const COOLDOWN_MS = 1500;        // أقل لاستجابة أسرع للسكرول

export default function ScrollCanvas({ onSectionChange }) {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const currentFrameRef = useRef(0);
  const currentSectionRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const tweenRef = useRef(null);
  const onSectionChangeRef = useRef(onSectionChange);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // تحديث ref الـ callback لما يتغير
  onSectionChangeRef.current = onSectionChange;

  // رسم فريم على الكانفاس - يستخدم CSS dimensions (الـ DPR scaling مطبق على الـ context)
  const drawFrame = useCallback((canvas, ctx, img) => {
    if (!img || !img.complete || !canvas) return;

    // نستخدم clientWidth/Height (الأبعاد المنطقية) لأن الـ context مضروب بالـ DPR
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;
    const canvasRatio = cssWidth / cssHeight;
    const imgRatio = img.width / img.height;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (imgRatio > canvasRatio) {
      drawHeight = cssHeight;
      drawWidth = drawHeight * imgRatio;
      offsetX = (cssWidth - drawWidth) / 2;
      offsetY = 0;
    } else {
      drawWidth = cssWidth;
      drawHeight = drawWidth / imgRatio;
      offsetX = 0;
      offsetY = (cssHeight - drawHeight) / 2;
    }

    // جودة عالية للتكبير
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.clearRect(0, 0, cssWidth, cssHeight);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const stopValues = Object.values(FRAME_STOPS);
    const stopKeys = Object.keys(FRAME_STOPS);
    const numSections = stopKeys.length;

    // ضبط أبعاد الكانفاس مع devicePixelRatio
    // سقف 1.5 يوازن بين الجودة والأداء (DPR=2 يضاعف ذاكرة GPU 4 أضعاف ويسبب لاق)
    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const cssW = window.innerWidth;
      const cssH = window.innerHeight;

      // الأبعاد الفعلية (للحدة) أكبر من المعروضة
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      // الأبعاد المعروضة في الـ CSS تبقى منطقية
      canvas.style.width = cssW + "px";
      canvas.style.height = cssH + "px";

      // إعادة تعيين ثم scaling - عشان drawImage يعمل بإحداثيات منطقية
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      const cur = imagesRef.current[currentFrameRef.current];
      if (cur && cur.complete && cur.naturalWidth > 0) {
        drawFrame(canvas, ctx, cur);
      }
    }

    // تحميل الصور بطريقتين: أول مجموعة بسرعة (للعرض)، والباقي بالخلفية
    // الفريمات قد تحتوي على فجوات (تم نقل ~25% منها لأرشيف خارجي لتقليل حجم Repo)
    // نتعامل مع فشل التحميل بصمت، والـ tween يقفز على الفجوات تلقائياً
    async function preloadImages() {
      const images = [];
      let loaded = 0;
      const INITIAL_BATCH = 60; // نُظهر الصفحة بعد تحميل أول 60 فريم
      const promises = [];
      const initialPromises = [];

      for (let i = 1; i <= TOTAL_FRAMES; i++) {
        const promise = new Promise((resolve) => {
          const img = new Image();
          img.src = getFrameSrc(i);
          img.onload = () => {
            loaded++;
            setLoadingProgress(Math.round((loaded / TOTAL_FRAMES) * 100));
            resolve();
          };
          img.onerror = () => {
            // الفريم محذوف عن قصد (موجود في _frames-archive) — نتجاهله بصمت
            images[i - 1] = null;
            loaded++;
            setLoadingProgress(Math.round((loaded / TOTAL_FRAMES) * 100));
            resolve();
          };
          images[i - 1] = img;
        });
        promises.push(promise);
        if (i <= INITIAL_BATCH) initialPromises.push(promise);
      }

      // ننتظر المجموعة الأولى فقط لإطلاق الواجهة
      await Promise.all(initialPromises);
      // الباقي يكمل بالخلفية
      Promise.all(promises).catch(() => {});
      return images;
    }

    // إيجاد أقرب فريم متاح (للتعامل مع الفريمات المنقولة للأرشيف)
    function findAvailableImage(frameIndex) {
      const imgs = imagesRef.current;
      // البحث للأمام أولاً (الـ tween عادة يتقدم)
      for (let offset = 0; offset < 5; offset++) {
        const fwd = frameIndex + offset;
        if (fwd < imgs.length && imgs[fwd] && imgs[fwd].complete && imgs[fwd].naturalWidth > 0) {
          return imgs[fwd];
        }
        const bwd = frameIndex - offset;
        if (bwd >= 0 && imgs[bwd] && imgs[bwd].complete && imgs[bwd].naturalWidth > 0) {
          return imgs[bwd];
        }
      }
      return null;
    }

    /**
     * 📌 انتقال لقسم معين مع أنيميشن الفريمات
     * يتحرك بين الفريم الحالي والفريم المستهدف بحركة سلسة
     */
    function goToSection(sectionIndex) {
      if (sectionIndex < 0 || sectionIndex >= numSections) return;
      if (isAnimatingRef.current) return;

      isAnimatingRef.current = true;
      currentSectionRef.current = sectionIndex;
      if (onSectionChangeRef.current) onSectionChangeRef.current(sectionIndex);

      const targetFrame = stopValues[sectionIndex] - 1; // تحويل لـ 0-indexed
      const startFrame = currentFrameRef.current;

      // إلغاء أي أنيميشن سابقة
      if (tweenRef.current) {
        tweenRef.current.kill();
      }

      const animObj = { frame: startFrame };

      tweenRef.current = gsap.to(animObj, {
        frame: targetFrame,
        duration: ANIMATION_DURATION,
        ease: "power1.inOut", // متناظر - لا تباطؤ زائد في النهاية
        onUpdate: () => {
          // snap-to-target في آخر 2-3 فريم لتجنب الـ drops البصرية في النهاية
          const remaining = Math.abs(targetFrame - animObj.frame);
          const f = remaining < 2.5 ? targetFrame : Math.round(animObj.frame);
          if (f !== currentFrameRef.current) {
            const img = imagesRef.current[f] && imagesRef.current[f].complete && imagesRef.current[f].naturalWidth > 0
              ? imagesRef.current[f]
              : findAvailableImage(f); // fallback للفريمات المنقولة للأرشيف
            if (img) {
              currentFrameRef.current = f;
              drawFrame(canvas, ctx, img);
            }
          }
        },
        onComplete: () => {
          currentFrameRef.current = targetFrame;
          const img = imagesRef.current[targetFrame] && imagesRef.current[targetFrame].complete && imagesRef.current[targetFrame].naturalWidth > 0
            ? imagesRef.current[targetFrame]
            : findAvailableImage(targetFrame);
          if (img) {
            drawFrame(canvas, ctx, img);
          }
          // قفل لفترة قصيرة بعد نهاية الأنيميشن
          setTimeout(() => {
            isAnimatingRef.current = false;
          }, COOLDOWN_MS - ANIMATION_DURATION * 1000);
        },
      });
    }

    /**
     * 📌 اختطاف السكرول (Scroll Hijack)
     * يمنع السكرول العادي ويستبدله بانتقال بين الأقسام
     */
    function handleWheel(e) {
      e.preventDefault();

      if (isAnimatingRef.current) return;

      if (e.deltaY > 0) {
        // نزول - القسم التالي
        const next = currentSectionRef.current + 1;
        if (next < numSections) {
          goToSection(next);
        }
      } else if (e.deltaY < 0) {
        // صعود - القسم السابق
        const prev = currentSectionRef.current - 1;
        if (prev >= 0) {
          goToSection(prev);
        }
      }
    }

    /**
     * 📌 دعم اللمس على الجوال (Touch Hijack)
     */
    let touchStartY = 0;
    function handleTouchStart(e) {
      touchStartY = e.touches[0].clientY;
    }

    function handleTouchEnd(e) {
      if (isAnimatingRef.current) return;

      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;

      // حد أدنى للحركة عشان ما يتفعل بالغلط
      if (Math.abs(diff) < 50) return;

      if (diff > 0) {
        // سحب لفوق = نزول
        const next = currentSectionRef.current + 1;
        if (next < numSections) {
          goToSection(next);
        }
      } else {
        // سحب لتحت = صعود
        const prev = currentSectionRef.current - 1;
        if (prev >= 0) {
          goToSection(prev);
        }
      }
    }

    /**
     * 📌 دعم لوحة المفاتيح
     */
    function handleKeyDown(e) {
      if (isAnimatingRef.current) return;

      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        const next = currentSectionRef.current + 1;
        if (next < numSections) goToSection(next);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        const prev = currentSectionRef.current - 1;
        if (prev >= 0) goToSection(prev);
      }
    }

    // تهيئة
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    preloadImages().then((images) => {
      imagesRef.current = images;
      setIsLoaded(true);

      // رسم أول فريم (frame_001 = keyframe الأساسي للـ hero، مضمون موجود)
      const firstImg = images[0] && images[0].complete && images[0].naturalWidth > 0
        ? images[0]
        : null;
      if (firstImg) {
        drawFrame(canvas, ctx, firstImg);
      }

      // 📌 تفعيل اختطاف السكرول
      window.addEventListener("wheel", handleWheel, { passive: false });
      window.addEventListener("touchstart", handleTouchStart, { passive: true });
      window.addEventListener("touchend", handleTouchEnd, { passive: true });
      window.addEventListener("keydown", handleKeyDown);

      // 📌 الاستماع لأحداث الانتقال من الخارج (مثل الـ dots)
      function handleGoToSectionEvent(e) {
        goToSection(e.detail);
      }
      window.addEventListener("goToSection", handleGoToSectionEvent);

      // حفظ الدالة عشان نشيلها عند التنظيف
      window._goToSectionHandler = handleGoToSectionEvent;
    });

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
      if (window._goToSectionHandler) {
        window.removeEventListener("goToSection", window._goToSectionHandler);
      }
      if (tweenRef.current) tweenRef.current.kill();
    };
  }, [drawFrame]);

  return (
    <>
      {/* Loading Overlay */}
      <div className={`loading-overlay ${isLoaded ? "loaded" : ""}`}>
        <div className="loading-logo">م</div>
        <div className="loading-spinner" />
        <p
          style={{
            marginTop: "1.25rem",
            color: "var(--text-secondary)",
            fontSize: "0.92rem",
            fontFamily: "var(--font-noto-kufi)",
            fontWeight: 600,
          }}
        >
          جاري تحضير التجربة
        </p>
        <p
          style={{
            marginTop: "0.4rem",
            color: "var(--text-muted)",
            fontSize: "0.78rem",
            fontFamily: "var(--font-noto-kufi)",
            fontFeatureSettings: "'tnum'",
          }}
        >
          {loadingProgress}%
        </p>

        {/* شريط التقدم */}
        <div
          style={{
            marginTop: "1rem",
            width: "220px",
            height: "3px",
            borderRadius: "2px",
            background: "rgba(255,255,255,0.06)",
            overflow: "hidden",
            border: "1px solid rgba(255, 255, 255, 0.04)",
          }}
        >
          <div
            style={{
              width: `${loadingProgress}%`,
              height: "100%",
              background: "var(--gradient-primary)",
              borderRadius: "2px",
              transition: "width 0.25s ease",
              boxShadow: "0 0 12px rgba(16, 185, 129, 0.5)",
            }}
          />
        </div>
      </div>

      {/* الكانفاس الثابت - بدون overlays ثقيلة */}
      <div className="canvas-container">
        <canvas ref={canvasRef} />
        {/* Vignette خفيف فقط على الحواف للعمق */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, transparent 50%, rgba(5, 6, 20, 0.25) 90%, rgba(5, 6, 20, 0.6) 100%)",
            pointerEvents: "none",
          }}
        />
      </div>
    </>
  );
}

// نصدر FRAME_STOPS عشان الصفحة الرئيسية تستخدمها
export { FRAME_STOPS };
