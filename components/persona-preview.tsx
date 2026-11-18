import { ChevronDown, Globe, Images, MessageCircle, ShieldCheck } from "lucide-react";
import type { PersonaProfile } from "@/lib/types";
import PersonaMark from "./persona-mark";
import PlatformIcon from "./platform-icon";

function Detail({ label, value, prominent = false }: { label: string; value?: string | string[]; prominent?: boolean }) {
  const empty = Array.isArray(value) ? !value.length : !value?.trim();
  return <div className={["persona-preview-detail", prominent && "prominent", empty && "is-empty"].filter(Boolean).join(" ")}>
    <dt>{label}</dt><dd>{Array.isArray(value) ? value.length ? <ul>{value.map((text, index) => <li key={index}>{text}</li>)}</ul> : "Not added yet" : value?.trim() || "Not added yet"}</dd>
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
          <h2><Globe size={16} aria-hidden="true" />Public profiles</h2>
          <div className="profile-connections">{profiles.map(([platform, value]) => {
            const href = publicUrl(value);
            const label = platform === "x" ? "X / Twitter" : platform[0].toUpperCase() + platform.slice(1);
            return href ? <a key={platform} href={href} target="_blank" rel="noreferrer" title={value}><PlatformIcon platform={platform} /><span>{label}</span></a> : <span className="profile-invalid-link" key={platform}><PlatformIcon platform={platform} /><span>{label}<small>{value}</small></span></span>;
          })}</div>
          {!profiles.length && <p className="muted">No public profiles added.</p>}
        </div>
      </div>
    </section>

    <section className="persona-advanced persona-preview-section profile" aria-label="Core profile">
      <div className="persona-overview-identity">
        <h2 className="persona-display-name">{persona.displayName?.trim() || "Your persona"}</h2>
        <p className="persona-company">{persona.company?.trim() || "Company not added"}</p>
        <p className="persona-role">{persona.role?.trim() || "Role not added"}</p>
        {persona.companyOneLiner?.trim() && <p className="persona-one-liner">{persona.companyOneLiner}</p>}
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
        <Detail label="Approved topics" value={persona.approvedTopics} prominent />
        <Detail label="Off-limits topics" value={persona.offLimitsTopics} prominent />
        <Detail label="Banned vocabulary" value={persona.bannedVocabulary} />
        <Detail label="Natural phrases" value={persona.naturalPhrases} />
        <Detail label="Strong opinions" value={persona.strongOpinions} />
      </dl>
    </section>

    <details className="persona-advanced persona-preview-section persona-reference-section writing">
      <summary><h2><MessageCircle size={20} aria-hidden="true" /><span>Writing samples</span><span className="persona-reference-count">{persona.writingSamples.length}</span><ChevronDown size={18} aria-hidden="true" /></h2></summary>
      {persona.writingSamples.length ? <ol className="persona-writing-samples">{persona.writingSamples.map((sample, index) => <li key={index}>{sample}</li>)}</ol> : <p className="muted">No writing samples added.</p>}
    </details>

    <details className="persona-advanced persona-preview-section persona-reference-section media">
      <summary><h2><Images size={20} aria-hidden="true" /><span>Reusable media references</span><span className="persona-reference-count">{media.length}</span><ChevronDown size={18} aria-hidden="true" /></h2></summary>
      <div className="persona-preview-media">{media.map(asset => <figure key={asset.id}>
        {asset.role === "audio" || asset.contentType?.startsWith("audio/") ? <audio controls preload="none" src={asset.url} aria-label={asset.label || asset.fileName} /> : <a href={asset.url} target="_blank" rel="noreferrer"><img src={asset.url} alt={asset.label || asset.fileName} /></a>}
        <figcaption><b>{asset.label || asset.fileName}</b><span>{asset.role}</span>{asset.fileName !== asset.label && <small>{asset.fileName}</small>}</figcaption>
      </figure>)}</div>
      {!media.length && <p className="muted">No saved media references yet.</p>}
    </details>
  </div>;
}
