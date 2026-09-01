import { createSsuQuery, createSsuMutation } from "../queryFactory";
import { sortByField } from "@/lib/utils";

const sortByCapabilityId = sortByField<any>("capabilityId");

const selectSortedByCapabilityId = (data: any) => {
  let list = data.items || [];
  sortByCapabilityId(list);
  return list;
};

export const useMembershipApplications = createSsuQuery({
  queryKey: ["membershipapplications/eligible-for-approval"],
  urlSegments: ["membershipapplications/eligible-for-approval"],
  select: selectSortedByCapabilityId,
});

export const useMyOutstandingMembershipApplications = createSsuQuery({
  queryKey: ["membershipapplications/my-outstanding-applications"],
  urlSegments: ["membershipapplications/my-outstanding-applications"],
  select: selectSortedByCapabilityId,
});

export const useSubmitMembershipApplication = createSsuMutation<any>({
  method: "POST",
  urlSegments: (data) => [
    data.capabilityDefinition?._links?.membershipApplications?.href,
  ],
  payload: () => null,
});

export const useBypassMembershipApproval = createSsuMutation<any>({
  method: "POST",
  urlSegments: (data) => [
    data.capabilityDefinition?._links?.joinCapability.href,
  ],
  payload: () => null,
});

export const useSubmitMembershipApplicationApproval = createSsuMutation<any>({
  method: "POST",
  urlSegments: (data) => [
    data.membershipApplicationDefinition?.approvals?._links?.self.href,
  ],
  payload: (data) =>
    data.roleId
      ? {
          roleId: data.roleId,
          assignedEntityId: data.membershipApplicationDefinition?.applicant,
          type: "capability",
          resource: data.membershipApplicationDefinition?.capabilityId,
        }
      : null,
});

export const useDeleteMembershipApplicationApproval = createSsuMutation<any>({
  method: "DELETE",
  urlSegments: (data) => [
    data.membershipApplicationDefinition?.approvals?._links?.self.href,
  ],
  payload: () => null,
});
