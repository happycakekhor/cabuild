import { Activity, BarChart3, BookOpen, Box, Bug, CalendarDays, Clapperboard, Info, Radar, RefreshCcw, Sparkles, UserRound, WandSparkles } from "lucide-react";

export type HeaderWorkspaceMode = "normal" | "drama" | null;
export const normalPages = [
  { id: "persona", label: "Persona", detail: "Voice, audience and brand assets", icon: UserRound },
  { id: "research", label: "Research", detail: "Find proven topics and source content", icon: Radar },
  { id: "create", label: "Create Content", detail: "Create images, videos and text", icon: Sparkles },
  { id: "publish", label: "My Contents", detail: "Create content and review your outputs", icon: CalendarDays },
  { id: "automation", label: "Automation", detail: "Schedule repeatable content workflows", icon: RefreshCcw },
  { id: "audit", label: "Social Audit", detail: "Understand connected-account performance", icon: BarChart3 },
  { id: "analyse", label: "Analyze", detail: "Track themes, gaps and performance", icon: Activity },
  { id: "logs", label: "Logs", detail: "Inspect provider jobs and errors", icon: Bug },
] as const;
export const dramaPages = [
  { id: "creative-brief", label: "Creative Brief", detail: "Format, audience and production intent", href: "/drama-studio?step=1", icon: WandSparkles },
  { id: "story-studio", label: "Story Studio", detail: "Story, visual assets and scene prompts", href: "/drama-studio?step=2", icon: BookOpen },
  { id: "generate-edit", label: "Generate & Edit", detail: "Create, review and refine production media", href: "/drama-studio?step=5", icon: Clapperboard },
  { id: "production-info", label: "Production Info", detail: "Final episodes, sources and deliverables", href: "/drama-studio/info", icon: Info },
  { id: "asset-library", label: "Asset Library", detail: "Characters, locations, props and media", href: "/drama-studio/assets", icon: Box },
] as const;
