import { useMutation, useQuery } from "@tanstack/react-query";
import { ssuRequest } from "../query";

const sortByCapabilityId = (list) => {
  list.sort((a, b) => a.capabilityId.localeCompare(b.capabilityId));
};

export function useMembershipApplications() {
  const query = useQuery({
    queryKey: ["membershipapplications/eligible-for-approval"],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["membershipapplications/eligible-for-approval"],
        payload: null,
        isCloudEngineerEnabled: true,
      }),
    select: (data: any) => {
      let list = data.items || [];
      sortByCapabilityId(list);
      return list;
    },
  });

  return query;
}

export function useSubmitMembershipApplication() {
  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: [
          data.capabilityDefinition?._links?.membershipApplications,
        ],
        payload: data.payload,
        isCloudEngineerEnabled: true,
      }),
  });

  return mutation;
}

export function useSubmitMembershipApplicationApproval() {
  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: [
          data.membershipApplicationDefinition?.approvals?._links?.self.href,
        ],
        payload: null,
        isCloudEngineerEnabled: true,
      }),
  });

  return mutation;
}

export function useDeleteMembershipApplicationApproval() {
  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "DELETE",
        urlSegments: [
          data.membershipApplicationDefinition?.approvals?._links?.self.href,
        ],
        payload: null,
        isCloudEngineerEnabled: true,
      }),
  });

  return mutation;
}
