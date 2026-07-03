import type { ThreadMessage } from "../contracts/thread";
import type { SearchDocumentsTool } from "../tools/search-documents.tool";
import type { ExtractSectionTool } from "../tools/extract-section.tool";

export interface RagAgentInput {
  readonly question: string;
  readonly history: readonly ThreadMessage[];
}

export class RAGAgent {
  public constructor(
    private readonly searchDocuments: SearchDocumentsTool,
    private readonly extractSection: ExtractSectionTool
  ) {}

  public async retrieve(input: RagAgentInput) {
    void input.history;
    return this.searchDocuments.execute({
      query: input.question,
      limit: 5
    });
  }

  public async extractIntroduction(paperId: Parameters<ExtractSectionTool["execute"]>[0]["paperId"]) {
    return this.extractSection.execute({
      paperId,
      sectionName: "introduction"
    });
  }
}

