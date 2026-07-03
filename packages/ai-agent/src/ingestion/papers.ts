import { REQUIRED_PAPERS, type PaperMetadata } from "../contracts/paper";

export interface PaperDownloadPlan {
  readonly papers: readonly PaperMetadata[];
  readonly targetDirectory: string;
}

export function createPaperDownloadPlan(targetDirectory: string): PaperDownloadPlan {
  return {
    papers: REQUIRED_PAPERS,
    targetDirectory
  };
}

