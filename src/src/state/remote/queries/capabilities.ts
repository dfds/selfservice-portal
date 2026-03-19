import { useMutation, useQuery } from "@tanstack/react-query";
import { msGraphRequest, ssuRequest } from "../query";
import { useEffect, useState, useContext } from "react";
import PreAppContext from "@/preAppContext";

const sortByName = (list) => {
  list.sort((a, b) => a.name.localeCompare(b.name));
};

export function useCapabilities() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const query = useQuery({
    queryKey: ["capabilities", "list"],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["capabilities"],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
    select: (data: any) => {
      let list = data.items || [];
      sortByName(list);
      return list;
    },
    staleTime: 30000,
  });

  return query;
}

export function useCapability(id: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const query = useQuery({
    queryKey: ["capabilities", "details", id],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["capabilities", id],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
    staleTime: 30000,
  });

  return query;
}

export function useCapabilityAdd() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: ["capabilities"],
        payload: data.payload,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return mutation;
}

export function useCostCentreCompliance(costCentre: string | null) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  return useQuery({
    queryKey: ["compliance", "cost-centres", costCentre],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["compliance", "cost-centres", costCentre],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
    enabled: !!costCentre,
    staleTime: 60000,
  });
}

export function useCapabilityCompliance(capabilityId: string | null) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const query = useQuery({
    queryKey: ["capabilities", "compliance", capabilityId],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["compliance", "capabilities", capabilityId],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
    enabled: !!capabilityId,
    staleTime: 60000,
  });

  return query;
}

export function useCapabilityMetadata(capabilityDefinition: any) {
  const link = capabilityDefinition?._links;
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const query = useQuery({
    queryKey: ["capabilities", "metadata", capabilityDefinition?.id],
    queryFn: async () => {
      return ssuRequest({
        method: "GET",
        urlSegments: [link.metadata.href],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      });
    },
    enabled: link != null,
  });

  return query;
}

export function useUpdateCapabilityMetadata() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: [data.capabilityDefinition?._links.metadata.href],
        payload: data.payload,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return mutation;
}

export function useUpdateRequiredCapabilityMetadata() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: [
          data.capabilityDefinition?._links.setRequiredMetadata.href,
        ],
        payload: data.payload,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return mutation;
}

export function useLeaveCapability() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: [data.capabilityDefinition?._links?.leaveCapability.href],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return mutation;
}

export function useCapabilityMembersDetailed(capabilityDefinition: any) {
  const link = capabilityDefinition?._links?.members;
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const query = useQuery({
    queryKey: ["capabilities", "members", "detailed", capabilityDefinition?.id],
    queryFn: async () => {
      const membersResp = await ssuRequest({
        method: "GET",
        urlSegments: [link.href],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      });

      let resps = await Promise.all(
        membersResp.items.map(async (member) => {
          if (!member.email) {
            return { ...member, pictureUrl: "" };
          }
          let resp = await msGraphRequest({
            method: "GET",
            url: `https://graph.microsoft.com/v1.0/users/${member.email}/photos/96x96/$value`,
            payload: null,
          });

          if (!resp.ok) {
            return { ...member, pictureUrl: "" };
          } else {
            const blob = await resp.blob();
            const url = window.URL || window.webkitURL;
            return { ...member, pictureUrl: url.createObjectURL(blob) };
          }
        }),
      );

      return resps;
    },
    enabled: link != null,
  });

  return query;
}

export function useCapabilityMembersApplications(capabilityDefinition: any) {
  const link = capabilityDefinition?._links?.membershipApplications;
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const query = useQuery({
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
        membersResp.items.map(async (member) => {
          if (!member.email) {
            return { ...member, applicantProfilePictureUrl: "" };
          }
          let resp = await msGraphRequest({
            method: "GET",
            url: `https://graph.microsoft.com/v1.0/users/${member.email}/photos/96x96/$value`,
            payload: null,
          });

          if (!resp.ok) {
            return { ...member, applicantProfilePictureUrl: "" };
          } else {
            const blob = await resp.blob();
            const url = window.URL || window.webkitURL;
            return {
              ...member,
              applicantProfilePictureUrl: url.createObjectURL(blob),
            };
          }
        }),
      );

      return resps;
    },
    enabled: !!link,
  });

  return query;
}

export function useCancelCapabilityDeletion() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: [
          "capabilities",
          data.capabilityId,
          "canceldeletionrequest",
        ],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });
  return mutation;
}

export function useCapabilityAwsAccount(capabilityId: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  return useQuery({
    queryKey: ["capabilities", "aws-account", capabilityId],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["capabilities", capabilityId, "awsaccount"],
        payload: null,
        isCloudEngineerEnabled,
      }),
    enabled: !!capabilityId,
  });
}

export function useCapabilityAzureResourcesById(capabilityId: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  return useQuery({
    queryKey: ["capabilities", "azure-resources", capabilityId],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["capabilities", capabilityId, "azureresources"],
        payload: null,
        isCloudEngineerEnabled,
      }),
    enabled: !!capabilityId,
  });
}

export function useCapabilityKafkaAccess(capabilityId: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  return useQuery({
    queryKey: ["capabilities", "kafka-access", capabilityId],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["capabilities", capabilityId, "kafkaclusteraccess"],
        payload: null,
        isCloudEngineerEnabled,
      }),
    enabled: !!capabilityId,
  });
}

export function useCapabilityMembers(capabilityId: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  return useQuery({
    queryKey: ["capabilities", "members", capabilityId],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["capabilities", capabilityId, "members"],
        payload: null,
        isCloudEngineerEnabled,
      }),
    enabled: !!capabilityId,
    select: (data: any) => data.items || [],
  });
}

export function useCapabilityMetadataById(capabilityId: string) {
  return useQuery({
    queryKey: ["capabilities", "metadata-raw", capabilityId],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["capabilities", capabilityId, "metadata"],
        payload: null,
        isCloudEngineerEnabled: true,
      }),
    enabled: !!capabilityId,
  });
}

export function useSetCapabilityMetadata() {
  return useMutation({
    mutationFn: async (data: { capabilityId: string; metadata: any }) =>
      ssuRequest({
        method: "POST",
        urlSegments: ["capabilities", data.capabilityId, "metadata"],
        payload: { JsonMetadata: data.metadata },
        isCloudEngineerEnabled: true,
      }),
  });
}

export function useCapabilityRequirementScore(capabilityId: string) {
  return useQuery({
    queryKey: ["capabilities", "requirement-score", capabilityId],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["capabilities", capabilityId, "requirement-score"],
        payload: null,
        isCloudEngineerEnabled: true,
      }),
    enabled: !!capabilityId,
  });
}

export function useBypassJoinCapability() {
  return useMutation({
    mutationFn: async (data: { capabilityId: string; userId: string }) =>
      ssuRequest({
        method: "POST",
        urlSegments: ["capabilities", data.capabilityId, "join"],
        payload: { userId: data.userId },
        isCloudEngineerEnabled: true,
      }),
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

export function useAllCapabilitiesWithMembers() {
  return useQuery({
    queryKey: ["capabilities", "all-with-members"],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["system", "legacy", "aad-aws-sync"],
        payload: null,
        isCloudEngineerEnabled: true,
      }),
    select: (data: any) => (Array.isArray(data) ? data : []),
    staleTime: 60000,
  });
}
