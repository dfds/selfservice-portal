import { useMutation, useQuery } from "@tanstack/react-query";
import { ssuRequest } from "../query";
import { useContext } from "react";
import PreAppContext from "@/preAppContext";

const sortByCapabilityId = (list) => {
  list.sort((a, b) => a.capabilityId.localeCompare(b.capabilityId));
};

export function useMembershipApplications() {
  const { isEnabledCloudEngineer } = useContext(PreAppContext);
  const query = useQuery({
    queryKey: ["membershipapplications/eligible-for-approval"],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["membershipapplications/eligible-for-approval"],
        payload: null,
        isCloudEngineerEnabled: isEnabledCloudEngineer,
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
  const { isEnabledCloudEngineer } = useContext(PreAppContext);
  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: [
          data.capabilityDefinition?._links?.membershipApplications?.href,
        ],
        payload: null,
        isCloudEngineerEnabled: isEnabledCloudEngineer,
      }),
  });

  return mutation;
}

export function useBypassMembershipApproval() {
  const { isEnabledCloudEngineer } = useContext(PreAppContext);
  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: [data.capabilityDefinition?._links?.joinCapability.href],
        payload: null,
        isCloudEngineerEnabled: isEnabledCloudEngineer,
      }),
  });

  return mutation;
}

export function useSubmitMembershipApplicationApproval() {
  const { isEnabledCloudEngineer } = useContext(PreAppContext);
  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: [
          data.membershipApplicationDefinition?.approvals?._links?.self.href,
        ],
        payload: null,
        isCloudEngineerEnabled: isEnabledCloudEngineer,
      }),
  });

  return mutation;
}

export function useDeleteMembershipApplicationApproval() {
  const { isEnabledCloudEngineer } = useContext(PreAppContext);
  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "DELETE",
        urlSegments: [
          data.membershipApplicationDefinition?.approvals?._links?.self.href,
        ],
        payload: null,
        isCloudEngineerEnabled: isEnabledCloudEngineer,
      }),
  });

  return mutation;
}
