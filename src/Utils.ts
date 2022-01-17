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

/**
 * computes the median of a list of numbers
 *
 * @param values list of numbers
 * @returns the middle value for uneven sizes, and
 * the average of the two middle values for even sizes
 */
export function median(values: number[]): number {
  if (values.length === 0) throw new Error("can not compute median of empty array");

  const items = [...values].sort((a, b) => a - b);
  var half = Math.floor(items.length / 2);

  if (items.length % 2) return items[half];
  return (items[half - 1] + items[half]) / 2.0;
}
