import { Config, Type } from '../index.mjs';
import { strict as assert } from "assert";
import fs from 'fs';

const existingKey = "test";
const existingValue = "testval";

const existingDictKey = "myDict";
const existingDictValue = "test: 3";

const existingListKey = "myList";
const existingListValue = "[true, 'hello', 4]";

const newKey = "nkey";
const newVal = "imNew";

const overwriteVal = "overwrittenVal";

const fileName = "test.cfg";

before(() => {
    if (fs.existsSync(fileName))
        fs.unlinkSync(fileName);

    fs.writeFileSync(fileName, `${existingKey}:${existingValue}\n${existingDictKey}: {${existingDictValue}}\n${existingListKey}:${existingListValue}`, {
        encoding: 'utf8'
    });
});

after(() => {
    if (fs.existsSync(fileName))
        fs.unlinkSync(fileName);
});

describe("Working with existing config file in es6", () => {

    let config;

    it("Open file", () => {
        config = new Config(fileName);
        //assert.equal("Get" in Config, true, "Invalid config instance");
    });

    it("Get already existing value", () => {
        const val = config.Get(existingKey);
        assert.strictEqual(val, existingValue, `Wrong value returned:\nexpected type: ${typeof(existingValue)}\ngot type: ${typeof(val)}\nexpected value: ${existingValue}\ngot value: ${val}`);
    });

    it("Get existing dict", () => {
        //console.log(fs.readFileSync(fileName, 'utf8'));
        const val = config.Get(existingDictKey);
        assert.deepStrictEqual(val, { test: 3 }, `Failed to parse dict:\nexpected: ${JSON.stringify({ test: true })}\ngot: ${JSON.stringify(val)}`);
    });

    it("Get existing list", () => {
        const val = config.Get(existingListKey);
        assert.deepStrictEqual(val, [true,'hello',4], `Failed to parse list:\nexpected: ${JSON.stringify([true,'hello',4])}\ngot: ${JSON.stringify(val)}\ngot type: ${typeof(val)}`);
    });

    it("Set new value", () => {
        const success = config.Set(newKey, newVal);
        assert.strictEqual(success, true, "Error while setting key/value");
    });

    it("Check if new value got setted", () => {
        const val = config.Get(newKey);
        assert.strictEqual(val, newVal, "Failed to set new value");
    });

    it("Overwrite an existing value", () => {
        const success = config.Set(existingKey, overwriteVal);
        assert.strictEqual(success, true, "Error while overwriting an existing key/value");
    });

    it("Check if overwritten value got updated", () => {
        const val = config.Get(existingKey);
        assert.strictEqual(val, overwriteVal, "Failed to overwrite value");
    });

    it("Save changes to file", () => {
        const success = config.Save();
        assert.strictEqual(success, true, "Could not save changes to file");
    });

});