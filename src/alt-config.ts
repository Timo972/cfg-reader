import * as fs from 'fs';

export function Unescape(str: string): string {
    const res = '';

    //TODO implement unescape https://github.com/Timo972/alt-config/blob/acb44ba3b23e9068d1182e84fdfbcef1044367b8/alt-config.h#L20

    return res;
}

export function Escape(str: string): string {
    const res = '';

    //TODO implement escape https://github.com/Timo972/alt-config/blob/acb44ba3b23e9068d1182e84fdfbcef1044367b8/alt-config.h#L65

    return res;
}

class Error {
    protected err: string;
    protected pos: number;
    protected lin: number;
    protected col: number;

    constructor(_what: string) {
        this.err = _what;
    }

    public what(): string {
        return this.err;
    }

    public position(): number {
        return this.pos;
    }

    public line(): number {
        return this.lin;
    }

    public column(): number {
        return this.col;
    }
}

type Scalar = string;
type List = Array<Node>;
type Dict = { [key: string]: Node };

enum Type {
    NONE,
    SCALAR,
    LIST,
    DICT,
}

class Node {
    protected type: Type;
    protected val: Value;

    constructor(_val?: boolean | number | Scalar | List | Dict | Node) {
        this.type = Type.SCALAR;
        switch (typeof _val) {
            case 'boolean':
                this.val = new ValueScalar(_val ? 'true' : 'false');
                break;
            case 'number':
            case 'bigint':
                this.val = new ValueScalar(String(_val));
                break;
            case 'string':
                this.val = new ValueScalar(_val);
                break;
            case 'object':
                if (_val instanceof Array) {
                    this.type = Type.LIST;
                    this.val = new ValueList(_val);
                } else if (_val instanceof Object) {
                    this.type = Type.DICT;
                    this.val = new ValueDict(_val);
                }
                break;
            default:
                this.type = Type.NONE;
        }
    }
    public IsNone(): boolean { return this.type == Type.NONE; }
		public IsScalar(): boolean { return this.type == Type.SCALAR; }
		public IsList(): boolean { return this.type == Type.LIST; }
    public IsDict(): boolean { return this.type == Type.DICT; }
    
    public ToBool() {
        return 
    }
}

class Value {
    public Copy(): Value {
        return new Value;
    }
    public ToBool(): boolean {
        throw new Error("Invalid cast");
    }
    //abstract ToDefBool(): boolean;
    public ToNumber(): number{
        throw new Error("Invalid cast");
    }
    //abstract ToDef
    public ToString(): string{
        throw new Error("Invalid cast");
    }

    public ToDict(): Dict{
        throw new Error("Invalid cast");
    }
    public ToList(): List{
        throw new Error("Invalid cast");
    }

    public GetIdx(idx: number): Node{
        throw new Error("Not a list");
    }
    public GetKey(key: string): Node{
        throw new Error("Not a dict");
    }
}

class ValueScalar extends Value {
    private val: Scalar;

    constructor(_val: Scalar) {
        super();
        this.val = _val;
    }

    public Copy(): Value {
        return new ValueScalar(this.val);
    }

    public ToBool(): boolean {
        if (this.val == "true" || this.val == "yes")
            return true;
        else if (this.val == "false" || this.val == "no")
            return false;
        
        throw new Error("Not a bool");
    }

    public ToNumber(): number {
        
        const num = Number(this.val);

        if (isNaN(num))
            throw new Error("Not a number")
        
        return num;
        
    }

    public ToString(): string {
        return this.val;
    }
}

class ValueList extends Value {
    private val: List;
    constructor(_val: List) {
        super();
        this.val = _val;
    }
    public Copy(): Value {
        return new ValueList(this.val);
    }
    public ToList(): List {
        return this.val;
    }
    public Get(idx: number): Node {
        const none = new Node();

        if (idx >= this.val.length) {
            return none;
        }

        return this.val[idx];
    }
}

class ValueDict extends Value {
    public val: Dict;
    constructor(_val: Dict) {
        super();
        this.val = _val;
    }
    public Copy(): Value {
        return new ValueDict(this.val);
    }
    public ToDict(): Dict {
        return this.val;
    }
    public Get(key: string): Node {
        return this.val[key];
    }
}

enum TokenType {
    ARRAY_START,
				ARRAY_END,

				DICT_START,
				DICT_END,

				KEY,
				SCALAR
}

class Token {
    public value: string;
    public pos: number;
    public line: number;
    public col: number;

    public type: TokenType;
}

class Parser {
    public buffer: Array<string>;
    public readPos: number = 0;
    public line: number = 1;
    public column: number = 0;
    public tokens: Array<Token>;

    constructor(rs: fs.ReadStream) {

    }

    public Parse(tok: Token): Node {
        switch (tok.type) {
            case TokenType.SCALAR:
                return new Node(tok.value);
            case TokenType.ARRAY_START:
                const list: List = [];

                return new Node(list);
            case TokenType.DICT_START:
                const dict: Dict = {};

                return new Node(dict);
        }
    }
}

class Emitter {
    public static Emit(
        node: Node,
        stream: fs.WriteStream,
        indent = 0,
        isLast = true,
        useCommas = true,
        useApostrophe = true,
    ) {
        const _indent = ' '.repeat(indent * 2);

        // TODO if isScalar
        if (node) {
            const str = (node as unknown) as string; //.ToString();
            const specialChars = 0;
            if (useApostrophe || specialChars > 0) stream.write(`'${Escape(str)}`);
            else stream.write(Escape(str));
            // TODO if isList
        } else if (node) {
            stream.write(`[\n`);

            stream.write(`${''.repeat((indent - 1) * 2)}${isLast || !useCommas ? ']\n' : '],\n'}`);
            // TODO if isDict
        } else if (node) {
            if (indent > 0) stream.write('{\n');

            const dict = node; //.ToDict();
            for (const it in dict) {
                //                                  is last
                Emitter.Emit(new Node(''), stream, indent + 1, false, useCommas, useApostrophe);
            }

            if (indent > 0) stream.write(`${''.repeat((indent - 1) * 2)}${isLast || !useCommas ? '}\n' : '},\n'}`);
        }
    }
}
