import GetBinding from 'bindings';

const bindings = GetBinding("config");

export const Config = bindings.Config;
export const Type = bindings.Type;

export default bindings;