/// <reference types="node" />
import { Writable } from 'stream';

declare enum NodeType {
    None = 0,
    Scalar = 1,
    List = 2,
    Dict = 3
}
declare type Dict$1 = {
    [key: string]: Node<List$1 | Dict$1 | Scalar>;
};
declare type Scalar = string;
declare type List$1 = Array<Node<List$1 | Dict$1 | Scalar>>;
declare class Node<NodeValueType> {
    type: NodeType;
    value: NodeValueType;
    constructor(type: NodeType, val: NodeValueType);
}

declare class Emitter {
    stream: string;
    protected containsSpecials(value: string): boolean;
    emitNode(node: Node<Dict$1 | List$1 | Scalar>, os: Writable, indent?: number, isLast?: boolean): void;
    emitConfigValue(value: ConfigValue, indent?: number, isLast?: boolean, commas?: boolean, apostrophes?: boolean): void;
}

declare enum TokenType {
    ArrayStart = 0,
    ArrayEnd = 1,
    DictStart = 2,
    DictEnd = 3,
    Key = 4,
    Scalar = 5
}
declare enum ErrorType {
    KeyExpected = 0,
    InvalidToken = 1,
    UnexpectedEOF = 2
}
declare class Token {
    type: TokenType;
    value: string;
    pos: number;
    line: number;
    col: number;
    constructor(_type: TokenType, _value?: string, _pos?: number, _line?: number, _col?: number);
}
declare class Parser {
    tokens: Token[];
    buffer: string;
    readPos: number;
    line: number;
    column: number;
    tokIdx: number;
    filePath: string;
    constructor(content: string, filePath?: string);
    parse(): Node<Dict$1>;
    protected unread(): number;
    protected peek(offset?: number): string;
    protected get(): string;
    protected skip(n?: number): void;
    protected skipNextToken(): void;
    protected tokenize(): void;
    protected createParseError(type: ErrorType, token: Token | number, col?: number): string;
    protected parseToken(): Node<Dict$1 | List$1 | Scalar>;
}

declare type Dict = {
    [key: string]: ConfigValue;
};
declare type List = Array<ConfigValue>;
declare type ConfigValue = string | boolean | number | Dict | List;
declare class Config {
    protected parser: Parser;
    protected emitter: Emitter;
    protected content: string;
    config: Dict;
    fileName: string;
    /**
     *
     * @param {string} fileName
     * @param {Object} predefinedValues [optional]
     */
    constructor(fileName: string, preDefines?: Object);
    protected existsFile(path: string): boolean;
    protected createFile(path: string): void;
    protected loadFile(path: string): void;
    protected parseNode(node: Node<Dict$1 | List$1 | Scalar>): ConfigValue;
    protected parse(): void;
    /**
     * Get a config value with unknown type, slower than GetOfType
     * @param {string} key
     * @returns {ConfigValue}
     */
    get(key: string): ConfigValue;
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
    save(useCommas?: boolean, useApostrophe?: boolean): Promise<void>;
    /**
     * Get a config value with known type, faster than normal Get
     * @param {string} key
     * @param {ValueType} type
     * @returns {ReturnValueType}
     */
    getOfType<ReturnValueType>(key: string): ReturnValueType;
    /**
     * Serialize config
     * @param {boolean} useCommas [default: true]
     * @param {boolean} useApostrophe [default: true]
     * @returns {string}
     */
    serialize(useCommas?: boolean, useApostrophe?: boolean): string;
}

export { Config, ConfigValue, Dict, List };
