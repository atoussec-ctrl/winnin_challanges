import { describe, expect, it } from "vitest";
import {
  validateCreateOrderInput,
  validateCreateProductInput,
  validateCreateUserInput
} from "./orders.validation";

describe("validateCreateUserInput", () => {
  it("accepts valid input", () => {
    expect(validateCreateUserInput({ email: "user@example.com", name: "User" })).toEqual([]);
  });

  it("rejects blank names and malformed emails", () => {
    expect(validateCreateUserInput({ email: "not-an-email", name: "  " })).toEqual([
      "User name is required.",
      "User email format is invalid."
    ]);
  });
});

describe("validateCreateProductInput", () => {
  it("accepts valid input including zero stock", () => {
    expect(validateCreateProductInput({ name: "Keyboard", price: 150, stock: 0 })).toEqual([]);
  });

  it("rejects blank names, non-positive prices and negative stock", () => {
    expect(validateCreateProductInput({ name: "", price: 0, stock: -1 })).toEqual([
      "Product name is required.",
      "Product price must be greater than zero and at most 1000000000.",
      "Product stock must be an integer between zero and 1000000."
    ]);
  });

  it("rejects non-finite prices and fractional stock", () => {
    expect(validateCreateProductInput({ name: "Mouse", price: Number.NaN, stock: 1.5 })).toEqual([
      "Product price must be greater than zero and at most 1000000000.",
      "Product stock must be an integer between zero and 1000000."
    ]);
  });

  it("rejects prices and stock above the safety bounds", () => {
    expect(validateCreateProductInput({ name: "Mouse", price: 1e307, stock: 2_000_000 })).toEqual([
      "Product price must be greater than zero and at most 1000000000.",
      "Product stock must be an integer between zero and 1000000."
    ]);
  });
});

describe("validateCreateOrderInput", () => {
  it("accepts a valid order", () => {
    expect(
      validateCreateOrderInput({
        items: [{ productId: "product-1", quantity: 2 }],
        userId: "user-1"
      })
    ).toEqual([]);
  });

  it("rejects empty or oversized item lists", () => {
    expect(validateCreateOrderInput({ items: [], userId: "user-1" })).toEqual([
      "Order must contain between 1 and 100 items."
    ]);

    const tooManyItems = Array.from({ length: 101 }, (_, index) => ({
      productId: `product-${index}`,
      quantity: 1
    }));
    expect(validateCreateOrderInput({ items: tooManyItems, userId: "user-1" })).toEqual([
      "Order must contain between 1 and 100 items."
    ]);
  });

  it("rejects non-integer or out-of-bounds quantities", () => {
    expect(
      validateCreateOrderInput({
        items: [
          { productId: "product-1", quantity: 0 },
          { productId: "product-2", quantity: 10_001 }
        ],
        userId: "user-1"
      })
    ).toEqual(["Item quantity must be an integer between 1 and 10000."]);
  });
});
