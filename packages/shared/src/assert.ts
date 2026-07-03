export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${String(value)}`);
}

export function invariant(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

