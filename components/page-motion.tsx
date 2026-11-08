"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Animate the existing DOM on navigation, without keying/remounting its forms. */
export default function PageMotion({ pageKey, children }: { pageKey: string | number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!element || reduced.matches || !element.animate) return;
    const animation = element.animate([{ opacity: .65, transform: "translateY(7px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 230, easing: "cubic-bezier(.2,.7,.2,1)" });
    const cancel = () => animation.cancel();
    reduced.addEventListener("change", cancel);
    return () => { animation.cancel(); reduced.removeEventListener("change", cancel); };
  }, [pageKey]);
  return <div className="page-motion" ref={ref}>{children}</div>;
}
