
import GetBinding from 'bindings';

const altNode = process.moduleLoadList.includes('NativeModule alt');

const bindings = altNode ? GetBinding("config") : GetBinding("config_alt");

export const Config = bindings.Config;
export const Type = bindings.Type;

export default bindings;