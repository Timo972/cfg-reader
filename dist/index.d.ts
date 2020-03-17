declare class Config {
    path: string;
    private conf;
    constructor(userpath: string);
    static load(userpath: string): any;
    get(specify: string | null | undefined): any;
}
export default Config;
