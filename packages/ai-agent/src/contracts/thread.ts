export type ThreadId = string;

export type MessageRole = "user" | "assistant";

export interface ThreadMessage {
  readonly id: string;
  readonly threadId: ThreadId;
  readonly role: MessageRole;
  readonly content: string;
  readonly createdAt: Date;
}

export interface AgentSource {
  readonly paperId: string;
  readonly title: string;
  readonly chunkId?: string;
}

export interface AgentAnswer {
  readonly content: string;
  readonly sources: readonly AgentSource[];
}

