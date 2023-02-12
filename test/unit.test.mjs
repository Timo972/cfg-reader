import { Config } from "../dist/index.mjs";
import { strict as assert } from "assert";
import fs from "fs";

const newConfigPath = "new-test.cfg";


after(() => {
  if (fs.existsSync(newConfigPath)) fs.unlinkSync(newConfigPath);
});

describe("New config", () => {
  describe("Set manual", () => {
    let config;
    it("Create config", () => {
      if (fs.existsSync(newConfigPath)) fs.unlinkSync(newConfigPath);
      config = new Config(newConfigPath);
      assert.strictEqual("get" in config, true, "Invalid config instance");
    });
    it("Set value", () => {
      const success = config.set("test", "Hello World!");
      //assert.strictEqual(success, true, "Error while setting key/value");
    });
    it("Save config", async () => {
      const success = await config.save();
      //assert.strictEqual(success, true, "Could not save changes to file");
    });
    it("Re-open config", () => {
      config = new Config(newConfigPath);
      assert.strictEqual("get" in config, true, "Invalid config instance");
    });
    it("Check", () => {
      const val = config.get("test");
      assert.strictEqual(val, "Hello World!", "Changes not applied");
    });
  });

  describe("Predefined values", () => {
    let config;
    it("Create config", () => {
      if (fs.existsSync(newConfigPath)) fs.unlinkSync(newConfigPath);
      config = new Config(newConfigPath, { test: true });
      assert.strictEqual("get" in config, true, "Invalid config instance");
    });
    it("Save config", async () => {
      const success = await config.save();
      //assert.strictEqual(success, true, "Could not save changes to file");
    });
    it("Re-open config", () => {
      config = new Config(newConfigPath);
      assert.strictEqual("get" in config, true, "Invalid config instance");
    });
    it("Check", () => {
      const val = config.get("test");
      assert.strictEqual(val, true, "Changes not appliedd");
    });
  });
});
