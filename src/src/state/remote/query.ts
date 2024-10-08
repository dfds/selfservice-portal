import { callApi, getSelfServiceAccessToken } from "@/AuthService";
import { composeSegmentsUrl, isValidURL } from "@/Utils";

export class SsuRequestQuery {
  urlSegments: string[];
  method: string;
  payload: any;
  isCloudEngineerEnabled: boolean;
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
    return httpResponse;
  }
}
