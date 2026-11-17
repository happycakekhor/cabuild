// Only models with provider integrations in Content Creator or Drama Studio.
export const BRIEF_MODELS = [
  { id: "gpt-5-5", label: "GPT-5.5" },
  { id: "gemini-3-pro", label: "Gemini 3 Pro" },
] as const;
export type BriefModelId = typeof BRIEF_MODELS[number]["id"];

export const KIE_MODELS = [
  ...BRIEF_MODELS.map(model => ({ ...model, kind: "Writing", note: "" })),
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", kind: "Writing", note: "" },
  { id: "gemini-3.5-flash", label: "Gemini 3.5 Flash", kind: "Writing", note: "Retired by provider" },
  { id: "gpt-image-2", label: "GPT Image 2", kind: "Image", note: "" },
  { id: "nanobanana-pro", label: "Nano Banana Pro", kind: "Image", note: "" },
  { id: "seedream-4.5", label: "Seedream 4.5", kind: "Image", note: "" },
  { id: "qwen2-image", label: "Qwen2 Image", kind: "Image", note: "" },
  { id: "veo-fast", label: "Veo Fast", kind: "Video", note: "" },
  { id: "seedance-2.0", label: "Seedance 2.0", kind: "Video", note: "" },
  { id: "kling-3.0", label: "Kling 3.0", kind: "Video", note: "" },
  { id: "kling-v3-turbo", label: "Kling V3 Turbo", kind: "Video", note: "" },
] as const;

export type KieModelBalance = {
  configured: boolean;
  credits: number | null;
  checkedAt: string;
  models: Array<{ id: string; label: string; kind: string; note: string; lastRequest: { status: string; at: string } | null }>;
};
