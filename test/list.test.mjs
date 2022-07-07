import { Config } from "../dist/index.mjs";
import { strict as assert } from "assert";
import fs from "fs";

const existingEmptyListKey = "mtList";
const existingEmptyListValue = `[]`;

const existingInlineListKey = "inlineList";
const existingInlineListValue = `[true, 'hello', 4]`;

const existingListKey = "myList";
const existingListValue = `[
    true, 
    'hello', 
    4
]`;

const fileName = "list-test.cfg";

before(() => {
  if (fs.existsSync(fileName)) fs.unlinkSync(fileName);

  fs.writeFileSync(
    fileName,
    `${existingEmptyListKey}:${existingEmptyListValue}\n${existingListKey}:${existingListValue}\n${existingInlineListKey}:${existingInlineListValue}\n`,
    {
      encoding: "utf8",
    }
  );
});

after(() => {
  if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
});

describe("Lists", () => {
  let config;

  it("Open file", async () => {
    config = await Config.load(fileName);
  });

  it("Get existing list", () => {
    const val = config.get(existingListKey);
    assert.deepStrictEqual(
      val,
      [true, "hello", 4],
      `Failed to parse list:\nexpected: ${JSON.stringify([
        true,
        "hello",
        4,
      ])}\ngot: ${JSON.stringify(val)}\ngot type: ${typeof val}`
    );
  });

  it("Get empty list", () => {
    const val = config.get(existingEmptyListKey);
    assert.deepStrictEqual(
      val,
      [],
      `Failed to parse list:\nexpected: ${JSON.stringify(
        []
      )}\ngot: ${JSON.stringify(val)}\ngot type: ${typeof val}`
    );
  });

  it("Get inline list", () => {
    const val = config.get(existingInlineListKey);
    assert.deepStrictEqual(
      val,
      [true, "hello", 4],
      `Failed to parse list:\nexpected: ${JSON.stringify([
        true,
        "hello",
        4,
      ])}\ngot: ${JSON.stringify(val)}\ngot type: ${typeof val}`
    );
  });

  it("Set list", () => {
    const success = config.set(existingListKey, [true, "hello", 5]);
    //assert.strictEqual(success, true, "Error while setting list");
  });

  it("Save list", async () => {
    const success = await config.save(fileName);
    //assert.strictEqual(success, true, "Could not save changes to file");
  });

  it("Re-open file", async () => {
    config = await Config.load(fileName);
  });

  it("Check serialization", () => {
    const updatedValue = config.get(existingListKey);
    assert.deepStrictEqual(
      updatedValue,
      [true, "hello", 5],
      "Changes not applied"
    );
  });
});
