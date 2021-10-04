import { Config } from "../dist/index.mjs";
import { strict as assert } from "assert";
import fs from "fs";

class PerfTest {
  constructor() {
    this.begin = +new Date();
  }
  stop() {
    return +new Date() - this.begin;
  }
}

after(() => {
  if (fs.existsSync("perf.cfg")) fs.unlinkSync("perf.cfg");
});

describe("Performance tests", () => {
  let cfg;

  it("Creating config", () => {
    const test = new PerfTest();
    cfg = new Config("perf.cfg", true);
    assert.equal(test.stop() < 3, true, "Slow!");
  });

  it("Set string value", () => {
    const test = new PerfTest();
    cfg.set("test", "perf");
    assert.equal(test.stop() < 0.01, true, "Slow!");
  });

  it("Get unknown value", () => {
    const test = new PerfTest();
    cfg.get("test");
    assert.equal(test.stop() < 0.1, true, "Slow!");
  });

  it("Get string value", () => {
    const test = new PerfTest();
    cfg.getOfType("test");
    assert.equal(test.stop() < 0.01, true, "Slow!");
  });

  it("Save config", () => {
    const test = new PerfTest();
    cfg.save();
    const time = test.stop();
    assert.equal(time <= 3, true, `Slow! ${time}ms`);
  });
});
