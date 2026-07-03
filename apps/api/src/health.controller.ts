import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("health")
@Controller("health")
export class HealthController {
  @Get()
  @ApiOkResponse({ description: "API is healthy." })
  public health() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime())
    };
  }
}

