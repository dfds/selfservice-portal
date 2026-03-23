import { useMutation, useQuery } from "@tanstack/react-query";
import { ssuRequest } from "../query";
import {
  createSsuParamQuery,
  createSsuQuery,
  createSsuMutation,
} from "../queryFactory";
import PreAppContext from "@/preAppContext";
import { useContext } from "react";

// ── Queries (factory) ────────────────────────────────────────────────────────

export const useEmailCampaign = createSsuParamQuery<string>({
  queryKey: (id) => ["emailCampaigns", "detail", id],
  urlSegments: (id) => ["email-campaigns", id],
  enabled: (id) => !!id,
});

export const useTemplateVariables = createSsuQuery({
  queryKey: ["emailCampaigns", "variables"],
  urlSegments: ["email-campaigns/variables"],
  staleTime: 300_000,
});

export const useEmailCampaignExecutions = createSsuParamQuery<string>({
  queryKey: (id) => ["emailCampaigns", "executions", id],
  urlSegments: (id) => ["email-campaigns", id, "executions"],
  enabled: (id) => !!id,
});

export const useEmailCampaignRecipients = createSsuParamQuery<string>({
  queryKey: (id) => ["emailCampaigns", "recipients", id],
  urlSegments: (id) => ["email-campaigns", id, "recipients"],
  enabled: (id) => !!id,
});

// ── Mutations (factory) ──────────────────────────────────────────────────────

export const useCreateEmailCampaign = createSsuMutation<any>({
  method: "POST",
  urlSegments: () => ["email-campaigns"],
});

export const useDeleteEmailCampaign = createSsuMutation<{ id: string }>({
  method: "DELETE",
  urlSegments: (data) => ["email-campaigns", data.id],
  payload: () => null,
});

export const useResolveAudience = createSsuMutation<any>({
  method: "POST",
  urlSegments: () => ["email-campaigns/resolve-audience"],
});

export const usePreviewEmailCampaignContent = createSsuMutation<any>({
  method: "POST",
  urlSegments: () => ["email-campaigns/preview"],
});

// ── Manual hooks (hook-arg dependent) ────────────────────────────────────────

export function useEmailCampaigns(statusFilter?: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const segments = ["email-campaigns"];
  if (statusFilter) {
    segments[0] = `email-campaigns?status=${statusFilter}`;
  }

  return useQuery({
    queryKey: ["emailCampaigns", "list", statusFilter],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: segments,
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });
}

export function useUpdateEmailCampaign(id: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  return useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "PUT",
        urlSegments: ["email-campaigns", id],
        payload: data.payload,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });
}

export function useDuplicateEmailCampaign(id: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  return useMutation({
    mutationFn: async () =>
      ssuRequest({
        method: "POST",
        urlSegments: ["email-campaigns", id, "duplicate"],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });
}

export function usePreviewEmailCampaign(id: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  return useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: ["email-campaigns", id, "preview"],
        payload: data?.payload || {},
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });
}

export function useSendEmailCampaign(id: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  return useMutation({
    mutationFn: async () =>
      ssuRequest({
        method: "POST",
        urlSegments: ["email-campaigns", id, "send"],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });
}

export function useCancelEmailCampaign(id: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  return useMutation({
    mutationFn: async () =>
      ssuRequest({
        method: "POST",
        urlSegments: ["email-campaigns", id, "cancel"],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });
}

export function useScheduleEmailCampaign(id: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  return useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: ["email-campaigns", id, "schedule"],
        payload: data.payload,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });
}

export function useRetryFailedRecipients(id: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  return useMutation({
    mutationFn: async () =>
      ssuRequest({
        method: "POST",
        urlSegments: ["email-campaigns", id, "retry-failed"],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });
}
