import type { JsonSchema } from "../contracts/json-schema";
import type { ToolResult } from "../contracts/tool-result";

export interface AgentTool<TInput, TOutput> {
  readonly name: string;
  readonly description: string;
  readonly inputSchema: JsonSchema;
  execute(input: TInput): Promise<ToolResult<TOutput>>;
}

