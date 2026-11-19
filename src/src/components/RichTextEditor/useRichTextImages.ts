import { useEffect, useRef, useState, type ChangeEvent } from "react";
import type { Editor } from "@tiptap/react";
import {
  PrivateAssetOwnerType,
  useOwnerAssets,
  useUploadPrivateAsset,
} from "@/state/remote/queries/privateAssets";
import { generateUploadId, validateImageFile } from "@/lib/privateAssetUtils";

interface RichTextImagesOptions {
  editor: Editor | null;
  ownerId?: string;
  ownerType: PrivateAssetOwnerType;
  maxSize?: number;
  contentReady?: boolean;
  onUploadingChange?: (uploading: boolean) => void;
}

export function useRichTextImages({
  editor,
  ownerId,
  ownerType,
  maxSize = Infinity,
  contentReady = true,
  onUploadingChange,
}: RichTextImagesOptions) {
  const uploadAsset = useUploadPrivateAsset();
  const assets = useOwnerAssets(ownerId, ownerType);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadingRef = useRef(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const urlByAssetId = new Map<string, string>();
  assets.data?.forEach((asset) => {
    if (asset.url) urlByAssetId.set(asset.assetId, asset.url);
  });

  useEffect(() => {
    if (!editor || !contentReady) return;
    const resolveImages = () => {
      if (editor.isDestroyed) return;
      const transaction = editor.state.tr;
      editor.state.doc.descendants((node, position) => {
        if (node.type.name !== "image") return;
        const assetId =
          node.attrs.assetId ||
          (node.attrs.src?.startsWith("cid:") ? node.attrs.src.slice(4) : null);
        const url = assets.data?.find((asset) => asset.assetId === assetId)
          ?.url;
        if (url && node.attrs.src !== url) {
          transaction.setNodeMarkup(position, undefined, {
            ...node.attrs,
            assetId,
            src: url,
          });
        }
      });
      if (transaction.docChanged) {
        transaction.setMeta("addToHistory", false);
        transaction.setMeta("skipDirty", true);
        editor.view.dispatch(transaction);
      }
    };
    resolveImages();
    editor.on("update", resolveImages);
    return () => {
      editor.off("update", resolveImages);
    };
  }, [editor, assets.data, contentReady]);

  const updateUpload = (
    uploadId: string,
    asset?: { assetId: string; url?: string },
  ) => {
    if (!editor || editor.isDestroyed) return;
    const transaction = editor.state.tr;
    editor.state.doc.descendants((node, position) => {
      if (node.type.name !== "image" || node.attrs.uploadId !== uploadId)
        return;
      if (asset) {
        transaction.setNodeMarkup(position, undefined, {
          ...node.attrs,
          assetId: asset.assetId,
          src: asset.url || `cid:${asset.assetId}`,
          uploadId: null,
        });
      } else {
        transaction.delete(position, position + node.nodeSize);
      }
      return false;
    });
    if (transaction.docChanged) {
      transaction.setMeta("addToHistory", false);
      transaction.setMeta("skipDirty", true);
      editor.view.dispatch(transaction);
    }
  };

  const uploadImage = async (file: File) => {
    if (!editor || !ownerId || uploadingRef.current) return;
    const validation = validateImageFile(file, maxSize);
    if (!validation.ok) {
      setError(validation.error || "Invalid image");
      return;
    }
    const uploadId = generateUploadId();
    editor
      .chain()
      .focus()
      .insertContentAt(editor.state.selection.to, {
        type: "image",
        attrs: {
          src: "",
          assetId: null,
          isInline: true,
          uploadId,
          alt: file.name,
        },
      })
      .run();
    uploadingRef.current = true;
    setUploading(true);
    setError("");
    onUploadingChange?.(true);
    try {
      const asset = await uploadAsset.mutateAsync({
        file,
        ownerId,
        ownerType,
        isInline: true,
      });
      updateUpload(uploadId, asset);
      const refreshed = await assets.refetch();
      if (
        !asset.url &&
        !refreshed.data?.find((item) => item.assetId === asset.assetId)?.url
      ) {
        setError("Image uploaded, but its preview is currently unavailable");
      }
    } catch {
      updateUpload(uploadId);
      setError("Could not upload image. Please retry.");
    } finally {
      uploadingRef.current = false;
      setUploading(false);
      onUploadingChange?.(false);
    }
  };

  return {
    inputRef,
    uploading,
    error,
    uploadImage,
    urlByAssetId,
    fetching: assets.isFetching,
    insertImage: () => inputRef.current?.click(),
    onFileChange: (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (file) void uploadImage(file);
    },
  };
}
