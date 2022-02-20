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
    Object.entries(obj).map(([k, v]) => [k, fn(parseInt(k), v)])
  );
}

/**
 * removes null elements from array
 *
 * @param obj the array to filter on
 * @returns an array with null elements removed
 */
export function dropNull<T>(obj: (T | null)[]): T[] {
  return obj.filter((x): x is T => x !== null);
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

/**
 * computes the ranks for each element, assuming a sorted list of numbers.
 * ranks start at 1, consecutive elements are assigned the same rank.
 *
 * @param values an array of values
 * @param opts.key optional mapper to extract the value to rank from each element
 * @param opts.nogaps if true, ranks, following a consecutive rank, won't skip ranks,
 * i.e. ranks will be [1, 2, 2, 3] and not [1, 2, 2, 4]
 */
export function rankIndexes<T>(
  values: T[],
  opts?: { key?: (element: T) => any; nogaps?: boolean }
): [number, T][] {
  const result: [number, T][] = [];
  const nogaps = opts?.nogaps ?? false;
  const key = opts?.key ?? ((x) => x);

  let metricPre = null;
  let [index, rank] = [0, 0];

  for (const element of values) {
    const metric = key(element);
    const exaequo = metricPre !== null && metricPre === metric;
    metricPre = metric;

    // ranks only on non-consecutive values
    if (!exaequo) rank++;
    index++;
    const i = exaequo ? rank : nogaps ? rank : index;

    result.push([i, element]);
  }

  return result;
}
