import { Field, Float, ID, InputType, Int, ObjectType } from "@nestjs/graphql";

@ObjectType("User")
export class UserModel {
  @Field(() => ID)
  public id!: string;

  @Field()
  public name!: string;

  @Field()
  public email!: string;

  @Field()
  public createdAt!: Date;
}

@ObjectType("Product")
export class ProductModel {
  @Field(() => ID)
  public id!: string;

  @Field()
  public name!: string;

  @Field(() => Float)
  public price!: number;

  @Field(() => Int)
  public stock!: number;

  @Field()
  public createdAt!: Date;
}

@ObjectType("OrderItem")
export class OrderItemModel {
  @Field(() => ProductModel)
  public product!: ProductModel;

  @Field(() => Int)
  public quantity!: number;

  @Field(() => Float)
  public price!: number;
}

@ObjectType("Order")
export class OrderModel {
  @Field(() => ID)
  public id!: string;

  @Field(() => UserModel)
  public user!: UserModel;

  @Field(() => [OrderItemModel])
  public items!: OrderItemModel[];

  @Field(() => Float)
  public total!: number;

  @Field()
  public createdAt!: Date;
}

@InputType()
export class CreateUserInput {
  @Field()
  public name!: string;

  @Field()
  public email!: string;
}

@InputType()
export class CreateProductInput {
  @Field()
  public name!: string;

  @Field(() => Float)
  public price!: number;

  @Field(() => Int)
  public stock!: number;
}

@InputType()
export class CreateOrderItemInput {
  @Field(() => ID)
  public productId!: string;

  @Field(() => Int)
  public quantity!: number;
}

@InputType()
export class CreateOrderInput {
  @Field(() => ID)
  public userId!: string;

  @Field(() => [CreateOrderItemInput])
  public items!: CreateOrderItemInput[];
}

