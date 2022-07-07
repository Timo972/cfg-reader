import test from "ava";
import { parse, serialize } from "../src";
import { Dict } from "../src/parser";

const serialized =
`test: true
bool: true
string: string
number: 1
float: 3.3
array: [
  1
  true
  2.5
  false
]
nested: {
  x: false
  y: {
    ip: 0.0.0.0
    localhost: 127.0.0.1
  }
}
`
const fileContent = `
test: true
bool: yes
string: 'string'
number: 1
float: 3.3
array: [
  1
  yes
  2.5
  false
]
nested: {
  x: no
  y: {
    ip: '0.0.0.0',
    localhost: 127.0.0.1
  }
}
`;
const config: Dict = {
  test: true,
  bool: true,
  string: "string",
  number: 1,
  float: 3.3,
  array: [1, true, 2.5, false],
  nested: {
    x: false,
    y: {
      ip: "0.0.0.0",
      localhost: "127.0.0.1",
    },
  },
};

test("serialize", (t) => {
  const content = serialize(config, false, false);
  t.deepEqual(content, serialized);
});

test("parse", (t) => {
  const aconfig = parse(fileContent);
  // t.is(aconfig, config);
  t.deepEqual(aconfig, config);
});
