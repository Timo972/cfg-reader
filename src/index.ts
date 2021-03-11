import fs from 'fs';
//import readline from 'readline';
import path from 'path';

declare type ConfigObject = { [key: string]: any };

enum ValueType {
    Boolean,
    Number,
    String,
    List,
    Dict
}

class Config {
    private config: ConfigObject = null;
    private lineCache: string[] = [];
    constructor(public readonly path: string) {
        this.parse();
    }
    public static load(path: string) {
    }
    protected processDictOrList(line: string, seperator: string = null): any | null {
        if (line.includes(']')) {
            if (this.lineCache[0] !== '0') throw new Error('Invalid config syntax');
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
                    parsed.push(keyValuePair[1])
            }

            return [key, parsed];
        }

        else if (line.includes('}')) {
            if (this.lineCache[0] !== '1') throw new Error('Invalid config syntax');
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
    protected parseLine(line: string): [string, any] | null {
        if (line.startsWith('#')) return;

        //! maybe this has to be checked at the end of this function to support inline lists / dicts
        const dictOrList = this.processDictOrList(line)

        if(dictOrList != null)
            return dictOrList;

        if (this.lineCache.length > 0) {
            // collecting data for parsing dict or list, return null to not add to config
            this.lineCache.push(line.trim().replace(/\s/g, ''));
            return null;
        }

        const lSplitted = line.trim().replace(/\s/g, '').replace(/'/g, '').split(':');
        const lKey = lSplitted[0];
        const lValue = lSplitted.length > 1 ? lSplitted[1] : lSplitted[0];

        console.log(lValue)

        if (lValue.startsWith('[') || lValue.startsWith('{')) {
            // begin of list (0) / dict (1)^
            console.log('Begin of list / dict')
            this.lineCache = [];
            this.lineCache.push(lValue.startsWith('{') ? '1' : '0')
            this.lineCache.push(lKey)
            this.lineCache.push((lValue.includes(']') || lValue.includes('}')) ? lValue : lValue.replace(/,/g, ''))
            return null;
        }

        const dictOrListInline = this.processDictOrList(line, ',')
        if(dictOrListInline != null)
            return dictOrList;

        return [lKey, this.parseValueUnknownType(lValue.replace(/,/g, ''))];
    }
    protected parseValueUnknownType(value: string): any {
        for (const sType in ValueType) {
            const type = Number(sType);
            if (isNaN(type)) return
            try {
                const parsedValue = this.parseValueOfType(type, value);
                return parsedValue;
            } catch (e) {
                //console.log(e);
            }
        }
    }
    protected parseValueOfType(type: ValueType, value: string): any {
        if (type === ValueType.Boolean) {
            const val = Boolean(value);
            if (typeof val !== 'boolean' || (value !== 'true' && value !== 'false' && value !== 'yes' && value !== 'no'))
                throw new Error('Wrong type: boolean');
            return val;
        } else if (type === ValueType.Number) {
            const val = Number(value);
            if (typeof val !== 'number' || isNaN(val))
                throw new Error('Wrong type: number');
            return val;
        } else if (type === ValueType.String) {
            const val = String(value);
            if (typeof val !== 'string')
                throw new Error('Wrong type: string');
            return String(value);
        } else if (type === ValueType.Dict) {
            // iterate over key: value pair
        } else if (type === ValueType.List) {
            // iterate over list

        }
    }
    protected parse(): void {
        this.config = {};
        //const fileStream = fs.createReadStream(path.normalize(this.path));
        //readline.createInterface({
        //    input: fileStream,
        //    output: process.stdout,
        //    terminal: false
        //}).on('line', (line) => {
        //    const parsedLine = this.parseLine(line);
        //    if (parsedLine != null)
        //        this.config[parsedLine[0]] = parsedLine[1];
        //    console.log('Parsed line', parsedLine, this.config)
        //});
        const fileContent = fs.readFileSync(path.normalize(this.path), { encoding: 'utf8' });

        for (const line of fileContent.split('\n')) {
            const parsedLine = this.parseLine(line);
            if (parsedLine != null)
                this.config[parsedLine[0]] = parsedLine[1];
            console.log('Parsed line', parsedLine, this.config)
        }

    }
    get(key: string): any {
        //if (this.config == null)
        //    this.parse()
        console.log('get key:', key);
        console.log('config:', this.config);
        return (key in this.config) ? this.config[key] : null;
    }
    has(key: string): boolean {
        //if (this.config == null)
        //    this.parse()
        return key in this.config;
    }
    set(key: string, value: any): boolean {
        //if (this.config == null)
        //    this.parse()
        this.config[key] = value;
        return true;
    }
    save(): boolean {
        return true;
    }
    static fromObject(obj: any) {
        return Config.fromJSON(JSON.stringify(obj))
    }
    static fromJSON(json_obj: string) {
        json_obj = json_obj.replace(/["\s]/g, '')
        const cfg = json_obj.slice(1, json_obj.length - 1).replace(/,/g, '\n')
        console.log(cfg)
        return cfg
    }
}

export default Config