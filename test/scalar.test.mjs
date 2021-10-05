import { Config } from "../dist/index.mjs";
import { strict as assert } from "assert";
import fs from "fs";

const existingKey = "test";
const existingValue = "testval";

const intKey = "myInt";
const intValue = 7;

const boolKey = "myBool";
const boolValue = true;

const newKey = "nkey";
const newVal = "imNew";

const overwriteVal = "overwrittenVal";

const fileName = "scalar-test.cfg";

before(() => {
  if (fs.existsSync(fileName)) fs.unlinkSync(fileName);

  fs.writeFileSync(
    fileName,
    `${existingKey}:'${existingValue}'\n${intKey}:${intValue}\n${boolKey}:${boolValue}`,
    {
      encoding: "utf8",
    }
  );
});

after(() => {
  if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
});

describe("Integers, Booleans, Strings", () => {
  let config;

  it("Open file", () => {
    config = new Config(fileName);
  });

  it("Get string", () => {
    const val = config.get(existingKey);
    assert.strictEqual(
      val,
      existingValue,
      `Wrong value returned:\nexpected type: ${typeof existingValue}\ngot type: ${typeof val}\nexpected value: ${existingValue}\ngot value: ${val}`
    );
  });

  it("Get boolean", () => {
    const val = config.get(boolKey);
    assert.strictEqual(val, boolValue, `expected: ${boolValue}, got: ${val}`);
  });

  it("Get integer", () => {
    const val = config.get(intKey);
    assert.strictEqual(val, intValue, `expected: ${intValue}, got: ${val}`);
  });

  it("Set new value", () => {
    const success = config.set(newKey, newVal);
    //assert.strictEqual(success, true, "Error while setting key/value");
  });

  it("Check new value", () => {
    const val = config.get(newKey);
    assert.strictEqual(val, newVal, `expected: ${newVal}, got: ${val}`);
  });

  it("Overwrite existing value", () => {
    const success = config.set(existingKey, overwriteVal);
    //assert.strictEqual(
    //  success,
    //  true,
    //  "Error while overwriting an existing key/value"
    //);
  });

  it("Check overwritten value", () => {
    const val = config.get(existingKey);
    assert.strictEqual(
      val,
      overwriteVal,
      `expected: ${overwriteVal}, got: ${val}`
    );
  });

  it("Save changes to file", async () => {
    const success = await config.save();
    //assert.strictEqual(success, true, "Could not save changes to file");
  });

  it("Check Emitter", () => {
    const updatedConfig = new Config(fileName);
    const updatedValue = updatedConfig.get(existingKey);
    assert.strictEqual(
      updatedValue,
      overwriteVal,
      `expected: ${overwriteVal}, got: ${updatedValue}`
    );
  });
});