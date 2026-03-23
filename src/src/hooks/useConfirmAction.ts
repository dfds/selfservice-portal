import { useState } from "react";
import type { UseMutationResult, QueryKey } from "@tanstack/react-query";
import { useMutationToast } from "@/hooks/useMutationToast";

interface UseConfirmActionOptions<TTarget, TPayload, TResponse> {
  mutation: UseMutationResult<TResponse, unknown, TPayload, unknown>;
  buildPayload: (target: TTarget) => TPayload;
  invalidateKeys?: QueryKey[];
  successMessage: string | ((data: TResponse) => string);
  errorMessage: string;
  onSuccess?: (data: TResponse) => void;
  onError?: (error: unknown) => void;
}

interface UseConfirmActionReturn<TTarget> {
  target: TTarget | null;
  setTarget: (target: TTarget | null) => void;
  isPending: boolean;
  confirm: () => void;
  dialogProps: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isPending: boolean;
    onConfirm: () => void;
  };
}

export function useConfirmAction<TTarget, TPayload, TResponse = unknown>(
  options: UseConfirmActionOptions<TTarget, TPayload, TResponse>,
): UseConfirmActionReturn<TTarget> {
  const [target, setTarget] = useState<TTarget | null>(null);

  const fire = useMutationToast(options.mutation, {
    invalidateKeys: options.invalidateKeys,
    successMessage: options.successMessage,
    errorMessage: options.errorMessage,
    onSuccess: (data) => {
      setTarget(null);
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });

  const confirm = () => {
    if (target) fire(options.buildPayload(target));
  };

  return {
    target,
    setTarget,
    isPending: options.mutation.isPending,
    confirm,
    dialogProps: {
      open: !!target,
      onOpenChange: (open: boolean) => {
        if (!open) setTarget(null);
      },
      isPending: options.mutation.isPending,
      onConfirm: confirm,
    },
  };
}
