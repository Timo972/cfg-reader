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
    protected extractLineCacheValues(filter: string, seperator: string = null): string[] {
        return seperator == null
            ? this.lineCache.slice(2, this.lineCache.length).filter((x) => x !== filter)
            : this.lineCache
                  .slice(2, this.lineCache.length)
                  .filter((x) => x !== filter)
                  .join(seperator)
                  .trim()
                  .replace(/\s/g, '')
                  .split(seperator);
    }
    protected processListEnding(seperator: string = null, lineNumber = 0): [string, Array<string | boolean | number>] {
        if (this.lineCache[0] !== '0') {
            throw new Error(`Invalid config syntax! Check line: ${lineNumber}`);
        }
        // end of list
        // process list through lineCache
        const key = this.lineCache[1];
        const values = this.extractLineCacheValues('[', seperator);

        this.lineCache = [];

        const parsed = [];

        for (const value of values) {
            const keyValuePair = this.parseLine(value);
            if (keyValuePair != null) parsed.push(keyValuePair[1]);
        }

        return [key, parsed];
    }
    protected processDictEnding(seperator: string = null, lineNumber = 0): [string, ConfigObject] {
        if (this.lineCache[0] !== '1') {
            throw new Error(`Invalid config syntax! Check line: ${lineNumber}`);
        }
        // end of dict
        // process dict through lineCache
        const key = this.lineCache[1];
        const values = this.extractLineCacheValues('{', seperator);

        this.lineCache = [];

        const parsed = {};

        for (const value of values) {
            const keyValuePair = this.parseLine(value);
            if (keyValuePair != null) parsed[keyValuePair[0]] = keyValuePair[1];
        }

        return [key, parsed];
    }
    protected parseLine(line: string, index?: number): [string, any] | null {
        if (line.startsWith('#')) return;

        // check if multi-line list / dict is ending
        const dictOrListEnding =
            line.includes(']') && !line.includes('[')
                ? this.processListEnding(null, index)
                : line.includes('}') && !line.includes('{')
                ? this.processDictEnding(null, index)
                : null;

        if (dictOrListEnding != null) return dictOrListEnding;

        if (this.lineCache.length > 0) {
            // collecting data for parsing dict or list, return null to not add to config
            this.lineCache.push(line.trim().replace(/\s/g, ''));
            return null;
        }

        const lSplitted = line.trim().replace(/\s/g, '').split(':');
        const lKey = lSplitted[0];
        const lValue =
            lSplitted.length > 1
                ? lSplitted.length > 2
                    ? lSplitted.slice(1, lSplitted.length).join(':')
                    : lSplitted[1]
                : lSplitted[0];

        if (lValue.startsWith('[') || lValue.startsWith('{')) {
            // begin of list (0) / dict (1)^
            this.lineCache = [];
            this.lineCache.push(lValue.startsWith('{') ? '1' : '0');
            this.lineCache.push(lKey);
            //this.lineCache.push(lValue.includes(']') || lValue.includes('}') ? lValue : lValue.replace(/,/g, ''));
            if ((lValue.startsWith('[') && lValue.endsWith(']')) || (lValue.startsWith('{') && lValue.endsWith('}'))) {
                // when dict / list is inline, split up
                const inlineValues = lValue
                    .slice(1, lValue.length - 1)
                    .split(',')
                    .filter((val) => val != '');
                if (inlineValues.length > 0) this.lineCache.push(...inlineValues);
            } else {
                this.lineCache.push(lValue);
                return null;
            }
        }

        // check if inline processing is needed
        if (this.lineCache.length > 0) {
            switch (this.lineCache[0]) {
                case '0':
                    return this.processListEnding(null, index);
                case '1':
                    return this.processDictEnding(null, index);
                default:
                    throw new Error('Unknown internal type! Maybe caused by invalid syntax');
            }
        }

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

        const lines = fileContent.split('\n');

        for (let line = 0; line < lines.length; line++) {
            const parsedLine = this.parseLine(lines[line], line);
            if (parsedLine != null) this.config[parsedLine[0]] = parsedLine[1];
        }
    }
    protected serializeObject(obj: ConfigObject, main = false): string {
        let serializedConfig = '';
        for (const key in obj) {
            const value = obj[key];
            // parse different types
            const serialized = this.serialzeOfUnknownType(value);

            // add to string
            serializedConfig += `${key}: ${serialized}\n`;
        }
        return !main ? `{\n${serializedConfig}}` : serializedConfig;
    }
    protected serializeArray(arr: Array<number | string | boolean>): string {
        const serializedValues = [];
        for (const value in arr) {
            const serialized = this.serialzeOfUnknownType(value);
            serializedValues.push(serialized);
        }
        return `[\n${serializedValues.join('\n')}]`;
    }
    protected serializeNumber(value: number): string {
        return String(value);
    }
    protected serializeString(value: string): string {
        return `'${value}'`;
    }
    protected serializeBoolean(value: boolean): string {
        return String(value);
    }
    protected serialzeOfUnknownType(value: any): string {
        let serialized: string;
        switch (typeof value) {
            case 'object':
                serialized = value instanceof Array ? this.serializeArray(value) : this.serializeObject(value);
                break;
            case 'number':
                serialized = this.serializeNumber(value);
                break;
            case 'string':
                serialized = this.serializeString(value);
                break;
            case 'boolean':
                serialized = this.serializeBoolean(value);
                break;
            default:
                throw new Error(`Invalid value type: ${typeof value}, value: ${value}`);
        }
        return serialized;
    }
    protected serialize(): string {
        return this.serializeObject(this.config, true);
    }
    public get(key: string): any {
        return key in this.config ? this.config[key] : null;
    }
    public has(key: string): boolean {
        return key in this.config;
    }
    public set(key: string, value: any): boolean {
        this.config[key] = value;
        return true;
    }
    public save(): boolean {
        try {
            const content = this.serialize();

            if (typeof this.path !== 'string') {
                throw new Error('This config does not have a valid path');
            }

            fs.writeFileSync(this.path, content, { encoding: 'utf8' });

            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }
}

export default Config;
