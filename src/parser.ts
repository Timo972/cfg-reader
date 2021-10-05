import { Detail } from "./detail";
import { Dict, List, Node, NodeType, Scalar } from "./node";

export enum TokenType {
    ArrayStart,
    ArrayEnd,
    DictStart,
    DictEnd,
    Key,
    Scalar
}

export enum ErrorType {
    KeyExpected,
    InvalidToken,
    UnexpectedEOF
}

class Token {
    public type: TokenType;
    public value: string;
    public pos: number;
    public line: number;
    public col: number;

    constructor(_type: TokenType, _value: string = "", _pos: number = 0, _line: number = 0, _col: number = 0) {
        this.type = _type;
        this.value = _value;
        this.pos = _pos;
        this.line = _line;
        this.col = _col;
    }
}

export class Parser {

    public tokens: Token[] = [];
    public buffer: string;
    public readPos: number = 0;
    public line: number = 0;
    public column: number = 0;
    public tokIdx: number = 0;
    public filePath: string;

    constructor(content: string, filePath?: string) {
        this.buffer = content;
        this.filePath = filePath;
    }

    public parse(): Node<Dict> {
        this.tokenize();

        console.log('Tokens:');
        console.table(this.tokens);

        return this.parseToken() as unknown as Node<Dict>;
    }

    protected unread(): number {
        return this.buffer.length - this.readPos;
    }

    protected peek(offset: number = 0): string {
        const idx = this.readPos + offset;
        return this.buffer[idx];
    }

    protected get(): string {
        this.column++;
        if (this.peek() == '\n') {
            this.line++;
            this.column = 0;
        }
        //const currPos = this.readPos;
        //this.readPos++;
        //return this.buffer[currPos];
        return this.buffer[this.readPos++];
    }

    protected skip(n: number = 1): void {
        for (let i = 0; i < n; i++) {
            this.column++;
            if (this.peek(i) == '\n') {
                this.line++;
                this.column = 0;
            }
        }
        this.readPos += n;
    }

    protected skipNextToken(): void {
        while(this.unread() > 0) {
            if (this.peek() == ' ' || this.peek() == '\n' || this.peek() == '\r' || this.peek() == '\t' || this.peek() == ',') {
                this.skip();
            } else if (this.peek() == '#') {
                this.skip();

                while (this.unread() > 0 && this.peek() != '\n' && this.peek() != '#') {
                    this.skip();
                }

                if (this.unread() > 0) {
                    this.skip();
                }
            } else {
                break;
            }
        }
    }

    protected tokenize(): void {
        this.tokens.push(new Token(TokenType.DictStart));

        while (this.unread() > 0) {
            this.skipNextToken();

            if (this.unread() == 0) {
                break;
            }
            if ( this.peek() == '[') {
                this.skip();
                this.tokens.push(new Token(TokenType.ArrayStart, "", this.readPos, this.line, this.column));
            } else if ( this.peek() == ']') {
                this.skip();
                this.tokens.push(new Token(TokenType.ArrayEnd, "", this.readPos, this.line, this.column));
            } else if ( this.peek() == '{') {
                this.skip();
                this.tokens.push(new Token(TokenType.DictStart, "", this.readPos, this.line, this.column));
            } else if ( this.peek() == '}') {
                this.skip();
                this.tokens.push(new Token(TokenType.DictEnd, "", this.readPos, this.line, this.column));
            } else {
                let val = "";

                if ( this.peek() == '\'' ||  this.peek() == '"') {
                    const start = this.get();

                    if ( this.peek() != start) {
                        while (this.unread() > 1 && (this.peek() == '\\' || this.peek(1) != start)) {
                            if (this.peek() == '\n' || this.peek() == '\r') {
                                if (this.get() == '\r' || this.peek() == '\n') {
                                    this.skip();
                                }
                                val += "\n";
                                continue;
                            }
                            val += this.get();
                        }   

                        if (this.unread() > 0) {
                            val += this.get();
                        }

                        if (this.unread() == 0) {
                            throw new Error(this.createParseError(ErrorType.UnexpectedEOF, this.line, this.column));
                        }
                    }

                    this.skip();
                } else {
                    while (this.unread() > 0 &&
                        this.peek() != '\n' &&
                        this.peek() != ':' &&
                        this.peek() != ',' &&
                        this.peek() != ']' &&
                        this.peek() != '}' &&
                        this.peek() != '#') {
                            val += this.get();
                    }
                }

                val = Detail.Unescape(val);

                if (this.unread() > 0 && this.peek() == ':') {
                    this.tokens.push(new Token(TokenType.Key, val, this.readPos, this.line, this.column));
                } else {
                    this.tokens.push(new Token(TokenType.Scalar, val, this.readPos, this.line, this.column));
                }

                if (this.unread() > 0 && (this.peek() == ':' || this.peek() == ',')) {
                    this.skip();
                }
            }
        }

        this.tokens.push(new Token(TokenType.DictEnd));

        return; // end
    }

    protected createParseError(type: ErrorType, token: Token | number, col?: number): string {
        let line: number;
        if (token instanceof Token) {
            col = token.col;
            line = token.line;
        } else
            line = token;

        line++;
        col++;

        const place = this.filePath ? `${this.filePath}:${line}:${col}` : `${line}:${col}`;
        const base = `[CFG-READER] error at line ${place} -> `;

        switch (type) {
            case ErrorType.KeyExpected:
                return base + `key expected`;
            case ErrorType.InvalidToken:
                return base + `invalid token`;
            case ErrorType.UnexpectedEOF:
                return base + `unexpected end of file`;
        }
    }

    protected parseToken(): Node<Dict | List | Scalar> {
        const token = this.tokens[this.tokIdx];
        switch (token.type) {
            case TokenType.Scalar:
                return new Node<string>(NodeType.Scalar, token.value);
            case TokenType.ArrayStart:
                const list = new Node<List>(NodeType.List, []);
                while (this.tokIdx < this.tokens.length - 1 && this.tokens[this.tokIdx + 1].type != TokenType.ArrayEnd) {
                    this.tokIdx++;
                    const node = this.parseToken();
                    list.value.push(node);
                }
                this.tokIdx++;

                return list;
            case TokenType.DictStart:
                const dict = new Node<Dict>(NodeType.Dict, {});
                while(this.tokIdx < this.tokens.length - 1 && this.tokens[this.tokIdx + 1].type != TokenType.DictEnd) {
                    this.tokIdx++;
                    const nextTok = this.tokens[this.tokIdx];
                    if (nextTok.type != TokenType.Key) {
                        throw new Error(this.createParseError(ErrorType.KeyExpected, nextTok));
                    }

                    const key = nextTok.value;
                    this.tokIdx++;
                    const node = this.parseToken();
                    dict.value[key] = node;
                }
                this.tokIdx++;

                return dict;
        }

        throw new Error(this.createParseError(ErrorType.InvalidToken, token));
    }
}