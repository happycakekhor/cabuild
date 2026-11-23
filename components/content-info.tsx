"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Download, Expand, ExternalLink, FileText, Film, ImageIcon } from "lucide-react";
import type { Asset, Brief, PublishItem } from "@/lib/types";
import { contentPresentation } from "@/lib/content-presentation";
import ContentDialog from "./content-dialog";
import PlatformIcon from "./platform-icon";

function TextSection({ title, value, empty, onExpand }: { title: string; value?: string; empty: string; onExpand: (title: string, value: string) => void }) {
  const id = useId();
  const box = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);
  useEffect(() => {
    const node = box.current;
    if (!node) return;
    const measure = () => setOverflow(node.scrollHeight > node.clientHeight + 1);
    const observer = new ResizeObserver(measure);
    observer.observe(node); measure();
    return () => observer.disconnect();
  }, [value]);
  return <section className="content-detail-section"><div className="content-detail-section-head"><h3 id={id}>{title}</h3>{value && overflow && <button type="button" className="content-expand" onClick={() => onExpand(title, value)} aria-label={`Expand ${title}`} aria-haspopup="dialog"><Expand size={15} aria-hidden="true" />Expand</button>}</div>
    <div ref={box} className={`content-detail-text${value ? "" : " is-empty"}`} role="region" aria-labelledby={id} tabIndex={overflow ? 0 : undefined}>{value || empty}</div>
  </section>;
}

function Media({ url, image, title }: { url: string; image: boolean; title: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? <div className="content-detail-placeholder"><Film size={32} aria-hidden="true" /><b>Preview unavailable</b><p>The file could not be loaded. You can still try downloading it.</p></div> : image ? <img src={url} alt={title} onError={() => setFailed(true)} /> : <video src={url} controls playsInline preload="metadata" aria-label={title} onError={() => setFailed(true)} />;
}

function dateLabel(value?: string) {
  return value && Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "Not recorded";
}

export default function ContentInfo({ item, asset, brief, onClose }: { item: PublishItem; asset?: Asset; brief?: Brief; onClose: () => void }) {
  const [expanded, setExpanded] = useState<{ title: string; value: string } | null>(null);
  const content = contentPresentation(item, asset, brief);
  const settings = { ...asset?.generationSettings, ...item.generationSettings };
  const references = item.assetReferences || asset?.assetReferences || [];
  const TypeIcon = content.video ? Film : content.image ? ImageIcon : FileText;
  const expand = (title: string, value: string) => setExpanded({ title, value });
  const sourceUrl = item.sourceUrl || asset?.sourceUrl;
  const sourceMedia = item.sourceMediaUrl || asset?.sourceMediaUrl;
  const sourceType = item.sourceMediaType || asset?.sourceMediaType;
  const sourceImage = sourceType === "image" ? sourceMedia : item.sourceThumbnailUrl || asset?.sourceThumbnailUrl;
  const details = [
    ["Content type", content.type], ["Model", item.generationModel || asset?.generationModel],
    ["Platform", item.platform], ["Created", dateLabel(item.createdAt || asset?.createdAt)],
    ["Persona", settings.usePersona === false ? "No persona" : settings.personaName || (settings.usePersona === true ? "Saved persona" : "Not recorded")],
    ["Aspect ratio", settings.aspectRatio], ["Duration", item.duration || settings.duration ? `${item.duration || settings.duration} seconds` : undefined],
    ["Variants", settings.variants], ["Tone", settings.tone], ["Length", settings.length],
    ["Provider", asset?.provider || item.provider], ["Approval", item.approvalStatus],
    ...(item.status === "scheduled" || item.status === "published" ? [["Scheduled", dateLabel(item.scheduledAt)]] : []),
  ].filter(([label, value]) => value !== undefined && value !== "" || ["Model", "Created", "Persona"].includes(String(label)));
  return <ContentDialog title="Content details" onClose={onClose} className="content-detail-dialog">
    <div className="content-detail-layout content-information">
      <div className="content-detail-visual">
        <div className="content-detail-player">
          {content.url && (content.video || content.image) ? <Media key={content.url} url={content.url} image={content.image} title={content.title} /> : <div className="content-detail-placeholder"><TypeIcon size={40} aria-hidden="true" /><b>{item.status === "generating" ? "Your content is being created" : item.status === "failed" ? "No media generated" : content.type === "Text post" ? "Text post" : "No preview available"}</b><p>{item.status === "generating" ? "Generation continues in the background. This preview updates when it is ready." : content.type === "Text post" ? "Read the saved copy alongside this preview." : "Your saved information is available below."}</p></div>}
        </div>
        <div className="content-detail-media-footer"><span><TypeIcon size={16} aria-hidden="true" />{content.type}</span>{content.url && <a className="asset-link" href={`/api/assets/${item.assetId}/download`}><Download size={16} aria-hidden="true" />Download {content.video ? "video" : content.image ? "image" : "text"}</a>}</div>
        <section className="content-detail-section"><h3>Generation details</h3><dl className="content-detail-facts">{details.map(([label, value]) => <div key={String(label)}><dt>{String(label)}</dt><dd>{value === undefined || value === "" ? "Not recorded" : String(value)}</dd></div>)}</dl></section>
        {references.length > 0 && <section className="content-detail-section"><h3>Reference assets</h3><ul className="content-detail-references">{references.map((reference, index) => <li key={index}><span><b>{reference.role}</b><span>{reference.fileName}</span></span>{reference.url && <a href={reference.url} target="_blank" rel="noreferrer" aria-label={`Open reference ${reference.fileName}`}><ExternalLink size={17} aria-hidden="true" /></a>}</li>)}</ul></section>}
        {(sourceUrl || sourceMedia || sourceImage) && <section className="content-detail-section"><h3>Research source</h3><p className="content-detail-source-title">{item.sourceTitle || asset?.sourceTitle || "Original source"}</p>{sourceMedia && sourceType === "video" ? <div className="content-detail-source-media"><Media key={sourceMedia} url={sourceMedia} image={false} title="Research source video" /></div> : sourceImage ? <div className="content-detail-source-media"><Media key={sourceImage} url={sourceImage} image title="Research source image" /></div> : null}{sourceUrl && <a className="asset-link" href={sourceUrl} target="_blank" rel="noreferrer"><ExternalLink size={15} aria-hidden="true" />Open original source</a>}</section>}
      </div>
      <div className="content-detail-copy">
        <div className="content-detail-identity"><span className="creator-output-platform"><PlatformIcon platform={item.platform} />{item.platform}</span><span className={`status ${item.status}`}>{content.status}</span></div>
        <TextSection title="Caption" value={content.caption} empty="No caption saved." onExpand={expand} />
        <TextSection title="Description" value={content.description} empty="No description saved for this content." onExpand={expand} />
        {item.hashtags?.length ? <TextSection title="Hashtags" value={item.hashtags.join(" ")} empty="No hashtags saved." onExpand={expand} /> : null}
        {(item.error || asset?.error) && <TextSection title="Generation error" value={item.error || asset?.error} empty="" onExpand={expand} />}
        <div className="content-detail-origin"><h3>Creation history</h3><p>The instructions and settings used for this content.</p></div>
        <TextSection title="Your submitted prompt" value={typeof settings.inputPrompt === "string" ? settings.inputPrompt : undefined} empty="The original prompt was not recorded for this item." onExpand={expand} />
        <TextSection title="Prompt sent to AI" value={asset?.prompt || item.prompt} empty="No AI prompt was recorded for this item." onExpand={expand} />
        <TextSection title="Saved title" value={item.title} empty="No title recorded." onExpand={expand} />
      </div>
    </div>
    {expanded && <ContentDialog title={expanded.title} onClose={() => setExpanded(null)} className="content-reader-dialog"><div className="content-full-text" tabIndex={0} role="region" aria-label={`Full ${expanded.title}`}>{expanded.value}</div></ContentDialog>}
  </ContentDialog>;
}