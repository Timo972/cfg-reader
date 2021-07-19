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

    constructor(_val: boolean | number | Scalar | List | Dict | Node) {
        switch (typeof _val) {
            case 'boolean':
                this.type = Type.SCALAR;
                this.val = new ValueScalar(_val ? 'true' : 'false');
                break;
            case 'number':
                this.type = Type.SCALAR;
                this.val = new ValueScalar(String(_val));
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
