/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import path from 'path';

declare type ConfigObject = { [key: string]: any };

export enum ValueType {
    Boolean,
    Number,
    String,
    List,
    Dict,
}

export class Config {
    private config: ConfigObject = null;
    private lineCache: string[] = [];
    constructor(public readonly path: string | ConfigObject) {
        if (typeof this.path === 'string') this.parse();
        else this.config = this.path;
    }
    protected processDictOrList(line: string, seperator: string = null): any | null {
        if (line.includes(']')) {
            if (this.lineCache[0] !== '0') throw new Error('Invalid config syntax');
            // end of list
            // process list through lineCache
            const key = this.lineCache[1];
            const values =
                seperator == null
                    ? this.lineCache.slice(2, this.lineCache.length).filter((x) => x !== '[')
                    : this.lineCache
                          .slice(2, this.lineCache.length)
                          .filter((x) => x !== '[')
                          .join(seperator)
                          .trim()
                          .replace(/\s/g, '')
                          .split(seperator);

            this.lineCache = [];

            const parsed = [];

            for (const value of values) {
                const keyValuePair = this.parseLine(value);
                if (keyValuePair != null) parsed.push(keyValuePair[1]);
            }

            return [key, parsed];
        } else if (line.includes('}')) {
            if (this.lineCache[0] !== '1') throw new Error('Invalid config syntax');
            // end of dict
            // process dict through lineCache
            const key = this.lineCache[1];
            const values =
                seperator == null
                    ? this.lineCache.slice(2, this.lineCache.length).filter((x) => x !== '{')
                    : this.lineCache
                          .slice(2, this.lineCache.length)
                          .filter((x) => x !== '{')
                          .join(seperator)
                          .trim()
                          .replace(/\s/g, '')
                          .split(seperator);

            this.lineCache = [];

            const parsed = {};

            for (const value of values) {
                const keyValuePair = this.parseLine(value);
                if (keyValuePair != null) parsed[keyValuePair[0]] = keyValuePair[1];
            }

            return [key, parsed];
        }

        return null;
    }
    protected parseLine(line: string): [string, any] | null {
        if (line.startsWith('#')) return;

        //! maybe this has to be checked at the end of this function to support inline lists / dicts
        const dictOrList = this.processDictOrList(line);

        if (dictOrList != null) return dictOrList;

        if (this.lineCache.length > 0) {
            // collecting data for parsing dict or list, return null to not add to config
            this.lineCache.push(line.trim().replace(/\s/g, ''));
            return null;
        }

        const lSplitted = line.trim().replace(/\s/g, '').split(':');
        const lKey = lSplitted[0];
        const lValue = lSplitted.length > 1 ? lSplitted[1] : lSplitted[0];

        if (lValue.startsWith('[') || lValue.startsWith('{')) {
            // begin of list (0) / dict (1)^
            this.lineCache = [];
            this.lineCache.push(lValue.startsWith('{') ? '1' : '0');
            this.lineCache.push(lKey);
            this.lineCache.push(lValue.includes(']') || lValue.includes('}') ? lValue : lValue.replace(/,/g, ''));
            return null;
        }

        const dictOrListInline = this.processDictOrList(line, ',');
        if (dictOrListInline != null) return dictOrList;

        return [
            lKey,
            this.parseValueUnknownType(
                lValue.lastIndexOf(',') == lValue.length - 1 ? lValue.substring(0, lValue.length - 1) : lValue,
            ),
        ];
    }
    protected parseValueUnknownType(value: string): any {
        for (const sType in ValueType) {
            const type = Number(sType);
            if (isNaN(type)) return;
            try {
                const parsedValue = this.parseValueOfType(type, value);
                return parsedValue;
            } catch (e) {}
        }
    }
    protected parseValueOfType(type: ValueType, value: string): any {
        if (type === ValueType.Boolean) {
            const val = Boolean(value);
            if (
                typeof val !== 'boolean' ||
                (value !== 'true' && value !== 'false' && value !== 'yes' && value !== 'no')
            )
                throw new Error('Wrong type: boolean');
            return val;
        } else if (type === ValueType.Number) {
            const val = Number(value);
            if (typeof val !== 'number' || isNaN(val)) throw new Error('Wrong type: number');
            return val;
        } else if (type === ValueType.String) {
            let val = String(value);
            if (typeof val !== 'string') throw new Error('Wrong type: string');
            val = val.indexOf('"') == 0 || val.indexOf("'") == 0 ? val.substring(1, val.length) : val;
            val =
                val.lastIndexOf('"') == val.length - 1 || val.lastIndexOf("'") == val.length - 1
                    ? val.substring(0, val.length - 1)
                    : val;
            return val;
        } else if (type === ValueType.Dict) {
            // iterate over key: value pair
        } else if (type === ValueType.List) {
            // iterate over list
        }
    }
    protected parse(): void {
        this.config = {};

        if (typeof this.path !== 'string') return;

        const fileContent = fs.readFileSync(path.normalize(this.path), { encoding: 'utf8' });

        for (const line of fileContent.split('\n')) {
            const parsedLine = this.parseLine(line);
            if (parsedLine != null) this.config[parsedLine[0]] = parsedLine[1];
        }
    }
    get(key: string): any {
        return key in this.config ? this.config[key] : null;
    }
    has(key: string): boolean {
        return key in this.config;
    }
    set(key: string, value: any): boolean {
        this.config[key] = value;
        return true;
    }
    save(): boolean {
        return true;
    }
}

export default Config;
