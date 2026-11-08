"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowRight, Clapperboard, FileText, ImageIcon, Radar, RefreshCcw, Sparkles, UserRound } from "lucide-react";
import type { Asset, PublishItem } from "@/lib/types";

type Result = { id: string; title: string; type: string; url?: string; caption?: string; createdAt: string };
type WelcomeData = { user: { name: string }; assets: Asset[]; publishQueue: PublishItem[] };

function ConceptArt({ kind }: { kind: "social" | "drama" | "text" }) {
  return <svg viewBox="0 0 400 280" fill="none" aria-hidden="true" className={`welcome-concept-art ${kind}`}>
    {kind === "social" ? <>
      <rect width="400" height="280" fill="#dce7d9" /><circle cx="310" cy="68" r="105" fill="#c0d0b7" />
      <path d="M0 236C99 177 245 265 400 190V280H0Z" fill="#a6bd9d" />
      <ellipse cx="200" cy="244" rx="72" ry="12" fill="#819b76" opacity=".35" />
      <rect x="157" y="83" width="86" height="151" rx="22" fill="#f7f3df" /><rect x="170" y="58" width="60" height="34" rx="8" fill="#374e40" />
      <path d="M184 126c28 1 37 18 17 37-23-2-30-20-17-37Z" fill="#79946c" /><path d="M199 148v31" stroke="#374e40" strokeWidth="3" />
      <path d="M178 199h44M187 209h26" stroke="#7f8a70" strokeWidth="3" strokeLinecap="round" />
      <path d="m81 75 4 12 13 3-13 4-4 13-3-13-13-4 13-3Z" fill="#fffdf1" />
    </> : kind === "drama" ? <>
      <rect width="400" height="280" fill="#242839" /><circle cx="286" cy="75" r="41" fill="#e9cf9e" />
      <path d="M0 189 75 107 163 186 237 140 400 219V280H0Z" fill="#50516e" /><path d="m0 236 151-83 142 90 107-57v94H0Z" fill="#373d54" />
      <path d="m191 280 55-110 31 110" fill="#9f7891" opacity=".5" /><circle cx="244" cy="172" r="8" fill="#181e2e" /><path d="m237 179-8 40h29l-9-40Z" fill="#181e2e" />
      <path d="M39 33h25M39 33v25M361 33h-25M361 33v25M39 247h25M39 247v-25M361 247h-25M361 247v-25" stroke="#fff" strokeOpacity=".45" strokeWidth="2" />
    </> : <>
      <rect width="400" height="280" fill="#eee5d8" /><rect x="73" y="28" width="254" height="245" rx="12" fill="#fffaf3" transform="rotate(-5 200 140)" />
      <path d="M118 81h64M118 106h165M118 119h138" stroke="#333b36" strokeWidth="7" strokeLinecap="round" />
      <path d="M118 153h165M118 170h149M118 187h158" stroke="#c1b9ab" strokeWidth="5" strokeLinecap="round" /><rect x="115" y="213" width="79" height="20" rx="10" fill="#dce7d9" />
      <circle cx="310" cy="56" r="27" fill="#8a9e87" /><path d="m297 56 9 9 16-19" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </>}
  </svg>;
}

function ResultPreview({ result }: { result: Result }) {
  const [unavailable, setUnavailable] = useState(false);
  const isVideo = result.type === "video" || result.type === "ugc";
  if (result.url && !unavailable && result.type !== "text") return isVideo
    ? <video src={result.url} controls playsInline preload="none" aria-label={result.title} onError={() => setUnavailable(true)} />
    : <Image src={result.url} alt={result.title} width={600} height={420} unoptimized onError={() => setUnavailable(true)} />;
  return <div className="welcome-result-fallback"><FileText size={28} /><p>{unavailable ? "Preview unavailable. Open My Contents to inspect this output." : result.caption || result.title}</p></div>;
}

export default function WelcomeHome({ data, onNavigate, onDrama }: { data: WelcomeData; onNavigate: (page: string) => void; onDrama: () => void }) {
  const readyAssets = data.assets.filter(asset => asset.status === "ready" && (asset.assetUrl || asset.type === "text"));
  const assetIds = new Set(readyAssets.map(asset => asset.id));
  const results: Result[] = [
    ...readyAssets.map(asset => ({ id: asset.id, title: asset.title, type: asset.type, url: asset.assetUrl, caption: data.publishQueue.find(item => item.assetId === asset.id)?.caption, createdAt: asset.createdAt })),
    ...data.publishQueue.filter(item => !assetIds.has(item.assetId) && ["done", "published", "scheduled"].includes(item.status) && (item.assetUrl || item.generationType === "text" && item.caption)).map(item => ({ id: item.id, title: item.title, type: item.generationType || "video", url: item.assetUrl, caption: item.caption, createdAt: item.createdAt || item.scheduledAt }))
  ].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const examples = [
    { kind: "social" as const, label: "Brand & product", title: "Make your product the story", detail: "Product images, social videos and campaign visuals.", icon: ImageIcon },
    { kind: "drama" as const, label: "Scenes & episodes", title: "Bring a story into focus", detail: "Scene clips, recurring characters and episodic stories.", icon: Clapperboard },
    { kind: "text" as const, label: "Captions & copy", title: "Find the words that fit", detail: "On-brand text, captions and social post ideas.", icon: FileText }
  ];
  const quickLinks = [
    { icon: UserRound, title: "Define your voice", detail: "Set up your persona", page: "persona" },
    { icon: Radar, title: "Find inspiration", detail: "Explore proven content", page: "research" },
    { icon: RefreshCcw, title: "Keep it going", detail: "Build an automation", page: "automation" },
  ];
  const activity = [...data.publishQueue].sort((a, b) => Date.parse(b.createdAt || b.scheduledAt) - Date.parse(a.createdAt || a.scheduledAt)).slice(0, 3);
  return <div className="home-panel welcome-page desktop-home">
    <section className="desktop-welcome-heading welcome-hero">
      <div><h1>A little inspiration. A lot of possibility.</h1><p>Welcome back, {data.user.name.split(" ")[0] || "creator"}. Pick up where you left off, or start something new.</p></div>
      <button className="primary" onClick={() => onNavigate("create")}><Sparkles size={16} /> Create content</button>
    </section>
    <section className="welcome-paths" aria-labelledby="welcome-paths-title">
      <div className="desktop-section-heading"><h2 id="welcome-paths-title">Your creative spaces</h2><span>From idea to finished content</span></div>
      <div className="desktop-launch-grid">
        <article className="desktop-launch normal"><div><span className="welcome-eyebrow"><Sparkles size={13} /> Everyday creativity</span><h2>Content Creator</h2><p>Find your next idea. Turn it into images, videos and words that sound like you.</p><button onClick={() => onNavigate("create")}>Start creating <ArrowRight size={15} /></button></div><div className="desktop-launch-art"><ConceptArt kind="social" /></div></article>
        <article className="desktop-launch drama"><div><span className="welcome-eyebrow"><Clapperboard size={13} /> Stories worth telling</span><h2>Drama Studio</h2><p>Build a world, shape your characters and bring every scene to life.</p><button onClick={onDrama}>Open studio <ArrowRight size={15} /></button></div><div className="desktop-launch-art"><ConceptArt kind="drama" /></div></article>
      </div>
    </section>
    <div className="desktop-dashboard-grid"><div>
      <section aria-labelledby="quick-links-title"><div className="desktop-section-heading"><h2 id="quick-links-title">A good place to start</h2></div><div className="desktop-quick-links">{quickLinks.map(({icon: Icon,title,detail,page}) => <button key={page} onClick={() => onNavigate(page)}><span><Icon size={19} /></span><span><b>{title}</b><small>{detail}</small></span><ArrowRight size={14} /></button>)}</div></section>
      <section className="welcome-showcase desktop-card" aria-labelledby="welcome-results-title">
        <div className="desktop-card-heading"><h2 id="welcome-results-title">{results.length ? "Recent creations" : "What will you make first?"}</h2><button className="text-link" onClick={() => onNavigate("publish")}>View My Contents <ArrowRight size={15} /></button></div>
        {results.length ? <div className="welcome-result-grid">{results.slice(0,3).map(result => <article className="welcome-result" key={result.id}><div className="welcome-result-media"><ResultPreview result={result} /></div><div className="welcome-result-copy"><span className="welcome-eyebrow">{result.type} · Created in your workspace</span><h3>{result.title}</h3><button className="text-link" onClick={() => onNavigate("publish")}>Review in My Contents <ArrowRight size={14} /></button></div></article>)}</div> : <><p className="welcome-example-note">Illustrative examples below. Your completed creations will appear here automatically.</p><div className="welcome-result-grid">{examples.map(({kind,label,title,detail,icon: Icon}) => <article className="welcome-result" key={kind}><div className="welcome-result-media"><ConceptArt kind={kind} /><span className="welcome-example-badge">Example</span></div><div className="welcome-result-copy"><span className="welcome-eyebrow"><Icon size={13} />{label}</span><h3>{title}</h3><p>{detail}</p></div></article>)}</div></>}
      </section>
    </div><aside className="desktop-dashboard-aside">
      <section className="desktop-card"><div className="desktop-card-heading"><h2>Workspace activity</h2></div><div className="desktop-card-body">{activity.length ? activity.map(item => <div className="desktop-activity" key={item.id}><span><Clapperboard size={15} /></span><div><b>{item.title}</b><p>{item.status.replaceAll("_", " ")}</p><small>{new Date(item.createdAt || item.scheduledAt).toLocaleDateString()}</small></div></div>) : <div className="desktop-activity-empty"><Sparkles size={24} /><h3>Ready when you are</h3><p>Your recent content activity will appear here as you create.</p></div>}</div></section>
      <section className="desktop-card" id="welcome-workflows"><div className="desktop-card-heading"><h2>Your idea, from start to finish</h2></div><div className="desktop-card-body">{[["Research","Discover a direction","research"],["Create","Bring your idea to life","create"],["Review","Find your finished content","publish"]].map(([title,detail,page],i) => <button className="desktop-workflow-step" onClick={() => onNavigate(page)} key={page}><span>0{i+1}</span><span><b>{title}</b><small>{detail}</small></span><ArrowRight size={14} /></button>)}<p className="desktop-workflow-note">Start at any stage. Your process is up to you.</p></div></section>
    </aside></div>
  </div>;
}
