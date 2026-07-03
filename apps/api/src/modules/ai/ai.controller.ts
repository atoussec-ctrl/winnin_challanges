import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  AskRequestDto,
  CreateThreadResponseDto,
  MessageDto,
  SendMessageRequestDto,
  SendMessageResponseDto,
  ThreadDto
} from "./ai.dtos";
import { AiService } from "./ai.service";

@ApiTags("ai")
@Controller()
export class AiController {
  public constructor(private readonly aiService: AiService) {}

  @Post("threads")
  @ApiOperation({ summary: "Create a conversation thread." })
  @ApiCreatedResponse({ type: CreateThreadResponseDto })
  public createThread(): CreateThreadResponseDto {
    return this.aiService.createThread();
  }

  @Get("threads")
  @ApiOperation({ summary: "List conversation threads." })
  @ApiOkResponse({ type: [ThreadDto] })
  public listThreads(): ThreadDto[] {
    return this.aiService.listThreads();
  }

  @Post("threads/:threadId/messages")
  @ApiOperation({ summary: "Send a message to the orchestrator inside a thread." })
  @ApiCreatedResponse({ type: SendMessageResponseDto })
  public sendMessage(
    @Param("threadId") threadId: string,
    @Body() input: SendMessageRequestDto
  ): Promise<SendMessageResponseDto> {
    return this.aiService.sendMessage(threadId, input);
  }

  @Get("threads/:threadId/messages")
  @ApiOperation({ summary: "List full message history from a thread." })
  @ApiOkResponse({ type: [MessageDto] })
  public listMessages(@Param("threadId") threadId: string): MessageDto[] {
    return this.aiService.listMessages(threadId);
  }

  @Post("ask")
  @ApiOperation({ summary: "Compatibility endpoint for the simple RAG challenge." })
  @ApiCreatedResponse({ type: SendMessageResponseDto })
  public ask(@Body() input: AskRequestDto): Promise<SendMessageResponseDto> {
    return this.aiService.ask(input);
  }
}

