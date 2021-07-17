## cfg-reader

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Node.js Version][node-version-image]][node-version-url]
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/aec7d7510bb34f138b70c304818945e4)](https://www.codacy.com/gh/Timo972/cfg-reader/dashboard?utm_source=github.com&utm_medium=referral&utm_content=Timo972/cfg-reader&utm_campaign=Badge_Grade)

## License and copyright notice

[alt-config (MIT)](https://github.com/altmp/alt-config)

## Important
Keep in mind this module is a native addon and its important to install to correct version for it to work.  
- @next for node version >= 12
- @alt for alt:V node module  
  You can find the special implementation for the alt:V node module at the alt-node branch.  
+ If you want to use this module along the alt:V JS Module, follow the corresponding installation tutorial
---
## Installation

```bash
npm i --save cfg-reader@next
```

## Installation for alt:V

```bash
npm i --save cfg-reader@alt
```
---
## Differences between v1

The cfg-reader is now using the open source alt-config parser from the altMP Team.  
It should be way faster than my own parser in v1.
## How to use

```js
const { Config } = require("cfg-reader");
const myCfg = new Config("config.cfg");
const val = myCfg.get("test");
//with the get method you can easiely filter the lines you need
```

```js
const { Config, Type } = require("cfg-reader");
const testCfg = new Config("test.cfg");
// If you know which type the value you want to get has you can use
// getOfType(key: string, type: number).
// It directly converts the value to the specific type
// and does not have to iterate over all possible types.
// -> little faster
testCfg.getOfType("test", Type.String);
```

## API
Check out types/index.d.ts
```ts
export class Config {
  constructor(fileName: string);
  /**
   * Get a config value with unknown type, slower than GetOfType
   * @param key {string}
   * @returns {ConfigValue}
   */
  public get(key: string): ConfigValue;
  /**
   * Set a config value
   * @param key {string}
   * @param value {any}
   */
  public set(key: string, value: ConfigValue): void;
  /**
   * Save the current changes to the opened file
   */
  public save(): boolean;
  /**
   * Get a config value with known type, faster than normal Get
   * @param key {string}
   * @param type {ValueType}
   * @returns {ConfigValue}
   */
  public getOfType(key: string, type: ValueType | number): ConfigValue;
  /**
   * Serialize config
   * @returns {string}
   */
  public serialize(): string;
}
```

## Example

config.cfg

```cfg
mysql: {
    host: 127.0.0.1,
    user: root,
    password: test123,
    database: db
}
```

index.js

```js
const mysql = require('mysql2');
const config = new require('cfg-reader').Config('config.cfg');
// equal to es6
// import { Config } from 'cfg-reader';
// const config = new Config('config.cfg');
const con = mysql.createConnection(config.get('mysql'));
...
```

[npm-image]: https://img.shields.io/npm/v/cfg-reader.svg
[npm-url]: https://npmjs.org/package/cfg-reader
[node-version-image]: http://img.shields.io/node/v/cfg-reader.svg
[node-version-url]: http://nodejs.org/download/
[downloads-image]: https://img.shields.io/npm/dm/cfg-reader.svg
[downloads-url]: https://npmjs.org/package/cfg-reader
