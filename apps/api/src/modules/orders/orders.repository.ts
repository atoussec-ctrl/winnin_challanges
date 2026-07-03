import { Injectable } from "@nestjs/common";
import type {
  Order,
  OrderTransactionContext,
  OrderUnitOfWorkPort,
  ProductSnapshot,
  StockDebit
} from "@desafio/domain";

export interface StoredProduct {
  readonly id: string;
  readonly name: string;
  readonly priceCents: number;
  readonly stock: number;
  readonly createdAt: Date;
}

export interface StoredUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly createdAt: Date;
}

class InMemoryOrderUnitOfWork implements OrderUnitOfWorkPort {
  private orderSequence = 1;
  private queue: Promise<unknown> = Promise.resolve();

  public constructor(
    private readonly products: Map<string, StoredProduct>,
    private readonly orders: Map<string, Order>
  ) {}

  public execute<T>(work: (context: OrderTransactionContext) => Promise<T>): Promise<T> {
    const run = this.queue.then(() => this.runExclusive(work));
    this.queue = run.catch(() => undefined);
    return run;
  }

  private async runExclusive<T>(
    work: (context: OrderTransactionContext) => Promise<T>
  ): Promise<T> {
    const productBackup = new Map(
      [...this.products.entries()].map(([id, product]) => [id, { ...product }])
    );
    const orderBackup = new Map([...this.orders.entries()].map(([id, order]) => [id, order]));

    const context: OrderTransactionContext = {
      inventory: {
        decrementStock: (items: readonly StockDebit[]) => {
          for (const item of items) {
            const product = this.products.get(item.productId);

            if (product) {
              this.products.set(product.id, {
                ...product,
                stock: product.stock - item.quantity
              });
            }
          }

          return Promise.resolve();
        },
        findProductsForUpdate: (productIds: readonly string[]): Promise<readonly ProductSnapshot[]> =>
          Promise.resolve(productIds.flatMap((productId) => {
            const product = this.products.get(productId);

            return product
              ? [
                  {
                    id: product.id,
                    name: product.name,
                    priceCents: product.priceCents,
                    stock: product.stock
                  }
                ]
              : [];
          }))
      },
      orders: {
        nextOrderId: () => `order-${this.orderSequence++}`,
        save: (order: Order) => {
          this.orders.set(order.id, order);
          return Promise.resolve();
        }
      }
    };

    try {
      return await work(context);
    } catch (error) {
      this.products.clear();
      productBackup.forEach((product, id) => this.products.set(id, product));
      this.orders.clear();
      orderBackup.forEach((order, id) => this.orders.set(id, order));
      throw error;
    }
  }
}

@Injectable()
export class InMemoryOrdersRepository {
  private readonly users = new Map<string, StoredUser>();
  private readonly products = new Map<string, StoredProduct>();
  private readonly orders = new Map<string, Order>();
  private userSequence = 1;
  private productSequence = 1;
  public readonly unitOfWork: OrderUnitOfWorkPort = new InMemoryOrderUnitOfWork(
    this.products,
    this.orders
  );

  public saveUser(input: { readonly name: string; readonly email: string }): StoredUser {
    const user: StoredUser = {
      createdAt: new Date(),
      email: input.email,
      id: `user-${this.userSequence++}`,
      name: input.name
    };

    this.users.set(user.id, user);
    return user;
  }

  public findUserById(userId: string): StoredUser | undefined {
    return this.users.get(userId);
  }

  public hasUserWithEmail(email: string): boolean {
    const normalized = email.trim().toLowerCase();
    return [...this.users.values()].some((user) => user.email.toLowerCase() === normalized);
  }

  public listUsers(): readonly StoredUser[] {
    return [...this.users.values()];
  }

  public saveProduct(input: {
    readonly name: string;
    readonly priceCents: number;
    readonly stock: number;
  }): StoredProduct {
    const product: StoredProduct = {
      createdAt: new Date(),
      id: `product-${this.productSequence++}`,
      name: input.name,
      priceCents: input.priceCents,
      stock: input.stock
    };

    this.products.set(product.id, product);
    return product;
  }

  public findProductById(productId: string): StoredProduct | undefined {
    return this.products.get(productId);
  }

  public listProducts(): readonly StoredProduct[] {
    return [...this.products.values()];
  }

  public listOrders(): readonly Order[] {
    return [...this.orders.values()];
  }

  public listOrdersByUserId(userId: string): readonly Order[] {
    return [...this.orders.values()].filter((order) => order.userId === userId);
  }
}
