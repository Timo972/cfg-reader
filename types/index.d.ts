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
     * Equal to the ValueType enum, just for JS
     */
    export const Type = {
        Boolean: 0,
        Number: 1,
        String: 2,
        List: 3,
        Dict: 4
    }

    /**
     * 
     */
    export class Config {
        constructor(fileName: string);
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
        public save(): boolean;
        /**
         * Get a config value with known type, faster than normal Get
         * @param key {string}
         * @param type {ValueType}
         * @returns {ConfigValue}
         */
        public getOfType(key: string, type: ValueType | number): ConfigValue;
    }

}