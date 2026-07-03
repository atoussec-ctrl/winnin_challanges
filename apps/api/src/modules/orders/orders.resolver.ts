import { Args, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import {
  CreateOrderInput,
  CreateProductInput,
  CreateUserInput,
  OrderModel,
  ProductModel,
  UserModel
} from "./order.models";
import { OrdersService } from "./orders.service";

@Resolver(() => UserModel)
export class OrdersResolver {
  public constructor(private readonly ordersService: OrdersService) {}

  @Query(() => [UserModel])
  public users(): UserModel[] {
    return this.ordersService.listUsers();
  }

  @Query(() => [ProductModel])
  public products(): ProductModel[] {
    return this.ordersService.listProducts();
  }

  @Query(() => [OrderModel])
  public orders(): OrderModel[] {
    return this.ordersService.listOrders();
  }

  @ResolveField("orders", () => [OrderModel])
  public userOrders(@Parent() user: UserModel): OrderModel[] {
    return this.ordersService.listOrdersByUserId(user.id);
  }

  @Mutation(() => UserModel)
  public createUser(@Args("input") input: CreateUserInput): UserModel {
    return this.ordersService.createUser(input);
  }

  @Mutation(() => ProductModel)
  public createProduct(@Args("input") input: CreateProductInput): ProductModel {
    return this.ordersService.createProduct(input);
  }

  @Mutation(() => OrderModel)
  public createOrder(@Args("input") input: CreateOrderInput): Promise<OrderModel> {
    return this.ordersService.createOrder(input);
  }
}
