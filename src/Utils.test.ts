import { mapValues, dropNull, median } from "./Utils";

describe("mapValues()", () => {
  it("passes numeric values", () => {
    const obj = { 1: 10, 2: 20, 3: 30 };
    const result = { 1: 100, 2: 200, 3: 300 };

    expect(mapValues(obj, (key, val) => val * 10)).toEqual(result);
  });

  it("passes numeric keys", () => {
    const obj = { 1: 10, 2: 20, 3: 30 };
    const result = { 1: 2, 2: 3, 3: 4 };

    expect(mapValues(obj, (key, val) => key + 1)).toEqual(result);
  });
});

describe("dropNull()", () => {
  it("drops null", () => {
    const obj = [null, 1, null, 2, null, 3];
    const result = [1, 2, 3];

    expect(dropNull(obj)).toEqual(result);
  });

  it("does not drop undefined", () => {
    const obj = [undefined, 1, undefined, 2, undefined, 3];
    const result = [undefined, 1, undefined, 2, undefined, 3];

    expect(dropNull(obj)).toEqual(result);
  });

  it("does not drop zero", () => {
    const obj = [0, 1, 0, 2, 0, 3];
    const result = [0, 1, 0, 2, 0, 3];

    expect(dropNull(obj)).toEqual(result);
  });

  it("does not drop false", () => {
    const obj = [false, 1, false, 2, false, 3];
    const result = [false, 1, false, 2, false, 3];

    expect(dropNull(obj)).toEqual(result);
  });
});

describe("median()", () => {
  it("works on odd-length arrays", () => {
    expect(median([2, 1, 3])).toBe(2);
  });

  it("works on even-length arrays", () => {
    expect(median([4, 2, 1, 3])).toBe((2 + 3) / 2.0);
  });

  it("throws on empty arrays", () => {
    expect(() => median([])).toThrow();
  });
});
