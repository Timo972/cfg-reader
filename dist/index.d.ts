declare class Config {
    path: string;
    private conf;
    constructor(userpath: string);
    static load(userpath: string): any;
    static fromObject(obj: any): string;
    static fromJSON(json: string): string;
    get(specify: string | null | undefined): any;
    set(key: string, value: any): void;
    has(key: string): boolean;
}
export default Config;
