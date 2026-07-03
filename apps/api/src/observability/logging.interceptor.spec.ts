import type { CallHandler, ExecutionContext } from "@nestjs/common";
import { firstValueFrom, of, throwError } from "rxjs";
import { describe, expect, it } from "vitest";
import { LoggingInterceptor, resolveOperationName } from "./logging.interceptor";
import { MetricsService } from "./metrics.service";
import { StructuredLogger } from "./structured-logger";

function createHttpContext(
  method?: string,
  url?: string,
  route?: { path?: string }
): ExecutionContext {
  return {
    getType: () => "http",
    switchToHttp: () => ({
      getRequest: () => ({ method, route, url })
    })
  } as unknown as ExecutionContext;
}

function createGraphqlContext(info: unknown): ExecutionContext {
  return {
    getArgByIndex: (index: number) => (index === 3 ? info : undefined),
    getArgs: () => [undefined, {}, {}, info],
    getClass: () => class FakeResolver {},
    getHandler: () => function fakeHandler() {},
    getType: () => "graphql"
  } as unknown as ExecutionContext;
}

function createInterceptor() {
  const lines: string[] = [];
  const metrics = new MetricsService();
  const logger = new StructuredLogger(
    (line) => lines.push(line),
    () => new Date("2026-07-03T12:00:00.000Z")
  );

  return { interceptor: new LoggingInterceptor(metrics, logger), lines, metrics };
}

describe("resolveOperationName", () => {
  it("names GraphQL operations by parent type and field", () => {
    const context = createGraphqlContext({ fieldName: "users", parentType: { name: "Query" } });

    expect(resolveOperationName(context)).toBe("graphql Query.users");
  });

  it("falls back when GraphQL info is incomplete", () => {
    const context = createGraphqlContext({});

    expect(resolveOperationName(context)).toBe("graphql Unknown.unknown");
  });

  it("names HTTP operations by method and url", () => {
    expect(resolveOperationName(createHttpContext("GET", "/health"))).toBe("GET /health");
  });

  it("prefers the route pattern over the concrete url to keep label cardinality bounded", () => {
    const context = createHttpContext("GET", "/threads/abc-123/messages", {
      path: "/threads/:threadId/messages"
    });

    expect(resolveOperationName(context)).toBe("GET /threads/:threadId/messages");
  });

  it("strips query strings when no route pattern is available", () => {
    expect(resolveOperationName(createHttpContext("GET", "/health?verbose=1"))).toBe(
      "GET /health"
    );
  });

  it("falls back when the HTTP request is incomplete", () => {
    expect(resolveOperationName(createHttpContext())).toBe("UNKNOWN /");
  });
});

describe("LoggingInterceptor", () => {
  it("records success metrics and logs completion", async () => {
    const { interceptor, lines, metrics } = createInterceptor();
    const handler: CallHandler = { handle: () => of("ok") };

    await expect(
      firstValueFrom(interceptor.intercept(createHttpContext("GET", "/health"), handler))
    ).resolves.toBe("ok");

    expect(metrics.snapshot()).toEqual([
      expect.objectContaining({
        errorCount: 0,
        operation: "GET /health",
        successCount: 1
      })
    ]);
    expect(lines[0]).toContain("GET /health completed in");
  });

  it("records error metrics, logs failure and rethrows", async () => {
    const { interceptor, lines, metrics } = createInterceptor();
    const handler: CallHandler = { handle: () => throwError(() => new Error("boom")) };

    await expect(
      firstValueFrom(interceptor.intercept(createHttpContext("POST", "/ask"), handler))
    ).rejects.toThrow("boom");

    expect(metrics.snapshot()).toEqual([
      expect.objectContaining({
        errorCount: 1,
        operation: "POST /ask",
        successCount: 0
      })
    ]);
    expect(lines[0]).toContain("POST /ask failed in");
    expect(lines[0]).toContain("boom");
  });

  it("stringifies non-Error failures", async () => {
    const { interceptor, lines } = createInterceptor();
    const handler: CallHandler = { handle: () => throwError(() => "string failure") };

    await expect(
      firstValueFrom(interceptor.intercept(createHttpContext("POST", "/ask"), handler))
    ).rejects.toBe("string failure");

    expect(lines[0]).toContain("string failure");
  });
});
