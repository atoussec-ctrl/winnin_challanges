import { describe, expect, it } from "vitest";
import { MetricsService } from "./metrics.service";

describe("MetricsService", () => {
  it("aggregates request samples by operation", () => {
    const service = new MetricsService();

    service.recordRequest({ durationMs: 10, operation: "graphql Query.users", outcome: "success" });
    service.recordRequest({ durationMs: 30, operation: "graphql Query.users", outcome: "success" });
    service.recordRequest({ durationMs: 5, operation: "graphql Query.users", outcome: "error" });

    expect(service.snapshot()).toEqual([
      {
        averageDurationMs: 15,
        errorCount: 1,
        maxDurationMs: 30,
        operation: "graphql Query.users",
        successCount: 2,
        totalDurationMs: 45
      }
    ]);
  });

  it("tracks operations independently", () => {
    const service = new MetricsService();

    service.recordRequest({ durationMs: 8, operation: "GET /health", outcome: "success" });
    service.recordRequest({ durationMs: 2, operation: "GET /metrics", outcome: "success" });

    expect(service.snapshot().map((metrics) => metrics.operation)).toEqual([
      "GET /health",
      "GET /metrics"
    ]);
  });

  it("renders Prometheus text format", () => {
    const service = new MetricsService();

    service.recordRequest({ durationMs: 12, operation: "GET /health", outcome: "success" });

    const payload = service.renderPrometheus();

    expect(payload).toContain("# TYPE api_requests_total counter");
    expect(payload).toContain('api_requests_total{operation="GET /health",outcome="success"} 1');
    expect(payload).toContain('api_requests_total{operation="GET /health",outcome="error"} 0');
    expect(payload).toContain('api_request_duration_ms_sum{operation="GET /health"} 12');
    expect(payload).toContain('api_request_duration_ms_max{operation="GET /health"} 12');
  });

  it("escapes label values in Prometheus output", () => {
    const service = new MetricsService();

    service.recordRequest({
      durationMs: 1,
      operation: 'weird "op" \\ with\nnewline',
      outcome: "error"
    });

    expect(service.renderPrometheus()).toContain(
      'api_requests_total{operation="weird \\"op\\" \\\\ with\\nnewline",outcome="error"} 1'
    );
  });
});
