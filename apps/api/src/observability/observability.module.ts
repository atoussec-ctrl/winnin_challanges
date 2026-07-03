import { Global, Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { LoggingInterceptor } from "./logging.interceptor";
import { MetricsController } from "./metrics.controller";
import { MetricsService } from "./metrics.service";
import { StructuredLogger } from "./structured-logger";

@Global()
@Module({
  controllers: [MetricsController],
  exports: [MetricsService, StructuredLogger],
  providers: [
    MetricsService,
    {
      provide: StructuredLogger,
      useFactory: (): StructuredLogger => new StructuredLogger()
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor
    }
  ]
})
export class ObservabilityModule {}
