import { useMutation, useQuery } from "@tanstack/react-query";
import { ssuRequest } from "../query";
import PreAppContext from "@/preAppContext";
import { useContext } from "react";

export interface useReleaseNotesProps {
  includeDrafts?: boolean;
}

export function useReleaseNotes({ includeDrafts }: useReleaseNotesProps) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const segments = ["release-notes"];
  if (includeDrafts != null && includeDrafts === true) {
    segments.push("?includeDrafts");
  }

  const query = useQuery({
    queryKey: ["releasenotes", "list"],
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

export function useReleaseNote(id: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const query = useQuery({
    queryKey: ["releasenotes", "details", id],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["release-notes", id],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return query;
}

export function useCreateReleaseNote() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: ["release-notes"],
        payload: data.payload,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return mutation;
}

export function useUpdateReleaseNote(id: string) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "PUT",
        urlSegments: ["release-notes", id],
        payload: data.payload,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return mutation;
}

export function useToggleNoteActivity() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const mutation = useMutation({
    mutationFn: async (input: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: [input.href],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return mutation;
}

export function useToggleReleaseNoteActive() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const mutation = useMutation({
    mutationFn: async (input: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: ["release-notes", input.id, "toggle-active"],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return mutation;
}
