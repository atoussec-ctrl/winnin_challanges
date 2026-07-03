import { Injectable } from "@nestjs/common";

export type RequestOutcome = "error" | "success";

export interface RequestSample {
  readonly durationMs: number;
  readonly operation: string;
  readonly outcome: RequestOutcome;
}

export interface OperationMetrics {
  readonly averageDurationMs: number;
  readonly errorCount: number;
  readonly maxDurationMs: number;
  readonly operation: string;
  readonly successCount: number;
  readonly totalDurationMs: number;
}

interface MutableOperationMetrics {
  errorCount: number;
  maxDurationMs: number;
  successCount: number;
  totalDurationMs: number;
}

function escapeLabelValue(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll("\"", "\\\"").replaceAll("\n", "\\n");
}

@Injectable()
export class MetricsService {
  private readonly operations = new Map<string, MutableOperationMetrics>();

  public recordRequest(sample: RequestSample): void {
    const metrics = this.operations.get(sample.operation) ?? {
      errorCount: 0,
      maxDurationMs: 0,
      successCount: 0,
      totalDurationMs: 0
    };

    if (sample.outcome === "success") {
      metrics.successCount += 1;
    } else {
      metrics.errorCount += 1;
    }

    metrics.totalDurationMs += sample.durationMs;
    metrics.maxDurationMs = Math.max(metrics.maxDurationMs, sample.durationMs);
    this.operations.set(sample.operation, metrics);
  }

  public snapshot(): readonly OperationMetrics[] {
    return [...this.operations.entries()].map(([operation, metrics]) => {
      const requestCount = metrics.successCount + metrics.errorCount;

      return {
        averageDurationMs: requestCount === 0 ? 0 : metrics.totalDurationMs / requestCount,
        errorCount: metrics.errorCount,
        maxDurationMs: metrics.maxDurationMs,
        operation,
        successCount: metrics.successCount,
        totalDurationMs: metrics.totalDurationMs
      };
    });
  }

  public renderPrometheus(): string {
    const lines: string[] = [
      "# HELP api_requests_total Total requests handled, labeled by operation and outcome.",
      "# TYPE api_requests_total counter",
      "# HELP api_request_duration_ms_sum Total request duration in milliseconds by operation.",
      "# TYPE api_request_duration_ms_sum counter",
      "# HELP api_request_duration_ms_max Max request duration in milliseconds by operation.",
      "# TYPE api_request_duration_ms_max gauge"
    ];

    for (const metrics of this.snapshot()) {
      const operation = escapeLabelValue(metrics.operation);
      lines.push(
        `api_requests_total{operation="${operation}",outcome="success"} ${metrics.successCount}`,
        `api_requests_total{operation="${operation}",outcome="error"} ${metrics.errorCount}`,
        `api_request_duration_ms_sum{operation="${operation}"} ${metrics.totalDurationMs}`,
        `api_request_duration_ms_max{operation="${operation}"} ${metrics.maxDurationMs}`
      );
    }

    return `${lines.join("\n")}\n`;
  }
}
