const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const rimraf = require("rimraf");
const { getBuildPath } = require("./build.cjs");

const rootPath = path.join(__dirname, "..");

async function deleteNode(deleteAltBuild) {
  if (deleteAltBuild) {
    const altBuildPath = getBuildPath(true);
    await promisify(rimraf)(altBuildPath).catch(
      (err) => err && console.error
    );
  }
}

async function deleteBinding() {
  const bindingPath = path.join(rootPath, "binding.gyp");
  if (fs.existsSync(bindingPath)) await promisify(fs.unlink)(bindingPath);
}

function detectAltBuild() {
  const altBuildPath = getBuildPath(true)
  return fs.existsSync(altBuildPath)
}

exports.clean = async function clean() {
  const isAltBuild = detectAltBuild()
  await deleteNode(isAltBuild);
  await deleteBinding();
};
