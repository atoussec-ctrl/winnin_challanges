import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { StructuredLogger } from "./observability/structured-logger";

async function bootstrap(): Promise<void> {
  const logger = new StructuredLogger();
  const app = await NestFactory.create(AppModule, { logger });
  app.enableCors();

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Desafio Winnin API")
    .setDescription("REST endpoints for AI/RAG and health checks. Orders are exposed via GraphQL.")
    .setVersion("0.1.0")
    .build();

  SwaggerModule.setup("docs", app, SwaggerModule.createDocument(app, swaggerConfig));

  const port = Number(process.env.API_PORT ?? 3333);
  await app.listen(port);
  logger.log(`API listening on port ${port}`, "Bootstrap");
}

void bootstrap();

