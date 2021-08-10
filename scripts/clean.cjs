const path = require("path");
const fs = require("fs");
const { promisify } = require("util");

const rootPath = path.join(__dirname, "..");

async function deleteBinding() {
  const bindingPath = path.join(rootPath, "binding.gyp");
  if (fs.existsSync(bindingPath)) await promisify(fs.unlink)(bindingPath);
}

exports.clean = function clean (cb) {
    deleteBinding().then(cb);
};
