import { existsSync, writeFile, readFile } from "fs";
import { promisify } from "util";
import { Emitter } from "./emitter";
import { ConfigValue, Dict, List, Parser } from "./parser";

export class Config {
  public config: Dict = {};

  /**
   * @param {Dict} preDefines [optional]
   */
  constructor(preDefines?: Dict) {
    if (!(preDefines instanceof Object) && preDefines != null) {
      throw new Error(
        "[CFG-READER]: invalid constructor call, preDefines must be null or Object"
      );
    }

    if (preDefines instanceof Object) this.config = preDefines;
  }

  private static create(
    content: string,
    filePath: string,
    preDefines?: Dict
  ): Config {
    const parser = new Parser(content, filePath);
    const config = new Config(preDefines);
    config.config = parser.parse();
    return config;
  }

  public static parse(content: string, preDefines?: Dict): Config {
    if (typeof content !== "string")
      throw new Error("[CFG-READER]: invalid content type, must be string");

    return this.create(content, null, preDefines);
  }

  public static async load(
    filePath: string,
    preDefines?: Dict
  ): Promise<Config> {
    if (typeof filePath !== "string")
      throw new Error("[CFG-READER]: invalid filePath type, must be string");

    if (!existsSync(filePath)) throw new Error("[CFG-READER]: file not found");

    const content = await promisify(readFile)(filePath, {
      encoding: "utf8",
    });

    return this.create(content, filePath, preDefines);
  }

  /**
   * Get a config value with unknown type, slower than GetOfType
   * @param {string} key
   * @returns {Value}
   */
  public get<Value extends string | number | boolean | List | Dict>(
    key: string
  ): Value {
    if (!(key in this.config))
      throw new Error(`[CFG-READER] key '${key}' not found in config`);

    return this.config[key] as Value;
  }

  /**
   * Get a config value
   * @param {string} key
   * @returns {ReturnValueType}
   * @deprecated
   */
  public getOfType<ReturnValueType extends ConfigValue>(
    key: string
  ): ReturnValueType {
    return this.get<ReturnValueType>(key);
    // return this.config[key] as unknown as ReturnValueType;
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
    filePath: string,
    useCommas?: boolean,
    useApostrophe?: boolean
  ): Promise<void> {
    const emitter = new Emitter();
    emitter.emitConfigValue(this.config, 0, true, useCommas, useApostrophe);

    await promisify(writeFile)(filePath, emitter.stream, {
      encoding: "utf8",
    });
  }

  /**
   * Serialize config
   * @param {boolean} useCommas [default: true]
   * @param {boolean} useApostrophe [default: true]
   * @returns {string}
   */
  public serialize(useCommas?: boolean, useApostrophe?: boolean): string {
    const emitter = new Emitter();
    emitter.emitConfigValue(this.config, 0, true, useCommas, useApostrophe);
    return emitter.stream;
  }
}

export function parse(content: string): Dict {
  const parser = new Parser(content, null);
  return parser.parse();
}

export function serialize(
  config: Dict,
  useCommas?: boolean,
  useApostrophe?: boolean
): string {
  const emitter = new Emitter();
  emitter.emitConfigValue(config, 0, true, useCommas, useApostrophe);
  return emitter.stream;
}
