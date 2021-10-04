import { readFileSync } from "fs";
//import { readFile } from "fs/promises";
import { Node, Dict, List, Scalar, NodeType } from "./node";
import { Parser } from "./parser";

export type JSDict = { [key: string]: ConfigValue };
export type JSList = Array<ConfigValue>;
export type ConfigValue = string | boolean | number | JSDict | JSList;

export const enum ValueType {
  Boolean,
  Number,
  String,
  List,
  Dict,
}

export class Config {
  protected parser: Parser;
  protected emitter: any;
  protected content: string;
  protected config: { [key: string]: ConfigValue };

  constructor(fileName: string, p2?: Object | boolean) {
    if (typeof fileName !== "string") {
      throw new Error(
        "[CFG-READER]: invalid constructor call, fileName must be type string"
      );
    }

    if (typeof p2 !== "boolean" && !(p2 instanceof Object) && p2 != null) {
      throw new Error("[CFG-READER]: invalid constructor call");
    }

    if (p2 == null) {
      //this.loadFile(fileName).then(this.parse.bind(this));
      this.loadFile(fileName);
      this.parse();
    } else if (p2 instanceof Object) {
    } else if (typeof p2 === "boolean") {
    }
  }

  //protected async loadFile(path: string): Promise<void> {
  //  const buffer = await readFile(path, { encoding: "utf8" });
  //  this.content = buffer;
  //}

  protected loadFile(path: string): void {
    this.content = readFileSync(path, { encoding: "utf8" });
  }

  protected parseNode(node: Node<Dict | List | Scalar>): ConfigValue {
    if (node.type == NodeType.Dict) {
      const dict = {};

      for (const key in (node as Node<Dict>).value) {
        const valueNode = (node as Node<Dict>).value[key] as Node<
          Dict | List | Scalar
        >;
        const value = this.parseNode(valueNode);

        dict[key] = value;
      }

      return dict;
    } else if (node.type == NodeType.List) {
      const length = (node as Node<List>).value.length;
      const list = new Array(length);

      for (let i = 0; i < length; i++) {
        const valueNode = (node as Node<List>).value[i];
        const value = this.parseNode(valueNode);

        list[i] = value;
      }

      return list;
    } else if (node.type == NodeType.Scalar) {
      const value = (node as Node<Scalar>).value;

      if (
        value === "true" ||
        value === "false" ||
        value === "yes" ||
        value === "no"
      ) {
        return value === "true" || value === "yes";
      } else if (isNaN(parseFloat(value))) {
        return value;
      } else {
        return parseFloat(value);
      }
    }

    return null;
  }

  protected parse(): void {
    if (this.content == null) {
      throw new Error(`[CFG-READER]: no file loaded (internal)`);
    }

    this.parser = new Parser(this.content);

    const node = this.parser.parse();

    this.config = this.parseNode(node) as JSDict;
  }

  public get(key: string): ConfigValue {
    return this.config[key];
  }

  public set(key: string, value: ConfigValue): void {
    this.config[key] = value;
  }

  public save(useCommas?: boolean, useApostrophe?: boolean): boolean {
    return false;
  }

  // public getOfType(key: string, type: ValueType | number): ConfigValue {}

  public getOfType<ReturnValueType>(key: string): ReturnValueType {
    return this.config[key] as unknown as ReturnValueType;
  }

  public serialize(useCommas?: boolean, useApostrophe?: boolean): string {
    return "";
  }
}
