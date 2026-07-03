import { describe, expect, it } from "vitest";
import {
  ComparePapersTool,
  RankPapersTool,
  SummarizeTool,
  type AnalysisModelPort
} from "../tools/analysis-tools";
import { AnalystAgent } from "./analyst-agent";

class FakeAnalysis implements AnalysisModelPort {
  public comparePapers() {
    return Promise.resolve({
      content: "Comparison",
      paperIds: ["2210.03629", "2302.04761"] as const
    });
  }

  public summarize() {
    return Promise.resolve({
      content: "Summary",
      paperIds: ["1706.03762"] as const
    });
  }

  public rankPapers() {
    return Promise.resolve({
      content: "Ranking",
      paperIds: ["2210.03629"] as const
    });
  }
}

function createAnalystAgent(): AnalystAgent {
  const analysis = new FakeAnalysis();

  return new AnalystAgent(
    new ComparePapersTool(analysis),
    new SummarizeTool(analysis),
    new RankPapersTool(analysis)
  );
}

describe("AnalystAgent", () => {
  it("compares papers", async () => {
    const result = await createAnalystAgent().compare(
      { history: [], question: "Compare tool use" },
      ["2210.03629", "2302.04761"]
    );

    expect(result.ok).toBe(true);
  });

  it("summarizes papers", async () => {
    const result = await createAnalystAgent().summarizePaper("1706.03762");

    expect(result.ok).toBe(true);
  });

  it("ranks papers", async () => {
    const result = await createAnalystAgent().rank(
      { history: [], question: "rank by relevance" },
      ["2210.03629", "2302.04761"]
    );

    expect(result.ok).toBe(true);
  });
});

