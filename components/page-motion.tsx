"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Animate the existing DOM on navigation, without keying/remounting its forms. */
export default function PageMotion({ pageKey, children }: { pageKey: string | number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!element || reduced.matches || !element.animate) return;
    const animations = [element.animate([{ opacity: .65, transform: "translateY(7px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 230, easing: "cubic-bezier(.2,.7,.2,1)" })];
    const mark = element.querySelector(".creator-page-mark");
    if (mark) animations.push(mark.animate([{ transform: "scale(.92) rotate(-5deg)" }, { transform: "scale(1) rotate(0)" }], { duration: 350, easing: "cubic-bezier(.22,1,.36,1)" }));
    // Navigation only: background refreshes and typing never replay this motion.
    element.querySelectorAll(".creation-fields > .create-card, .persona-preview > section, .insight-metrics > article, .automation-type-tabs > button").forEach((card, index) => {
      if (index < 6) animations.push(card.animate([{ transform: "translateY(6px)" }, { transform: "translateY(0)" }], { duration: 280, delay: index * 25, easing: "cubic-bezier(.22,1,.36,1)" }));
    });
    const cancel = () => animations.forEach(animation => animation.cancel());
    reduced.addEventListener("change", cancel);
    return () => { cancel(); reduced.removeEventListener("change", cancel); };
  }, [pageKey]);
  return <div className="page-motion" ref={ref}>{children}</div>;
}
