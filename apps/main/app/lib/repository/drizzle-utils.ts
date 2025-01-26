export function takeUniqueOrThrow<T>(values: T[]): T {
  if (values.length !== 1) {
    throw new Error('Found non-unique value');
  }
  return values[0];
}
