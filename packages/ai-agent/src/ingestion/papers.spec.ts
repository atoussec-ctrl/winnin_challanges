import { describe, expect, it } from "vitest";
import { REQUIRED_PAPERS } from "../contracts/paper";
import { createPaperDownloadPlan } from "./papers";

describe("createPaperDownloadPlan", () => {
  it("includes the five required arXiv papers", () => {
    expect(createPaperDownloadPlan("data/papers")).toEqual({
      papers: REQUIRED_PAPERS,
      targetDirectory: "data/papers"
    });
  });
});

