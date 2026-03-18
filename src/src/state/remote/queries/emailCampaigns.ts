import { useMutation, useQuery } from "@tanstack/react-query";
import { ssuRequest } from "../query";
import PreAppContext from "@/preAppContext";
import { useContext } from "react";

export function useEmailCampaigns(statusFilter?: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const segments = ["email-campaigns"];
  if (statusFilter) {
    segments[0] = `email-campaigns?status=${statusFilter}`;
  }

  const query = useQuery({
    queryKey: ["emailCampaigns", "list", statusFilter],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: segments,
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return query;
}

export function useEmailCampaign(id: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const query = useQuery({
    queryKey: ["emailCampaigns", "detail", id],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["email-campaigns", id],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
    enabled: !!id,
  });

  return query;
}

export function useTemplateVariables() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const query = useQuery({
    queryKey: ["emailCampaigns", "variables"],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["email-campaigns/variables"],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
    staleTime: 300_000,
  });

  return query;
}

export function useCreateEmailCampaign() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: ["email-campaigns"],
        payload: data.payload,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return mutation;
}

export function useUpdateEmailCampaign(id: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "PUT",
        urlSegments: ["email-campaigns", id],
        payload: data.payload,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return mutation;
}

export function useDeleteEmailCampaign() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "DELETE",
        urlSegments: ["email-campaigns", data.id],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return mutation;
}

export function useDuplicateEmailCampaign(id: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const mutation = useMutation({
    mutationFn: async () =>
      ssuRequest({
        method: "POST",
        urlSegments: ["email-campaigns", id, "duplicate"],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return mutation;
}

export function useResolveAudience() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: ["email-campaigns/resolve-audience"],
        payload: data.payload,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return mutation;
}

export function usePreviewEmailCampaign(id: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: ["email-campaigns", id, "preview"],
        payload: data?.payload || {},
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return mutation;
}

export function usePreviewEmailCampaignContent() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: ["email-campaigns/preview"],
        payload: data.payload,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return mutation;
}

export function useSendEmailCampaign(id: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const mutation = useMutation({
    mutationFn: async () =>
      ssuRequest({
        method: "POST",
        urlSegments: ["email-campaigns", id, "send"],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return mutation;
}

export function useCancelEmailCampaign(id: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const mutation = useMutation({
    mutationFn: async () =>
      ssuRequest({
        method: "POST",
        urlSegments: ["email-campaigns", id, "cancel"],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return mutation;
}

export function useScheduleEmailCampaign(id: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: ["email-campaigns", id, "schedule"],
        payload: data.payload,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return mutation;
}

export function useEmailCampaignExecutions(id: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const query = useQuery({
    queryKey: ["emailCampaigns", "executions", id],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["email-campaigns", id, "executions"],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
    enabled: !!id,
  });

  return query;
}

export function useEmailCampaignRecipients(id: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const query = useQuery({
    queryKey: ["emailCampaigns", "recipients", id],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["email-campaigns", id, "recipients"],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
    enabled: !!id,
  });

  return query;
}

export function useRetryFailedRecipients(id: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const mutation = useMutation({
    mutationFn: async () =>
      ssuRequest({
        method: "POST",
        urlSegments: ["email-campaigns", id, "retry-failed"],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return mutation;
}
