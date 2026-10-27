import { Image } from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ImageNodeView } from "./image-node-view";

// Extends the base image node with the private-asset identity (assetId) and
// inline flag. The editor DOM uses `src` for a presigned preview URL, while the
// persisted HTML src is rewritten to `cid:{assetId}` at save time so inline
// attachments render in the sent email after the preview URL expires.
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
      // Transient, client-only marker used to locate a placeholder while its
      // upload is in flight; never parsed from or rendered to HTML.
      uploadId: {
        default: null,
        rendered: false,
      },
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

// Rewrites inline image sources to `cid:{assetId}` so persisted HTML carries a
// stable reference instead of an expiring presigned URL. Non-inline or
// assetId-less images are left untouched.
export function serializeInlineImages(html: string): string {
  if (!html || typeof DOMParser === "undefined") return html;

  const doc = new DOMParser().parseFromString(html, "text/html");
  const images = doc.body.querySelectorAll("img[data-asset-id]");
  images.forEach((img) => {
    const assetId = img.getAttribute("data-asset-id");
    const isInline = img.getAttribute("data-inline") !== "false";
    if (assetId && isInline) {
      img.setAttribute("src", `cid:${assetId}`);
    }
  });
  return doc.body.innerHTML;
}

type ProseMirrorJsonNode = {
  type?: string;
  attrs?: Record<string, any>;
  content?: ProseMirrorJsonNode[];
};

// Rewrites inline image sources in a ProseMirror JSON doc to cid:{assetId} so
// contentJson stores the stable identity, not an expiring presigned URL.
export function serializeInlineImageJson<T>(doc: T): T {
  const clone = JSON.parse(JSON.stringify(doc)) as ProseMirrorJsonNode;

  const walk = (node: ProseMirrorJsonNode) => {
    if (
      node.type === "image" &&
      node.attrs?.assetId &&
      node.attrs?.isInline !== false
    ) {
      node.attrs = { ...node.attrs, src: `cid:${node.attrs.assetId}` };
    }
    node.content?.forEach(walk);
  };

  walk(clone);
  return clone as T;
}

// Replaces cid:{assetId} image sources with presigned preview URLs so inline
// images render outside the editor (e.g. in server-rendered previews). Images
// that cannot be resolved are swapped for a placeholder: a spinner while the
// asset list is still loading, otherwise an "unavailable" note.
export function resolveInlineImageUrls(
  html: string,
  urlByAssetId: Map<string, string>,
  loading = false,
): string {
  if (!html || typeof DOMParser === "undefined") return html;

  const doc = new DOMParser().parseFromString(html, "text/html");
  let addedPlaceholder = false;

  doc.body.querySelectorAll("img").forEach((img) => {
    const src = img.getAttribute("src") || "";
    if (!src.startsWith("cid:")) return;

    const url = urlByAssetId.get(src.slice(4));
    if (url) {
      img.setAttribute("src", url);
      return;
    }

    const placeholder = doc.createElement("span");
    placeholder.className = loading ? "cid-image-loading" : "cid-image-missing";
    placeholder.textContent = loading ? "Loading image…" : "Image unavailable";
    img.replaceWith(placeholder);
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

  // Preserve the full document when the server returned one; otherwise the
  // DOMParser-wrapped body is the original fragment.
  return /<html[\s>]/i.test(html)
    ? doc.documentElement.outerHTML
    : doc.body.innerHTML;
}
