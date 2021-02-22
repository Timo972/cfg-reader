const { Config, Type } = require('../index.cjs');
const assert = require('assert').strict;
const fs = require('fs');

const existingKey = "test";
const existingValue = "testval";

const newKey = "nkey";
const newVal = "imNew";

const overwriteVal = "overwrittenVal";

const fileName = "test.cfg";

before(() => {
    if (fs.existsSync(fileName))
        fs.unlinkSync(fileName);

    fs.writeFileSync(fileName, `${existingKey}:${existingValue}`, {
        encoding: 'utf8'
    });
});

after(() => {
    if (fs.existsSync(fileName))
        fs.unlinkSync(fileName);
});

describe("Working with existing config file", () => {

    let config;

    it("Open file", () => {
        config = new Config(fileName);
        //assert.equal("Get" in Config, true, "Invalid config instance");
    });

    it("Get already existing value", () => {
        const val = config.Get(existingKey);
        assert.strictEqual(val, existingValue, `Wrong value returned:\nexpected type: ${typeof(existingValue)}\ngot type: ${typeof(val)}\nexpected value: ${existingValue}\ngot value: ${val}`);
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