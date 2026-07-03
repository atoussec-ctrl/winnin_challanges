export type JsonSchema = Readonly<Record<string, unknown>>;

export function objectSchema(
  properties: Readonly<Record<string, JsonSchema>>,
  required: readonly string[]
): JsonSchema {
  return {
    additionalProperties: false,
    properties,
    required,
    type: "object"
  };
}

