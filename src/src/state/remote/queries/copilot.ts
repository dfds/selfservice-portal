import { useContext } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import PreAppContext from "@/preAppContext";
import { msGraphRequest, ssuRequest } from "../query";
import { useCanI } from "./rbac";

const COPILOT_READ_OWN = {
  namespace: "copilot",
  name: "read-own",
  accessType: "global",
} as const;

/**
 * A failed permission lookup leaves isDenied false; /copilot/me still enforces read-own.
 */
export function useCanReadOwnCopilot() {
  const { data, isFetched } = useCanI(COPILOT_READ_OWN);
  return { isDenied: data === false, isFetched };
}

const COPILOT_READ_ALL = {
  namespace: "copilot",
  name: "read-all",
  accessType: "global",
} as const;

/**
 * Admin access requires copilot/read-all regardless of CE mode.
 * A failed permission lookup leaves isDenied false; the API still enforces the grant.
 */
export function useCanReadAllCopilot() {
  const { data, isFetched } = useCanI(COPILOT_READ_ALL);
  return { isAllowed: data === true, isDenied: data === false, isFetched };
}

export interface CopilotMeta {
  copilotAvailable: boolean;
  generatedAt?: string | null;
  freshness?: Record<string, string | null>;
  from?: string | null;
  to?: string | null;
  matchedEmail?: string | null;
}

export interface CopilotSeat {
  scope: string;
  orgName?: string | null;
  planType?: string | null;
  createdAt?: string | null;
  lastActivityAt?: string | null;
  lastActivityEditor?: string | null;
  lastAuthenticatedAt?: string | null;
  pendingCancellationDate?: string | null;
}

export interface CopilotDay {
  day: string;
  interactions?: number | null;
  codeGenerations?: number | null;
  codeAcceptances?: number | null;
  locSuggestedToAdd?: number | null;
  locSuggestedToDelete?: number | null;
  locAdded?: number | null;
  locDeleted?: number | null;
  aiCreditsUsed?: number | null;
  usedAgent?: boolean | null;
  usedChat?: boolean | null;
  usedCli?: boolean | null;
  usedCodingAgent?: boolean | null;
  usedCloudAgent?: boolean | null;
  ides: string[];
  languages: string[];
  models: string[];
}

/** Metrics use GitHub's snake_case names and omit zeros. */
export interface CopilotFact {
  key1: string;
  key2?: string | null;
  metrics: Record<string, number>;
}

export interface CopilotPeriod {
  from: string;
  to: string;
  daysActive: number;
  firstDay?: string | null;
  lastDay?: string | null;
  totals: Record<string, number | boolean>;
  breakdowns: Record<string, CopilotFact[]>;
}

/** grossAmount is the list price in USD, before included credits. */
export interface CopilotCreditAmount {
  quantity: number;
  grossAmount: number;
}

export interface CopilotCredits {
  totals: CopilotCreditAmount;
  byDay: (CopilotCreditAmount & { day: string })[];
  byModel: (CopilotCreditAmount & { model: string })[];
}

/**
 * The AI credit budget covering the user this month, in USD. consumed is
 * GitHub's figure, the gross amount of the month's credits.
 */
export interface CopilotBudget {
  amount: number;
  consumed: number;
  preventFurtherUsage: boolean;
}

export type CopilotUnmappedReason =
  | "service_principal"
  | "no_dfds_email"
  | "not_mapped"
  | "user_not_found";

interface CopilotLink {
  href: string;
  rel: string;
  allow: string[];
}

export interface CopilotMe {
  mapped: boolean;
  unmappedReason?: CopilotUnmappedReason | null;
  login?: string | null;
  name?: string | null;
  seated: boolean;
  seats: CopilotSeat[];
  daily: CopilotDay[];
  latest28d?: CopilotPeriod | null;
  credits?: CopilotCredits | null;
  /** The current month, whatever the range. */
  budget?: CopilotBudget | null;
  meta: CopilotMeta;
  _links?: {
    self?: CopilotLink;
    credits?: CopilotLink;
    /** Present on /copilot/me only when the caller holds copilot/read-all. */
    users?: CopilotLink;
  };
}

/** Keeps the previous range's data while a new range loads. */
export function useCopilotMe({ from, to }: { from: string; to: string }) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext) as any;
  return useQuery<CopilotMe, Error>({
    queryKey: ["copilot", "me", from, to],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: [`copilot/me?from=${from}&to=${to}`],
        payload: null,
        isCloudEngineerEnabled,
      }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export interface CopilotUserSummary {
  login: string;
  name?: string | null;
  primaryEmail?: string | null;
  seated: boolean;
}

export interface CopilotUserSearch {
  items: CopilotUserSummary[];
  meta: { copilotAvailable: boolean };
}

/** Keeps the previous range's data while a new range loads, but never another login's. */
export function useCopilotUser({
  login,
  from,
  to,
}: {
  login: string;
  from: string;
  to: string;
}) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext) as any;
  const key = login.toLowerCase();
  return useQuery<CopilotMe, Error>({
    queryKey: ["copilot", "user", key, from, to],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: [
          `copilot/users/${encodeURIComponent(login)}?from=${from}&to=${to}`,
        ],
        payload: null,
        isCloudEngineerEnabled,
      }),
    placeholderData: (prev, prevQuery) =>
      prevQuery?.queryKey[2] === key ? prev : undefined,
    enabled: login !== "",
    staleTime: 60_000,
  });
}

/** The API rejects queries shorter than two characters. */
export function useCopilotUserSearch(q: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext) as any;
  return useQuery<CopilotUserSearch, Error>({
    queryKey: ["copilot", "users", "search", q.toLowerCase()],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: [`copilot/users?q=${encodeURIComponent(q)}&limit=10`],
        payload: null,
        isCloudEngineerEnabled,
      }),
    enabled: q.length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
    retry: false,
  });
}

/**
 * The Entra display name for an address, or null. Graph resolves
 * `/users/{id}` by UPN only, so an address that is not the UPN gives null.
 */
export function useGraphDisplayName(upn: string) {
  return useQuery<string | null, Error>({
    queryKey: ["graph", "user", "displayName", upn.toLowerCase()],
    queryFn: async () => {
      const resp = await msGraphRequest({
        method: "GET",
        url: `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(
          upn,
        )}?$select=displayName`,
        payload: null,
      });
      if (!resp.ok) return null;
      return (await resp.json()).displayName ?? null;
    },
    enabled: upn !== "",
    staleTime: 60 * 60_000,
    retry: false,
  });
}

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Query garbage collection does not revoke object URLs. A data URL avoids retaining the blob.
 */
export function useGraphPhoto(upn: string) {
  return useQuery<string | null, Error>({
    queryKey: ["graph", "user", "photo", upn.toLowerCase()],
    queryFn: async () => {
      const resp = await msGraphRequest({
        method: "GET",
        url: `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(
          upn,
        )}/photos/96x96/$value`,
        payload: null,
      });
      if (!resp.ok) return null;
      return readAsDataUrl(await resp.blob());
    },
    enabled: upn !== "",
    staleTime: Infinity,
    retry: false,
  });
}

/**
 * copilot-insights envelope as relayed by selfservice-api. `data` is null and
 * `meta.copilotAvailable` false when copilot-insights is unreachable.
 */
export interface CopilotEnvelope<T> {
  data: T | null;
  meta: {
    copilotAvailable?: boolean;
    generatedAt?: string;
    scope?: string;
    from?: string;
    to?: string;
    freshness?: Record<string, string | null>;
    page?: { limit: number; offset: number; total: number };
  };
}

export type CopilotParams = Record<string, string | number | undefined>;

function adminUrl(path: string, params: CopilotParams): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") qs.set(k, String(v));
  }
  const query = qs.toString();
  return `copilot/admin/${path}${query ? `?${query}` : ""}`;
}

/**
 * GET copilot-insights `/api/v1/{path}` through the admin passthrough.
 * selfservice-api answers 403 without `copilot/read-all`.
 */
export function useCopilotAdmin<T>(
  path: string,
  params: CopilotParams = {},
  options: { enabled?: boolean; keepPrevious?: boolean } = {},
) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext) as any;
  return useQuery<CopilotEnvelope<T>, Error>({
    queryKey: ["copilot", "admin", path, params],
    placeholderData: options.keepPrevious ? keepPreviousData : undefined,
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: [adminUrl(path, params)],
        payload: null,
        isCloudEngineerEnabled,
      }),
    enabled: options.enabled ?? true,
    staleTime: 5 * 60_000,
    retry: false,
  });
}

export interface CopilotScope {
  kind: "enterprise" | "org";
  name: string;
  installed: boolean;
  active: boolean;
  copilotEnabled: boolean;
}

export interface CopilotCollectorStatus {
  collector: string;
  lastRun?: {
    status: string;
    startedAt?: string;
    finishedAt?: string | null;
    items?: number;
    error?: string | null;
  } | null;
  lastOkAt?: string | null;
}

export interface CopilotSummary {
  seats: {
    total: number;
    active28d: number;
    neverActive: number;
    pendingCancellation: number;
  };
  latestDay?: Record<string, number | string> | null;
  daysWithData: number;
  avgDailyActiveUsers: number;
  activeUsers: number;
  totals: Record<string, number>;
  featureEngagement?: {
    periodEnd: string;
    metrics: Record<string, number>;
    features: CopilotFact[];
  } | null;
}

export type CopilotOrgDay = { day: string } & Record<string, number | string>;

export interface CopilotSeatHistoryDay {
  day: string;
  total: number;
  active28d: number;
  neverActive: number;
  pendingCancellation: number;
}

export interface CopilotAdminSeat {
  scope: string;
  userId: number;
  login: string;
  name?: string | null;
  email?: string | null;
  orgName?: string | null;
  assigningTeamSlug?: string | null;
  planType?: string | null;
  createdAt?: string | null;
  lastActivityAt?: string | null;
  lastActivityEditor?: string | null;
  lastAuthenticatedAt?: string | null;
  pendingCancellationDate?: string | null;
}

export interface CopilotUserTotals {
  userId: number;
  login: string;
  name?: string | null;
  email?: string | null;
  daysActive: number;
  firstDay?: string | null;
  lastDay?: string | null;
  totals: Record<string, number | boolean>;
}

export interface CopilotRepoTotals {
  repoId: number;
  owner: string;
  name: string;
  visibility?: string | null;
  daysWithData: number;
  totals: Record<string, number>;
}

export interface CopilotTeamDay {
  day: string;
  teamId: number;
  slug: string;
  members: number;
  activeUsers: number;
  totals: Record<string, number | boolean>;
}

/**
 * Budget amounts reflect today. For enterprise AI credits, consumed is the month's
 * net ai_credit amount with consumedSource "ai_credit_usage". User budget consumption
 * uses GitHub's figure for the current month and is null for past months.
 */
export interface CopilotBudgetItem {
  id: string;
  type: string;
  scope: string;
  entityName?: string | null;
  login?: string | null;
  productSku?: string | null;
  amount: number;
  consumed?: number | null;
  consumedSource?: "github" | "ai_credit_usage" | null;
  preventFurtherUsage: boolean;
  /** Users with spend on a multi-user budget; null for past months. */
  userStates?: number | null;
}

export type CopilotCreditTotals = Record<string, number>;

export interface CopilotCreditUsage {
  totals: CopilotCreditTotals;
  groups: ({ totals: CopilotCreditTotals } & Record<string, any>)[];
}
