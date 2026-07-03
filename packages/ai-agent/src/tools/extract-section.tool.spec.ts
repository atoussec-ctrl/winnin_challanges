import { describe, expect, it } from "vitest";
import { ExtractSectionTool, type PaperSectionPort } from "./extract-section.tool";

class FakeSections implements PaperSectionPort {
  public response: Awaited<ReturnType<PaperSectionPort["extractSection"]>> = {
    content: "The paper introduction.",
    paperId: "1706.03762",
    sectionName: "introduction"
  };

  public extractSection() {
    return Promise.resolve(this.response);
  }
}

describe("ExtractSectionTool", () => {
  it("returns the requested section", async () => {
    const tool = new ExtractSectionTool(new FakeSections());

    const result = await tool.execute({
      paperId: "1706.03762",
      sectionName: "introduction"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.content).toBe("The paper introduction.");
    }
  });

  it("rejects empty section names", async () => {
    const tool = new ExtractSectionTool(new FakeSections());

    const result = await tool.execute({
      paperId: "1706.03762",
      sectionName: " "
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("INVALID_SECTION");
    }
  });

  it("returns an error when the section does not exist", async () => {
    const sections = new FakeSections();
    sections.response = null;
    const tool = new ExtractSectionTool(sections);

    const result = await tool.execute({
      paperId: "1706.03762",
      sectionName: "conclusion"
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("SECTION_NOT_FOUND");
    }
  });
});

