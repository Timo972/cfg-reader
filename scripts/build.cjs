const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const TARGET_NAME = "config_alt.node";
const NODE_VERSION = "14.15.2";

if (process.platform !== "linux" && process.platform !== "win32")
  throw new Error(
    `This platform (${process.platform}) does not support alt-node`
  );

const buildPath = path.join(__dirname, "..", "build", "Release", TARGET_NAME);
const nodePath =
  process.platform === "linux"
    ? "./deps/alt-node"
    : path.join(__dirname, "..", "deps", "alt-node");

const proc = spawn(
  `npx node-gyp rebuild --nodedir ${path.normalize(nodePath)}`,
  {
    cwd: process.cwd(),
    shell: true,
  }
);

proc.on("error", console.error);

proc.stdout.pipe(process.stdout);
proc.stderr.pipe(process.stderr);
process.stdin.pipe(proc.stdin);

const outPath = path.join(
  __dirname,
  "..",
  "compiled",
  NODE_VERSION,
  process.platform,
  process.arch
);

proc.on("close", (code, signal) => {
  if (code === 0) {
    fs.mkdirSync(outPath, {
      recursive: true,
    });
    fs.copyFileSync(buildPath, path.join(outPath, TARGET_NAME));
    fs.rm(
      buildPath,
      { recursive: true, force: true },
      (err) => err && console.error
    );
  }
});
