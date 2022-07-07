declare type Dict = {
    [key: string]: ConfigValue;
};
declare type List = Array<ConfigValue>;
declare type ConfigValue = string | boolean | number | Dict | List;

declare class Config {
    config: Dict;
    /**
     * @param {Dict} preDefines [optional]
     */
    constructor(preDefines?: Dict);
    private static create;
    static parse(content: string, preDefines?: Dict): Config;
    static load(filePath: string, preDefines?: Dict): Promise<Config>;
    /**
     * Get a config value with unknown type, slower than GetOfType
     * @param {string} key
     * @returns {Value}
     */
    get<Value extends string | number | boolean | List | Dict>(key: string): Value;
    /**
     * Get a config value
     * @param {string} key
     * @returns {ReturnValueType}
     * @deprecated
     */
    getOfType<ReturnValueType extends ConfigValue>(key: string): ReturnValueType;
    /**
     * Set a config value
     * @param {string} key
     * @param {ConfigValue} value
     */
    set(key: string, value: ConfigValue): void;
    /**
     * Save the current changes to the opened file
     * @param {boolean} useCommas [default: true]
     * @param {boolean} useApostrophe [default: true]
     *
     * @returns {Promise<void>}
     */
    save(filePath: string, useCommas?: boolean, useApostrophe?: boolean): Promise<void>;
    /**
     * Serialize config
     * @param {boolean} useCommas [default: true]
     * @param {boolean} useApostrophe [default: true]
     * @returns {string}
     */
    serialize(useCommas?: boolean, useApostrophe?: boolean): string;
}
declare function parse(content: string): Dict;
declare function serialize(config: Dict, useCommas?: boolean, useApostrophe?: boolean): string;

export { Config, ConfigValue, Dict, List, parse, serialize };
