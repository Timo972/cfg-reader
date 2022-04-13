import { existsSync, readFileSync, writeFileSync, writeFile } from "fs";
import { promisify } from "util";
import { Emitter } from "./emitter";
import {
  Node,
  Dict as NodeDict,
  List as NodeList,
  Scalar as NodeScalar,
  NodeType,
} from "./node";
import { Parser } from "./parser";

export type Dict = { [key: string]: ConfigValue };
export type List = Array<ConfigValue>;
export type ConfigValue = string | boolean | number | Dict | List;

export class Config {
  protected parser: Parser;
  protected emitter: Emitter;
  protected content: string;
  public config: Dict = {};
  public fileName: string;

  /**
   *
   * @param {string} fileName
   * @param {Object} predefinedValues [optional]
   */
  constructor(fileName: string, preDefines?: Object) {
    if (typeof fileName !== "string") {
      throw new Error(
        "[CFG-READER]: invalid constructor call, fileName must be type string"
      );
    }

    this.fileName = fileName;

    if (!(preDefines instanceof Object) && preDefines != null) {
      throw new Error(
        "[CFG-READER]: invalid constructor call, preDefines must be null or Object"
      );
    }

    if (preDefines == null && this.existsFile(fileName)) {
      this.loadFile(fileName);
      this.parse();
    } else if (preDefines instanceof Object) {
      this.config = preDefines as Dict;

      if (this.existsFile(fileName)) {
        this.loadFile(fileName);
        this.parse();
      }
    }
  }

  protected existsFile(path: string): boolean {
    return existsSync(path);
  }

  protected createFile(path: string): void {
    writeFileSync(path, "", { encoding: "utf8" });
  }

  protected loadFile(path: string): void {
    this.content = readFileSync(path, { encoding: "utf8" });
  }

  // returns false when value is a float
  protected isNumber(value: string): boolean {
    return /^-?\d+$/.test(value);
  }

  protected isFloat(value: string): boolean {
    return (
      this.isNumber(value) ||
      (value.search(/\./g) == 1 && value.split(".").every(this.isNumber))
    );
  }

  protected parseNode(
    node: Node<NodeDict | NodeList | NodeScalar>
  ): ConfigValue {
    if (node.type == NodeType.Dict) {
      const dict: Dict = {};

      for (const key in (node as Node<NodeDict>).value) {
        const valueNode = (node as Node<NodeDict>).value[key] as Node<
          NodeDict | NodeList | NodeScalar
        >;
        const value = this.parseNode(valueNode);

        dict[key] = value;
      }

      return dict;
    } else if (node.type == NodeType.List) {
      const length = (node as Node<NodeList>).value.length;
      const list: List = new Array(length);

      for (let i = 0; i < length; i++) {
        const valueNode = (node as Node<NodeList>).value[i];
        const value = this.parseNode(valueNode);

        list[i] = value;
      }

      return list;
    } else if (node.type == NodeType.Scalar) {
      const value = (node as Node<NodeScalar>).value;

      if (
        value === "true" ||
        value === "false" ||
        value === "yes" ||
        value === "no"
      ) {
        return value === "true" || value === "yes";
      } else if (this.isFloat(value)) {
        return parseFloat(value);
      } else {
        return value;
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

    const config = this.parseNode(node) as Dict;
    this.config = Object.assign(this.config, config);
  }

  /**
   * Get a config value with unknown type, slower than GetOfType
   * @param {string} key
   * @returns {ConfigValue}
   */
  public get(key: string): ConfigValue {
    return this.config[key];
  }

  /**
   * Set a config value
   * @param {string} key
   * @param {ConfigValue} value
   */
  public set(key: string, value: ConfigValue): void {
    this.config[key] = value;
  }

  /**
   * Save the current changes to the opened file
   * @param {boolean} useCommas [default: true]
   * @param {boolean} useApostrophe [default: true]
   *
   * @returns {Promise<void>}
   */
  public async save(
    useCommas?: boolean,
    useApostrophe?: boolean
  ): Promise<void> {
    if (!this.existsFile(this.fileName)) this.createFile(this.fileName);

    this.emitter = new Emitter();
    this.emitter.emitConfigValue(
      this.config,
      0,
      true,
      useCommas,
      useApostrophe
    );

    await promisify(writeFile)(this.fileName, this.emitter.stream, {
      encoding: "utf8",
    });
  }

  /**
   * Get a config value with known type, faster than normal Get
   * @param {string} key
   * @param {ValueType} type
   * @returns {ReturnValueType}
   */
  public getOfType<ReturnValueType>(key: string): ReturnValueType {
    return this.config[key] as unknown as ReturnValueType;
  }

  /**
   * Serialize config
   * @param {boolean} useCommas [default: true]
   * @param {boolean} useApostrophe [default: true]
   * @returns {string}
   */
  public serialize(useCommas?: boolean, useApostrophe?: boolean): string {
    this.emitter = new Emitter();
    this.emitter.emitConfigValue(
      this.config,
      0,
      true,
      useCommas,
      useApostrophe
    );
    return this.emitter.stream;
  }
}
