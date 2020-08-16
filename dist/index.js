'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var _path = require('path');

var path = _interopRequireWildcard(_path);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Config = function () {
    function Config(userpath) {
        _classCallCheck(this, Config);

        this.path = userpath;
    }

    _createClass(Config, [{
        key: 'get',
        value: function get(specify) {
            this.conf = this.conf ? this.conf : Config.load(this.path);
            if (specify) {
                var specified = {};
                for (var key in this.conf) {
                    if (this.conf.hasOwnProperty(key) && key.split('_')[0] == specify) {
                        var selector = key.split('_')[1];
                        if (selector == undefined) {
                            specified = this.conf[key];
                        } else {
                            specified[selector] = this.conf[key];
                        }
                        try {
                            if (selector == undefined) {
                                if (specified.charAt(0) == '{' || specified.charAt(0) == '[') {
                                    specified = JSON.parse(this.conf[key]);
                                }
                            } else {
                                if (specified[selector].charAt(0) == '{' || specified[selector].charAt(0) == '[') {
                                    specified[selector] = JSON.parse(this.conf[key]);
                                }
                            }
                        } catch (error) {
                            console.log('you can ignore this: ' + error);
                            return;
                        }
                    }
                }
                return specified;
            }
            return this.conf;
        }
    }, {
        key: 'set',
        value: function set(key, value) {
            this.conf = this.conf ? this.conf : Config.load(this.path);
            this.conf[key] = value;
            console.table(this.conf);
        }
    }, {
        key: 'save',
        value: function save() {
            if (this.conf == Config.load(this.path)) return;
            fs.writeFileSync(this.path, Config.fromObject(this.conf));
        }
    }], [{
        key: 'load',
        value: function load(userpath) {
            if (!fs.existsSync(userpath)) {
                console.error(new Error('File does not exist!'));
            }
            var config_string = fs.readFileSync(path.normalize(userpath), { encoding: 'utf8' });
            config_string = config_string.replace(/(?:[,\r"' ])/g, '').split(/\n/g).map(function (chunk) {
                return chunk.indexOf('#') != -1 ? chunk.substr(0, chunk.indexOf('#')) : chunk;
            }).map(function (chunk) {
                return chunk.split(/:(.+)/, 2);
            });
            var config = {};
            var object_start = void 0;
            var array_start = void 0;
            config_string.forEach(function (chunk) {
                if (chunk[0] == '') return;
                if (chunk[1] == '{' || chunk[1] == '[') {
                    if (chunk[1] == '{') {
                        config[chunk[0]] = chunk[1];
                        object_start = chunk[0];
                    } else {
                        config[chunk[0]] = chunk[1];
                        array_start = chunk[0];
                    }
                } else if (chunk[0] == '}' || chunk[0] == ']') {
                    if (chunk[0] == '}') {
                        config[object_start] = config[object_start].substr(0, config[object_start].length - 1);
                        config[object_start] += chunk[0];
                        object_start = undefined;
                    } else {
                        config[array_start] = config[array_start].substr(0, config[array_start].length - 1);
                        config[array_start] += chunk[0];
                        array_start = undefined;
                    }
                } else {
                    if (object_start != undefined) {
                        config[object_start] += '"' + chunk[0] + '":"' + chunk[1] + '",';
                    } else if (array_start != undefined) {
                        config[array_start] += '"' + chunk[0] + '",';
                    } else {
                        config[chunk[0]] = chunk[1];
                    }
                }
            });
            return config;
        }
    }, {
        key: 'fromObject',
        value: function fromObject(obj) {
            return Config.fromJSON(JSON.stringify(obj));
        }
    }, {
        key: 'fromJSON',
        value: function fromJSON(json_obj) {
            json_obj = json_obj.replace(/["\s]/g, '');
            var cfg = json_obj.slice(1, json_obj.length - 1).replace(/,/g, '\n');
            console.log(cfg);
            return cfg;
        }
    }]);

    return Config;
}();

module.exports = Config;