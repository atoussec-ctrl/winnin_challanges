import { describe, expect, it } from "vitest";
import { toolError, toolOk } from "./tool-result";

describe("tool result helpers", () => {
  it("creates successful tool results", () => {
    expect(toolOk({ value: 1 }, { count: 1 })).toEqual({
      data: { value: 1 },
      metadata: { count: 1 },
      ok: true
    });
  });

  it("creates failed tool results", () => {
    expect(toolError("BROKEN", "Broken tool")).toEqual({
      error: {
        code: "BROKEN",
        message: "Broken tool"
      },
      ok: false
    });
  });
});

