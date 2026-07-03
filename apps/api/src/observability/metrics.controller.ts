import { Controller, Get, Header } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { MetricsService } from "./metrics.service";

@ApiTags("observability")
@Controller("metrics")
export class MetricsController {
  public constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Header("Content-Type", "text/plain; version=0.0.4; charset=utf-8")
  @ApiOperation({ summary: "Expose request metrics in Prometheus text format." })
  @ApiOkResponse({ description: "Prometheus metrics payload." })
  public metrics(): string {
    return this.metricsService.renderPrometheus();
  }
}
