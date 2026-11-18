import { Images, MessageCircle, ShieldCheck } from "lucide-react";
import type { PersonaProfile } from "@/lib/types";
import PersonaMark from "./persona-mark";
import PlatformIcon from "./platform-icon";

function Detail({ label, value, prominent = false }: { label: string; value?: string | string[]; prominent?: boolean }) {
  const empty = Array.isArray(value) ? !value.length : !value?.trim();
  return <div className={["persona-preview-detail", prominent && "prominent", empty && "is-empty"].filter(Boolean).join(" ")}>
    <dt>{label}</dt><dd>{Array.isArray(value) ? value.length ? <ul>{value.map((text, index) => <li key={index}>{text}</li>)}</ul> : "Empty" : value?.trim() || "Empty"}</dd>
  </div>;
}

function publicUrl(value: string) {
  try { const clean = value.trim(); const url = new URL(/^https?:\/\//i.test(clean) ? clean : "https://" + clean); return ["https:", "http:"].includes(url.protocol) ? url.href : undefined; } catch { return undefined; }
}

export default function PersonaPreview({ persona }: { persona: PersonaProfile }) {
  const seenLinks = new Set<string>();
  const profiles = Object.entries(persona.sourceUrls).filter(([, value]) => {
    if (!value?.trim()) return false;
    const key = (publicUrl(value) || value.trim()).replace(/\/$/, "");
    if (seenLinks.has(key)) return false;
    seenLinks.add(key);
    return true;
  });
  const media = persona.mediaAssets || [];
  return <div className="persona-preview persona-overview" aria-label="Persona preview">
    <section className="creator-identity" aria-label="Profile image and public profiles">
      <div className="profile-identity-body">
        <PersonaMark persona={persona} />
        <div className="profile-public-links">
          <div className="profile-connections" aria-label="Public profiles">{profiles.map(([platform, value]) => {
            const href = publicUrl(value);
            const label = platform === "x" ? "X / Twitter" : platform[0].toUpperCase() + platform.slice(1);
            return href ? <a key={platform} href={href} target="_blank" rel="noreferrer" title={label} aria-label={label}><PlatformIcon platform={platform} /></a> : <span className="profile-invalid-link" key={platform} title={`${label}: ${value}`} aria-label={`${label}: invalid URL`}><PlatformIcon platform={platform} /></span>;
          })}</div>
          {!profiles.length && <p className="muted">Empty</p>}
        </div>
      </div>
    </section>

    <section className="persona-advanced persona-preview-section profile" aria-label="Core profile">
      <div className="persona-overview-identity">
        <h2 className="persona-display-name">{persona.displayName?.trim() || "Empty"}</h2>
        <p className="persona-company">{persona.company?.trim() || "Empty"}</p>
        <p className="persona-role">{persona.role?.trim() || "Empty"}</p>
        <p className="persona-one-liner">{persona.companyOneLiner?.trim() || "Empty"}</p>
      </div>
      <div className="persona-audience-summary">
        <h3><MessageCircle size={18} aria-hidden="true" />Audience and voice</h3>
        <dl className="persona-preview-grid">
          <Detail label="Primary audience" value={persona.primaryAudience} prominent />
          <Detail label="Voice style" value={persona.voiceStyle} prominent />
          <Detail label="Audience insight" value={persona.audienceInsight} />
          <Detail label="Content language" value={persona.contentLanguage} />
        </dl>
      </div>
    </section>

    <section className="persona-advanced persona-preview-section guardrails">
      <h2 className="persona-section-title"><span className="persona-section-icon"><ShieldCheck size={22} aria-hidden="true" /></span>Prompt guardrails</h2>
      <dl className="persona-preview-grid persona-guidelines-grid">
        <Detail label="Approved topics" value={persona.approvedTopics} />
        <Detail label="Off-limits topics" value={persona.offLimitsTopics} />
        <Detail label="Banned vocabulary" value={persona.bannedVocabulary} />
        <Detail label="Natural phrases" value={persona.naturalPhrases} />
        <Detail label="Strong opinions" value={persona.strongOpinions} />
      </dl>
    </section>

    <section className="persona-advanced persona-preview-section persona-reference-section writing">
      <h2 className="persona-section-title"><MessageCircle size={20} aria-hidden="true" />Writing samples</h2>
      <p className="persona-writing-samples">{persona.writingSamples.filter(sample => sample.trim()).join(", ") || "Empty"}</p>
    </section>

    <section className="persona-advanced persona-preview-section persona-reference-section media">
      <h2 className="persona-section-title"><Images size={20} aria-hidden="true" />Reusable media references</h2>
      <div className="persona-preview-media">{media.map(asset => <figure key={asset.id}>
        {asset.role === "audio" || asset.contentType?.startsWith("audio/") ? <audio controls preload="none" src={asset.url} aria-label={asset.label || asset.fileName} /> : <a href={asset.url} target="_blank" rel="noreferrer"><img src={asset.url} alt={asset.label || asset.fileName} /></a>}
        <figcaption><b>{asset.label || asset.fileName}</b><span>{asset.role}</span>{asset.fileName !== asset.label && <small>{asset.fileName}</small>}</figcaption>
      </figure>)}</div>
      {!media.length && <p className="muted">Empty</p>}
    </section>
  </div>;
}
