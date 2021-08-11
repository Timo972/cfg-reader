
import GetBinding from 'bindings';
import NodeGypBuild from 'node-gyp-build';

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const altNode = process.execArgv.includes('altv-resource');

const bindings = !altNode ? NodeGypBuild(__dirname) : GetBinding("config_alt");

export const Config = bindings.Config;
export const Type = bindings.Type;

export default bindings;