import { strict as assert } from "assert";
import { Config } from "../dist/index.mjs";

class TestConfig extends Config {
  testIsInt(str) {
    return this.isInt(str);
  }
  testIsFloat(str) {
    return this.isFloat(str);
  }
}

const instance = new TestConfig("");
const values = [
  ["0.0.0.0", false, false],
  ["127.0.0.1", false, false],
  ["1.5", false, true],
  ["1", true, false],
];

describe("Config::Config", () => {
  it("Config::isInt", () => {
    for (const [str, isInt, isFloat] of values) {
      const v = instance.testIsInt(str);

      assert.strictEqual(v, isInt);
    }
  });

  it("Config::isFloat", () => {
    for (const [str, isInt, isFloat] of values) {
      const v = instance.testIsFloat(str);

      assert.strictEqual(v, isFloat);
    }
  });
});
