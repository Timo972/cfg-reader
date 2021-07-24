const GetBinding = require('bindings');

const altNode = process.execArgv.includes('altv-resource');

module.exports = !altNode ? GetBinding("config") : GetBinding("config_alt");