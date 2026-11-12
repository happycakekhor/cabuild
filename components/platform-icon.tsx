import { Globe } from "lucide-react";

export default function PlatformIcon({ platform }: { platform: string }) {
  const name = platform.toLowerCase();
  const slug = name === "twitter" ? "x" : name;
  return ["instagram", "facebook", "linkedin", "tiktok", "youtube", "x", "threads"].includes(slug)
    ? <img className="platform-logo" src={`/brands/${slug}.svg`} width={18} height={18} alt="" aria-hidden="true" />
    : <Globe size={18} aria-hidden="true" />;
}
