import type { AgentAnswer, ThreadMessage } from "../contracts/thread";
import type { PaperId } from "../contracts/paper";
import type { AnalystAgent } from "./analyst-agent";
import type { RAGAgent } from "./rag-agent";

export interface OrchestratorInput {
  readonly content: string;
  readonly history: readonly ThreadMessage[];
}

const DEFAULT_PAPER_IDS: readonly PaperId[] = [
  "1706.03762",
  "1810.04805",
  "2005.11401",
  "2210.03629",
  "2302.04761"
];

export class OrchestratorAgent {
  public constructor(
    private readonly ragAgent: RAGAgent,
    private readonly analystAgent: AnalystAgent
  ) {}

  public async answer(input: OrchestratorInput): Promise<AgentAnswer> {
    const normalizedQuestion = input.content.toLowerCase();

    if (normalizedQuestion.includes("compare")) {
      const result = await this.analystAgent.compare(
        { history: input.history, question: input.content },
        DEFAULT_PAPER_IDS
      );

      return result.ok
        ? {
            content: result.data.content,
            sources: result.data.paperIds.map((paperId) => ({ paperId, title: paperId }))
          }
        : { content: result.error.message, sources: [] };
    }

    if (normalizedQuestion.includes("rank") || normalizedQuestion.includes("relevante")) {
      const result = await this.analystAgent.rank(
        { history: input.history, question: input.content },
        DEFAULT_PAPER_IDS
      );

      return result.ok
        ? {
            content: result.data.content,
            sources: result.data.paperIds.map((paperId) => ({ paperId, title: paperId }))
          }
        : { content: result.error.message, sources: [] };
    }

    const result = await this.ragAgent.retrieve({
      history: input.history,
      question: input.content
    });

    if (!result.ok) {
      return { content: result.error.message, sources: [] };
    }

    return {
      content:
        result.data.matches.length === 0
          ? "No relevant context was found for this question."
          : result.data.matches.map((match) => match.content).join("\n\n"),
      sources: result.data.matches.map((match) => ({
        chunkId: match.chunkId,
        paperId: match.paperId,
        title: match.title
      }))
    };
  }
}

