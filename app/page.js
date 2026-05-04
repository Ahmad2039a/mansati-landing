"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import ScrollCanvas from "./components/ScrollCanvas";
import CursorGlow from "./components/CursorGlow";
import {
  IconScan, IconChart, IconShield, IconUsers, IconLightning,
  IconArrowLeft, IconSparkle, IconLock, IconWhatsapp, IconPhone, IconStar,
  IconBuilding, IconCheckBadge, Logo,
} from "./components/Icons";

/* =====================================================
   🎯 بيانات
   ===================================================== */
const SECTION_LABELS = ["الرئيسية", "المميزات", "الأسعار", "ابدأ"];

const FEATURES = [
  { icon: IconWhatsapp, tone: "emerald", title: "تنبيهات واتساب", desc: "إشعارات لحظية قبل انتهاء أي سجل أو رخصة." },
  { icon: IconScan, tone: "cyan", title: "قراءة ذكية", desc: "تحليل تلقائي للسجلات واستخراج البيانات بدقة." },
  { icon: IconChart, tone: "violet", title: "حاسبة نطاقات", desc: "اعرف نطاق منشأتك وعدد الموظفين المطلوب." },
  { icon: IconShield, tone: "emerald", title: "حماية بنكية", desc: "تشفير AES-256 ونسخ احتياطي يومي آمن." },
  { icon: IconUsers, tone: "violet", title: "إدارة الموظفين", desc: "تتبع الإقامات والتأشيرات بكل سهولة." },
  { icon: IconLightning, tone: "gold", title: "تكامل سريع", desc: "ربط مع الجهات الحكومية في أقل من 5 دقائق." },
];

const PARTNERS = ["وزارة التجارة", "أبشر", "نطاقات", "GOSI"];

/* =====================================================
   🏗️ Home
   ===================================================== */
export default function Home() {
  const [activeSection, setActiveSection] = useState(0);
  const [billingPeriod, setBillingPeriod] = useState("monthly");

  const handleSectionChange = useCallback((sectionIndex) => {
    setActiveSection(sectionIndex);
  }, []);

  const goToSection = useCallback((index) => {
    window.dispatchEvent(new CustomEvent("goToSection", { detail: index }));
  }, []);

  return (
    <div style={{ overflow: "hidden", height: "100vh" }}>
      <ScrollCanvas onSectionChange={handleSectionChange} />
      <div className="bg-mesh" />
      <div className="bg-noise" />
      <CursorGlow />

      <TopNav activeSection={activeSection} goToSection={goToSection} />
      <SectionIndicator activeSection={activeSection} goToSection={goToSection} />

      <div className="section-counter">
        <span className="num">0{activeSection + 1}</span>
        <span className="divider" />
        <span>0{SECTION_LABELS.length}</span>
        <span style={{ marginRight: "0.5rem" }}>{SECTION_LABELS[activeSection]}</span>
      </div>

      <div className="scroll-hint" style={{ opacity: activeSection === 0 ? 0.65 : 0 }}>
        <span>اسحب للأسفل</span>
        <div className="mouse" />
      </div>

      <SectionWrapper id="hero" active={activeSection === 0} index={0} current={activeSection}>
        <HeroSection goToSection={goToSection} active={activeSection === 0} />
      </SectionWrapper>

      <SectionWrapper id="features" active={activeSection === 1} index={1} current={activeSection}>
        <FeaturesSection />
      </SectionWrapper>

      <SectionWrapper id="pricing" active={activeSection === 2} index={2} current={activeSection}>
        <PricingSection
          billingPeriod={billingPeriod}
          setBillingPeriod={setBillingPeriod}
          goToSection={goToSection}
        />
      </SectionWrapper>

      <SectionWrapper id="cta" active={activeSection === 3} index={3} current={activeSection}>
        <CTASection />
      </SectionWrapper>
    </div>
  );
}

/* =====================================================
   📦 SectionWrapper - يضيف class section-active + يعيد تشغيل الحركات
   ===================================================== */
function SectionWrapper({ id, active, index, current, children }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!active || !ref.current) return;
    // عند تنشيط القسم: نعيد تشغيل CSS animations بطريقة محسنة للأداء
    const els = Array.from(ref.current.querySelectorAll(".reveal"));
    
    // 1. إزالة الأنيميشن من الجميع (DOM Write)
    els.forEach((el) => {
      el.style.animation = "none";
    });
    
    // 2. Force reflow مرة واحدة فقط للقسم كامل (DOM Read) لتجنب الـ Layout Thrashing
    void ref.current.offsetHeight;
    
    // 3. إعادة الأنيميشن للجميع (DOM Write)
    els.forEach((el) => {
      el.style.animation = "";
    });
  }, [active]);

  return (
    <section
      ref={ref}
      id={id}
      className={active ? "section-active" : ""}
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 10,
        opacity: active ? 1 : 0,
        transform: active
          ? "translateY(0) scale(1)"
          : current < index
          ? "translateY(30px) scale(0.985)"
          : "translateY(-30px) scale(0.985)",
        transition: "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        willChange: "transform, opacity", // إجبار الـ GPU على معالجة الانتقال
        pointerEvents: active ? "auto" : "none",
        overflowY: "auto",
        overflowX: "hidden",
        padding: "6rem 1.25rem 2rem", // مساحة كافية للـ Navbar
      }}
    >
      <div style={{ margin: "auto 0", width: "100%", display: "flex", justifyContent: "center" }}>
        {children}
      </div>
    </section>
  );
}

/* =====================================================
   🧭 Top Nav
   ===================================================== */
function TopNav({ activeSection, goToSection }) {
  const links = [
    { label: "الرئيسية", index: 0 },
    { label: "المميزات", index: 1 },
    { label: "الأسعار", index: 2 },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        top: "1.1rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        padding: "0.45rem 0.5rem 0.45rem 1.25rem",
        width: "min(94%, 760px)",
        borderRadius: "9999px",
        background: "rgba(5, 6, 20, 0.85)",
        border: "1px solid rgba(255, 255, 255, 0.07)",
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
      }}
    >
      <button
        onClick={() => goToSection(0)}
        style={{
          display: "flex", alignItems: "center", gap: "0.6rem",
          background: "transparent", border: "none", cursor: "pointer", padding: 0,
          fontFamily: "inherit",
        }}
      >
        <Logo size={30} />
        <span style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-primary)" }}>منصتي</span>
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: "0.15rem" }}>
        {links.map((link) => (
          <button
            key={link.index}
            onClick={() => goToSection(link.index)}
            className={`nav-link ${activeSection === link.index ? "active" : ""}`}
            style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "0.85rem" }}
          >
            {link.label}
          </button>
        ))}
      </div>

      <MagneticButton
        onClick={() => goToSection(3)}
        className="btn-primary"
        style={{ padding: "0.5rem 1.1rem", fontSize: "0.82rem", animation: "none" }}
      >
        ابدأ الآن
        <IconArrowLeft width={13} height={13} />
      </MagneticButton>
    </nav>
  );
}

/* =====================================================
   🦸 Hero
   ===================================================== */
function HeroSection({ goToSection, active }) {
  return (
    <div style={{ maxWidth: "880px", width: "100%", textAlign: "center" }}>
      <h1
        className="reveal reveal-2 text-shadow-soft"
        style={{
          fontSize: "clamp(2rem, 5.2vw, 3.75rem)",
          fontWeight: 800,
          lineHeight: 1.18,
          letterSpacing: "-0.025em",
          color: "var(--text-primary)",
          marginBottom: "1.1rem",
        }}
      >
        أدر التزاماتك الحكومية
        <br />
        <span className="text-aurora">وتجنب الغرامات</span>
        <span style={{ color: "var(--text-primary)" }}> بضغطة زر</span>
      </h1>

      <p
        className="reveal reveal-3 text-shadow-strong"
        style={{
          fontSize: "clamp(0.95rem, 1.4vw, 1.1rem)",
          lineHeight: 1.7,
          color: "#e2e8f0",
          maxWidth: "560px",
          margin: "0 auto 1.85rem",
          fontWeight: 500,
        }}
      >
        منصة متكاملة تربط سجلاتك ورخصك وإقاماتك في مكان واحد.
        تنبيهات ذكية، حاسبة نطاقات، وتقارير لحظية.
      </p>

      <div
        className="reveal reveal-4"
        style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "2.25rem" }}
      >
        <MagneticButton onClick={() => goToSection(3)} className="btn-primary">
          <IconSparkle width={17} height={17} />
          تجربة مجانية
        </MagneticButton>
        <MagneticButton onClick={() => goToSection(1)} className="btn-secondary">
          استكشف
          <IconArrowLeft width={15} height={15} />
        </MagneticButton>
      </div>

      {/* Stats panel */}
      <div
        className="reveal reveal-5"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "1.75rem",
          padding: "0.95rem 1.85rem",
          borderRadius: "9999px",
          background: "rgba(5, 6, 20, 0.85)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 16px 50px rgba(0, 0, 0, 0.35)",
        }}
      >
        <Stat value={500} suffix="+" label="منشأة مسجلة" active={active} />
        <div className="stat-divider" />
        <Stat value={99.9} suffix="%" label="وقت التشغيل" active={active} decimals={1} />
        <div className="stat-divider" />
        <Stat value={24} suffix="/7" label="دعم فني" active={active} />
      </div>

      <div
        className="reveal reveal-6"
        style={{
          marginTop: "1.25rem",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.85rem",
            flexWrap: "wrap",
            padding: "0.5rem 1rem 0.5rem 1.15rem",
            borderRadius: "9999px",
            background: "rgba(8, 11, 26, 0.85)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div className="avatar-group">
            <div className="avatar">أ</div>
            <div className="avatar">م</div>
            <div className="avatar">س</div>
            <div className="avatar">ك</div>
          </div>
          <span style={{ width: "1px", height: "16px", background: "rgba(255, 255, 255, 0.15)" }} />
          <div style={{ display: "flex", gap: "0.18rem" }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <IconStar key={i} width={12} height={12} style={{ color: "#fbbf24", filter: "drop-shadow(0 0 4px rgba(251,191,36,0.5))" }} />
            ))}
          </div>
          <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 500 }}>
            <strong style={{ color: "var(--text-primary)", fontWeight: 700 }}>500+</strong> منشأة تثق بنا
          </span>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   📊 Stat (counter animation)
   ===================================================== */
function Stat({ value, suffix = "", label, active, decimals = 0 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!active) {
      setDisplay(0);
      return;
    }
    const duration = 1500;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, value]);

  return (
    <div className="stat-card">
      <div className="stat-num">
        {decimals ? display.toFixed(decimals) : Math.round(display)}
        {suffix}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

/* =====================================================
   ⭐ Features
   ===================================================== */
function FeaturesSection() {
  return (
    <div style={{ maxWidth: "1100px", width: "100%" }}>
      <div className="reveal reveal-1 text-shadow-soft" style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, marginBottom: "0.75rem" }}>
          كل ما تحتاجه في <span className="text-aurora">منصة واحدة</span>
        </h2>
        <p className="text-shadow-strong" style={{ fontSize: "0.98rem", color: "#e2e8f0", maxWidth: "520px", margin: "0 auto", lineHeight: 1.65, fontWeight: 500 }}>
          أدوات ذكية مصممة خصيصاً للسوق السعودي
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "0.95rem",
        }}
      >
        {FEATURES.map((f, i) => (
          <TiltCard key={i} className={`reveal reveal-${i + 2}`}>
            <FeatureCard feature={f} />
          </TiltCard>
        ))}
      </div>

      <div className="reveal reveal-8 logos-strip">
        <span style={{ fontSize: "0.74rem", color: "var(--text-faint)", letterSpacing: "0.05em" }}>متكامل مع</span>
        {PARTNERS.map((p, i) => (
          <div key={i} className="logo-item">
            <IconBuilding width={14} height={14} />
            <span>{p}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureCard({ feature }) {
  const Icon = feature.icon;
  const toneClass =
    feature.tone === "violet" ? "feature-icon-violet"
    : feature.tone === "cyan" ? "feature-icon-cyan"
    : feature.tone === "gold" ? "feature-icon-gold"
    : "";
  return (
    <div className="glass-card" style={{ padding: "1.4rem", height: "100%" }}>
      <div className={`feature-icon ${toneClass}`}>
        <Icon width={20} height={20} />
      </div>
      <h3 style={{ fontSize: "1.02rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.4rem", letterSpacing: "-0.01em" }}>
        {feature.title}
      </h3>
      <p style={{ color: "var(--text-secondary)", lineHeight: 1.65, fontSize: "0.86rem" }}>
        {feature.desc}
      </p>
    </div>
  );
}

/* =====================================================
   💰 Pricing
   ===================================================== */
function PricingSection({ billingPeriod, setBillingPeriod, goToSection }) {
  const isYearly = billingPeriod === "yearly";

  const plans = [
    {
      name: "المبتدئة", desc: "للأفراد",
      monthly: 0, yearly: 0, featured: false,
      features: ["سجل تجاري واحد", "تنبيهات بريد إلكتروني", "لوحة أساسية", "حتى 5 موظفين"],
      cta: "ابدأ مجاناً",
    },
    {
      name: "المتقدمة", desc: "للمنشآت المتوسطة",
      monthly: 199, yearly: 1990, featured: true,
      features: ["سجلات غير محدودة", "تنبيهات واتساب + بريد", "حاسبة نطاقات", "قراءة ذكية", "موظفين بلا حدود", "دعم أولوية"],
      cta: "ابدأ الآن",
    },
    {
      name: "المؤسسية", desc: "للشركات الكبيرة",
      monthly: 599, yearly: 5990, featured: false,
      features: ["كل المتقدمة", "API مخصص", "مدير حساب", "تكامل ERP/HR", "تقارير متقدمة", "SLA 99.9%"],
      cta: "تواصل",
    },
  ];

  return (
    <div style={{ maxWidth: "1080px", width: "100%" }}>
      <div className="reveal reveal-1 text-shadow-soft" style={{ textAlign: "center", marginBottom: "1rem" }}>
        <h2
          style={{
            fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)",
            fontWeight: 800,
            color: "var(--text-primary)",
            lineHeight: 1.2,
            letterSpacing: "-0.025em",
            marginBottom: "0.4rem",
          }}
        >
          خطط مرنة <span className="text-aurora">تناسب احتياجك</span>
        </h2>
        <p className="text-shadow-strong" style={{ fontSize: "0.9rem", color: "#e2e8f0", maxWidth: "440px", margin: "0 auto", lineHeight: 1.6, fontWeight: 500 }}>
          ابدأ مجاناً وترقَّ في أي وقت
        </p>
      </div>

      <div className="reveal reveal-2" style={{ display: "flex", justifyContent: "center", marginBottom: "1.2rem" }}>
        <BillingToggle period={billingPeriod} setPeriod={setBillingPeriod} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "0.8rem",
          alignItems: "stretch",
        }}
      >
        {plans.map((plan, i) => (
          <div key={i} className={`reveal reveal-${i + 3}`} style={{ display: "flex" }}>
            <PricingCard plan={plan} isYearly={isYearly} goToSection={goToSection} />
          </div>
        ))}
      </div>

      <p
        className="reveal reveal-7"
        style={{
          textAlign: "center",
          marginTop: "1rem",
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.4rem",
        }}
      >
        <IconLock width={13} height={13} />
        دفع آمن • إلغاء بأي وقت • فاتورة ضريبية
      </p>
    </div>
  );
}

function BillingToggle({ period, setPeriod }) {
  const containerRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ right: 0, width: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const buttons = containerRef.current.querySelectorAll("button");
    const activeBtn = period === "monthly" ? buttons[0] : buttons[1];
    if (activeBtn) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      // RTL: نحسب من اليمين
      const right = containerRect.right - btnRect.right;
      setIndicatorStyle({ right: `${right}px`, width: `${btnRect.width}px` });
    }
  }, [period]);

  return (
    <div ref={containerRef} className="billing-toggle">
      <span
        className="indicator"
        style={{
          right: indicatorStyle.right,
          width: indicatorStyle.width,
        }}
      />
      <button className={period === "monthly" ? "active" : ""} onClick={() => setPeriod("monthly")}>
        شهري
      </button>
      <button className={period === "yearly" ? "active" : ""} onClick={() => setPeriod("yearly")}>
        سنوي
        <span className="savings-tag">−17%</span>
      </button>
    </div>
  );
}

function PricingCard({ plan, isYearly, goToSection }) {
  const price = isYearly ? plan.yearly : plan.monthly;
  const isFree = price === 0;
  const periodLabel = isYearly ? "سنوياً" : "شهرياً";

  return (
    <div
      className={`glass-card ${plan.featured ? "pricing-popular" : ""}`}
      style={{ padding: "1.25rem 1.1rem", display: "flex", flexDirection: "column", position: "relative", width: "100%" }}
    >
      {plan.featured && (
        <div style={{ position: "absolute", top: "0.8rem", left: "0.8rem", zIndex: 2 }}>
          <span className="badge-pill badge-popular">الأكثر طلباً</span>
        </div>
      )}

      {plan.featured && (
        <>
          <div className="glow-orb glow-orb-emerald animate-orb-float" style={{ width: "140px", height: "140px", top: "-40px", right: "-40px", position: "absolute" }} />
          <div className="glow-orb glow-orb-violet animate-orb-float" style={{ width: "120px", height: "120px", bottom: "-30px", left: "-30px", position: "absolute", animationDelay: "3s" }} />
        </>
      )}

      <div style={{ marginBottom: "0.75rem", marginTop: plan.featured ? "1rem" : 0, position: "relative", zIndex: 1 }}>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.2rem" }}>
          {plan.name}
        </h3>
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{plan.desc}</p>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: "0.35rem", marginBottom: "1.2rem", position: "relative", zIndex: 1, minHeight: "2.6rem" }}>
        {isFree ? (
          <span className="price-num">مجاناً</span>
        ) : (
          <>
            <span className={`price-num ${plan.featured ? "price-num-featured" : ""}`}>
              {price.toLocaleString("ar-SA")}
            </span>
            <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: 500 }}>
              ر.س / {periodLabel}
            </span>
          </>
        )}
      </div>

      <ul className="check-list" style={{ marginBottom: "0.85rem", flex: 1, position: "relative", zIndex: 1 }}>
        {plan.features.map((f, j) => (<li key={j}>{f}</li>))}
      </ul>

      <MagneticButton
        onClick={() => goToSection(3)}
        className={plan.featured ? "btn-primary" : "btn-secondary"}
        style={{ width: "100%", justifyContent: "center", padding: "0.6rem", fontSize: "0.85rem", position: "relative", zIndex: 1 }}
      >
        {plan.cta}
        <IconArrowLeft width={14} height={14} />
      </MagneticButton>
    </div>
  );
}

/* =====================================================
   🔐 CTA
   ===================================================== */
function CTASection() {
  const [phone, setPhone] = useState("");

  return (
    <div style={{ maxWidth: "640px", width: "100%" }}>
      <div className="reveal reveal-1 glass-card" style={{ padding: "2.25rem 2rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div className="glow-orb glow-orb-emerald animate-orb-float" style={{ width: "240px", height: "240px", top: "-80px", right: "-80px", position: "absolute" }} />
        <div className="glow-orb glow-orb-violet animate-orb-float" style={{ width: "200px", height: "200px", bottom: "-60px", left: "-60px", position: "absolute", animationDelay: "2s" }} />
        <div className="glow-orb glow-orb-cyan animate-orb-float" style={{ width: "160px", height: "160px", top: "50%", left: "50%", transform: "translate(-50%, -50%)", position: "absolute", animationDelay: "1s" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            className="reveal reveal-2"
            style={{
              width: "3.75rem",
              height: "3.75rem",
              margin: "0 auto 1.15rem",
              borderRadius: "1.15rem",
              background: "var(--gradient-primary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff",
              boxShadow: "0 12px 40px rgba(16, 185, 129, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.25)",
              animation: "pulseGlow 3s ease-in-out infinite",
            }}
          >
            <IconSparkle width={24} height={24} />
          </div>

          <h2
            className="reveal reveal-3 text-shadow-soft"
            style={{
              fontSize: "clamp(1.45rem, 3.4vw, 2.1rem)",
              fontWeight: 800,
              color: "var(--text-primary)",
              lineHeight: 1.25,
              letterSpacing: "-0.02em",
              marginBottom: "0.7rem",
            }}
          >
            ابدأ رحلتك مع <span className="text-aurora">منصتي</span>
            <br />
            وكن دائماً على اطلاع
          </h2>

          <p
            className="reveal reveal-4 text-shadow-soft"
            style={{ fontSize: "0.95rem", color: "var(--text-secondary)", maxWidth: "420px", margin: "0 auto 1.5rem", lineHeight: 1.65 }}
          >
            أنشئ حسابك في أقل من دقيقة - بدون بطاقة ائتمان
          </p>

          <form
            className="reveal reveal-5"
            onSubmit={(e) => {
              e.preventDefault();
              alert(`جاري التسجيل: ${phone}`);
            }}
            style={{ display: "flex", gap: "0.4rem", maxWidth: "400px", margin: "0 auto 1rem", flexWrap: "wrap" }}
          >
            <div
              style={{
                display: "flex", alignItems: "center", flex: 1, minWidth: "180px",
                background: "rgba(8, 11, 26, 0.85)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "9999px",
                padding: "0.15rem 0.35rem 0.15rem 0.95rem",
                gap: "0.55rem",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
              }}
            >
              <IconPhone width={15} height={15} style={{ color: "var(--primary-300)" }} />
              <input
                type="tel"
                placeholder="05xxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--text-primary)",
                  fontFamily: "inherit",
                  fontSize: "0.95rem",
                  padding: "0.55rem 0",
                  direction: "ltr",
                  textAlign: "right",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                }}
              />
            </div>
            <MagneticButton type="submit" className="btn-primary" style={{ padding: "0.6rem 1.3rem", fontSize: "0.88rem" }}>
              تسجيل
              <IconArrowLeft width={14} height={14} />
            </MagneticButton>
          </form>

          <div className="reveal reveal-6" style={{ display: "flex", alignItems: "center", gap: "0.7rem", maxWidth: "260px", margin: "0.85rem auto" }}>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, transparent, rgba(255,255,255,0.12), transparent)" }} />
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>أو</span>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, transparent, rgba(255,255,255,0.12), transparent)" }} />
          </div>

          <button className="reveal reveal-6 btn-secondary" style={{ padding: "0.65rem 1.4rem", fontSize: "0.88rem" }}>
            تسجيل الدخول لحساب موجود
          </button>

          <div
            className="reveal reveal-7"
            style={{
              marginTop: "1.5rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.85rem",
              flexWrap: "wrap",
              padding: "0.55rem 1rem",
              borderRadius: "9999px",
              background: "rgba(8, 11, 26, 0.85)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
            }}
          >
            <TrustItem icon={IconLock} text="تشفير AES-256" />
            <span style={{ width: "1px", height: "14px", background: "rgba(255, 255, 255, 0.15)" }} />
            <TrustItem icon={IconShield} text="حماية SSL" />
            <span style={{ width: "1px", height: "14px", background: "rgba(255, 255, 255, 0.15)" }} />
            <TrustItem icon={IconCheckBadge} text="معتمد رسمياً" />
          </div>
        </div>
      </div>

      <p className="reveal reveal-8" style={{ textAlign: "center", marginTop: "1.15rem", fontSize: "0.74rem", color: "var(--text-faint)", lineHeight: 1.6 }}>
        © {new Date().getFullYear()} منصتي · جميع الحقوق محفوظة · المملكة العربية السعودية
      </p>
    </div>
  );
}

function TrustItem({ icon: Icon, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-secondary)", fontSize: "0.76rem", fontWeight: 500 }}>
      <Icon width={13} height={13} style={{ color: "var(--primary-300)" }} />
      <span>{text}</span>
    </div>
  );
}

/* =====================================================
   📍 Section Indicator
   ===================================================== */
function SectionIndicator({ activeSection, goToSection }) {
  return (
    <div className="section-indicator">
      {SECTION_LABELS.map((label, i) => (
        <button
          key={i}
          onClick={() => goToSection(i)}
          className={`section-dot ${activeSection === i ? "active" : ""}`}
          aria-label={label}
        >
          <span className="label">{label}</span>
        </button>
      ))}
    </div>
  );
}

/* =====================================================
   🧲 Magnetic Button (مع rAF throttling لتقليل اللاق)
   ===================================================== */
function MagneticButton({ children, className, style, onClick, type = "button" }) {
  const ref = useRef(null);
  const rafRef = useRef(0);
  const targetRef = useRef({ x: 0, y: 0 });

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    targetRef.current.x = (e.clientX - rect.left - rect.width / 2) * 0.18;
    targetRef.current.y = (e.clientY - rect.top - rect.height / 2) * 0.22;
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      const node = ref.current;
      if (node) {
        node.style.transform = `translate(${targetRef.current.x}px, ${targetRef.current.y}px)`;
      }
      rafRef.current = 0;
    });
  };

  const handleLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    const el = ref.current;
    if (el) el.style.transform = "translate(0, 0)";
  };

  return (
    <button
      ref={ref}
      type={type}
      className={className}
      style={{ ...style, transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)", willChange: "transform" }}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </button>
  );
}

/* =====================================================
   🃏 TiltCard (مع rAF throttling)
   ===================================================== */
function TiltCard({ children, className }) {
  const ref = useRef(null);
  const rafRef = useRef(0);
  const targetRef = useRef({ rx: 0, ry: 0 });

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    targetRef.current.rx = (((e.clientY - rect.top) / rect.height) - 0.5) * -6;
    targetRef.current.ry = (((e.clientX - rect.left) / rect.width) - 0.5) * 6;
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      const node = ref.current;
      if (node) {
        const { rx, ry } = targetRef.current;
        node.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      }
      rafRef.current = 0;
    });
  };

  const handleLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    const el = ref.current;
    if (el) el.style.transform = "perspective(900px) rotateX(0) rotateY(0)";
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{ transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)", willChange: "transform" }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </div>
  );
}
