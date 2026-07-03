import type { CreateOrderInput, CreateProductInput, CreateUserInput } from "./order.models";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PRICE = 1_000_000_000;
const MAX_STOCK = 1_000_000;
const MAX_ORDER_ITEMS = 100;
const MAX_ITEM_QUANTITY = 10_000;

export function validateCreateUserInput(input: CreateUserInput): readonly string[] {
  const errors: string[] = [];

  if (input.name.trim().length === 0) {
    errors.push("User name is required.");
  }

  if (!EMAIL_PATTERN.test(input.email.trim())) {
    errors.push("User email format is invalid.");
  }

  return errors;
}

export function validateCreateProductInput(input: CreateProductInput): readonly string[] {
  const errors: string[] = [];

  if (input.name.trim().length === 0) {
    errors.push("Product name is required.");
  }

  if (!Number.isFinite(input.price) || input.price <= 0 || input.price > MAX_PRICE) {
    errors.push(`Product price must be greater than zero and at most ${MAX_PRICE}.`);
  }

  if (!Number.isInteger(input.stock) || input.stock < 0 || input.stock > MAX_STOCK) {
    errors.push(`Product stock must be an integer between zero and ${MAX_STOCK}.`);
  }

  return errors;
}

export function validateCreateOrderInput(input: CreateOrderInput): readonly string[] {
  const errors: string[] = [];

  if (input.items.length === 0 || input.items.length > MAX_ORDER_ITEMS) {
    errors.push(`Order must contain between 1 and ${MAX_ORDER_ITEMS} items.`);
  }

  if (
    input.items.some(
      (item) => !Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > MAX_ITEM_QUANTITY
    )
  ) {
    errors.push(`Item quantity must be an integer between 1 and ${MAX_ITEM_QUANTITY}.`);
  }

  return errors;
}
