## cfg-reader

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Node.js Version][node-version-image]][node-version-url]
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/865f452f649248989b121761bda06fcc)](https://app.codacy.com/gh/Timo972/cfg-reader?utm_source=github.com&utm_medium=referral&utm_content=Timo972/cfg-reader&utm_campaign=Badge_Grade_Settings)

⚡⚡ Take a look at the @next version in [⚠dev branch⚠](https://github.com/Timo972/cfg-reader/tree/dev).
It got some API changes and is now based on the alt-config parser by the altMP Team.

## Installation

cfg-reader is free from native bindings and can be installed on Linux, Mac OS or Windows without any issues.

```bash
npm i --save cfg-reader
```

## How to use

```js
const Config = require('cfg-reader');
const config = new Config('./config.cfg');
config.get('some_property');
//with the get method you can easiely filter the lines you need
```

## Notice

 - The save method is not working rn
 - Commas at the end are optional
 - Inline keys are **not** supported (``mysql: { host: 127.0.0.1 }``) currently
 - For more information take a look at [alt:V Config docs](https://docs.altv.mp/articles/configs/index.html)

## Example

config.cfg
```cfg
mysql_host: 127.0.0.1,
mysql_user: root,
mysql_password: test123,
mysql_database: db
```
__or__
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
const config = new require('cfg-reader')('config.cfg');
const con = mysql.createConnection(config.get('mysql'));
...
```

## Todo
- [ ] create stringify method
- [ ] support inline dicts and lists

[npm-image]: https://img.shields.io/npm/v/cfg-reader.svg
[npm-url]: https://npmjs.org/package/cfg-reader
[node-version-image]: http://img.shields.io/node/v/cfg-reader.svg
[node-version-url]: http://nodejs.org/download/
[downloads-image]: https://img.shields.io/npm/dm/cfg-reader.svg
[downloads-url]: https://npmjs.org/package/cfg-reader
