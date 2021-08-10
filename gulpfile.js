const { series } = require('gulp');
const { getNode } = require('./scripts/get-node.cjs');
const { build } = require('./scripts/build.cjs');
const { clean } = require('./scripts/clean.cjs');

exports.clean = clean;
exports.build = series(build(false), clean);
exports.buildAlt = series(getNode, build(true), clean);