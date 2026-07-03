export interface ToolError {
  readonly code: string;
  readonly message: string;
}

export type ToolResult<TData> =
  | {
      readonly ok: true;
      readonly data: TData;
      readonly metadata?: Readonly<Record<string, unknown>>;
    }
  | {
      readonly ok: false;
      readonly error: ToolError;
      readonly metadata?: Readonly<Record<string, unknown>>;
    };

export function toolOk<TData>(
  data: TData,
  metadata?: Readonly<Record<string, unknown>>
): ToolResult<TData> {
  return { data, metadata, ok: true };
}

export function toolError<TData>(code: string, message: string): ToolResult<TData> {
  return {
    error: { code, message },
    ok: false
  };
}

