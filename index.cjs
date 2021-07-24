const GetBinding = require('bindings');

const altNode = process.moduleLoadList.includes('NativeModule alt');

module.exports = altNode ? GetBinding("config") : GetBinding("config_alt");