import { createSsuParamQuery, createSsuMutation } from "../queryFactory";

export const useJsonSchema = createSsuParamQuery<string>({
  queryKey: (schemaId) => ["json-schema", schemaId],
  urlSegments: (schemaId) => ["json-schema", schemaId],
  authMode: true,
  enabled: (id) => !!id,
});

export const useUpdateJsonSchema = createSsuMutation<{
  schemaId: string;
  schema: any;
}>({
  method: "POST",
  urlSegments: (data) => ["json-schema", data.schemaId],
  payload: (data) => data.schema,
  authMode: true,
});

export const useValidateJsonSchema = createSsuMutation<any>({
  method: "POST",
  urlSegments: () => ["json-schema", "validate"],
  payload: (data) => data,
  authMode: true,
});
