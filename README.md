## cfg-reader

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Node.js Version][node-version-image]][node-version-url]
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/aec7d7510bb34f138b70c304818945e4)](https://www.codacy.com/gh/Timo972/cfg-reader/dashboard?utm_source=github.com&utm_medium=referral&utm_content=Timo972/cfg-reader&utm_campaign=Badge_Grade)
[![Latest Build](https://github.com/Timo972/cfg-reader/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/Timo972/cfg-reader/actions/workflows/npm-publish.yml)

## License and copyright notice

[alt-config (MIT)](https://github.com/altmp/alt-config)

## Important
- supported node version >= 12
- Since v2.1.0 you can use this module for the alt:V nodejs version and default nodejs version at the same time.
---
## Installation (works for alt:V too)

```bash
npm i --save cfg-reader@latest
```
---
## Differences between v3
The cfg-reader is now a full typescript port of the open source alt-config parser from the altMP Team.  

### Breaking changes
- Removed Config class API

## How to use
```
# config.cfg
name: Test
port: 7788
players: 1 
```

```ts
// config.ts
// Typescript types
import type { List, Dict, ConfigValue } from "cfg-reader";
// Functions
import { parse, serialize } from "cfg-reader";

import { promises: { readFile } } from 'fs';

const rawConfig = await readFile('config.cfg');
const config = parse(rawConfig);

console.log(config.port); // prints: 7788
console.log(config.players); // prints: 1
```

## API
Check out [Typescript types](types/index.d.ts)

## Example
```bash
# config.cfg
mysql: {
    host: 127.0.0.1,
    user: root,
    password: test123,
    database: db
}
```

```js
// index.js
const mysql = require('mysql2');
const { readFile } = require('fs').promises;
const CFG = require('cfg-reader');
// equal to es6
// import * as CFG from 'cfg-reader';

const rawConfig = await readFile('config.cfg');
const { mysql } = CFG.parse(rawConfig);

const conn = mysql.createConnection(mysql);
...
```

[npm-image]: https://img.shields.io/npm/v/cfg-reader.svg
[npm-url]: https://npmjs.org/package/cfg-reader
[node-version-image]: http://img.shields.io/node/v/cfg-reader.svg
[node-version-url]: http://nodejs.org/download/
[downloads-image]: https://img.shields.io/npm/dm/cfg-reader.svg
[downloads-url]: https://npmjs.org/package/cfg-reader
