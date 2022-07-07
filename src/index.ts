import { Emitter } from "./emitter";
import { ConfigValue, Dict, List, Parser } from "./parser";

export function parse(content: string): Dict {
  const parser = new Parser(content);
  return parser.parse();
}

export function serialize(
  config: Dict,
  useCommas: boolean = false,
  useApostrophe: boolean = false
): string {
  const emitter = new Emitter();
  emitter.emitConfigValue(config, 0, true, useCommas, useApostrophe);
  return emitter.stream;
}

export type { List, Dict, ConfigValue };
