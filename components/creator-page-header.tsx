import type { ReactNode } from "react";
import { Activity, BarChart3, Bug, FolderOpen, Radar, RefreshCcw, Sparkles, UserRound } from "lucide-react";
import type { PageArt } from "./page-intro";

/** Compact workspace heading: identification and actions, without marketing copy. */
export default function CreatorPageHeader({ title, art = "create", children }: {
  title: string; art?: PageArt; children?: ReactNode;
}) {
  const Icon = title === "Analyze" ? Activity : title === "Social Audit" ? BarChart3 : title === "Logs" ? Bug : title === "Create Content" ? Sparkles :
    { identity: UserRound, research: Radar, create: Sparkles, library: FolderOpen, operations: RefreshCcw, story: Sparkles, admin: UserRound, text: Bug }[art];
  return <header className="page-intro creator-page-header" aria-label={`${title} introduction`}>
    <div className="creator-page-title"><span className="creator-page-mark" aria-hidden="true"><Icon size={28} strokeWidth={1.7} /></span><h1>{title}</h1></div>
    {children && <div className="page-intro-tools">{children}</div>}
  </header>;
}
