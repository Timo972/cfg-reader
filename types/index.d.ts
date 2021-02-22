declare type ConfigValue = string | boolean | number | any | any[]

//declare module "cfg-reader" {
//
//    export const enum ValueType {
//        Boolean,
//        Number,
//        String,
//        List,
//        Dict
//    }
//
//    export class Config {
//        constructor(fileName: string);
//        public Get(key: string): ConfigValue;
//        /**
//         * @param key {string}
//         * @param value {any}
//         */
//        public Set(key: string, value: ConfigValue): void;
//        public Save(): boolean;
//        public GetOfType(key: string, type: ValueType | number): ConfigValue;
//    }
//}

export const enum ValueType {
    Boolean,
    Number,
    String,
    List,
    Dict
}

export class Config {
    constructor(fileName: string);
    public Get(key: string): ConfigValue;
    /**
     * @param key {string}
     * @param value {any}
     */
    public Set(key: string, value: ConfigValue): void;
    public Save(): boolean;
    public GetOfType(key: string, type: ValueType | number): ConfigValue;
}

