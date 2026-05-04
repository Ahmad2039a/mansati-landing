"use client";

import { useEffect, useRef } from "react";

/* =====================================================
   ✨ هالة ضوئية تتبع الماوس بدقة (top/left + transform centered)
   ===================================================== */
export default function CursorGlow() {
  const glowRef = useRef(null);

  useEffect(() => {
    const el = glowRef.current;
    if (!el) return;

    let rafId = 0;
    let pendingX = window.innerWidth / 2;
    let pendingY = window.innerHeight / 2;

    function apply() {
      // top/left بقيم مباشرة - الـ transform: translate(-50%,-50%) في CSS يمركز
      el.style.left = pendingX + "px";
      el.style.top = pendingY + "px";
      rafId = 0;
    }

    function onMove(e) {
      pendingX = e.clientX;
      pendingY = e.clientY;
      if (rafId) return;
      rafId = requestAnimationFrame(apply);
    }

    apply();
    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return <div ref={glowRef} className="cursor-glow" aria-hidden="true" />;
}
