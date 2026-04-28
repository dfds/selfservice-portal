import { useQuery } from "@tanstack/react-query";
import { msGraphRequest, ssuRequest } from "../query";
import { useEffect, useState, useContext } from "react";
import PreAppContext from "@/preAppContext";
import { sortByField } from "@/lib/utils";
import { fetchUserPhoto } from "@/lib/graphUtils";
import {
  createSsuQuery,
  createSsuParamQuery,
  createSsuLinkQuery,
  createSsuMutation,
} from "../queryFactory";

const sortByName = sortByField<any>("name");

// ── Queries (factory) ────────────────────────────────────────────────────────

export const useCapabilities = createSsuQuery({
  queryKey: ["capabilities", "list"],
  urlSegments: ["capabilities"],
  select: (data: any) => {
    let list = data.items || [];
    sortByName(list);
    return list;
  },
  staleTime: 30000,
});

export const useCapability = createSsuParamQuery<string>({
  queryKey: (id) => ["capabilities", "details", id],
  urlSegments: (id) => ["capabilities", id],
  staleTime: 30000,
});

export const useCapabilityAdd = createSsuMutation<any>({
  method: "POST",
  urlSegments: () => ["capabilities"],
});

export const useCostCentreCompliance = createSsuParamQuery<string | null>({
  queryKey: (costCentre) => ["compliance", "cost-centres", costCentre],
  urlSegments: (costCentre) => ["compliance", "cost-centres", costCentre!],
  enabled: (cc) => !!cc,
  staleTime: 60000,
});

export const useCapabilityCompliance = createSsuParamQuery<string | null>({
  queryKey: (capabilityId) => ["capabilities", "compliance", capabilityId],
  urlSegments: (capabilityId) => [
    "compliance",
    "capabilities",
    capabilityId!,
  ],
  enabled: (id) => !!id,
  staleTime: 60000,
});

export const useCapabilityMetadata = createSsuLinkQuery<any>({
  queryKey: (def) => ["capabilities", "metadata", def?.id],
  linkHref: (def) => def?._links?.metadata?.href,
});

export const useUpdateCapabilityMetadata = createSsuMutation<any>({
  method: "POST",
  urlSegments: (data) => [
    data.capabilityDefinition?._links.metadata.href,
  ],
});

export const useUpdateRequiredCapabilityMetadata = createSsuMutation<any>({
  method: "POST",
  urlSegments: (data) => [
    data.capabilityDefinition?._links.setRequiredMetadata.href,
  ],
});

export const useLeaveCapability = createSsuMutation<any>({
  method: "POST",
  urlSegments: (data) => [
    data.capabilityDefinition?._links?.leaveCapability.href,
  ],
  payload: () => null,
});

export const useCancelCapabilityDeletion = createSsuMutation<any>({
  method: "POST",
  urlSegments: (data) => [
    "capabilities",
    data.capabilityId,
    "canceldeletionrequest",
  ],
  payload: () => null,
});

export const useCapabilityAwsAccount = createSsuParamQuery<string>({
  queryKey: (capabilityId) => [
    "capabilities",
    "aws-account",
    capabilityId,
  ],
  urlSegments: (capabilityId) => [
    "capabilities",
    capabilityId,
    "awsaccount",
  ],
  enabled: (id) => !!id,
});

export const useCapabilityAzureResourcesById =
  createSsuParamQuery<string>({
    queryKey: (capabilityId) => [
      "capabilities",
      "azure-resources",
      capabilityId,
    ],
    urlSegments: (capabilityId) => [
      "capabilities",
      capabilityId,
      "azureresources",
    ],
    enabled: (id) => !!id,
  });

export const useCapabilityKafkaAccess = createSsuParamQuery<string>({
  queryKey: (capabilityId) => [
    "capabilities",
    "kafka-access",
    capabilityId,
  ],
  urlSegments: (capabilityId) => [
    "capabilities",
    capabilityId,
    "kafkaclusteraccess",
  ],
  enabled: (id) => !!id,
});

export const useCapabilityMembers = createSsuParamQuery<string>({
  queryKey: (capabilityId) => ["capabilities", "members", capabilityId],
  urlSegments: (capabilityId) => [
    "capabilities",
    capabilityId,
    "members",
  ],
  enabled: (id) => !!id,
  select: (data: any) => data.items || [],
});

export const useCapabilityMetadataById = createSsuParamQuery<string>({
  queryKey: (capabilityId) => [
    "capabilities",
    "metadata-raw",
    capabilityId,
  ],
  urlSegments: (capabilityId) => [
    "capabilities",
    capabilityId,
    "metadata",
  ],
  authMode: true,
  enabled: (id) => !!id,
});

export const useSetCapabilityMetadata = createSsuMutation<{
  capabilityId: string;
  metadata: any;
}>({
  method: "POST",
  urlSegments: (data) => ["capabilities", data.capabilityId, "metadata"],
  payload: (data) => ({ JsonMetadata: data.metadata }),
  authMode: true,
});

export const useCapabilityRequirementScore = createSsuParamQuery<string>({
  queryKey: (capabilityId) => [
    "capabilities",
    "requirement-score",
    capabilityId,
  ],
  urlSegments: (capabilityId) => [
    "capabilities",
    capabilityId,
    "requirement-score",
  ],
  authMode: true,
  enabled: (id) => !!id,
});

export const useBypassJoinCapability = createSsuMutation<{
  capabilityId: string;
  userId: string;
}>({
  method: "POST",
  urlSegments: (data) => ["capabilities", data.capabilityId, "join"],
  payload: (data) => ({ userId: data.userId }),
  authMode: true,
});

export const useRemoveCapabilityMember = createSsuMutation<{
  capabilityId: string;
  memberId: string;
}>({
  method: "DELETE",
  urlSegments: (data) => [
    "capabilities",
    data.capabilityId,
    "members",
    data.memberId,
  ],
  payload: () => null,
});

export const useAllCapabilitiesWithMembers = createSsuQuery({
  queryKey: ["capabilities", "all-with-members"],
  urlSegments: ["system", "legacy", "aad-aws-sync"],
  authMode: true,
  select: (data: any) => (Array.isArray(data) ? data : []),
  staleTime: 60000,
});

// ── Manual hooks (complex queryFn) ───────────────────────────────────────────

export function useCapabilityMembersDetailed(capabilityDefinition: any) {
  const link = capabilityDefinition?._links?.members;
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  return useQuery({
    queryKey: [
      "capabilities",
      "members",
      "detailed",
      capabilityDefinition?.id,
    ],
    queryFn: async () => {
      const membersResp = await ssuRequest({
        method: "GET",
        urlSegments: [link.href],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      });

      let resps = await Promise.all(
        membersResp.items.map(async (member) => ({
          ...member,
          pictureUrl: await fetchUserPhoto(member.email),
        })),
      );

      return resps;
    },
    enabled: link != null,
  });
}

export function useCapabilityMembersApplications(
  capabilityDefinition: any,
) {
  const link = capabilityDefinition?._links?.membershipApplications;
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  return useQuery({
    queryKey: [
      "capabilities",
      "members",
      "membership-applications",
      capabilityDefinition?.id,
    ],
    queryFn: async () => {
      const membersResp = await ssuRequest({
        method: "GET",
        urlSegments: [link.href],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      });

      let resps = await Promise.all(
        membersResp.items.map(async (member) => ({
          ...member,
          applicantProfilePictureUrl: await fetchUserPhoto(member.email),
        })),
      );

      return resps;
    },
    enabled: !!link,
  });
}

export function useUserProfilePicture(upn: string) {
  const query = useQuery({
    queryKey: [`user-profilepicture.${upn}`],
    queryFn: async () =>
      msGraphRequest({
        method: "GET",
        url: `https://graph.microsoft.com/v1.0/users/${upn}/photos/96x96/$value`,
        payload: null,
      }),
    enabled: !!upn,
  });

  const [profilePicture, setProfilePicture] = useState("");

  useEffect(() => {
    if (!query.data?.ok) {
      setProfilePicture("");
    } else {
      query.data.blob().then((data) => {
        const url = window.URL || window.webkitURL;
        setProfilePicture(url.createObjectURL(data));
      });
    }
  }, [query.isFetched]);

  return { ...query, profilePicture };
}
