import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { getProviderApiKey } from "@/lib/apiKeyOverrides";
import { readDb } from "@/lib/store";
import { KIE_MODELS } from "@/lib/kie-models";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  const [apiKey, db] = await Promise.all([getProviderApiKey("kie"), readDb()]);
  let credits: number | null = null;
  if (apiKey) {
    try {
      const response = await fetch("https://api.kie.ai/api/v1/chat/credit", {
        headers: { Authorization: `Bearer ${apiKey}` }, cache: "no-store", signal: AbortSignal.timeout(8000),
      });
      const payload = await response.json();
      const amount = typeof payload?.data === "number" || (typeof payload?.data === "string" && payload.data.trim()) ? Number(payload.data) : NaN;
      if (response.ok && Number(payload?.code) === 200 && Number.isFinite(amount) && amount >= 0) credits = amount;
    } catch { /* Unknown balance is distinct from zero. Never probe a paid generation. */ }
  }
  const logs = (db.debugLogs || []).filter(log => log.workspaceId === user.workspaceId && log.provider === "kie" && ["success", "failed"].includes(log.status));
  const models = KIE_MODELS.map(model => {
    const latest = logs.filter(log => log.details?.model === model.id || log.details?.modelId === model.id)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0];
    return { ...model, lastRequest: latest ? { status: latest.status === "success" ? "Succeeded" : /429|rate.limit/i.test(latest.error || "") ? "Rate limited" : "Failed", at: latest.createdAt } : null };
  });
  return NextResponse.json({ configured: Boolean(apiKey), credits, models, checkedAt: new Date().toISOString() }, { headers });
}
