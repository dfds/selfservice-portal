import React, { useState, useRef } from "react";
import { X, Upload, Image as ImageIcon, AlertCircle } from "lucide-react";
import {
  PrivateAssetOwnerType,
  useOwnerAssets,
} from "@/state/remote/queries/privateAssets";
import { useImageUpload } from "@/hooks/useImageUpload";
import { MAX_ASSET_SIZE_BYTES } from "@/lib/privateAssetUtils";
import styles from "./ImageUploadSection.module.css";

interface ImageUploadSectionProps {
  ownerId?: string;
  ownerType: PrivateAssetOwnerType;
  assetIds: string[];
  onAssetIdsChange: (assetIds: string[]) => void;
  disabled?: boolean;
}

function UploadPreview({ file }: { file: File }) {
  const [url, setUrl] = useState<string>();

  React.useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return url ? (
    <img src={url} alt={file.name} className={styles.assetPreview} />
  ) : null;
}

export function ImageUploadSection({
  ownerId,
  ownerType,
  assetIds,
  onAssetIdsChange,
  disabled = false,
}: ImageUploadSectionProps) {
  const { data: assets = [] } = useOwnerAssets(ownerId, ownerType);
  const { uploadingImages, uploadImage, cancelUpload } = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  React.useEffect(() => {
    console.log("[ImageUploadSection] Debug:", {
      ownerId,
      ownerType,
      assetIds,
      assetsLoaded: assets.length,
      assets,
    });
  }, [ownerId, ownerType, assetIds, assets]);

  const assetMap = new Map(assets.map((a) => [a.assetId, a]));
  const displayedAssets = assetIds
    .map((id) => assetMap.get(id))
    .filter((a) => !!a);

  // Create preview URLs for uploaded files for immediate visual feedback
  const uploadPreviews = uploadingImages
    .filter((img) => img.assetId) // Only show when assetId is set (upload completed)
    .map((img) => ({
      assetId: img.assetId!,
      file: img.file,
    }));

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        setUploadError(null);
        const assetId = await uploadImage(file, ownerType);
        onAssetIdsChange([...assetIds, assetId]);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Upload failed");
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveAsset = (assetId: string) => {
    onAssetIdsChange(assetIds.filter((id) => id !== assetId));
    // Also remove from uploading list if it's there
    cancelUpload(
      uploadingImages.find((img) => img.assetId === assetId)?.uploadId || "",
    );
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <label className={styles.label}>
          <ImageIcon size={16} />
          Images
        </label>
        <span className={styles.optional}>(optional)</span>
      </div>

      {uploadError && (
        <div className={styles.errorAlert}>
          <AlertCircle size={16} />
          <span>{uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className={styles.closeError}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      <div className={styles.uploadArea}>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled || uploadingImages.length > 0}
          className={styles.hiddenInput}
          aria-label="Upload images"
        />

        <button
          type="button"
          onClick={handleBrowseClick}
          disabled={disabled || uploadingImages.length > 0}
          className={styles.browseButton}
        >
          <Upload size={18} />
          Browse images
        </button>

        <p className={styles.hint}>
          PNG, JPG, GIF, or WebP • Max{" "}
          {Math.floor(MAX_ASSET_SIZE_BYTES / 1024 / 1024)}MB
        </p>
      </div>

      {/* Uploading images */}
      {uploadingImages.filter((img) => !img.assetId).length > 0 && (
        <div className={styles.uploadingList}>
          <div className={styles.uploadingLabel}>Uploading...</div>
          {uploadingImages
            .filter((img) => !img.assetId)
            .map((img) => (
              <div key={img.uploadId} className={styles.uploadingItem}>
                <div className={styles.uploadingName}>{img.file.name}</div>
                {img.error ? (
                  <div className={styles.uploadingError}>
                    Failed: {img.error}
                  </div>
                ) : (
                  <>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${img.progress}%` }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => cancelUpload(img.uploadId)}
                      className={styles.cancelButton}
                      aria-label={`Cancel upload of ${img.file.name}`}
                    >
                      ×
                    </button>
                  </>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Uploaded images */}
      {(displayedAssets.length > 0 || uploadPreviews.length > 0) && (
        <div className={styles.assetsList}>
          <div className={styles.assetsLabel}>
            Images ({displayedAssets.length + uploadPreviews.length})
          </div>
          <div className={styles.assetsGrid}>
            {/* Saved images from backend */}
            {displayedAssets.map((asset) => (
              <div key={asset!.assetId} className={styles.assetItem}>
                {asset!.url ? (
                  <img
                    src={asset!.url}
                    alt={asset!.fileName}
                    className={styles.assetPreview}
                  />
                ) : (
                  <div className={styles.assetPlaceholder}>
                    <ImageIcon size={32} />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveAsset(asset!.assetId)}
                  disabled={disabled}
                  className={styles.removeButton}
                  title="Remove image"
                  aria-label={`Remove ${asset!.fileName}`}
                >
                  <X size={16} />
                </button>
                <div className={styles.assetInfo}>{asset!.fileName}</div>
              </div>
            ))}
            {/* Upload previews (from File objects) */}
            {uploadPreviews.map((preview) => (
              <div key={preview.assetId} className={styles.assetItem}>
                <UploadPreview file={preview.file} />
                <button
                  type="button"
                  onClick={() => handleRemoveAsset(preview.assetId)}
                  disabled={disabled}
                  className={styles.removeButton}
                  title="Remove image"
                  aria-label={`Remove ${preview.file.name}`}
                >
                  <X size={16} />
                </button>
                <div className={styles.assetInfo}>{preview.file.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
