declare module "cfg-reader" {
    export class Config {
        public readonly path: string;
        private config;
        constructor(path: string);
        constructor(config: Object);
        get(key: string): any;
        set(key: string, value: any): void;
        has(key: string): boolean;
        save(): boolean;
    }

    export default Config
}