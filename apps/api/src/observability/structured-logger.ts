import type { LoggerService } from "@nestjs/common";

export type LogLevel = "debug" | "error" | "log" | "verbose" | "warn";

export type LogWriter = (line: string) => void;

const defaultWriter: LogWriter = (line) => {
  process.stdout.write(`${line}\n`);
};

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

function toMessage(message: unknown): string {
  if (typeof message === "string") {
    return message;
  }

  if (message instanceof Error) {
    return message.message;
  }

  return safeStringify(message);
}

export class StructuredLogger implements LoggerService {
  public constructor(
    private readonly writer: LogWriter = defaultWriter,
    private readonly clock: () => Date = () => new Date()
  ) {}

  public log(message: unknown, ...optionalParams: unknown[]): void {
    this.write("log", message, optionalParams);
  }

  public error(message: unknown, ...optionalParams: unknown[]): void {
    this.write("error", message, optionalParams);
  }

  public warn(message: unknown, ...optionalParams: unknown[]): void {
    this.write("warn", message, optionalParams);
  }

  public debug(message: unknown, ...optionalParams: unknown[]): void {
    this.write("debug", message, optionalParams);
  }

  public verbose(message: unknown, ...optionalParams: unknown[]): void {
    this.write("verbose", message, optionalParams);
  }

  private write(level: LogLevel, message: unknown, optionalParams: readonly unknown[]): void {
    const lastParam = optionalParams[optionalParams.length - 1];
    const context = typeof lastParam === "string" ? lastParam : undefined;
    const details = context === undefined ? optionalParams : optionalParams.slice(0, -1);
    const entry: Record<string, unknown> = {
      level,
      message: toMessage(message),
      timestamp: this.clock().toISOString()
    };

    if (context !== undefined) {
      entry.context = context;
    }

    if (details.length > 0) {
      entry.details = details;
    }

    let line: string;

    try {
      line = JSON.stringify(entry);
    } catch {
      line = JSON.stringify({ ...entry, details: details.map((detail) => String(detail)) });
    }

    this.writer(line);
  }
}
