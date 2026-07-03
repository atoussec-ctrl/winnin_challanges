import { describe, expect, it } from "vitest";
import { objectSchema } from "./json-schema";

describe("objectSchema", () => {
  it("creates a strict object JSON schema", () => {
    expect(objectSchema({ name: { type: "string" } }, ["name"])).toEqual({
      additionalProperties: false,
      properties: { name: { type: "string" } },
      required: ["name"],
      type: "object"
    });
  });
});

