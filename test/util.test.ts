import { strict as assert } from "assert";
import { isInt, isFloat } from "../src/parser";

const values: Array<[string, boolean, boolean]> = [
  ["0.0.0.0", false, false],
  ["127.0.0.1", false, false],
  ["1.5", false, true],
  ["1", true, false],
];

describe("Utilities", () => {
  it("isInt", () => {
    for (const [str, int, float] of values) {
      const v = isInt(str);

      assert.strictEqual(v, int);
    }
  });

  it("isFloat", () => {
    for (const [str, int, float] of values) {
      const v = isFloat(str);

      assert.strictEqual(v, float);
    }
  });
});
