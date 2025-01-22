import {
  callApi,
  getGraphAccessToken,
  getSelfServiceAccessToken,
} from "@/AuthService";
import { composeSegmentsUrl, isValidURL } from "@/Utils";
import { useQuery } from "@tanstack/react-query";

export class SsuRequestQuery {
  urlSegments: string[];
  method: string;
  payload: any;
  isCloudEngineerEnabled: boolean;
}

export class MsGraphRequestQuery {
  url: string;
  method: string;
  payload: any;
}

export async function ssuRequest(rq: SsuRequestQuery) {
  const accessToken = await getSelfServiceAccessToken();

  let url = composeSegmentsUrl(rq.urlSegments);
  if (isValidURL(rq.urlSegments[0])) {
    url = rq.urlSegments[0];
  }

  const httpResponse = await callApi(
    url,
    accessToken,
    rq.method,
    rq.payload,
    rq.isCloudEngineerEnabled,
  );
  if (httpResponse.ok) {
    const contentType = httpResponse.headers.get("Content-Type");
    if (contentType && contentType.includes("application/json")) {
      const resp = await httpResponse.json();
      return resp;
    }
  } else {
    const err = new Error("Unexpected response");
    (err as any).data = httpResponse;
    throw err;
  }
}

export async function msGraphRequest(rq: MsGraphRequestQuery) {
  const accessToken = await getGraphAccessToken();
  const httpResponse = await callApi(
    rq.url,
    accessToken,
    rq.method,
    rq.payload,
  );
  return httpResponse;
}

export function useSsuRequestLink(link: any, isCloudEngineerEnabled: boolean) {
  const href = link?.href;

  const query = useQuery({
    queryKey: ["ssu-request", href],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: [href],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
    enabled: !!href,
  });

  return query;
}
