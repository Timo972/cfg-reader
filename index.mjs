
import GetBinding from 'bindings';

const altNode = process.execArgv.includes('altv-resource');

const bindings = !altNode ? GetBinding("config") : GetBinding("config_alt");

export const Config = bindings.Config;
export const Type = bindings.Type;

export default bindings;