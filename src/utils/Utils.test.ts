import { mapValues, dropNull, median, rankIndexes } from "./Utils";

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

describe("rankIndexes()", () => {
  it("ranks numeric values", () => {
    const obj = [10, 20, 30];
    const result = [
      [1, 10],
      [2, 20],
      [3, 30],
    ];

    expect(rankIndexes(obj)).toEqual(result);
  });

  it("ranks numeric values [ex aequo]", () => {
    const obj = [10, 10, 30, 40];
    const result = [
      [1, 10],
      [1, 10],
      [3, 30],
      [4, 40],
    ];

    expect(rankIndexes(obj)).toEqual(result);
  });

  it("ranks numeric values [ex aequo, consecutive]", () => {
    const obj = [10, 10, 20, 20, 30];
    const result = [
      [1, 10],
      [1, 10],
      [3, 20],
      [3, 20],
      [5, 30],
    ];

    expect(rankIndexes(obj)).toEqual(result);
  });

  it("ranks numeric values [ex aequo, mixed]", () => {
    const obj = [10, 20, 20, 20, 30, 40, 40, 50, 60];
    const result = [
      [1, 10],
      [2, 20],
      [2, 20],
      [2, 20],
      [5, 30],
      [6, 40],
      [6, 40],
      [8, 50],
      [9, 60],
    ];

    expect(rankIndexes(obj)).toEqual(result);
  });

  it("ranks numeric values [ex aequo, no gaps]", () => {
    const obj = [10, 10, 30, 40];
    const result = [
      [1, 10],
      [1, 10],
      [2, 30],
      [3, 40],
    ];

    expect(rankIndexes(obj, { nogaps: true })).toEqual(result);
  });

  it("ranks numeric values [ex aequo, consecutive, no gaps]", () => {
    const obj = [10, 10, 20, 20, 30];
    const result = [
      [1, 10],
      [1, 10],
      [2, 20],
      [2, 20],
      [3, 30],
    ];

    expect(rankIndexes(obj, { nogaps: true })).toEqual(result);
  });

  it("ranks numeric values [ex aequo, mixed, no gaps]", () => {
    const obj = [10, 20, 20, 20, 30, 40, 40, 50, 60];
    const result = [
      [1, 10],
      [2, 20],
      [2, 20],
      [2, 20],
      [3, 30],
      [4, 40],
      [4, 40],
      [5, 50],
      [6, 60],
    ];

    expect(rankIndexes(obj, { nogaps: true })).toEqual(result);
  });

  it("ranks string values", () => {
    const obj = ["a", "b", "c"];
    const result = [
      [1, "a"],
      [2, "b"],
      [3, "c"],
    ];

    expect(rankIndexes(obj)).toEqual(result);
  });

  it("ranks string values [ex aequo]", () => {
    const obj = ["a", "a", "c", "d"];
    const result = [
      [1, "a"],
      [1, "a"],
      [3, "c"],
      [4, "d"],
    ];

    expect(rankIndexes(obj)).toEqual(result);
  });

  it("ranks object values with key mapper", () => {
    const obj = [
      { a: 10, b: "u" },
      { a: 20, b: "v" },
      { a: 30, b: "w" },
    ];
    const result = [
      [1, { a: 10, b: "u" }],
      [2, { a: 20, b: "v" }],
      [3, { a: 30, b: "w" }],
    ];

    expect(rankIndexes(obj, { key: (e) => e.a })).toEqual(result);
  });

  it("ranks object values with key mapper [ex aequo]", () => {
    const obj = [
      { a: 10, b: "u" },
      { a: 10, b: "v" },
      { a: 30, b: "w" },
      { a: 40, b: "x" },
    ];
    const result = [
      [1, { a: 10, b: "u" }],
      [1, { a: 10, b: "v" }],
      [3, { a: 30, b: "w" }],
      [4, { a: 40, b: "x" }],
    ];

    expect(rankIndexes(obj, { key: (e) => e.a })).toEqual(result);
  });

  it("ranks object values with key mapper [ex aequo, no gaps]", () => {
    const obj = [
      { a: 10, b: "u" },
      { a: 10, b: "v" },
      { a: 30, b: "w" },
      { a: 40, b: "x" },
    ];
    const result = [
      [1, { a: 10, b: "u" }],
      [1, { a: 10, b: "v" }],
      [2, { a: 30, b: "w" }],
      [3, { a: 40, b: "x" }],
    ];

    expect(rankIndexes(obj, { key: (e) => e.a, nogaps: true })).toEqual(result);
  });
});
