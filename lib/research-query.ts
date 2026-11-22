import type { Platform } from "@/lib/types";

/** One input for a source URL or keywords. A malformed URL must not start a paid keyword search. */
export function parseResearchQuery(value: string): { mode: "url" | "keywords"; value: string; platform?: Platform; error?: string } {
  const text = value.trim();
  if (!text) return { mode: "keywords", value: text, error: "Enter a URL or keywords to search." };
  const hasScheme = /^[a-z][a-z\d+.-]*:\/\//i.test(text) || /^(https?|ftp|file|mailto|javascript|data):/i.test(text);
  const looksLikeDomain = /^(?:www\.)?[^\s/.]+(?:\.[^\s/.]+)*\.[a-z]{2,}(?::\d+)?(?:[/?#][^\s]*)?$/i.test(text);
  if (!hasScheme && !looksLikeDomain) return { mode: "keywords", value: text };
  try {
    const url = new URL(hasScheme ? text : `https://${text}`);
    if (!["http:", "https:"].includes(url.protocol) || !url.hostname.includes(".") || url.username || url.password) throw new Error("Invalid source URL");
    const host = url.hostname.toLowerCase();
    const isHost = (domain: string) => host === domain || host.endsWith(`.${domain}`);
    const platform: Platform | undefined = isHost("instagram.com") ? "Instagram" : isHost("tiktok.com") ? "TikTok" : isHost("youtube.com") || isHost("youtu.be") ? "YouTube" : isHost("facebook.com") || isHost("fb.watch") ? "Facebook" : isHost("linkedin.com") ? "LinkedIn" : isHost("x.com") || isHost("twitter.com") ? "X" : undefined;
    return { mode: "url", value: url.href, platform };
  } catch {
    return { mode: "url", value: text, error: "Enter a valid http:// or https:// source URL." };
  }
}
