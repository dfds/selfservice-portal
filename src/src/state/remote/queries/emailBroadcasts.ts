import { useMutation, useQuery } from "@tanstack/react-query";
import { ssuRequest } from "../query";
import PreAppContext from "@/preAppContext";
import { useContext } from "react";

export function useEmailBroadcasts(statusFilter?: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const segments = ["email-broadcasts"];
  if (statusFilter) {
    segments[0] = `email-broadcasts?status=${statusFilter}`;
  }

  const query = useQuery({
    queryKey: ["emailBroadcasts", "list", statusFilter],
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

export function useEmailBroadcast(id: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const query = useQuery({
    queryKey: ["emailBroadcasts", "detail", id],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["email-broadcasts", id],
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
    queryKey: ["emailBroadcasts", "variables"],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["email-broadcasts/variables"],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
    staleTime: 300_000,
  });

  return query;
}

export function useCreateEmailBroadcast() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: ["email-broadcasts"],
        payload: data.payload,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return mutation;
}

export function useUpdateEmailBroadcast(id: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "PUT",
        urlSegments: ["email-broadcasts", id],
        payload: data.payload,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return mutation;
}

export function useDeleteEmailBroadcast() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "DELETE",
        urlSegments: ["email-broadcasts", data.id],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return mutation;
}

export function useDuplicateEmailBroadcast(id: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const mutation = useMutation({
    mutationFn: async () =>
      ssuRequest({
        method: "POST",
        urlSegments: ["email-broadcasts", id, "duplicate"],
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
        urlSegments: ["email-broadcasts/resolve-audience"],
        payload: data.payload,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return mutation;
}

export function usePreviewEmailBroadcast(id: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: ["email-broadcasts", id, "preview"],
        payload: data?.payload || {},
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return mutation;
}

export function useSendEmailBroadcast(id: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const mutation = useMutation({
    mutationFn: async () =>
      ssuRequest({
        method: "POST",
        urlSegments: ["email-broadcasts", id, "send"],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return mutation;
}

export function useCancelEmailBroadcast(id: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const mutation = useMutation({
    mutationFn: async () =>
      ssuRequest({
        method: "POST",
        urlSegments: ["email-broadcasts", id, "cancel"],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return mutation;
}

export function useScheduleEmailBroadcast(id: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: ["email-broadcasts", id, "schedule"],
        payload: data.payload,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return mutation;
}

export function useEmailBroadcastExecutions(id: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const query = useQuery({
    queryKey: ["emailBroadcasts", "executions", id],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["email-broadcasts", id, "executions"],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
    enabled: !!id,
  });

  return query;
}

export function useEmailBroadcastRecipients(id: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const query = useQuery({
    queryKey: ["emailBroadcasts", "recipients", id],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["email-broadcasts", id, "recipients"],
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
        urlSegments: ["email-broadcasts", id, "retry-failed"],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return mutation;
}
