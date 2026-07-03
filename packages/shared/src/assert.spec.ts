import { describe, expect, it } from "vitest";
import { assertNever, invariant } from "./assert";

describe("assert helpers", () => {
  it("does not throw when invariant is true", () => {
    expect(() => invariant(true, "should not throw")).not.toThrow();
  });

  it("throws when invariant is false", () => {
    expect(() => invariant(false, "broken invariant")).toThrow("broken invariant");
  });

  it("throws for unreachable values", () => {
    expect(() => assertNever("unexpected" as never)).toThrow("Unexpected value: unexpected");
  });
});

