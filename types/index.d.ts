declare type ConfigValue = string | boolean | number | any | any[]
declare module "cfg-reader" {
    /**
     * this class cannot be created by constructor
     */
    export class Config {
        public Get(key: string): ConfigValue;
        public Set(key: string, value: ConfigValue): void;
        public Save(): boolean;
    }

    export function Load(fileName: string): Config;

    /**
     * @deprecated See {@link Load}
     * @param fileName string
     */
    export function load(fileName: string): Config;
}