/**
 * maps each object value to a new value and returns the new object.
 * the object keys are assumed to be numbers.
 *
 * @param obj the original object, with numeric keys
 * @param fn the function to apply to each value
 * @returns the new object, with the same keys but mapped values
 */
export function mapValues<V, W>(
  obj: { [key: number]: V },
  fn: (key: number, value: V) => W
): { [key: number]: W } {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, fn(k as any as number, v)])
  );
}
