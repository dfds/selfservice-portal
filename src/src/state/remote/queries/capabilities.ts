import { useQuery } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import { msGraphRequest, ssuRequest } from "../query";
import { useEffect, useState, useContext } from "react";
import PreAppContext from "@/preAppContext";
import { fetchUserPhoto } from "@/lib/graphUtils";
import {
  createSsuQuery,
  createSsuParamQuery,
  createSsuLinkQuery,
  createSsuMutation,
} from "../queryFactory";
import type {
  AllCostCentresCompliance,
  CapabilityComplianceHistory,
  ComplianceCostCentreKind,
  ComplianceHistory,
  ComplianceSummary,
  CostCentreComplianceHistory,
  RequirementComplianceHistory,
  RequirementsCompliance,
} from "./compliance.types";

export function normalizeCapabilityFavourite<T extends Record<string, any>>(
  capability: T,
) {
  if (!capability) {
    return capability;
  }

  const { isFavourited, ...rest } = capability;

  return {
    ...rest,
    isFavourite: capability.isFavourite ?? isFavourited === true,
  };
}

// ── Queries (factory) ────────────────────────────────────────────────────────

export const useCapabilities = createSsuQuery({
  queryKey: ["capabilities", "list"],
  urlSegments: ["capabilities"],
  select: (data: any) => {
    let list = (data.items || []).map(normalizeCapabilityFavourite);
    list.sort((a: any, b: any) => {
      const aFavourite = a.isFavourite === true;
      const bFavourite = b.isFavourite === true;
      if (aFavourite !== bFavourite) {
        return bFavourite ? 1 : -1;
      }
      return a.name.localeCompare(b.name);
    });
    return list;
  },
  staleTime: 30000,
});

export const useCapability = createSsuParamQuery<string>({
  queryKey: (id) => ["capabilities", "details", id],
  urlSegments: (id) => ["capabilities", id],
  select: (data: any) => normalizeCapabilityFavourite(data),
  staleTime: 30000,
});

export const useCapabilityAdd = createSsuMutation<any>({
  method: "POST",
  urlSegments: () => ["capabilities"],
});

// ── Compliance ──────────────────────────────────────────────────────────────
// Every compliance hook takes an optional `date` ("YYYY-MM-DD", UTC). Without
// one it reads the live state, which the API recomputes on each request.

const LIVE_COMPLIANCE_REFETCH_MS = 5 * 60_000;

/**
 * Query options for `GET /compliance/<path>`, live or for one past day. A past
 * day is a stored snapshot that never changes, so it is never refetched.
 */
export function complianceQueryOptions(path: string[], date?: string) {
  const segments = [...path];
  if (date) {
    // A separate "?date=" segment would get a "/" in front of it.
    segments[segments.length - 1] += `?date=${encodeURIComponent(date)}`;
  }
  const queryKey = ["compliance", ...path, date ?? "live"];
  return {
    queryKey,
    urlSegments: ["compliance", ...segments],
    staleTime: date ? Infinity : 60_000,
    refetchInterval: date ? (false as const) : LIVE_COMPLIANCE_REFETCH_MS,
    placeholderData: keepDataFromOtherDates(queryKey),
  };
}

/**
 * `keepPreviousData`, limited to the same resource on another date. Switching
 * to another capability or cost centre must not show the previous one's data.
 */
function keepDataFromOtherDates(queryKey: QueryKey) {
  return <T>(
    previousData: T | undefined,
    previousQuery: { queryKey: QueryKey } | undefined,
  ) => {
    const previousKey = previousQuery?.queryKey;
    const sameResource =
      previousKey?.length === queryKey.length &&
      previousKey.slice(0, -1).every((part, i) => part === queryKey[i]);
    return sameResource ? previousData : undefined;
  };
}

function isNotFound(error: Error) {
  return (error as any)?.data?.status === 404;
}

/** A day without a snapshot is a 404 that a retry won't fix. */
function retryUnlessNotFound(failureCount: number, error: Error) {
  return !isNotFound(error) && failureCount < 3;
}

function createComplianceQuery<TArgs extends { date?: string }, TData = any>(
  path: (args: TArgs) => string[],
  enabled?: (args: TArgs) => boolean,
) {
  const options = (args: TArgs) =>
    complianceQueryOptions(path(args), args.date);
  return createSsuParamQuery<TArgs, TData>({
    queryKey: (args) => options(args).queryKey,
    urlSegments: (args) => options(args).urlSegments,
    staleTime: (args) => options(args).staleTime,
    refetchInterval: (args) => options(args).refetchInterval,
    placeholderData: (args) => options(args).placeholderData,
    retry: retryUnlessNotFound,
    enabled,
  });
}

const costCentreComplianceQuery = createComplianceQuery<{
  costCentre: string | null;
  date?: string;
}>(
  ({ costCentre }) => ["cost-centres", costCentre!],
  ({ costCentre }) => !!costCentre,
);

export const useCostCentreCompliance = (
  costCentre: string | null,
  date?: string,
) => costCentreComplianceQuery({ costCentre, date });

const costCentreComplianceDetailsQuery = createComplianceQuery<{
  costCentre: string | null;
  date?: string;
}>(
  ({ costCentre }) => ["cost-centres", costCentre!, "details"],
  ({ costCentre }) => !!costCentre,
);

export const useCostCentreComplianceDetails = (
  costCentre: string | null,
  date?: string,
) => costCentreComplianceDetailsQuery({ costCentre, date });

const allCostCentresComplianceQuery = createComplianceQuery<
  { date?: string },
  AllCostCentresCompliance
>(() => ["cost-centres"]);

export const useAllCostCentresCompliance = (date?: string) =>
  allCostCentresComplianceQuery({ date });

const capabilityComplianceQuery = createComplianceQuery<{
  capabilityId: string | null;
  date?: string;
}>(
  ({ capabilityId }) => ["capabilities", capabilityId!],
  ({ capabilityId }) => !!capabilityId,
);

export const useCapabilityCompliance = (
  capabilityId: string | null,
  date?: string,
) => capabilityComplianceQuery({ capabilityId, date });

const rogueCapabilitiesComplianceQuery = createComplianceQuery<{
  date?: string;
}>(() => ["rogue-capabilities"]);

export const useRogueCapabilitiesCompliance = (date?: string) =>
  rogueCapabilitiesComplianceQuery({ date });

const rogueCapabilitiesComplianceDetailsQuery = createComplianceQuery<{
  date?: string;
}>(() => ["rogue-capabilities", "details"]);

export const useRogueCapabilitiesComplianceDetails = (date?: string) =>
  rogueCapabilitiesComplianceDetailsQuery({ date });

const orphanedCapabilitiesComplianceQuery = createComplianceQuery<{
  date?: string;
}>(() => ["orphaned-capabilities"]);

export const useOrphanedCapabilitiesCompliance = (date?: string) =>
  orphanedCapabilitiesComplianceQuery({ date });

const orphanedCapabilitiesComplianceDetailsQuery = createComplianceQuery<{
  date?: string;
}>(() => ["orphaned-capabilities", "details"]);

export const useOrphanedCapabilitiesComplianceDetails = (date?: string) =>
  orphanedCapabilitiesComplianceDetailsQuery({ date });

const requirementsComplianceQuery = createComplianceQuery<
  { date?: string },
  RequirementsCompliance
>(() => ["requirements"]);

export const useRequirementsCompliance = (date?: string) =>
  requirementsComplianceQuery({ date });

const requirementComplianceDetailsQuery = createComplianceQuery<{
  requirementId: string | null;
  date?: string;
}>(
  ({ requirementId }) => ["requirements", requirementId!],
  ({ requirementId }) => !!requirementId,
);

export const useRequirementComplianceDetails = (
  requirementId: string | null,
  date?: string,
) => requirementComplianceDetailsQuery({ requirementId, date });

const complianceSummaryQuery = createComplianceQuery<
  { date?: string },
  ComplianceSummary
>(() => ["summary"]);

export const useComplianceSummary = (date?: string) =>
  complianceSummaryQuery({ date });

// Today's history item is computed live, so it refreshes with the live queries.
const COMPLIANCE_HISTORY_FRESHNESS = {
  staleTime: 60_000,
  refetchInterval: LIVE_COMPLIANCE_REFETCH_MS,
};

/** One summary per recorded day, from the oldest retained day to today. */
export const useComplianceHistory = createSsuQuery<ComplianceHistory>({
  queryKey: ["compliance", "history"],
  urlSegments: ["compliance", "history"],
  ...COMPLIANCE_HISTORY_FRESHNESS,
});

/** Which group a cost-centre history covers; `costCentre` is ignored for rogue and orphaned. */
export type ComplianceGroup = {
  kind: ComplianceCostCentreKind;
  costCentre: string | null;
};

function groupPath({ kind, costCentre }: ComplianceGroup): string[] {
  if (kind === "rogue") return ["rogue-capabilities"];
  if (kind === "orphaned") return ["orphaned-capabilities"];
  return ["cost-centres", costCentre!];
}

const costCentreComplianceHistoryQuery = createSsuParamQuery<
  ComplianceGroup,
  CostCentreComplianceHistory
>({
  queryKey: (group) => ["compliance", ...groupPath(group), "history"],
  urlSegments: (group) => ["compliance", ...groupPath(group), "history"],
  enabled: ({ kind, costCentre }) => kind !== "costCentre" || !!costCentre,
  ...COMPLIANCE_HISTORY_FRESHNESS,
});

/** One entry per recorded day the group existed, oldest first. */
export const useCostCentreComplianceHistory = (group: ComplianceGroup) =>
  costCentreComplianceHistoryQuery(group);

const requirementComplianceHistoryQuery = createSsuParamQuery<
  { requirementId: string | null },
  RequirementComplianceHistory
>({
  queryKey: ({ requirementId }) => [
    "compliance",
    "requirements",
    requirementId,
    "history",
  ],
  urlSegments: ({ requirementId }) => [
    "compliance",
    "requirements",
    requirementId!,
    "history",
  ],
  enabled: ({ requirementId }) => !!requirementId,
  ...COMPLIANCE_HISTORY_FRESHNESS,
  retry: retryUnlessNotFound,
});

/** One entry per recorded day, oldest first, with the requirement's totals per cost centre. */
export const useRequirementComplianceHistory = (requirementId: string | null) =>
  requirementComplianceHistoryQuery({ requirementId });

const capabilityComplianceHistoryQuery = createSsuParamQuery<
  { capabilityId: string | null; days: number },
  CapabilityComplianceHistory
>({
  queryKey: ({ capabilityId, days }) => [
    "compliance",
    "capabilities",
    capabilityId,
    "history",
    days,
  ],
  urlSegments: ({ capabilityId, days }) => [
    "compliance",
    "capabilities",
    capabilityId!,
    `history?days=${days}`,
  ],
  enabled: ({ capabilityId }) => !!capabilityId,
  ...COMPLIANCE_HISTORY_FRESHNESS,
  retry: retryUnlessNotFound,
});

/** The last `days` days ending today (UTC), oldest first. */
export const useCapabilityComplianceHistory = (
  capabilityId: string | null,
  days = 90,
) => capabilityComplianceHistoryQuery({ capabilityId, days });

export const useCapabilityMetadata = createSsuLinkQuery<any>({
  queryKey: (def) => ["capabilities", "metadata", def?.id],
  linkHref: (def) => def?._links?.metadata?.href,
});

export const useUpdateCapabilityMetadata = createSsuMutation<any>({
  method: "POST",
  urlSegments: (data) => [data.capabilityDefinition?._links.metadata.href],
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
  queryKey: (capabilityId) => ["capabilities", "aws-account", capabilityId],
  urlSegments: (capabilityId) => ["capabilities", capabilityId, "awsaccount"],
  enabled: (id) => !!id,
});

export const useCapabilityAzureResourcesById = createSsuParamQuery<string>({
  queryKey: (capabilityId) => ["capabilities", "azure-resources", capabilityId],
  urlSegments: (capabilityId) => [
    "capabilities",
    capabilityId,
    "azureresources",
  ],
  enabled: (id) => !!id,
});

export const useCapabilityKafkaAccess = createSsuParamQuery<string>({
  queryKey: (capabilityId) => ["capabilities", "kafka-access", capabilityId],
  urlSegments: (capabilityId) => [
    "capabilities",
    capabilityId,
    "kafkaclusteraccess",
  ],
  enabled: (id) => !!id,
});

export const useCapabilityMembers = createSsuParamQuery<string>({
  queryKey: (capabilityId) => ["capabilities", "members", capabilityId],
  urlSegments: (capabilityId) => ["capabilities", capabilityId, "members"],
  enabled: (id) => !!id,
  select: (data: any) => data.items || [],
});

export const useCapabilityMetadataById = createSsuParamQuery<string>({
  queryKey: (capabilityId) => ["capabilities", "metadata-raw", capabilityId],
  urlSegments: (capabilityId) => ["capabilities", capabilityId, "metadata"],
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
    queryKey: ["capabilities", "members", "detailed", capabilityDefinition?.id],
    queryFn: async () => {
      const membersResp = await ssuRequest({
        method: "GET",
        urlSegments: [link.href],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      });

      let resps = await Promise.all(
        membersResp.items.map(async (member: any) => {
          const isServicePrincipal = member.type === "service-principal";
          return {
            ...member,
            pictureUrl: isServicePrincipal
              ? null
              : await fetchUserPhoto(member.email),
          };
        }),
      );

      return resps;
    },
    enabled: link != null,
  });
}

export const useAddServicePrincipalCapabilityMember = createSsuMutation<{
  capabilityId: string;
  servicePrincipalId: string;
  appDisplayName?: string | null;
}>({
  method: "POST",
  urlSegments: (data) => [
    "capabilities",
    data.capabilityId,
    "service-principal-members",
  ],
  payload: (data) => ({
    servicePrincipalId: data.servicePrincipalId,
    appDisplayName: data.appDisplayName ?? null,
  }),
  authMode: true,
});

export const useAddCapabilityFavourite = createSsuMutation<{ id: string }>({
  method: "POST",
  urlSegments: (data) => ["capabilities", data.id, "favourite"],
  payload: () => null,
});

export const useRemoveCapabilityFavourite = createSsuMutation<{
  id: string;
}>({
  method: "DELETE",
  urlSegments: (data) => ["capabilities", data.id, "favourite"],
  payload: () => null,
});

export function useCapabilityMembersApplications(capabilityDefinition: any) {
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
        membersResp.items.map(async (member: any) => ({
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
