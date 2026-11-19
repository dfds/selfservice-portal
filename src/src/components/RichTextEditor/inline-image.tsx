import React from "react";
import { Image } from "@tiptap/extension-image";
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react";
import { Loader2 } from "lucide-react";
export { serializeRichContentDocument as serializeInlineImageJson } from "@/lib/richContent";

export function ImageNodeView({ node }: NodeViewProps) {
  const { src, alt, title } = node.attrs;
  const resolved = !!src && !src.startsWith("cid:");
  return (
    <NodeViewWrapper as="div" className="inline-image-node" data-drag-handle>
      {resolved ? (
        <img
          src={src}
          alt={alt || ""}
          title={title || ""}
          className="max-w-full h-auto rounded"
        />
      ) : (
        <span
          role="status"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-dashed border-card bg-surface-subtle text-muted text-[0.75rem]"
        >
          <Loader2 size={14} className="animate-spin" />
          Loading image...
        </span>
      )}
    </NodeViewWrapper>
  );
}

export const InlineImage = Image.extend({
  name: "image",
  addAttributes() {
    return {
      ...this.parent?.(),
      assetId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-asset-id"),
        renderHTML: (attributes) =>
          attributes.assetId ? { "data-asset-id": attributes.assetId } : {},
      },
      uploadId: { default: null, rendered: false },
      isInline: {
        default: true,
        parseHTML: (element) => element.getAttribute("data-inline") !== "false",
        renderHTML: (attributes) => ({
          "data-inline": String(attributes.isInline),
        }),
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});

export function serializeInlineImages(html: string): string {
  if (!html || typeof DOMParser === "undefined") return html;
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.body.querySelectorAll("img[data-asset-id]").forEach((image) => {
    const assetId = image.getAttribute("data-asset-id");
    if (assetId && image.getAttribute("data-inline") !== "false") {
      image.setAttribute("src", `cid:${assetId}`);
    }
  });
  return doc.body.innerHTML;
}

export function resolveInlineImageUrls(
  html: string,
  urlByAssetId: Map<string, string>,
  loading = false,
): string {
  if (!html || typeof DOMParser === "undefined") return html;
  const doc = new DOMParser().parseFromString(html, "text/html");
  let addedPlaceholder = false;
  doc.body.querySelectorAll("img").forEach((image) => {
    const src = image.getAttribute("src") || "";
    if (!src.startsWith("cid:")) return;
    const url = urlByAssetId.get(src.slice(4));
    if (url) {
      image.setAttribute("src", url);
      return;
    }
    const placeholder = doc.createElement("span");
    placeholder.className = loading ? "cid-image-loading" : "cid-image-missing";
    placeholder.textContent = loading
      ? "Loading image..."
      : "Image unavailable";
    image.replaceWith(placeholder);
    addedPlaceholder = true;
  });
  if (addedPlaceholder) {
    const style = doc.createElement("style");
    style.textContent = `
      .cid-image-loading, .cid-image-missing {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 8px 12px; border: 1px dashed #cbd5e1; border-radius: 6px;
        color: #64748b; font-size: 12px; font-family: sans-serif;
      }
      .cid-image-loading::before {
        content: ""; width: 12px; height: 12px; border-radius: 50%;
        border: 2px solid #cbd5e1; border-top-color: #64748b;
        animation: cid-spin 0.7s linear infinite;
      }
      @keyframes cid-spin { to { transform: rotate(360deg); } }
    `;
    (doc.head || doc.body).appendChild(style);
  }
  return /<html[\s>]/i.test(html)
    ? doc.documentElement.outerHTML
    : doc.body.innerHTML;
}
