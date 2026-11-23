import type { Metadata } from "next";
import HistoryGuard from "@/components/history-guard";
import "./globals.css";
import "./workspace-theme.css";
import "./content-creator.css";
import "./insights.css";
import "./settings.css";
import "./desktop-workspace.css";
import "./creator-visual.css";
import "./creator-workspaces.css";
import "./persona-overview.css";
import "./persona-editor.css";
import "./green-accents.css";
import "./content-library.css";

export const metadata: Metadata = {
  title: "ContentAgent Social",
  description: "Content intelligence and automation platform"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><HistoryGuard />{children}</body>
    </html>
  );
}
