import { Writable } from "stream";
import { ConfigValue, Dict, List } from "./parser";
import { Detail } from "./detail";

export class Emitter {
  public stream: string = "";

  protected containsSpecials(value: string): boolean {
    return /[:,'"\[\]\{\}]/gm.test(value);
  }

  public emitNode(
    node: ConfigValue,
    os: Writable,
    indent: number = 0,
    isLast: boolean = true
  ): void {
    const _indent = " ".repeat(indent * 2);

    if (
      typeof node === "string" ||
      typeof node === "bigint" ||
      typeof node === "boolean" ||
      typeof node === "number"
    ) {
      os.write(`'${Detail.Escape(String(node))}',\n`);
    } else if (typeof node === "object" && node instanceof Array) {
      os.write("[\n");

      const list = node as List;
      for (let i = 0; i < list.length; i++) {
        const it = list[i];
        os.write(_indent);
        this.emitNode(it, os, indent + 1, i == list.length - 1);
      }

      os.write(`${" ".repeat((indent - 1) * 2)}${isLast ? "]\n" : "],\n"}`);
    } else if (typeof node === "object" && node instanceof Object) {
      if (indent > 0) os.write("{\n");

      const dict = node as Dict;
      const keys = Object.keys(dict);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        // if (dict[key].type == NodeType.None) continue;

        os.write(_indent + key + ":");
        this.emitNode(dict[key], os, indent + 1, i == keys.length - 1);
      }

      if (indent > 0)
        os.write(`${" ".repeat((indent - 1) * 2)}${isLast ? "}\n" : "},\n"}`);
    }
  }

  public emitConfigValue(
    value: ConfigValue,
    indent: number = 0,
    isLast: boolean = true,
    commas: boolean = true,
    apostrophes: boolean = true
  ): void {
    const _indent = " ".repeat(indent * 2);

    if (value instanceof Array) {
      //os.write('[\n');
      this.stream += "[\n";
      for (let i = 0; i < value.length; i++) {
        //os.write(_indent);
        this.stream += _indent;
        this.emitConfigValue(value[i], indent + 1, i == value.length - 1);
      }

      //os.write(_indent.repeat(indent - 1) + `${isLast || !commas ? ']\n' : '],\n'}`);
      this.stream +=
        _indent.repeat(indent - 1) + `${isLast || !commas ? "]\n" : "],\n"}`;
    } else if (value instanceof Object) {
      if (indent > 0)
        //os.write('{\n');
        this.stream += "{\n";

      const keys = Object.keys(value);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const _value = value[key];

        if (_value == null) continue;

        //os.write(_indent + key + ':');
        this.stream += _indent + key + ":";
        this.emitConfigValue(_value, indent + 1, i == keys.length - 1);
      }

      if (indent > 0)
        //os.write(_indent.repeat(indent - 1) + `${isLast || !commas ? '}\n' : '},\n'}`);
        this.stream +=
          _indent.repeat(indent - 1) + `${isLast || !commas ? "}\n" : "},\n"}`;
    } else {
      let escaped;

      if (typeof value === "boolean") {
        escaped = Detail.Escape(String(value));
      } else if (typeof value === "string") {
        escaped = Detail.Escape(value);
      } else if (typeof value === "number") {
        escaped = Detail.Escape(value.toString());
      }

      if (escaped === undefined) {
        throw new Error(
          `[CFG-READER] can not emit value of type: ${typeof value}. (you passed an invalid data type)`
        );
      }

      const useApostrophes = apostrophes || this.containsSpecials(escaped);

      this.stream +=
        (useApostrophes ? "'" : "") +
        escaped +
        (useApostrophes ? "'" : "") +
        (commas ? "," : "") +
        "\n";
    }
  }
}
