// Shared helpers for the /private-assets upload flow (owner-agnostic).

export const MAX_ASSET_SIZE_BYTES = 10 * 1024 * 1024; // 10 MiB

const ALLOWED_IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp"];
const ALLOWED_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
];

export interface ImageValidationResult {
  ok: boolean;
  error?: string;
}

export function validateImageFile(file: File): ImageValidationResult {
  if (!file) {
    return { ok: false, error: "No file provided" };
  }

  if (file.size > MAX_ASSET_SIZE_BYTES) {
    return { ok: false, error: "Image must be 10 MiB or smaller" };
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const extensionAllowed = ALLOWED_IMAGE_EXTENSIONS.includes(extension);
  const mimeAllowed = ALLOWED_IMAGE_MIME_TYPES.includes(file.type);

  if (!extensionAllowed && !mimeAllowed) {
    return {
      ok: false,
      error: "Unsupported image type. Use PNG, JPG, GIF, or WebP",
    };
  }

  return { ok: true };
}

// Transient, client-only id used to track a freshly inserted image placeholder
// while its upload is in flight (the real identity is the assetId the API
// returns on completion). Never persisted.
export function generateUploadId(prefix = "img"): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${random}`;
}
