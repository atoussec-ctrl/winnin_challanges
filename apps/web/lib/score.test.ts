import { describe, expect, it } from "vitest";
import { getScoreTone } from "./score";

describe("getScoreTone", () => {
  it("returns danger for scores below 50", () => {
    expect(getScoreTone(49)).toBe("danger");
  });

  it("returns warning for scores between 50 and 80", () => {
    expect(getScoreTone(50)).toBe("warning");
    expect(getScoreTone(80)).toBe("warning");
  });

  it("returns success for scores above 80", () => {
    expect(getScoreTone(81)).toBe("success");
  });

  it("returns empty when AniList does not provide a score", () => {
    expect(getScoreTone(null)).toBe("empty");
    expect(getScoreTone(undefined)).toBe("empty");
  });
});

