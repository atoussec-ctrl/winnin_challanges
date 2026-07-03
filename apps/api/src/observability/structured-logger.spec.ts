import { describe, expect, it, vi } from "vitest";
import { StructuredLogger } from "./structured-logger";

function createLogger() {
  const lines: string[] = [];
  const logger = new StructuredLogger(
    (line) => lines.push(line),
    () => new Date("2026-07-03T12:00:00.000Z")
  );

  return { lines, logger };
}

describe("StructuredLogger", () => {
  it("writes JSON lines with level, message and timestamp", () => {
    const { lines, logger } = createLogger();

    logger.log("API listening", "Bootstrap");

    expect(JSON.parse(lines[0] ?? "")).toEqual({
      context: "Bootstrap",
      level: "log",
      message: "API listening",
      timestamp: "2026-07-03T12:00:00.000Z"
    });
  });

  it("serializes non-string messages and keeps extra params as details", () => {
    const { lines, logger } = createLogger();

    logger.warn({ operation: "createOrder" }, { durationMs: 12 }, "LoggingInterceptor");

    expect(JSON.parse(lines[0] ?? "")).toEqual({
      context: "LoggingInterceptor",
      details: [{ durationMs: 12 }],
      level: "warn",
      message: "{\"operation\":\"createOrder\"}",
      timestamp: "2026-07-03T12:00:00.000Z"
    });
  });

  it("uses the error message when logging Error instances without context", () => {
    const { lines, logger } = createLogger();

    logger.error(new Error("boom"), { code: 500 });

    expect(JSON.parse(lines[0] ?? "")).toEqual({
      details: [{ code: 500 }],
      level: "error",
      message: "boom",
      timestamp: "2026-07-03T12:00:00.000Z"
    });
  });

  it("does not throw when details contain circular references", () => {
    const { lines, logger } = createLogger();
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    logger.error("request failed", circular, "LoggingInterceptor");

    expect(JSON.parse(lines[0] ?? "")).toEqual({
      context: "LoggingInterceptor",
      details: ["[object Object]"],
      level: "error",
      message: "request failed",
      timestamp: "2026-07-03T12:00:00.000Z"
    });
  });

  it("does not throw when the message itself is not serializable", () => {
    const { lines, logger } = createLogger();
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    logger.log(circular);

    expect(JSON.parse(lines[0] ?? "")).toMatchObject({
      level: "log",
      message: "[object Object]"
    });
  });

  it("covers debug and verbose levels", () => {
    const { lines, logger } = createLogger();

    logger.debug("debug message");
    logger.verbose("verbose message");

    expect(JSON.parse(lines[0] ?? "")).toMatchObject({ level: "debug", message: "debug message" });
    expect(JSON.parse(lines[1] ?? "")).toMatchObject({
      level: "verbose",
      message: "verbose message"
    });
  });

  it("writes to stdout by default", () => {
    const written: string[] = [];
    const writeSpy = vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
      written.push(String(chunk));
      return true;
    });

    try {
      new StructuredLogger().log("default writer");
    } finally {
      writeSpy.mockRestore();
    }

    expect(written[0]).toContain("default writer");
    expect(written[0]?.endsWith("\n")).toBe(true);
  });
});
