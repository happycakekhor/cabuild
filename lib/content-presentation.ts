import type { Asset, Brief, PublishItem } from "./types";

/** Display saved publishing copy, never the prompt-derived internal title. */
export function contentPresentation(item: PublishItem, asset?: Asset, brief?: Brief) {
  const video = item.generationType === "video" || asset?.type === "video" || asset?.type === "ugc";
  const image = !video && (item.generationType === "image" || asset?.type === "image" || asset?.type === "carousel");
  const type = video ? "Video" : image ? "Image" : "Text post";
  const settings = { ...asset?.generationSettings, ...item.generationSettings };
  const caption = item.caption?.trim() || brief?.caption?.trim() || "";
  const description = brief?.description?.trim() || (typeof settings.description === "string" ? settings.description.trim() : "");
  const copy = caption || description;
  const firstLine = copy.split(/\n/)[0];
  const title = firstLine ? firstLine.length > 140 ? `${firstLine.slice(0, 137)}…` : firstLine : `Untitled ${type.toLowerCase()}`;
  return { video, image, type, caption, description, title, url: item.assetUrl || asset?.assetUrl,
    summary: description || (caption.includes("\n") ? caption.slice(caption.indexOf("\n") + 1).trim() : ""),
    status: item.status === "done" ? "Ready" : item.status.charAt(0).toUpperCase() + item.status.slice(1) };
}
