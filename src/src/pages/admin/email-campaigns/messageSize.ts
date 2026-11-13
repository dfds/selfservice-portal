const encoder = new TextEncoder();

export const MAX_EMAIL_SIZE_BYTES = 2.5 * 1024 * 1024;

export function estimateEmailMessageBytes(
  subject: string,
  bodyHtml: string,
  imageSizesInBytes: number[],
): number {
  const textBytes =
    encoder.encode(subject).length + encoder.encode(bodyHtml).length;
  const encodedImageBytes = imageSizesInBytes.reduce((total, imageBytes) => {
    const base64Bytes = 4 * Math.ceil(imageBytes / 3);
    const mimeLineBreakBytes = 2 * Math.ceil(base64Bytes / 76);
    return total + base64Bytes + mimeLineBreakBytes;
  }, 0);

  return textBytes + encodedImageBytes;
}

export function formatEmailSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.ceil(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}