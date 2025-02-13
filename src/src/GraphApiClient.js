import { callApi, getGraphAccessToken } from "./AuthService";

export async function getUserProfile() {
  const accessToken = await getGraphAccessToken();
  const profileResponse = await callApi(
    "https://graph.microsoft.com/v1.0/me",
    accessToken,
  );
  const profile = await profileResponse.json();

  return {
    name: profile.displayName,
    email: profile.mail,
    upn: profile.userPrincipalName,
    title: profile.jobTitle,
  };
}

export async function getUserProfilePictureUrl() {
  const accessToken = await getGraphAccessToken();
  const pictureResponse = await callApi(
    "https://graph.microsoft.com/v1.0/me/photos/48x48/$value",
    accessToken,
  );

  if (!pictureResponse.ok) {
    return "";
  }

  const blob = await pictureResponse.blob();
  const url = window.URL || window.webkitURL;

  return url.createObjectURL(blob);
}

export async function getAnotherUserProfilePictureUrl(upn) {
  const accessToken = await getGraphAccessToken();
  const pictureResponse = await callApi(
    `https://graph.microsoft.com/v1.0/users/${upn}/photos/96x96/$value`,
    accessToken,
  );

  if (!pictureResponse.ok) {
    return "";
  }

  const blob = await pictureResponse.blob();
  const url = window.URL || window.webkitURL;

  return url.createObjectURL(blob);
}

export async function getUsers(filterString) {
  const accessToken = await getGraphAccessToken();
  const adUsers = await callApi(
    `https://graph.microsoft.com/v1.0/users?$filter=startswith(displayName, '${encodeURIComponent(
      filterString,
    )}') and mail ge '!' or startswith(mail, '${encodeURIComponent(
      filterString,
    )}') and mail ge '!' or startswith(displayName, '${encodeURIComponent(
      filterString,
    )}') and userPrincipalName ge '!'`,
    accessToken,
  );
  const users = await adUsers.json();

  return users;
}
