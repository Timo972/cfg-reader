import { Writable } from 'stream';
import { ConfigValue } from '.';
import { Detail } from './detail';
import { Dict, List, Node, NodeType, Scalar } from "./node";

export class Emitter {
    public stream: string = "";
    public emitNode(node: Node<Dict | List | Scalar>, os: Writable, indent: number = 0, isLast: boolean = true): void {
        const _indent = ' '.repeat(indent * 2);

        if (node.type === NodeType.Scalar) {
            os.write(`'${Detail.Escape((node as Node<Scalar>).value)}',\n`);
        } else if (node.type === NodeType.List) {
            os.write('[\n');

            const list = (node as Node<List>).value;
            for (let i = 0; i < list.length; i++) {
                const it = list[i];
                os.write(_indent);
                this.emitNode(it, os, indent + 1, i == list.length - 1);
            }

            os.write(`${' '.repeat((indent - 1) * 2)}${isLast ? ']\n' : '],\n'}`);
        } else if (node.type == NodeType.Dict) {
            if (indent > 0)
                os.write('{\n');

            const dict = (node as Node<Dict>).value;
            const keys = Object.keys(dict);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (dict[key].type == NodeType.None)
                    continue;

                os.write(_indent + key + ':');
                this.emitNode(dict[key], os, indent + 1, i == keys.length - 1);
            }

            if (indent > 0)
                os.write(`${' '.repeat((indent - 1) * 2)}${isLast ? '}\n' : '},\n'}`);
        }
    }

    public emitConfigValue(value: ConfigValue, indent: number = 0, isLast: boolean = true, commas: boolean = true, apostrophes: boolean = true): void {
        const _indent = ' '.repeat(indent * 2);

        if (value instanceof Array) {
            //os.write('[\n');
            this.stream += '[\n';
            for (let i = 0; i < value.length; i++) {
                //os.write(_indent);
                this.stream += _indent;
                this.emitConfigValue(value[i], indent + 1, i == value.length - 1);
            }

            //os.write(_indent.repeat(indent - 1) + `${isLast || !commas ? ']\n' : '],\n'}`);
            this.stream += _indent.repeat(indent - 1) + `${isLast || !commas ? ']\n' : '],\n'}`;
        } else if (value instanceof Object) {
            if (indent > 0)
                //os.write('{\n');
                this.stream += '{\n';

            const keys = Object.keys(value);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const _value = value[key];

                if (_value == null)
                    continue;

                //os.write(_indent + key + ':');
                this.stream += _indent + key + ':';
                this.emitConfigValue(_value, indent + 1, i == keys.length - 1);
            }

            if (indent > 0)
                //os.write(_indent.repeat(indent - 1) + `${isLast || !commas ? '}\n' : '},\n'}`);
                this.stream += _indent.repeat(indent - 1) + `${isLast || !commas ? '}\n' : '},\n'}`;
        } else if (typeof value === "boolean") {
            //os.write(`${(apostrophes ? "'" : '') + Detail.Escape(String(value)) + (commas ? ',' : '') + (apostrophes ? "'" : '')}\n`);
            this.stream += (apostrophes ? "'" : '') + Detail.Escape(String(value)) + (apostrophes ? "'" : '') + (commas ? ',' : '') + '\n';
        } else if (typeof value === "string") {
            //os.write(`${(apostrophes ? "'" : '') + Detail.Escape(value) + (commas ? ',' : '') + (apostrophes ? "'" : '')}\n`);
            this.stream += (apostrophes ? "'" : '') + Detail.Escape(value) + (apostrophes ? "'" : '') + (commas ? ',' : '') + '\n';
        } else if (typeof value === "number") {
            //os.write(`${(apostrophes ? "'" : '') + Detail.Escape(value.toString()) + (commas ? ',' : '') + (apostrophes ? "'" : '')}\n`);
            this.stream += (apostrophes ? "'" : '') + Detail.Escape(value.toString()) + (apostrophes ? "'" : '') + (commas ? ',' : '') + '\n';
        }
    }
}