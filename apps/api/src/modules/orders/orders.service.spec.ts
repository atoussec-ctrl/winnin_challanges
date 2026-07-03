import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { InMemoryOrdersRepository } from "./orders.repository";
import { OrdersService } from "./orders.service";

function createService(): OrdersService {
  return new OrdersService(new InMemoryOrdersRepository());
}

describe("OrdersService", () => {
  it("creates users, products and orders", async () => {
    const service = createService();
    const user = service.createUser({
      email: "user@example.com",
      name: "User"
    });
    const product = service.createProduct({
      name: "Keyboard",
      price: 150,
      stock: 2
    });

    const order = await service.createOrder({
      items: [{ productId: product.id, quantity: 1 }],
      userId: user.id
    });

    expect(order.total).toBe(150);
    expect(order.items[0]?.product.stock).toBe(1);
    expect(service.listUsers()).toHaveLength(1);
    expect(service.listProducts()[0]?.stock).toBe(1);
  });

  it("lists orders globally and by user", async () => {
    const service = createService();
    const firstUser = service.createUser({ email: "first@example.com", name: "First" });
    const secondUser = service.createUser({ email: "second@example.com", name: "Second" });
    const product = service.createProduct({ name: "Keyboard", price: 100, stock: 5 });

    await service.createOrder({
      items: [{ productId: product.id, quantity: 1 }],
      userId: firstUser.id
    });
    await service.createOrder({
      items: [{ productId: product.id, quantity: 2 }],
      userId: secondUser.id
    });

    expect(service.listOrders()).toHaveLength(2);
    expect(service.listOrdersByUserId(firstUser.id)).toHaveLength(1);
    expect(service.listOrdersByUserId(secondUser.id)[0]?.total).toBe(200);
  });

  it("rejects users with invalid input", () => {
    const service = createService();

    expect(() => service.createUser({ email: "invalid", name: " " })).toThrow(BadRequestException);
    expect(() => service.createUser({ email: "invalid", name: " " })).toThrow(
      "User name is required. User email format is invalid."
    );
  });

  it("rejects duplicated emails ignoring case", () => {
    const service = createService();
    service.createUser({ email: "user@example.com", name: "User" });

    expect(() => service.createUser({ email: "USER@example.com", name: "Other" })).toThrow(
      ConflictException
    );
  });

  it("rejects products with invalid input", () => {
    const service = createService();

    expect(() => service.createProduct({ name: "", price: -1, stock: -2 })).toThrow(
      BadRequestException
    );
  });

  it("rejects orders for unknown users", async () => {
    const service = createService();

    await expect(
      service.createOrder({
        items: [{ productId: "product-1", quantity: 1 }],
        userId: "missing"
      })
    ).rejects.toThrow("User missing was not found.");
  });

  it("rejects orders with missing products and keeps product stock unchanged", async () => {
    const service = createService();
    const user = service.createUser({
      email: "user@example.com",
      name: "User"
    });

    await expect(
      service.createOrder({
        items: [{ productId: "missing", quantity: 1 }],
        userId: user.id
      })
    ).rejects.toThrow(NotFoundException);

    expect(service.listProducts()).toEqual([]);
  });

  it("serializes concurrent orders so stock is never oversold", async () => {
    const service = createService();
    const user = service.createUser({ email: "user@example.com", name: "User" });
    const product = service.createProduct({ name: "Keyboard", price: 100, stock: 1 });

    const results = await Promise.allSettled([
      service.createOrder({ items: [{ productId: product.id, quantity: 1 }], userId: user.id }),
      service.createOrder({ items: [{ productId: product.id, quantity: 1 }], userId: user.id })
    ]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);
    expect(service.listProducts()[0]?.stock).toBe(0);
    expect(service.listOrders()).toHaveLength(1);
  });

  it("rejects orders with out-of-bounds quantities before touching the domain", async () => {
    const service = createService();
    const user = service.createUser({ email: "user@example.com", name: "User" });

    await expect(
      service.createOrder({
        items: [{ productId: "product-1", quantity: 10_001 }],
        userId: user.id
      })
    ).rejects.toThrow(BadRequestException);
  });

  it("rejects orders with insufficient stock and rolls back state", async () => {
    const service = createService();
    const user = service.createUser({
      email: "user@example.com",
      name: "User"
    });
    const product = service.createProduct({
      name: "Keyboard",
      price: 150,
      stock: 1
    });

    await expect(
      service.createOrder({
        items: [{ productId: product.id, quantity: 2 }],
        userId: user.id
      })
    ).rejects.toThrow(ConflictException);

    expect(service.listProducts()[0]?.stock).toBe(1);
  });

  it("translates domain validation errors into bad requests", async () => {
    const service = createService();
    const user = service.createUser({
      email: "user@example.com",
      name: "User"
    });

    await expect(
      service.createOrder({
        items: [],
        userId: user.id
      })
    ).rejects.toThrow(BadRequestException);
  });

  it("rethrows unknown errors from the unit of work untouched", async () => {
    const repository = new InMemoryOrdersRepository();
    const service = new OrdersService(repository);
    const user = service.createUser({ email: "user@example.com", name: "User" });
    const failure = new Error("infrastructure exploded");
    repository.unitOfWork.execute = () => Promise.reject(failure);

    await expect(
      service.createOrder({
        items: [{ productId: "product-1", quantity: 1 }],
        userId: user.id
      })
    ).rejects.toBe(failure);
  });

  it("guards against missing users while mapping stored orders", () => {
    const service = createService();
    const mapOrder = (service as unknown as {
      toOrderModel(order: {
        createdAt: Date;
        id: string;
        items: readonly [];
        totalCents: number;
        userId: string;
      }): unknown;
    }).toOrderModel.bind(service);

    expect(() =>
      mapOrder({
        createdAt: new Date("2026-07-03T00:00:00.000Z"),
        id: "order-1",
        items: [],
        totalCents: 0,
        userId: "missing"
      })
    ).toThrow("User missing was not found.");
  });

  it("guards against missing products while mapping stored orders", () => {
    const service = createService();
    const user = service.createUser({
      email: "user@example.com",
      name: "User"
    });
    const mapOrder = (service as unknown as {
      toOrderModel(order: {
        createdAt: Date;
        id: string;
        items: readonly [
          {
            productId: string;
            quantity: number;
            subtotalCents: number;
            unitPriceCents: number;
          }
        ];
        totalCents: number;
        userId: string;
      }): unknown;
    }).toOrderModel.bind(service);

    expect(() =>
      mapOrder({
        createdAt: new Date("2026-07-03T00:00:00.000Z"),
        id: "order-1",
        items: [
          {
            productId: "missing",
            quantity: 1,
            subtotalCents: 15000,
            unitPriceCents: 15000
          }
        ],
        totalCents: 15000,
        userId: user.id
      })
    ).toThrow("Product missing was not found.");
  });
});
