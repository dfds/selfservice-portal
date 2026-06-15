import { useMutation, useQuery } from "@tanstack/react-query";
import { ssuRequest } from "../query";
import { createSsuParamQuery, createSsuMutation } from "../queryFactory";
import PreAppContext from "@/preAppContext";
import { useContext } from "react";

// ── Queries ──────────────────────────────────────────────────────────────────

export interface useReleaseNotesProps {
  includeDrafts?: boolean;
}

// Manual — conditional URL segment building
export function useReleaseNotes({ includeDrafts }: useReleaseNotesProps = {}) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  // Drafts are a manage-page-only concern. Keep them in their own cache entry
  // so the published-only consumers (release notes list, what's-new) never pull
  // drafts into their payload — and so neither side clobbers the other's cache.
  const wantsDrafts = includeDrafts === true;

  const segments = ["release-notes"];
  if (wantsDrafts) {
    segments.push("?includeDrafts");
  }

  return useQuery({
    queryKey: ["releasenotes", "list", wantsDrafts ? "drafts" : "published"],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: segments,
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });
}

export const useReleaseNote = createSsuParamQuery<string>({
  queryKey: (id) => ["releasenotes", "details", id],
  urlSegments: (id) => ["release-notes", id],
});

// ── Mutations ────────────────────────────────────────────────────────────────

export const useCreateReleaseNote = createSsuMutation<{ payload: any }>({
  method: "POST",
  urlSegments: () => ["release-notes"],
});

// Manual — hook argument (id) not supported by createSsuMutation
export function useUpdateReleaseNote(id: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  return useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "PUT",
        urlSegments: ["release-notes", id],
        payload: data.payload,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });
}

export const useToggleNoteActivity = createSsuMutation<{ href: string }>({
  method: "POST",
  urlSegments: (input) => [input.href],
  payload: () => null,
});

export const useToggleReleaseNoteActive = createSsuMutation<{
  id: string;
}>({
  method: "POST",
  urlSegments: (input) => ["release-notes", input.id, "toggle-active"],
  payload: () => null,
});

export const useDeleteReleaseNote = createSsuMutation<{ id: string }>({
  method: "DELETE",
  urlSegments: (data) => ["release-notes", data.id],
  payload: () => null,
});
