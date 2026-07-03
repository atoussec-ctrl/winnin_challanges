export type PaperId = "1706.03762" | "1810.04805" | "2005.11401" | "2210.03629" | "2302.04761";

export interface PaperMetadata {
  readonly id: PaperId;
  readonly title: string;
  readonly arxivUrl: string;
}

export interface DocumentChunk {
  readonly chunkId: string;
  readonly paperId: PaperId;
  readonly title: string;
  readonly content: string;
  readonly score: number;
  readonly page?: number;
  readonly section?: string;
}

export const REQUIRED_PAPERS: readonly PaperMetadata[] = [
  {
    arxivUrl: "https://arxiv.org/pdf/1706.03762",
    id: "1706.03762",
    title: "Attention Is All You Need"
  },
  {
    arxivUrl: "https://arxiv.org/pdf/1810.04805",
    id: "1810.04805",
    title: "BERT: Pre-training of Deep Bidirectional Transformers"
  },
  {
    arxivUrl: "https://arxiv.org/pdf/2005.11401",
    id: "2005.11401",
    title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
  },
  {
    arxivUrl: "https://arxiv.org/pdf/2210.03629",
    id: "2210.03629",
    title: "ReAct: Synergizing Reasoning and Acting in Language Models"
  },
  {
    arxivUrl: "https://arxiv.org/pdf/2302.04761",
    id: "2302.04761",
    title: "Toolformer: Language Models Can Teach Themselves to Use Tools"
  }
];

