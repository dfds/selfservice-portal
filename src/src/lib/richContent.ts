import type { JSONContent } from "@tiptap/react";

export function isRichContent(value: string): boolean {
  try {
    const parsed = JSON.parse(value);
    return parsed?.type === "doc" && Array.isArray(parsed.content);
  } catch {
    return false;
  }
}

export function parseRichContent(value: string | JSONContent): JSONContent {
  if (typeof value !== "string") return value;
  try {
    const parsed = JSON.parse(value);
    if (parsed?.type === "doc" && Array.isArray(parsed.content)) return parsed;
  } catch {
    return plainTextContent(value);
  }
  return plainTextContent(value);
}

function plainTextContent(value: string): JSONContent {
  return {
    type: "doc",
    content: value.split(/\r?\n/).map((text) => ({
      type: "paragraph",
      ...(text ? { content: [{ type: "text", text }] } : {}),
    })),
  };
}

export function richContentText(value: string | JSONContent = ""): string {
  if (typeof value === "string" && !isRichContent(value)) return value;
  const visit = (node: JSONContent): string => {
    if (node.type === "image") return "";
    if (node.type === "hardBreak") return "\n";
    if (node.text) return node.text;
    const text = (node.content || []).map(visit).join("");
    return ["paragraph", "heading", "listItem"].includes(node.type || "")
      ? `${text}\n`
      : text;
  };
  return visit(parseRichContent(value || "")).trim();
}

export function serializeRichContentDocument<T>(doc: T): T {
  const visit = (node: JSONContent): JSONContent => ({
    ...node,
    ...(node.type === "image" &&
    node.attrs?.assetId &&
    node.attrs.isInline !== false
      ? { attrs: { ...node.attrs, src: `cid:${node.attrs.assetId}` } }
      : {}),
    ...(node.content ? { content: node.content.map(visit) } : {}),
  });
  return visit(doc as JSONContent) as T;
}

export function serializeRichContent(doc: JSONContent): string {
  return JSON.stringify(serializeRichContentDocument(doc));
}

export function richContentAssetIds(doc: JSONContent): string[] {
  const ids = new Set<string>();
  const visit = (node: JSONContent) => {
    if (node.type === "image" && node.attrs?.assetId)
      ids.add(node.attrs.assetId);
    node.content?.forEach(visit);
  };
  visit(doc);
  return [...ids];
}

export function hasRichContent(value: string): boolean {
  return (
    !!richContentText(value).trim() ||
    richContentAssetIds(parseRichContent(value)).length > 0
  );
}
