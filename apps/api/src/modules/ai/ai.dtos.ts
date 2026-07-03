import { ApiProperty } from "@nestjs/swagger";

export class CreateThreadResponseDto {
  @ApiProperty({ example: "9b60bda7-cb31-4bb9-86b4-f2c7f2659f1b" })
  public threadId!: string;
}

export class SendMessageRequestDto {
  @ApiProperty({ example: "Compare ReAct e Toolformer" })
  public content!: string;
}

export class AskRequestDto {
  @ApiProperty({ example: "O que e RAG?" })
  public question!: string;
}

export class SourceDto {
  @ApiProperty({ example: "2210.03629" })
  public paperId!: string;

  @ApiProperty({ example: "ReAct: Synergizing Reasoning and Acting in Language Models" })
  public title!: string;

  @ApiProperty({ example: "chunk-001", required: false })
  public chunkId?: string;
}

export class SendMessageResponseDto {
  @ApiProperty()
  public threadId!: string;

  @ApiProperty()
  public response!: string;

  @ApiProperty({ type: [SourceDto] })
  public sources!: SourceDto[];
}

export class MessageDto {
  @ApiProperty()
  public id!: string;

  @ApiProperty()
  public threadId!: string;

  @ApiProperty({ enum: ["user", "assistant"] })
  public role!: "user" | "assistant";

  @ApiProperty()
  public content!: string;

  @ApiProperty()
  public createdAt!: Date;
}

export class ThreadDto {
  @ApiProperty()
  public threadId!: string;

  @ApiProperty()
  public createdAt!: Date;
}

