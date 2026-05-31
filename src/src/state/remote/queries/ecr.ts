import { createSsuQuery, createSsuMutation } from "../queryFactory";

export const useEcrRepositories = createSsuQuery({
  queryKey: ["ecr", "repositories"],
  urlSegments: ["ecr/repositories"],
});

export const useCreateEcrRepository = createSsuMutation<{ payload: any }>({
  method: "POST",
  urlSegments: () => ["ecr/repositories"],
  payload: (data) => data.payload,
});

export const useEcrOutOfSyncInfo = createSsuQuery({
  queryKey: ["ecr", "out-of-sync"],
  urlSegments: ["metrics/out-of-sync-ecr-repos"],
  authMode: true,
  staleTime: 30000,
});

export const useSyncEcr = createSsuMutation<{ updateOnMismatch: boolean }>({
  method: "POST",
  urlSegments: (data) => [
    `ecr/synchronize?updateOnMismatch=${data.updateOnMismatch}`,
  ],
  payload: () => null,
  authMode: true,
});
