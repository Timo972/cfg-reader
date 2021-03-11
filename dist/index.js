'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fs = require('fs');
var path = require('path');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);

exports.ValueType = void 0;
(function (ValueType) {
    ValueType[ValueType["Boolean"] = 0] = "Boolean";
    ValueType[ValueType["Number"] = 1] = "Number";
    ValueType[ValueType["String"] = 2] = "String";
    ValueType[ValueType["List"] = 3] = "List";
    ValueType[ValueType["Dict"] = 4] = "Dict";
})(exports.ValueType || (exports.ValueType = {}));
class Config {
    constructor(path) {
        this.path = path;
        this.config = null;
        this.lineCache = [];
        if (typeof (this.path) === 'string')
            this.parse();
        else
            this.config = this.path;
    }
    processDictOrList(line, seperator = null) {
        if (line.includes(']')) {
            if (this.lineCache[0] !== '0')
                throw new Error('Invalid config syntax');
            // end of list
            // process list through lineCache
            const key = this.lineCache[1];
            const values = seperator == null ? this.lineCache.slice(2, this.lineCache.length).filter(x => x !== '[') : this.lineCache.slice(2, this.lineCache.length).filter(x => x !== '[').join(seperator).trim().replace(/\s/g, '').split(seperator);
            console.log(values);
            this.lineCache = [];
            const parsed = [];
            for (const value of values) {
                const keyValuePair = this.parseLine(value);
                if (keyValuePair != null)
                    parsed.push(keyValuePair[1]);
            }
            return [key, parsed];
        }
        else if (line.includes('}')) {
            if (this.lineCache[0] !== '1')
                throw new Error('Invalid config syntax');
            // end of dict
            // process dict through lineCache
            const key = this.lineCache[1];
            const values = seperator == null ? this.lineCache.slice(2, this.lineCache.length).filter(x => x !== '{') : this.lineCache.slice(2, this.lineCache.length).filter(x => x !== '{').join(seperator).trim().replace(/\s/g, '').split(seperator);
            console.log(values);
            this.lineCache = [];
            const parsed = {};
            for (const value of values) {
                const keyValuePair = this.parseLine(value);
                if (keyValuePair != null)
                    parsed[keyValuePair[0]] = keyValuePair[1];
            }
            return [key, parsed];
        }
        return null;
    }
    parseLine(line) {
        if (line.startsWith('#'))
            return;
        //! maybe this has to be checked at the end of this function to support inline lists / dicts
        const dictOrList = this.processDictOrList(line);
        if (dictOrList != null)
            return dictOrList;
        if (this.lineCache.length > 0) {
            // collecting data for parsing dict or list, return null to not add to config
            this.lineCache.push(line.trim().replace(/\s/g, ''));
            return null;
        }
        const lSplitted = line.trim().replace(/\s/g, '').split(':');
        const lKey = lSplitted[0];
        const lValue = lSplitted.length > 1 ? lSplitted[1] : lSplitted[0];
        console.log(lValue);
        if (lValue.startsWith('[') || lValue.startsWith('{')) {
            // begin of list (0) / dict (1)^
            console.log('Begin of list / dict');
            this.lineCache = [];
            this.lineCache.push(lValue.startsWith('{') ? '1' : '0');
            this.lineCache.push(lKey);
            this.lineCache.push((lValue.includes(']') || lValue.includes('}')) ? lValue : lValue.replace(/,/g, ''));
            return null;
        }
        const dictOrListInline = this.processDictOrList(line, ',');
        if (dictOrListInline != null)
            return dictOrList;
        return [lKey, this.parseValueUnknownType(lValue.lastIndexOf(',') == lValue.length - 1 ? lValue.substring(0, lValue.length - 1) : lValue)];
    }
    parseValueUnknownType(value) {
        for (const sType in exports.ValueType) {
            const type = Number(sType);
            if (isNaN(type))
                return;
            try {
                const parsedValue = this.parseValueOfType(type, value);
                return parsedValue;
            }
            catch (e) {
                //console.log(e);
            }
        }
    }
    parseValueOfType(type, value) {
        if (type === exports.ValueType.Boolean) {
            const val = Boolean(value);
            if (typeof val !== 'boolean' || (value !== 'true' && value !== 'false' && value !== 'yes' && value !== 'no'))
                throw new Error('Wrong type: boolean');
            return val;
        }
        else if (type === exports.ValueType.Number) {
            const val = Number(value);
            if (typeof val !== 'number' || isNaN(val))
                throw new Error('Wrong type: number');
            return val;
        }
        else if (type === exports.ValueType.String) {
            let val = String(value);
            if (typeof val !== 'string')
                throw new Error('Wrong type: string');
            val = (val.indexOf('"') == 0 || val.indexOf("'") == 0) ? val.substring(1, val.length) : val;
            val = (val.lastIndexOf('"') == val.length - 1 || val.lastIndexOf("'") == val.length - 1) ? val.substring(0, val.length - 1) : val;
            return val;
        }
        else if (type === exports.ValueType.Dict) ;
        else if (type === exports.ValueType.List) ;
    }
    parse() {
        this.config = {};
        if (typeof (this.path) !== 'string')
            return;
        const fileContent = fs__default['default'].readFileSync(path__default['default'].normalize(this.path), { encoding: 'utf8' });
        for (const line of fileContent.split('\n')) {
            const parsedLine = this.parseLine(line);
            if (parsedLine != null)
                this.config[parsedLine[0]] = parsedLine[1];
            console.log('Parsed line', parsedLine, this.config);
        }
    }
    get(key) {
        console.log('get key:', key);
        console.log('config:', this.config);
        return (key in this.config) ? this.config[key] : null;
    }
    has(key) {
        return key in this.config;
    }
    set(key, value) {
        this.config[key] = value;
        return true;
    }
    save() {
        return true;
    }
}

exports.Config = Config;
exports.default = Config;
