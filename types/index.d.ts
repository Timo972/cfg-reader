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
        /**
         * 
         * @param {string} fileName 
         */
        constructor(fileName: string);
        /**
         * 
         * @param {string} fileName 
         * @param {boolean} createIfNotExist [default: false]
         */
        constructor(fileName: string, createIfNotExist: boolean);
        /**
         * 
         * @param {string} fileName 
         * @param {Object} predefinedValues 
         */
        constructor(fileName: string, predefinedValues: Object);
        /**
         * Get a config value with unknown type, slower than GetOfType
         * @param {string} key 
         * @returns {ConfigValue}
         */
        public get(key: string): ConfigValue;
        /**
         * Set a config value
         * @param {string} key 
         * @param {any} value 
         */
        public set(key: string, value: ConfigValue): void;
        /**
         * Save the current changes to the opened file
         * @param {boolean} useCommas [default: false]
         * @param {boolean} useApostrophe [default: false]
         * 
         * @returns boolean
         */
        public save(useCommas?: boolean, useApostrophe?: boolean): boolean;
        /**
         * Get a config value with known type, faster than normal Get
         * @param {string} key 
         * @param {ValueType} type 
         * @returns {ConfigValue}
         */
        public getOfType(key: string, type: ValueType | number): ConfigValue;
        /**
         * Serialize config 
         * @param {boolean} useCommas [default: false]
         * @param {boolean} useApostrophe [default: false]
         * @returns {string}
         */
        public serialize(useCommas?: boolean, useApostrophe?: boolean): string;
    }

}