import { useState, useCallback, useContext } from "react";
import {
  useUploadPrivateAsset,
  PrivateAssetOwnerType,
} from "@/state/remote/queries/privateAssets";
import {
  validateImageFile,
  generateUploadId,
  MAX_ASSET_SIZE_BYTES,
} from "@/lib/privateAssetUtils";
import { useToast } from "@/context/ToastContext";
import PreAppContext from "@/preAppContext";

export interface UploadingImage {
  uploadId: string;
  file: File;
  progress: number;
  error?: string;
  assetId?: string;
}

export interface UseImageUploadReturn {
  uploadingImages: UploadingImage[];
  uploadImage: (
    file: File,
    ownerType: PrivateAssetOwnerType,
  ) => Promise<string>;
  clearUploads: () => void;
  cancelUpload: (uploadId: string) => void;
}

export function useImageUpload(): UseImageUploadReturn {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const toast = useToast();
  const uploadAsset = useUploadPrivateAsset();

  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([]);

  const uploadImage = useCallback(
    async (file: File, ownerType: PrivateAssetOwnerType): Promise<string> => {
      const uploadId = generateUploadId("img");

      setUploadingImages((prev) => [...prev, { uploadId, file, progress: 0 }]);

      try {
        const validation = validateImageFile(file);
        if (!validation.ok) {
          const errorMsg = validation.error || "Invalid image file";
          setUploadingImages((prev) =>
            prev.map((img) =>
              img.uploadId === uploadId
                ? { ...img, error: errorMsg, progress: 0 }
                : img,
            ),
          );
          toast?.error(errorMsg);
          throw new Error(errorMsg);
        }

        // Upload without owner since we'll claim it on save
        const result = await uploadAsset.mutateAsync({
          file,
          ownerType,
          isInline: true,
        });

        setUploadingImages((prev) =>
          prev.map((img) =>
            img.uploadId === uploadId
              ? { ...img, progress: 100, assetId: result.assetId }
              : img,
          ),
        );

        return result.assetId;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to upload image";
        setUploadingImages((prev) =>
          prev.map((img) =>
            img.uploadId === uploadId ? { ...img, error: errorMsg } : img,
          ),
        );
        toast?.error(errorMsg);
        throw err;
      }
    },
    [uploadAsset, toast],
  );

  const clearUploads = useCallback(() => {
    setUploadingImages([]);
  }, []);

  const cancelUpload = useCallback((uploadId: string) => {
    setUploadingImages((prev) =>
      prev.filter((img) => img.uploadId !== uploadId),
    );
  }, []);

  return {
    uploadingImages,
    uploadImage,
    clearUploads,
    cancelUpload,
  };
}
