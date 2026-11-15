"use client";

import type { ReactNode } from "react";

export function focusCreatorSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  if (target instanceof HTMLDetailsElement) target.open = true;
  target.focus({ preventScroll: true });
  target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
}

/** In-page navigation keeps uncontrolled form inputs mounted and their drafts intact. */
export default function CreatorSectionNav({ label, sections, children }: {
  label: string; sections: { id: string; label: string; icon: ReactNode }[]; children?: ReactNode;
}) {
  return <nav className="creator-section-nav" aria-label={label}>
    {children}
    <div>{sections.map(section => <button type="button" key={section.id} onClick={() => focusCreatorSection(section.id)}>{section.icon}<span>{section.label}</span></button>)}</div>
  </nav>;
}
