import { useQuery, useMutation } from "@tanstack/react-query";
import { ssuRequest } from "../query";
import { useContext } from "react";
import PreAppContext from "@/preAppContext";

export function useDemoSignups() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const query = useQuery({
    queryKey: ["demosignups"],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["demos/signups"],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
    select: (data: any) => {
      let list = data.items || [];
      return list;
    },
  });

  return query;
}

export function useDemos() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const query = useQuery({
    queryKey: ["demos"],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["demos"],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
    select: (data: any) => {
      let list = data.demos || [];
      return list;
    },
  });

  return query;
}

export function useRegisterDemo() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      ssuRequest({
        method: "POST",
        urlSegments: ["demos"],
        payload: data,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      });
    },
  });

  return mutation;
}

export function useDeleteDemo() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      ssuRequest({
        method: "DELETE",
        urlSegments: ["demos", data.demoId],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      });
    },
  });

  return mutation;
}

export function useUpdateDemo() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      ssuRequest({
        method: "POST",
        urlSegments: ["demos", data.id],
        payload: data,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      });
    },
  });
  return mutation;
}
