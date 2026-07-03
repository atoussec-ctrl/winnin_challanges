import { describe, expect, it } from "vitest";
import { MetricsController } from "./metrics.controller";
import { MetricsService } from "./metrics.service";

describe("MetricsController", () => {
  it("returns the Prometheus payload from the metrics service", () => {
    const service = new MetricsService();
    service.recordRequest({ durationMs: 3, operation: "GET /health", outcome: "success" });

    const payload = new MetricsController(service).metrics();

    expect(payload).toContain('api_requests_total{operation="GET /health",outcome="success"} 1');
  });
});
