import { useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import { ssuRequest } from "./query";
import PreAppContext from "@/preAppContext";

// ── Auth mode ─────────────────────────────────────────────────────────────────

type AuthMode = "context" | boolean;

function useResolvedAuth(mode: AuthMode): boolean {
  const ctx = useContext(PreAppContext);
  if (mode === "context") return (ctx as any).isCloudEngineerEnabled;
  return mode as boolean;
}

// ── Query factory (zero args) ─────────────────────────────────────────────────

interface SsuQueryConfig<TData = any, TSelected = TData> {
  queryKey: QueryKey;
  urlSegments: string[];
  method?: string;
  authMode?: AuthMode;
  select?: (data: TData) => TSelected;
  staleTime?: number;
  enabled?: boolean;
}

export function createSsuQuery<TData = any, TSelected = TData>(
  config: SsuQueryConfig<TData, TSelected>,
) {
  return function useSsuQuery() {
    const isCloudEngineerEnabled = useResolvedAuth(
      config.authMode ?? "context",
    );

    return useQuery<TData, Error, TSelected>({
      queryKey: config.queryKey,
      queryFn: async () =>
        ssuRequest({
          method: config.method ?? "GET",
          urlSegments: config.urlSegments,
          payload: null,
          isCloudEngineerEnabled,
        }),
      ...(config.select && { select: config.select }),
      ...(config.staleTime !== undefined && { staleTime: config.staleTime }),
      ...(config.enabled !== undefined && { enabled: config.enabled }),
    });
  };
}

// ── Parameterized query factory ───────────────────────────────────────────────

interface SsuParamQueryConfig<TArgs, TData = any, TSelected = TData> {
  queryKey: (args: TArgs) => QueryKey;
  urlSegments: (args: TArgs) => string[];
  method?: string;
  authMode?: AuthMode;
  select?: (data: TData) => TSelected;
  staleTime?: number;
  enabled?: (args: TArgs) => boolean;
}

export function createSsuParamQuery<TArgs, TData = any, TSelected = TData>(
  config: SsuParamQueryConfig<TArgs, TData, TSelected>,
) {
  return function useSsuParamQuery(args: TArgs) {
    const isCloudEngineerEnabled = useResolvedAuth(
      config.authMode ?? "context",
    );

    return useQuery<TData, Error, TSelected>({
      queryKey: config.queryKey(args),
      queryFn: async () =>
        ssuRequest({
          method: config.method ?? "GET",
          urlSegments: config.urlSegments(args),
          payload: null,
          isCloudEngineerEnabled,
        }),
      ...(config.select && { select: config.select }),
      ...(config.staleTime !== undefined && { staleTime: config.staleTime }),
      ...(config.enabled && { enabled: config.enabled(args) }),
    });
  };
}

// ── Link-based query factory ──────────────────────────────────────────────────

interface SsuLinkQueryConfig<TDef, TData = any, TSelected = TData> {
  queryKey: (def: TDef) => QueryKey;
  linkHref: (def: TDef) => string | undefined;
  method?: string;
  authMode?: AuthMode;
  select?: (data: TData) => TSelected;
  staleTime?: number;
}

export function createSsuLinkQuery<TDef, TData = any, TSelected = TData>(
  config: SsuLinkQueryConfig<TDef, TData, TSelected>,
) {
  return function useSsuLinkQuery(def: TDef) {
    const isCloudEngineerEnabled = useResolvedAuth(
      config.authMode ?? "context",
    );
    const href = config.linkHref(def);

    return useQuery<TData, Error, TSelected>({
      queryKey: config.queryKey(def),
      queryFn: async () =>
        ssuRequest({
          method: config.method ?? "GET",
          urlSegments: [href!],
          payload: null,
          isCloudEngineerEnabled,
        }),
      enabled: !!href,
      ...(config.select && { select: config.select }),
      ...(config.staleTime !== undefined && { staleTime: config.staleTime }),
    });
  };
}

// ── Mutation factory ──────────────────────────────────────────────────────────

interface SsuMutationConfig<TPayload = any> {
  method: string | ((data: TPayload) => string);
  urlSegments: (data: TPayload) => string[];
  payload?: (data: TPayload) => any;
  authMode?: AuthMode;
}

export function createSsuMutation<TPayload = any>(
  config: SsuMutationConfig<TPayload>,
) {
  return function useSsuMutation() {
    const isCloudEngineerEnabled = useResolvedAuth(
      config.authMode ?? "context",
    );

    return useMutation({
      mutationFn: async (data: TPayload) =>
        ssuRequest({
          method:
            typeof config.method === "function"
              ? config.method(data)
              : config.method,
          urlSegments: config.urlSegments(data),
          payload: config.payload
            ? config.payload(data)
            : (data as any).payload ?? null,
          isCloudEngineerEnabled,
        }),
    });
  };
}
