import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor
} from "@nestjs/common";
import { GqlExecutionContext, type GqlContextType } from "@nestjs/graphql";
import { catchError, tap, throwError, type Observable } from "rxjs";
import { MetricsService } from "./metrics.service";
import { StructuredLogger } from "./structured-logger";

interface GraphQLResolveInfoLike {
  readonly fieldName?: string;
  readonly parentType?: { readonly name?: string };
}

interface HttpRequestLike {
  readonly method?: string;
  readonly route?: { readonly path?: string };
  readonly url?: string;
}

export function resolveOperationName(context: ExecutionContext): string {
  if (context.getType<GqlContextType>() === "graphql") {
    const info = GqlExecutionContext.create(context).getInfo<GraphQLResolveInfoLike>();
    return `graphql ${info.parentType?.name ?? "Unknown"}.${info.fieldName ?? "unknown"}`;
  }

  const request = context.switchToHttp().getRequest<HttpRequestLike>();
  const path = request.route?.path ?? (request.url ?? "/").split("?")[0];
  return `${request.method ?? "UNKNOWN"} ${path}`;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  public constructor(
    private readonly metrics: MetricsService,
    private readonly logger: StructuredLogger
  ) {}

  public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const operation = resolveOperationName(context);
    const startedAt = Date.now();

    return next.handle().pipe(
      tap(() => this.record(operation, "success", startedAt)),
      catchError((error: unknown) => {
        this.record(operation, "error", startedAt, error);
        return throwError(() => error);
      })
    );
  }

  private record(
    operation: string,
    outcome: "error" | "success",
    startedAt: number,
    error?: unknown
  ): void {
    const durationMs = Date.now() - startedAt;
    this.metrics.recordRequest({ durationMs, operation, outcome });

    if (outcome === "success") {
      this.logger.log(`${operation} completed in ${durationMs}ms`, "LoggingInterceptor");
      return;
    }

    const reason = error instanceof Error ? error.message : String(error);
    this.logger.error(
      `${operation} failed in ${durationMs}ms: ${reason}`,
      "LoggingInterceptor"
    );
  }
}
