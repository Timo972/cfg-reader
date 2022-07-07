import test from "ava";
import { isInt, isFloat } from "../src/parser";
import { Detail } from "../src/detail";

const values: Array<[string, boolean, boolean]> = [
  ["0.0.0.0", false, false],
  ["127.0.0.1", false, false],
  ["1.5", false, true],
  ["1", true, false],
];

const toEscape = [
  // [input, output]
  ["\n", "\\n"],
  ["\r", "\\r"],
];

const toUnescape = [
  // [input, output]
  ["\\n", "n"],
  ["\\r", "r"],
];

test("isInt", (t) => {
  for (const [str, int, float] of values) {
    const v = isInt(str);

    t.is(v, int);
  }
});

test("isFloat", (t) => {
  for (const [str, int, float] of values) {
    const v = isFloat(str);

    t.is(v, float);
  }
});

test("Detail::Escape", (t) => {
  for (const [input, output] of toEscape) {
    const escaped = Detail.Escape(input);

    t.is(escaped, output);
  }
});

test("Detail::Unescape", (t) => {
  for (const [input, output] of toUnescape) {
    const unescaped = Detail.Unescape(input);

    t.is(unescaped, output);
  }
});
