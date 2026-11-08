"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import "./header-credits.css";
import { CREDIT_REFRESH_EVENT } from "@/lib/credit-refresh";
import { ChevronDown, Coins, LogOut, Menu, RefreshCcw, Settings, UserRound } from "lucide-react";

type AccountSummary = {
  user: { id?: string; name: string; email: string; role: string };
  workspace: { id?: string; name: string; plan: string; credits?: number };
  checkedAt?: string;
  providers: Array<{
    id: string;
    label: string;
    configured: boolean;
    credits: number | null;
    unit: "credits" | "USD" | null;
    message: string;
  }>;
};

import WorkspaceSidebar from "./workspace-sidebar";
import { normalPages, dramaPages, type HeaderWorkspaceMode } from "./workspace-pages";
export { normalPages, dramaPages, type HeaderWorkspaceMode } from "./workspace-pages";

export default function GlobalHeader({
  activeMode,
  activePage,
  initialAccount,
  frontendBaseUrl = "",
  initialWorkspaceCredits,
  onHomeNavigate,
  onNormalNavigate,
  onBeforeLeave,
}: {
  activeMode: HeaderWorkspaceMode;
  frontendBaseUrl?: string;
  activePage?: string;
  initialAccount?: { name: string; email: string; role: string };
  initialWorkspaceCredits?: number;
  onHomeNavigate?: () => void;
  onBeforeLeave?: () => boolean | Promise<boolean>;
  onNormalNavigate?: (page: string) => void;
}) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeSidebar = useCallback(() => setMobileOpen(false), []);
  const destination = (path: string) => `${frontendBaseUrl}${path}`;
  const headerRef = useRef<HTMLDivElement>(null);
  const hoverCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const balanceRadioName = useId();
  const [openPanel, setOpenPanel] = useState<"normal" | "drama" | "credits" | "account" | null>(null);
  const [suppressedPanel, setSuppressedPanel] = useState<"normal" | "drama" | "credits" | "account" | null>(null);
  const [summary, setSummary] = useState<AccountSummary | null>(
    initialAccount
      ? {
          user: initialAccount,
          workspace: { name: "Content Agent", plan: "", credits: initialWorkspaceCredits },
          providers: [],
        }
      : null,
  );
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [creditsError, setCreditsError] = useState(false);
  const [pinnedBalance, setPinnedBalance] = useState({ scope: "", id: "workspace" });
  const balanceScope = summary?.user.id && summary?.workspace.id
    ? `cabuild:header-balance:${summary.user.id}:${summary.workspace.id}`
    : "";

  useEffect(() => {
    if (!balanceScope) return;
    try {
      setPinnedBalance({ scope: balanceScope, id: window.localStorage.getItem(balanceScope) || "workspace" });
    } catch {
      setPinnedBalance({ scope: balanceScope, id: "workspace" });
    }
  }, [balanceScope]);

  const selectBalance = (id: string) => {
    setPinnedBalance({ scope: balanceScope, id });
    if (balanceScope) {
      try { window.localStorage.setItem(balanceScope, id); } catch { /* Selection still works for this page. */ }
    }
  };

  const creditRequestActive = useRef(false);
  const creditRefreshPending = useRef(false);
  const refreshCredits = useCallback(async function loadCredits(): Promise<void> {
    if (creditRequestActive.current) { creditRefreshPending.current = true; return; }
    creditRequestActive.current = true;
    setLoadingCredits(true);
    try {
      const response = await fetch("/api/account/credits", { cache: "no-store" });
      if (!response.ok) throw new Error("Balance lookup failed");
      const nextSummary = await response.json() as AccountSummary;
      if (!nextSummary.user || !nextSummary.workspace || !Array.isArray(nextSummary.providers)) throw new Error("Balance response unavailable");
      setSummary(nextSummary);
      setCreditsError(false);
    } catch {
      setCreditsError(true);
    } finally {
      creditRequestActive.current = false;
      setLoadingCredits(false);
      if (creditRefreshPending.current) { creditRefreshPending.current = false; void loadCredits(); }
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => void refreshCredits(), 0);
    return () => window.clearTimeout(timeout);
  }, [refreshCredits]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const refreshAfterUsage = () => { clearTimeout(timer); timer = setTimeout(() => void refreshCredits(), 500); };
    window.addEventListener(CREDIT_REFRESH_EVENT, refreshAfterUsage);
    return () => { clearTimeout(timer); window.removeEventListener(CREDIT_REFRESH_EVENT, refreshAfterUsage); };
  }, [refreshCredits]);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpenPanel(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        headerRef.current?.querySelector<HTMLElement>(".global-nav-group.open .global-nav-trigger > button, .global-action-group.open > button")?.focus();
        const hovered = headerRef.current?.querySelector<HTMLElement>("[data-header-panel]:hover")?.dataset.headerPanel as typeof suppressedPanel;
        setOpenPanel((current) => {
          setSuppressedPanel(current ?? hovered ?? null);
          return null;
        });
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => () => { if (hoverCloseTimer.current) clearTimeout(hoverCloseTimer.current); }, []);

  const openNormal = (page: string, event?: React.MouseEvent) => {
    if (!onNormalNavigate) return;
    event?.preventDefault();
    onNormalNavigate(page);
    setOpenPanel(null);
    setSuppressedPanel(openPanel === "account" ? "account" : "normal");
  };
  const panelGroupProps = (panel: "normal" | "drama" | "credits" | "account") => ({
    "data-header-panel": panel,
    onFocusCapture: () => { if (hoverCloseTimer.current) clearTimeout(hoverCloseTimer.current); },
    onPointerEnter: (event: React.PointerEvent<HTMLDivElement>) => {
      if (hoverCloseTimer.current) clearTimeout(hoverCloseTimer.current);
      if (event.pointerType === "mouse") {
        setSuppressedPanel(null);
        setOpenPanel(panel);
      }
    },
    onPointerLeave: (event: React.PointerEvent<HTMLDivElement>) => {
      if (suppressedPanel === panel) setSuppressedPanel(null);
      if (event.pointerType === "mouse") {
        if ((panel === "credits" || panel === "account") && event.currentTarget.contains(document.activeElement)) return;
        hoverCloseTimer.current = setTimeout(() => setOpenPanel(current => current === panel ? null : current), 220);
      }
    },
    onBlurCapture: (event: React.FocusEvent<HTMLDivElement>) => {
      if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setOpenPanel(current => current === panel ? null : current);
    },
  });
  const logout = async () => {
    if (onBeforeLeave && !await onBeforeLeave()) return;
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  };
  const account = summary?.user ?? initialAccount;
  const workspaceCredits = summary?.workspace?.credits ?? initialWorkspaceCredits;
  const balanceOptions = [
    { id: "workspace", label: "Content Agent", configured: true, credits: workspaceCredits ?? null, unit: "CA credits", message: `${summary?.workspace.plan || "Workspace"} · ${summary?.workspace.name || "Content Agent"}`, kind: "Workspace credits" },
    ...(summary?.providers ?? []).map(provider => ({ ...provider, unit: provider.unit, kind: provider.unit === "USD" ? "Remaining monthly allowance" : provider.unit === "credits" ? "Provider credits" : "Connection status" })),
  ];
  const selectedBalance = balanceOptions.find(option => option.id === (pinnedBalance.scope === balanceScope ? pinnedBalance.id : "workspace")) ?? balanceOptions[0];
  const formatBalance = (balance: typeof balanceOptions[number]) => {
    if (typeof balance.credits !== "number" || !Number.isFinite(balance.credits)) return balance.configured ? "Unavailable" : "Not connected";
    return balance.unit === "USD"
      ? `${balance.credits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
      : `${balance.credits.toLocaleString()} ${balance.unit || "credits"}`;
  };
  const checkedAt = summary?.checkedAt && !Number.isNaN(Date.parse(summary.checkedAt)) ? new Date(summary.checkedAt) : null;
  const initials = (account?.name || "Content Agent")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <>
    <WorkspaceSidebar activeMode={activeMode} activePage={activePage} account={account} workspaceName={summary?.workspace.name} frontendBaseUrl={frontendBaseUrl} onHomeNavigate={onHomeNavigate} onNormalNavigate={onNormalNavigate} mobileOpen={mobileOpen} onClose={closeSidebar} />
    <div className="global-header" ref={headerRef}>
      <div className="global-header-inner">
        <div className="desktop-topbar-title">
          <button type="button" className="desktop-nav-open" aria-label="Open navigation" aria-expanded={mobileOpen} aria-controls="workspace-sidebar" onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
          <div className="desktop-breadcrumb"><span>Workspace</span><span aria-hidden="true">/</span><strong>{[...normalPages, ...dramaPages].find(page => page.id === activePage)?.label || (activePage === "settings" ? "Settings" : activePage === "account" ? "Account" : "Overview")}</strong></div>
        </div>

        <div className="global-header-actions">
          <div {...panelGroupProps("credits")} className={`global-action-group ${openPanel === "credits" ? "open" : ""} ${suppressedPanel === "credits" ? "suppress-hover" : ""}`}>
            <button type="button" className="global-credit-trigger" aria-label="Show credit balances" aria-expanded={openPanel === "credits"} onClick={() => setOpenPanel(openPanel === "credits" ? null : "credits")}>
              <Coins size={15} />
              <span className="global-action-label credit-pinned-label"><small>{selectedBalance.label}{creditsError ? " · Last known" : ""}</small><b>{formatBalance(selectedBalance)}</b></span>
              <ChevronDown size={12} />
            </button>
            <div className="global-popover credit-popover">
              <div className="global-popover-head">
                <div><b>Credits &amp; API balances</b><small>Choose the balance shown in your header</small></div>
                <button type="button" onClick={() => void refreshCredits()} disabled={loadingCredits} aria-label="Refresh credit balances"><RefreshCcw size={16} className={loadingCredits ? "credit-refreshing" : ""} /></button>
              </div>
              <p className={`credit-update-status ${creditsError ? "credit-update-error" : ""}`} role="status">
                {loadingCredits ? "Refreshing balances…" : creditsError ? "Could not refresh. Displayed balances may be out of date." : checkedAt ? `Checked ${checkedAt.toLocaleString()}` : "Balance details available below"}
              </p>
              <fieldset className="credit-provider-list"><legend>Show in header</legend>
                {balanceOptions.map(balance => (
                  <label className={`credit-balance-choice ${selectedBalance.id === balance.id ? "selected" : ""}`} key={balance.id}>
                    <input type="radio" name={balanceRadioName} value={balance.id} checked={selectedBalance.id === balance.id} onChange={() => selectBalance(balance.id)} aria-label={`Show ${balance.label} in header`} />
                    <span className="credit-balance-copy">
                      <span className="credit-balance-heading"><b>{balance.label}</b><strong>{formatBalance(balance)}</strong></span>
                      <small>{balance.kind} · {balance.message}</small>
                    </span>
                  </label>
                ))}
              </fieldset>
              <p className="credit-balance-note">CA credits, provider credits and USD allowances are separate balances.</p>
            </div>
          </div>

          <div {...panelGroupProps("account")} className={`global-action-group ${openPanel === "account" ? "open" : ""} ${suppressedPanel === "account" ? "suppress-hover" : ""}`}>
            <button type="button" className="global-account-trigger" aria-label="Open account menu" aria-expanded={openPanel === "account"} onClick={() => { if (hoverCloseTimer.current) clearTimeout(hoverCloseTimer.current); setOpenPanel(openPanel === "account" ? null : "account"); }}>
              <span className="global-account-avatar">{initials || "CA"}</span>
              <span className="global-action-label"><b>{account?.name || "Account"}</b><small>{account?.role || "Workspace user"}</small></span>
              <ChevronDown size={12} />
            </button>
            <div className="global-popover account-popover">
              <div className="account-summary"><span className="global-account-avatar large">{initials || "CA"}</span><span><b>{account?.name || "Content Agent user"}</b><small>{account?.email || "Signed-in account"}</small></span></div>
              <Link href={destination("/?view=account")} onClick={(event) => openNormal("account", event)}><UserRound size={14} /> Account</Link>
              <Link href={destination("/?view=settings")} onClick={(event) => openNormal("settings", event)}><Settings size={14} /> Settings</Link>
              <button type="button" onClick={() => void logout()}><LogOut size={14} /> Log out</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
