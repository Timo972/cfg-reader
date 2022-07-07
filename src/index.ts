import { existsSync, readFileSync, writeFileSync, writeFile } from "fs";
import { promisify } from "util";
import { Emitter } from "./emitter";
import { ConfigValue, Dict, Parser } from "./parser";

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

  protected parse(): void {
    if (this.content == null) {
      throw new Error(`[CFG-READER]: no file loaded (internal)`);
    }

    this.parser = new Parser(this.content, this.fileName);

    this.config = Object.assign(this.config, this.parser.parse());
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
