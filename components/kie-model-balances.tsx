"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Coins, RefreshCcw, X } from "lucide-react";
import { CREDIT_REFRESH_EVENT } from "@/lib/credit-refresh";
import type { KieModelBalance } from "@/lib/kie-models";

export default function KieModelBalances() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<KieModelBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const request = useRef<AbortController | null>(null);
  const refreshPending = useRef(false);
  const checked = useRef(0);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  const panelId = useId();
  const refresh = useCallback(async function loadBalance(force = false): Promise<void> {
    if (request.current) { if (force) refreshPending.current = true; return; }
    if (!force && Date.now() - checked.current < 60_000) return;
    const controller = new AbortController(); request.current = controller;
    setLoading(true);
    try {
      const response = await fetch("/api/account/kie-models", { cache: "no-store", signal: controller.signal });
      if (!response.ok) throw new Error("Balance unavailable");
      const result = await response.json() as KieModelBalance;
      if (!Array.isArray(result.models) || typeof result.configured !== "boolean" || (result.credits !== null && (typeof result.credits !== "number" || !Number.isFinite(result.credits)))) throw new Error("Balance unavailable");
      setData(result); setFailed(false); checked.current = Date.now();
    } catch {
      if (!controller.signal.aborted) setFailed(true);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
      if (request.current === controller) request.current = null;
      if (!controller.signal.aborted && refreshPending.current) { refreshPending.current = false; void loadBalance(true); }
    }
  }, []);
  useEffect(() => { if (open) void refresh(); }, [open, refresh]);
  useEffect(() => {
    const invalidate = () => { checked.current = 0; if (open || request.current) void refresh(true); };
    window.addEventListener(CREDIT_REFRESH_EVENT, invalidate);
    return () => window.removeEventListener(CREDIT_REFRESH_EVENT, invalidate);
  }, [open, refresh]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); if (root.current?.contains(document.activeElement)) trigger.current?.focus(); } };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);
  useEffect(() => () => { request.current?.abort(); clearTimeout(closeTimer.current); }, []);
  const close = () => { setOpen(false); trigger.current?.focus(); };
  return <div className="brief-kie-balances" ref={root}
    onPointerEnter={event => { clearTimeout(closeTimer.current); if (event.pointerType === "mouse") setOpen(true); }}
    onPointerLeave={event => { if (event.pointerType === "mouse" && !root.current?.contains(document.activeElement)) closeTimer.current = setTimeout(() => setOpen(false), 220); }}
    onBlur={event => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false); }}
    onKeyDown={event => { if (event.key === "Escape" && open) { event.preventDefault(); event.stopPropagation(); close(); } }}>
    <button type="button" ref={trigger} className="brief-balance-trigger" aria-label="Kie models" aria-expanded={open} aria-controls={panelId} aria-haspopup="dialog" onClick={() => setOpen(current => !current)}><Coins size={16} aria-hidden="true" />Kie</button>
    {open && <div id={panelId} role="dialog" aria-label="Kie model balances" className="brief-balance-popover">
      <div className="brief-balance-head"><b>Kie models in CABUILD</b><button type="button" aria-label="Close Kie model balances" onClick={close}><X size={16} /></button></div>
      <div className="brief-shared-balance"><span>Shared credits remaining</span><strong>{data ? !data.configured ? "Not connected" : data.credits === null ? "Unavailable" : data.credits.toLocaleString(undefined, { maximumFractionDigits: 4 }) : loading ? "Loading…" : "Unavailable"}</strong><button type="button" aria-label="Refresh Kie model balances" onClick={() => void refresh(true)} disabled={loading}><RefreshCcw size={16} aria-hidden="true" /></button></div>
      <p className="brief-balance-note">These models share one Kie balance. Kie does not report remaining tokens or live capacity per model.</p>
      <p className="brief-balance-status" role="status">{loading ? "Checking balance…" : failed ? "Could not refresh. Any displayed balance is last known." : data?.checkedAt ? `Checked ${new Date(data.checkedAt).toLocaleString()}` : "Balance unavailable"}</p>
      {data?.models.map(model => <div className="brief-model-balance-row" key={model.id}><span><b>{model.label}</b><small>{model.kind} · Shared credit pool</small></span><span><small>{model.note || "Live capacity unknown"}</small>{model.lastRequest && <small>Last request: {model.lastRequest.status} · {new Date(model.lastRequest.at).toLocaleString()}</small>}</span></div>)}
    </div>}
  </div>;
}
