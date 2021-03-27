## cfg-reader

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Node.js Version][node-version-image]][node-version-url]
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/aec7d7510bb34f138b70c304818945e4)](https://www.codacy.com/gh/Timo972/cfg-reader/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Timo972/cfg-reader&amp;utm_campaign=Badge_Grade)

## License and copyright notice

[alt-config (MIT)](https://github.com/altmp/alt-config)

## Important
- You can only set integers, booleans and strings via the set method currently
- The alt:V JS-Module will not be able to import this module -> you **can not** use this in alt:V Multiplayer

## Installation

```bash
npm i --save cfg-reader@next
```

## How to use

```js
const { Config } = require('cfg-reader');
const myCfg = new Config('config.cfg');
myCfg.Get('test');
//with the get method you can easiely filter the lines you need
```

```js
const { Config, Type } = require('cfg-reader');
const testCfg = new Config('test.cfg');
// If you know which type the value you want to get has you can use
// GetOfType(key: string, type: number).
// It directly converts the value to the right type 
// and does not have to iterate over all possible types.
// -> little faster
testCfg.GetOfType('test', Type.String);
```

## Differences between v1
Removed:
- Config.load()
- Config.fromJson()
- Config.fromObject()
- Config.path
- Config#has()

Renamed:
- Config#get() to Config#Get()
- Config#set() to Config#Set()
- Config#save() to Config#Save()

Added:
- Config#GetOfType()

The cfg-reader is now using the open source alt-config parser from the altMP Team.
It should be way faster than my own parser in v1.
Additionally is this module now a native node addon.
If you find a memory leak make sure to create an issue at this repo.
Contributions are welcome.

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
const con = mysql.createConnection(config.Get('mysql'));
...
```
## or

config.cfg
```ini
mysql_host: 127.0.0.1
mysql_user: root
mysql_password: test123
mysql_database: db
mysql_wait: no # no is equal with false and yes is equal with true
mysql_climit: 10
mysql_qlimit: 0
```
index.js
```js
const mysql = require('mysql2');
const { Config, Type } = require('cfg-reader');
const config = new Config('config.cfg');
const con = mysql.createConnection({
    host: config.GetOfType('mysql_host', Type.String),
    user: config.Get('mysql_user'),
    password: config.Get('mysql_password'),
    database: config.Get('mysql_database'),
    waitForConnections: config.GetOfType('mysql_wait', Type.Boolean),
    connectionLimit: config.GetOfType('mysql_climit', Type.Number),
    queueLimit: config.Get('mysql_qlimit')
});
...
```

[npm-image]: https://img.shields.io/npm/v/cfg-reader.svg
[npm-url]: https://npmjs.org/package/cfg-reader
[node-version-image]: http://img.shields.io/node/v/cfg-reader.svg
[node-version-url]: http://nodejs.org/download/
[downloads-image]: https://img.shields.io/npm/dm/cfg-reader.svg
[downloads-url]: https://npmjs.org/package/cfg-reader
