import type { Order } from "@desafio/domain";

export interface StoredUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly createdAt: Date;
}

export interface StoredProduct {
  readonly id: string;
  readonly name: string;
  readonly priceCents: number;
  readonly stock: number;
  readonly createdAt: Date;
}

// Portas consumidas pelo OrdersService (camada de aplicacao). Distintas das
// portas de dominio (ProductInventoryPort/OrderWriterPort em @desafio/domain),
// que descrevem o que o caso de uso precisa dentro de uma transacao; estas
// aqui descrevem o que o service precisa para CRUD/consulta fora dela.
export interface UsersRepositoryPort {
  saveUser(input: { readonly name: string; readonly email: string }): Promise<StoredUser>;
  findUserById(userId: string): Promise<StoredUser | undefined>;
  // PERF-01: uma unica chamada para varios ids, usada na hidratacao em lote
  // de OrderModel.user (ver OrdersService.toOrderModels) - evita 1 query por
  // pedido.
  findUsersByIds(userIds: readonly string[]): Promise<ReadonlyMap<string, StoredUser>>;
  hasUserWithEmail(email: string): Promise<boolean>;
  listUsers(): Promise<readonly StoredUser[]>;
}

export interface ProductsRepositoryPort {
  saveProduct(input: {
    readonly name: string;
    readonly priceCents: number;
    readonly stock: number;
  }): Promise<StoredProduct>;
  findProductById(productId: string): Promise<StoredProduct | undefined>;
  // PERF-01: mesma ideia de findUsersByIds, para OrderItemModel.product.
  findProductsByIds(productIds: readonly string[]): Promise<ReadonlyMap<string, StoredProduct>>;
  listProducts(): Promise<readonly StoredProduct[]>;
}

export interface OrdersRepositoryPort {
  listOrders(): Promise<readonly Order[]>;
  listOrdersByUserIds(
    userIds: readonly string[]
  ): Promise<ReadonlyMap<string, readonly Order[]>>;
}

export const USERS_REPOSITORY = Symbol("USERS_REPOSITORY");
export const PRODUCTS_REPOSITORY = Symbol("PRODUCTS_REPOSITORY");
export const ORDERS_REPOSITORY = Symbol("ORDERS_REPOSITORY");
export const ORDER_UNIT_OF_WORK = Symbol("ORDER_UNIT_OF_WORK");
