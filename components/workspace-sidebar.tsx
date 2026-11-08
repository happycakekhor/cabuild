"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { createContext, useContext, useEffect, useId, useRef, useState } from "react";
import { Bug, ChevronRight, Clapperboard, Home, Settings, Sparkles, X } from "lucide-react";
import { dramaPages, normalPages, type HeaderWorkspaceMode } from "./workspace-pages";

// Portals are outside hidden route containers; loading routes explicitly hide their old sidebar.
export const WorkspaceNavigationVisibility = createContext(true);

export default function WorkspaceSidebar({ activeMode, activePage, account, workspaceName, frontendBaseUrl = "", onHomeNavigate, onNormalNavigate, mobileOpen, onClose }: {
  activeMode: HeaderWorkspaceMode;
  activePage?: string;
  account?: { name: string; role: string };
  workspaceName?: string;
  frontendBaseUrl?: string;
  onHomeNavigate?: () => void;
  onNormalNavigate?: (page: string) => void;
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const visible = useContext(WorkspaceNavigationVisibility);
  const [expanded, setExpanded] = useState<HeaderWorkspaceMode>(activeMode);
  const sidebarRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  const home = activePage === "home" || !activePage && !activeMode;
  const initials = (account?.name || "Content Agent").split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase();
  const closeCallback = useRef(onClose);
  closeCallback.current = onClose;
  useEffect(() => setMounted(true), []);
  useEffect(() => { setExpanded(activeMode); closeCallback.current(); }, [activeMode, activePage]);
  useEffect(() => {
    if (!mounted) return;
    const media = window.matchMedia("(max-width: 1000px)");
    const sync = () => {
      if (sidebarRef.current) sidebarRef.current.inert = media.matches && !mobileOpen;
      if (!media.matches && mobileOpen) closeCallback.current();
    };
    sync();
    media.addEventListener("change", sync);
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (mobileOpen && media.matches) closeRef.current?.focus();
    return () => {
      media.removeEventListener("change", sync);
      if (mobileOpen && media.matches && trigger?.isConnected) trigger.focus();
    };
  }, [mobileOpen, mounted, visible]);
  if (!mounted || !visible) return null;

  const normalClick = (page: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (onNormalNavigate) { event.preventDefault(); onNormalNavigate(page); }
  };
  const homeClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (onHomeNavigate) { event.preventDefault(); onHomeNavigate(); }
  };
  return createPortal(<>
    {mobileOpen && <div className="desktop-nav-backdrop" onClick={onClose} aria-hidden="true" />}
    <aside ref={sidebarRef} id="workspace-sidebar" className={`desktop-sidebar ${mobileOpen ? "is-open" : ""}`} aria-label="Workspace sidebar" onKeyDown={event => {
      if (!mobileOpen || !window.matchMedia("(max-width: 1000px)").matches) return;
      if (event.key === "Escape") { event.preventDefault(); onClose(); }
      if (event.key !== "Tab") return;
      const items = [...event.currentTarget.querySelectorAll<HTMLElement>('a[href],button:not([disabled])')].filter(item => item.getClientRects().length);
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }}>
      <Link href={`${frontendBaseUrl}/`} className="desktop-brand" aria-label="Content Agent home" onClick={homeClick}><span className="desktop-brand-mark"><Sparkles size={19} /></span><span><b>CABUILD</b><small>CONTENT WORKSPACE</small></span></Link>
      <button ref={closeRef} className="desktop-nav-close" type="button" aria-label="Close navigation" onClick={onClose}><X size={19} /></button>
      <div className="desktop-workspace"><span className="desktop-avatar">CA</span><span><b>{workspaceName || "My workspace"}</b><small>Your creative workspace</small></span></div>
      <nav className="desktop-navigation" aria-label="Main navigation">
        <Link href={`${frontendBaseUrl}/`} className={`desktop-nav-item ${home ? "active" : ""}`} aria-current={home ? "page" : undefined} onClick={homeClick}><Home size={17} /><span>Overview</span></Link>
        {(["normal", "drama"] as const).map(mode => {
          const isOpen = expanded === mode, Icon = mode === "normal" ? Sparkles : Clapperboard;
          return <section className={`desktop-nav-section ${mode}`} key={mode}>
            <button className="desktop-nav-group" type="button" aria-expanded={isOpen} aria-controls={`${id}-${mode}`} onClick={() => setExpanded(isOpen ? null : mode)}><Icon size={17} /><span>{mode === "normal" ? "Content Creator" : "Drama Studio"}</span><ChevronRight className="desktop-group-chevron" size={15} /></button>
            <div className="desktop-nav-pages" id={`${id}-${mode}`} hidden={!isOpen}>
              {mode === "normal" ? normalPages.filter(page => page.id !== "logs").map(page => <Link key={page.id} href={`${frontendBaseUrl}/?view=${page.id}`} className={`desktop-nav-item ${activeMode === mode && activePage === page.id ? "active" : ""}`} aria-current={activeMode === mode && activePage === page.id ? "page" : undefined} onClick={normalClick(page.id)}><page.icon size={16} /><span>{page.label}</span></Link>) : dramaPages.map(page => <Link key={page.id} href={`${frontendBaseUrl}${page.href}`} className={`desktop-nav-item ${activeMode === mode && activePage === page.id ? "active" : ""}`} aria-current={activeMode === mode && activePage === page.id ? "page" : undefined}><page.icon size={16} /><span>{page.label}</span></Link>)}
            </div>
          </section>;
        })}
        <div className="desktop-nav-label">Workspace</div>
        <Link href={`${frontendBaseUrl}/?view=logs`} className={`desktop-nav-item ${activePage === "logs" ? "active" : ""}`} aria-current={activePage === "logs" ? "page" : undefined} onClick={normalClick("logs")}><Bug size={17} /><span>Logs</span></Link>
      </nav>
      <div className="desktop-sidebar-footer">
        <Link href={`${frontendBaseUrl}/?view=settings`} className={`desktop-nav-item ${activePage === "settings" ? "active" : ""}`} aria-current={activePage === "settings" ? "page" : undefined} onClick={normalClick("settings")}><Settings size={17} /><span>Settings</span></Link>
        <Link className="desktop-profile" href={`${frontendBaseUrl}/?view=account`} aria-current={activePage === "account" ? "page" : undefined} onClick={normalClick("account")}><span className="desktop-avatar">{initials}</span><span><b>{account?.name || "Your account"}</b><small>{account?.role || "Workspace member"}</small></span><ChevronRight size={16} /></Link>
      </div>
    </aside>
  </>, document.body);
}
