const GetBinding = require('bindings');

const altNode = process.execArgv.includes('altv-resource');

module.exports = !altNode ? require('node-gyp-build')(__dirname) : GetBinding("config_alt");