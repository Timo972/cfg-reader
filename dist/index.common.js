"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var Config = /** @class */ (function () {
    function Config(userpath) {
        this.path = userpath;
    }
    Config.load = function (userpath) {
        if (!fs.existsSync(userpath)) {
            console.error(new Error('File does not exist!'));
        }
        var config_string = fs.readFileSync(path.normalize(userpath), { encoding: 'utf8' });
        config_string = config_string.replace(/(?:[,\r"' ])/g, '').split(/\n/g).map(function (chunk) { return chunk.indexOf('#') != -1 ? chunk.substr(0, chunk.indexOf('#')) : chunk; }).map(function (chunk) { return chunk.split(/:(.+)/, 2); });
        var config = {};
        var object_start;
        var array_start;
        config_string.forEach(function (chunk) {
            if (chunk[0] == '')
                return;
            if (chunk[1] == '{' || chunk[1] == '[') {
                if (chunk[1] == '{') {
                    config[chunk[0]] = chunk[1];
                    object_start = chunk[0];
                }
                else {
                    config[chunk[0]] = chunk[1];
                    array_start = chunk[0];
                }
            }
            else if (chunk[0] == '}' || chunk[0] == ']') {
                if (chunk[0] == '}') {
                    config[object_start] = config[object_start].substr(0, config[object_start].length - 1);
                    config[object_start] += chunk[0];
                    object_start = undefined;
                }
                else {
                    config[array_start] = config[array_start].substr(0, config[array_start].length - 1);
                    config[array_start] += chunk[0];
                    array_start = undefined;
                }
            }
            else {
                if (object_start != undefined) {
                    config[object_start] += "\"" + chunk[0] + "\":\"" + chunk[1] + "\",";
                }
                else if (array_start != undefined) {
                    config[array_start] += "\"" + chunk[0] + "\",";
                }
                else {
                    config[chunk[0]] = chunk[1];
                }
            }
        });
        return config;
    };
    Config.prototype.get = function (specify) {
        this.conf = this.conf ? this.conf : Config.load(this.path);
        if (specify) {
            var specified = {};
            for (var key in this.conf) {
                if (this.conf.hasOwnProperty(key) && key.split('_')[0] == specify) {
                    var selector = key.split('_')[1];
                    if (selector == undefined) {
                        specified = this.conf[key];
                    }
                    else {
                        specified[selector] = this.conf[key];
                    }
                    try {
                        if (selector == undefined) {
                            if (specified.charAt(0) == '{' || specified.charAt(0) == '[') {
                                specified = JSON.parse(this.conf[key]);
                            }
                        }
                        else {
                            if (specified[selector].charAt(0) == '{' || specified[selector].charAt(0) == '[') {
                                specified[selector] = JSON.parse(this.conf[key]);
                            }
                        }
                    }
                    catch (error) {
                        console.log('you can ignore this: ' + error);
                        return;
                    }
                }
            }
            return specified;
        }
        return this.conf;
    };
    return Config;
}());
exports.default = Config;
