import { Module } from "@nestjs/common";
import { InMemoryOrdersRepository } from "./orders.repository";
import { OrdersResolver } from "./orders.resolver";
import { OrdersService } from "./orders.service";

@Module({
  providers: [InMemoryOrdersRepository, OrdersResolver, OrdersService]
})
export class OrdersModule {}

