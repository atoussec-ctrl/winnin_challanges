import type { PaperId } from "../contracts/paper";
import type { ThreadMessage } from "../contracts/thread";
import type {
  ComparePapersTool,
  RankPapersTool,
  SummarizeTool
} from "../tools/analysis-tools";

export interface AnalystAgentInput {
  readonly question: string;
  readonly history: readonly ThreadMessage[];
}

export class AnalystAgent {
  public constructor(
    private readonly comparePapers: ComparePapersTool,
    private readonly summarize: SummarizeTool,
    private readonly rankPapers: RankPapersTool
  ) {}

  public async compare(input: AnalystAgentInput, paperIds: readonly PaperId[]) {
    void input.history;
    return this.comparePapers.execute({
      aspect: input.question,
      paperIds
    });
  }

  public async summarizePaper(paperId: PaperId) {
    return this.summarize.execute({
      maxBulletPoints: 5,
      paperId
    });
  }

  public async rank(input: AnalystAgentInput, paperIds: readonly PaperId[]) {
    return this.rankPapers.execute({
      criterion: input.question,
      paperIds
    });
  }
}

