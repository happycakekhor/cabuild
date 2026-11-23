"use client";

import { useState } from "react";
import { Download, FileText, Film, ImageIcon } from "lucide-react";
import type { Asset, Brief, PublishItem } from "@/lib/types";
import { contentPresentation } from "@/lib/content-presentation";
import PlatformIcon from "./platform-icon";

export default function ContentOutputCard({ item, asset, brief, onOpen }: {
  item: PublishItem; asset?: Asset; brief?: Brief; onOpen: () => void;
}) {
  const content = contentPresentation(item, asset, brief);
  const [failedUrl, setFailedUrl] = useState<string>();
  const TypeIcon = content.video ? Film : content.image ? ImageIcon : FileText;
  const media = content.url && failedUrl !== content.url && (content.video || content.image);
  return <article className="publish-card content-output-card" data-content-id={item.id}>
    <button type="button" className="content-card-open" onClick={onOpen} aria-label={`Open content: ${content.title}`} aria-haspopup="dialog" />
    <div className="content-output-media" aria-hidden="true">
      {media ? content.video ? <video src={content.url} muted preload="metadata" playsInline onError={() => setFailedUrl(content.url)} /> : <img src={content.url} alt="" loading="lazy" onError={() => setFailedUrl(content.url)} /> : <TypeIcon size={32} />}
    </div>
    <div className="content-output-heading">
      <div className="content-output-meta"><span className="creator-output-platform"><PlatformIcon platform={item.platform} />{item.platform}</span><span className={`status ${item.status}`}>{content.status}</span></div>
      <h3>{content.title}</h3>
    </div>
    <div className="content-output-description"><p>{content.summary || "No description saved."}</p>
      {item.status === "generating" && <small role="status">Generating · You can leave and come back.</small>}
      {item.status === "failed" && <small>Generation failed. Open for details.</small>}
    </div>
    <footer className="content-output-footer"><span className="content-type-label"><TypeIcon size={16} aria-hidden="true" />{content.type}</span>
      <div className="content-output-actions">{content.url && <a className="icon-btn" href={`/api/assets/${item.assetId}/download`} aria-label={`Download ${content.type.toLowerCase()}`} title={`Download ${content.type.toLowerCase()}`}><Download size={19} aria-hidden="true" /></a>}</div>
    </footer>
  </article>;
}
