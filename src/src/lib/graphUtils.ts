import { msGraphRequest } from "@/state/remote/query";

export async function fetchUserPhoto(email: string): Promise<string> {
  if (!email) return "";
  const resp = await msGraphRequest({
    method: "GET",
    url: `https://graph.microsoft.com/v1.0/users/${email}/photos/96x96/$value`,
    payload: null,
  });
  if (!resp.ok) return "";
  const blob = await resp.blob();
  const url = window.URL || window.webkitURL;
  return url.createObjectURL(blob);
}
