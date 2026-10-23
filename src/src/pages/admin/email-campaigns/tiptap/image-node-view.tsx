import React from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Loader2 } from "lucide-react";

// Shows a spinner until the image src is a real URL. Inline images are stored by
// cid:{contentId} and only get a presigned URL once the asset list resolves.
export function ImageNodeView({ node }: NodeViewProps) {
  const { src, alt, title } = node.attrs as {
    src?: string;
    alt?: string;
    title?: string;
  };
  const isResolved = !!src && !src.startsWith("cid:");

  return (
    <NodeViewWrapper as="div" className="inline-image-node" data-drag-handle>
      {isResolved ? (
        <img
          src={src}
          alt={alt || ""}
          title={title || ""}
          className="max-w-full h-auto rounded"
        />
      ) : (
        <span className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-dashed border-card bg-surface-subtle text-muted text-[0.75rem]">
          <Loader2 size={14} className="animate-spin" />
          Loading image…
        </span>
      )}
    </NodeViewWrapper>
  );
}
