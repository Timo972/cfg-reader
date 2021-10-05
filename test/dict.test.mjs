import { Config } from "../dist/index.mjs";
import { strict as assert } from "assert";
import fs from "fs";

const existingDictKey = "myDict";
const existingDictValue = "test: 3";

const existingEmptyDictKey = "mtDict";
const existingEmptyDictValue = "{}";

const existingInlineDictKey = "inlineDict";
const existingInlineDictValue = "{inline:true}";

const fileName = "dict-test.cfg";

before(() => {
  if (fs.existsSync(fileName)) fs.unlinkSync(fileName);

  fs.writeFileSync(
    fileName,
    `${existingDictKey}: {\n${existingDictValue}\n}\n${existingEmptyDictKey}:${existingEmptyDictValue}\n${existingInlineDictKey}:${existingInlineDictValue}\n`,
    {
      encoding: "utf8",
    }
  );
});

after(() => {
  if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
});

describe("Dicts", () => {
  let config;

  it("Open file", () => {
    config = new Config(fileName);
  });

  it("Get existing dict", () => {
    //console.log(fs.readFileSync(fileName, 'utf8'));
    const val = config.get(existingDictKey);
    assert.deepStrictEqual(
      val,
      { test: 3 },
      `Failed to parse dict:\nexpected: ${JSON.stringify({
        test: true,
      })}\ngot: ${JSON.stringify(val)}`
    );
  });

  it("Get empty dict", () => {
    //console.log(fs.readFileSync(fileName, 'utf8'));
    const val = config.get(existingEmptyDictKey);
    assert.deepStrictEqual(
      val,
      {},
      `Failed to parse dict:\nexpected: ${JSON.stringify(
        {}
      )}\ngot: ${JSON.stringify(val)}`
    );
  });

  xit("Get inline dict", () => {
    //console.log(fs.readFileSync(fileName, 'utf8'));
    const val = config.get(existingInlineDictKey);
    assert.deepStrictEqual(
      val,
      { inline: true },
      `Failed to parse dict:\nexpected: ${JSON.stringify({
        test: true,
      })}\ngot: ${JSON.stringify(val)}`
    );
  });

  it("Set dict", () => {
    const success = config.set(existingDictKey, { overwritten: true });
    //assert.strictEqual(success, true, "Error while setting dict");
  });

  it("Save dict", async () => {
    const success = await config.save();
    //assert.strictEqual(success, true, "Could not save changes to file");
  });

  it("Re-open file", () => {
    config = new Config(fileName);
  });

  it("Check serialization", () => {
    const updatedValue = config.get(existingDictKey);
    assert.deepStrictEqual(
      updatedValue,
      { overwritten: true },
      "Changes not applied"
    );
  });
});
