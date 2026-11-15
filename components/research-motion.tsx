"use client";
import { useEffect, useRef, type ReactNode } from "react";

/** A short entrance per visible row, only when opening a Research view. */
export default function ResearchMotion({ viewKey, children }: { viewKey: string; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches || !root.current || !root.current.animate) return;
    const rows = [...root.current.querySelectorAll<HTMLElement>(".research-mode, .research-form > *, .keyword-input-row, .dimension-shell > *, .research-recent-list > button, .research-history-entry, .result-row")];
    const animations = rows.filter(row => row.getClientRects().length && !row.contains(document.activeElement)).map((row, index) => row.animate(
      [{ opacity: .5, transform: "translateY(6px)" }, { opacity: 1, transform: "translateY(0)" }],
      { duration: 160, delay: Math.min(index * 18, 90), easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" }
    ));
    const cancel = () => animations.forEach(animation => animation.cancel());
    reduced.addEventListener("change", cancel);
    return () => { cancel(); reduced.removeEventListener("change", cancel); };
  }, [viewKey]);
  return <div ref={root} className="research-page">{children}</div>;
}
