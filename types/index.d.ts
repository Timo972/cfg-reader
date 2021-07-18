declare module "cfg-reader" {

    export type ConfigValue = string | boolean | number | any | any[]

    /**
     * Same enum as the object passed from the native addon
     * You can use this if you use Typescript
     */
    export const enum ValueType {
        Boolean,
        Number,
        String,
        List,
        Dict
    }

    /**
     * 
     */
    export class Config {
        constructor(fileName: string, createIfNotExist: boolean);
        constructor(fileName: string, predefinedValues: Object);
        /**
         * Get a config value with unknown type, slower than GetOfType
         * @param key {string}
         * @returns {ConfigValue}
         */
        public get(key: string): ConfigValue;
        /**
         * Set a config value
         * @param key {string}
         * @param value {any}
         */
        public set(key: string, value: ConfigValue): void;
        /**
         * Save the current changes to the opened file
         */
        public save(useCommas: boolean = false, useApostrophe: boolean = false): boolean;
        /**
         * Get a config value with known type, faster than normal Get
         * @param key {string}
         * @param type {ValueType}
         * @returns {ConfigValue}
         */
        public getOfType(key: string, type: ValueType | number): ConfigValue;
        /**
         * Serialize config 
         * @returns {string}
         */
        public serialize(useCommas: boolean = false, useApostrophe: boolean = false): string;
    }

}