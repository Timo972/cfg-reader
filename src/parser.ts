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

    constructor(content: string) {
        this.buffer = content;
    }

    public parse(): Node<Dict> {
        this.tokenize();

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
        if (this.peek(0) == '\n') {
            this.line++;
            this.column = 0;
        }
        const currPos = this.readPos;
        this.readPos++;
        return this.buffer[currPos];
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
            const peekChar = this.peek();
            if (peekChar == ' ' || peekChar == '\n' || peekChar == '\r' || peekChar == '\t' || peekChar == ',') {
                this.skip();
            } else if (peekChar == '#') {
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

            const peek = this.peek();
            if (peek == '[') {
                this.skip();
                this.tokens.push(new Token(TokenType.ArrayStart, "", this.readPos, this.line, this.column));
            } else if (peek == ']') {
                this.skip();
                this.tokens.push(new Token(TokenType.ArrayEnd, "", this.readPos, this.line, this.column));
            } else if (peek == '{') {
                this.skip();
                this.tokens.push(new Token(TokenType.DictStart, "", this.readPos, this.line, this.column));
            } else if (peek == '}') {
                this.skip();
                this.tokens.push(new Token(TokenType.DictEnd, "", this.readPos, this.line, this.column));
            } else {
                let val = "";

                if (peek == '\'' || peek == '"') {
                    const start = this.get();

                    if (peek != start) {
                        while (this.unread() > 1 && (this.peek() == '\\' || this.peek(1) != start)) {
                            if (this.peek() == '\n' || this.peek() == '\r') {
                                if (this.get() == '\n' || this.peek() == '\n') {
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
                            throw new Error("unexpected end of file");
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
                        throw new Error(`[CFG-READER] error at line ${nextTok.line}: key expected`);
                    }

                    const key = nextTok.value;
                    this.tokIdx++;
                    const node = this.parseToken();
                    dict[key] = node;
                }

                return dict;
        }

        throw new Error(`[CFG-READER] error at line ${token.line}: invalid token`);
    }
}