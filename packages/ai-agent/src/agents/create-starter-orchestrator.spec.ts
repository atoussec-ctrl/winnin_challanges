import { describe, expect, it } from "vitest";
import { createStarterOrchestrator } from "./create-starter-orchestrator";

describe("createStarterOrchestrator", () => {
  it("creates a placeholder orchestrator for retrieval", async () => {
    const answer = await createStarterOrchestrator().answer({
      content: "O que e attention?",
      history: []
    });

    expect(answer).toEqual({
      content: "No relevant context was found for this question.",
      sources: []
    });
  });

  it("creates a placeholder orchestrator for analysis", async () => {
    const answer = await createStarterOrchestrator().answer({
      content: "Compare os papers",
      history: []
    });

    expect(answer).toEqual({
      content: "Analysis model is not configured yet.",
      sources: []
    });
  });
});

