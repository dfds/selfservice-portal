import type { UseMutationResult, QueryKey } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";
import { queryClient } from "@/state/remote/client";

interface MutationToastOptions<TResponse> {
  invalidateKeys?: QueryKey[];
  successMessage: string | ((data: TResponse) => string);
  errorMessage: string;
  onSuccess?: (data: TResponse) => void;
  onError?: (error: unknown) => void;
}

export function useMutationToast<TPayload, TResponse = unknown>(
  mutation: UseMutationResult<TResponse, unknown, TPayload, unknown>,
  options: MutationToastOptions<TResponse>,
): (payload: TPayload) => void {
  const toast = useToast();

  return (payload: TPayload) => {
    mutation.mutate(payload, {
      onSuccess: (data) => {
        options.invalidateKeys?.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
        const message =
          typeof options.successMessage === "function"
            ? options.successMessage(data)
            : options.successMessage;
        toast.success(message);
        options.onSuccess?.(data);
      },
      onError: (error) => {
        toast.error(options.errorMessage);
        options.onError?.(error);
      },
    });
  };
}
