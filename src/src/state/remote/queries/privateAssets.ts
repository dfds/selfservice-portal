import { useMutation, useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import {
  callApi,
  callApiMultipart,
  getSelfServiceAccessToken,
} from "@/AuthService";
import { composeSegmentsUrl } from "@/Utils";
import PreAppContext from "@/preAppContext";

export enum PrivateAssetOwnerType {
  EmailCampaign = "EmailCampaign",
}

export interface PrivateAsset {
  assetId: string;
  ownerId: string;
  ownerType: PrivateAssetOwnerType;
  isInline: boolean;
  sizeInBytes: number;
  createdAt: string;
  storageKey: string;
  fileName: string;
  mimeType: string;
  // Temporary presigned S3 URL (valid ~15 min). Use for preview only; may be
  // absent if signing failed after the upload was committed.
  url?: string;
}

export interface UploadPrivateAssetInput {
  file: File;
  ownerId: string;
  ownerType: PrivateAssetOwnerType;
  isInline: boolean;
}

// Sends the file and all metadata in a single multipart POST.
export async function uploadPrivateAsset(
  input: UploadPrivateAssetInput,
  isCloudEngineerEnabled: boolean,
): Promise<PrivateAsset> {
  const accessToken = await getSelfServiceAccessToken();
  if (!accessToken) {
    throw new Error("No access token available");
  }

  const formData = new FormData();
  formData.append("file", input.file);
  formData.append("ownerId", input.ownerId);
  formData.append("ownerType", input.ownerType);
  formData.append("isInline", String(input.isInline));

  const url = composeSegmentsUrl(["private-assets/upload"]);
  const response = await callApiMultipart(
    url,
    accessToken,
    formData,
    isCloudEngineerEnabled,
  );

  if (!response.ok) {
    const err = new Error("Asset upload failed");
    (err as any).data = response;
    throw err;
  }

  return response.json();
}

export function useUploadPrivateAsset() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  return useMutation({
    mutationFn: (input: UploadPrivateAssetInput) =>
      uploadPrivateAsset(input, isCloudEngineerEnabled),
  });
}

export function useOwnerAssets(
  ownerId: string | undefined,
  ownerType: PrivateAssetOwnerType,
) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  return useQuery<PrivateAsset[]>({
    queryKey: ["privateAssets", ownerType, ownerId],
    enabled: !!ownerId,
    queryFn: async () => {
      const accessToken = await getSelfServiceAccessToken();
      if (!accessToken) {
        throw new Error("No access token available");
      }
      const url = composeSegmentsUrl([
        `private-assets?ownerId=${encodeURIComponent(
          ownerId as string,
        )}&ownerType=${encodeURIComponent(ownerType)}`,
      ]);
      const response = await callApi(
        url,
        accessToken,
        "GET",
        null,
        isCloudEngineerEnabled,
      );
      if (!response.ok) {
        const err = new Error("Could not load assets");
        (err as any).data = response;
        throw err;
      }
      return response.json();
    },
  });
}
