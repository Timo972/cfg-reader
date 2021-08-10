const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const { ALT_NODE_VERSION } = require("./alt-constants.cjs");

const TARGET_NAME = (alt) => `config${alt ? "_alt" : ""}.node`;

if (process.platform !== "linux" && process.platform !== "win32")
  throw new Error(
    `This platform (${process.platform}) does not support alt-node`
  );

const getBuildPath = (alt) =>
  path.join(__dirname, "..", "build", "Release", TARGET_NAME(alt));

const getOutPath = (alt) =>
  alt
    ? path.join(
        __dirname,
        "..",
        "compiled",
        ALT_NODE_VERSION,
        process.platform,
        process.arch
      )
    : path.join(__dirname, "..", "build", "Release");

const nodePath =
  process.platform === "linux"
    ? "./deps/alt-node"
    : path.join(__dirname, "..", "deps", "alt-node");

const rootPath = path.join(__dirname, "..");

const getBindingFile = (alt) =>
  path.join(__dirname, `binding-${alt ? "alt" : "napi"}.gyp`);

function copyBinding(alt = false) {
  fs.copyFileSync(getBindingFile(alt), path.join(rootPath, "binding.gyp"));
}

function buildAlgorithm(alt = false) {
  console.log(`Using ${alt ? "alt" : "napi"}-binding`);

  copyBinding(alt);

  const proc = spawn(
    alt
      ? `npx node-gyp rebuild --nodedir ${path.normalize(nodePath)}`
      : "npx node-gyp rebuild",
    {
      cwd: process.cwd(),
      shell: true,
    }
  );

  proc.on("error", console.error);

  proc.stdout.pipe(process.stdout);
  proc.stderr.pipe(process.stderr);
  process.stdin.pipe(proc.stdin);

  const outPath = getOutPath(alt);

  return new Promise((resolve, reject) => {
    proc.on("close", (code, signal) => {
      if (code === 0) {
        fs.mkdirSync(outPath, {
          recursive: true,
        });
        if (alt) {
          const bindingLoc = path.join(outPath, TARGET_NAME(alt));
          console.log(`Locating bindings: ${bindingLoc}`);
          fs.copyFileSync(getBuildPath(alt), bindingLoc);
        }
        resolve();
      } else {
        reject();
      }
    });
  });
}

// build(process.argv.indexOf("--alt") > -1);

exports.getBuildPath = getBuildPath;

exports.build = (config) =>
  function compile(cb) {
    buildAlgorithm(config).then(cb);
  };
