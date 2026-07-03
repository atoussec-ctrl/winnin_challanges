import { describe, expect, it } from "vitest";
import { toIsoString } from "./date";

describe("toIsoString", () => {
  it("serializes dates in ISO-8601 format", () => {
    expect(toIsoString(new Date("2026-07-03T03:00:00.000Z"))).toBe(
      "2026-07-03T03:00:00.000Z"
    );
  });
});

