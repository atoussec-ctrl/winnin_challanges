import { describe, expect, it } from "vitest";
import { HealthController } from "./health.controller";

describe("HealthController", () => {
  it("returns API health status with uptime and timestamp", () => {
    const health = new HealthController().health();

    expect(health.status).toBe("ok");
    expect(health.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(new Date(health.timestamp).toISOString()).toBe(health.timestamp);
  });
});
