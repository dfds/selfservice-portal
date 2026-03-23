import { createSsuLinkQuery, createSsuMutation } from "../queryFactory";

export const useCapabilityAzureResources = createSsuLinkQuery<any>({
  queryKey: (def) => ["capabilities", "azure", "azure-resources", def?.id],
  linkHref: (def) => def?._links?.azureResources?.href,
});

export const useCapabilityAzureResourceRequest = createSsuMutation<any>({
  method: "POST",
  urlSegments: (data) => [
    "capabilities",
    data.capabilityDefinition.id,
    "azureresources",
  ],
  payload: (data) => data.payload,
});
