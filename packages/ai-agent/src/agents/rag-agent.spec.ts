import { describe, expect, it } from "vitest";
import { ExtractSectionTool, type PaperSectionPort } from "../tools/extract-section.tool";
import { SearchDocumentsTool, type VectorSearchPort } from "../tools/search-documents.tool";
import { RAGAgent } from "./rag-agent";

class EmptyVectorSearch implements VectorSearchPort {
  public search() {
    return Promise.resolve([]);
  }
}

class FakeSections implements PaperSectionPort {
  public extractSection() {
    return Promise.resolve({
      content: "Intro",
      paperId: "1706.03762" as const,
      sectionName: "introduction"
    });
  }
}

describe("RAGAgent", () => {
  it("retrieves context with the search tool", async () => {
    const agent = new RAGAgent(
      new SearchDocumentsTool(new EmptyVectorSearch()),
      new ExtractSectionTool(new FakeSections())
    );

    const result = await agent.retrieve({ history: [], question: "attention" });

    expect(result.ok).toBe(true);
  });

  it("extracts introductions through the section tool", async () => {
    const agent = new RAGAgent(
      new SearchDocumentsTool(new EmptyVectorSearch()),
      new ExtractSectionTool(new FakeSections())
    );

    const result = await agent.extractIntroduction("1706.03762");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.sectionName).toBe("introduction");
    }
  });
});

