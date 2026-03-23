import { createSsuQuery, createSsuMutation } from "../queryFactory";

export const useMe = createSsuQuery({
  queryKey: ["me"],
  urlSegments: ["me"],
  staleTime: 30000,
});

export const useUpdateMyPersonalInformation = createSsuMutation<{
  profileDefinition: any;
  user: { name: string; email: string };
}>({
  method: "PUT",
  urlSegments: (data) => [
    data.profileDefinition?._links?.personalInformation.href,
  ],
  payload: (data) => ({
    name: data.user.name,
    email: data.user.email,
  }),
});

export const useUpdateUserSettingsInformation = createSsuMutation<any>({
  method: "POST",
  urlSegments: () => ["me", "settings"],
  payload: (data) => data,
});

export const useRegisterMyVisit = createSsuMutation<{
  profileDefinition: any;
}>({
  method: "POST",
  urlSegments: (data) => [
    data.profileDefinition?._links?.portalVisits.href,
  ],
  payload: () => null,
});
