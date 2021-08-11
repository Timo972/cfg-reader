## cfg-reader

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Node.js Version][node-version-image]][node-version-url]
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/aec7d7510bb34f138b70c304818945e4)](https://www.codacy.com/gh/Timo972/cfg-reader/dashboard?utm_source=github.com&utm_medium=referral&utm_content=Timo972/cfg-reader&utm_campaign=Badge_Grade)
[![Latest Build](https://github.com/Timo972/cfg-reader/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/Timo972/cfg-reader/actions/workflows/npm-publish.yml)

## License and copyright notice

[alt-config (MIT)](https://github.com/altmp/alt-config)

## Important
Keep in mind this module is a native addon and its important to reinstall if you change your node version.  
- supported node version >= 12
- Since v2.1.0 you can use this module for the alt:V nodejs version and default nodejs version at the same time.
---
## Installation (works for alt:V too)

```bash
npm i --save cfg-reader
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
Check out [Typescript types](types/index.d.ts)

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
