import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { HealthController } from "./health.controller";
import { AiModule } from "./modules/ai/ai.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { ObservabilityModule } from "./observability/observability.module";

@Module({
  controllers: [HealthController],
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: true,
      driver: ApolloDriver,
      sortSchema: true
    }),
    ObservabilityModule,
    OrdersModule,
    AiModule
  ]
})
export class AppModule {}

