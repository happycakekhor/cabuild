"use client";
import { useState } from "react";
import { UserRound } from "lucide-react";
import type { PersonaProfile } from "@/lib/types";

export default function PersonaMark({ persona }: { persona?: PersonaProfile }) {
  const [failedUrl, setFailedUrl] = useState<string>();
  const assets = persona?.mediaAssets || [];
  const logo = assets.find(asset => asset.role === "logo") || assets.find(asset => asset.role === "avatar/persona");
  return <span className="creator-persona-mark" aria-hidden="true">
    {logo?.url && logo.url !== failedUrl ? <img src={logo.url} alt="" onError={() => setFailedUrl(logo.url)} /> : <UserRound size={26} strokeWidth={1.6} />}
  </span>;
}
