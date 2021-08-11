const { series, src, parallel } = require("gulp");
const mocha = require("gulp-mocha");
const { getNode } = require("./scripts/get-node.cjs");
const { build } = require("./scripts/build.cjs");
const { clean } = require("./scripts/clean.cjs");
const { nodeGypBuild } = require("./scripts/node-gyp-build.cjs");

exports.clean = clean;
exports.nodeGypBuild = series(nodeGypBuild, clean);
exports.build = series(build(false), clean);
exports.buildAlt = series(getNode, build(true), clean);

const testUnit = () =>
  src("test/unit.test.mjs", { read: false }).pipe(
    mocha({
      reporter: "list",
    })
  );

const testPerformance = () =>
  src("test/performance.test.mjs", { read: false }).pipe(
    mocha({
      reporter: "list",
    })
  );

exports.test = testUnit;
exports.testPerformance = testPerformance;

exports.testAll = series(exports.build, parallel(testUnit, testPerformance));
