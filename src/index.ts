import { createWriteStream, existsSync, readFileSync, writeFileSync } from "fs";
import { Writable } from 'stream';
import { Emitter } from "./emitter";
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
  protected emitter: Emitter = new Emitter();
  protected content: string;
  public config: JSDict = {};
  public fileName: string;

  constructor(fileName: string, preDefines?: Object) {
    if (typeof fileName !== "string") {
      throw new Error(
        "[CFG-READER]: invalid constructor call, fileName must be type string"
      );
    }

    this.fileName = fileName;

    if (!(preDefines instanceof Object) && preDefines != null) {
      throw new Error("[CFG-READER]: invalid constructor call, preDefines must be null or Object");
    }

    if (preDefines == null && this.existsFile(fileName)) {
      //this.loadFile(fileName).then(this.parse.bind(this));
        this.loadFile(fileName);
        this.parse();
    } else if (preDefines instanceof Object) {
      this.config = preDefines as JSDict;

      if (this.existsFile(fileName)) {
        this.loadFile(fileName);
        this.parse();
      }
    }
  }

  //protected async loadFile(path: string): Promise<void> {
  //  const buffer = await readFile(path, { encoding: "utf8" });
  //  this.content = buffer;
  //}

  protected existsFile(path: string): boolean {
      return existsSync(path);
  }

  protected createFile(path: string): void {
    writeFileSync(path, "", { encoding: "utf8" });
  }

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

    this.parser = new Parser(this.content, this.fileName);

    const node = this.parser.parse();

    const config = this.parseNode(node) as JSDict;
    this.config = Object.assign(this.config, config);
  }

  public get(key: string): ConfigValue {
    return this.config[key];
  }

  public set(key: string, value: ConfigValue): void {
    this.config[key] = value;
  }

  public save(useCommas?: boolean, useApostrophe?: boolean): Promise<void> {
    if (!this.existsFile(this.fileName))
        this.createFile(this.fileName);

    const os = createWriteStream(this.fileName, { encoding: 'utf8', autoClose: true });
    this.emitter.emitConfigValue(this.config, os, 0, true, useCommas, useApostrophe);

    return new Promise((resolve: CallableFunction) => {
        os.end(resolve);
    });
  }

  // public getOfType(key: string, type: ValueType | number): ConfigValue {}

  public getOfType<ReturnValueType>(key: string): ReturnValueType {
    return this.config[key] as unknown as ReturnValueType;
  }

  public serialize(useCommas?: boolean, useApostrophe?: boolean): Promise<Writable> {
    const stream = new Writable({defaultEncoding: 'utf8'});
    this.emitter.emitConfigValue(this.config, stream, 0, true, useCommas, useApostrophe);
    
    return new Promise<Writable>((resolve: CallableFunction) => {
        stream.end(() => resolve(stream));
    });
  }
}
