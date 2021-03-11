declare class Config {
    public readonly path: string;
    private config;
    constructor(path: string);
    static load(userpath: string): any;
    static fromObject(obj: any): string;
    static fromJSON(json: string): string;
    get(key: string): any;
    set(key: string, value: any): void;
    has(key: string): boolean;
}
export default Config;
