const assert = require('assert').strict;
const { spawn } = require("child_process");

if(process.platform !== 'linux' && process.platform !== 'win32')
    throw new Error(`This platform (${process.platform}) does not support alt-node`);

describe('Check compability with alt:V JS Runtime', () => {
    it("Install alt:V Server", (done) => {
        spawn("npx altv-srv --dir test --branch dev --js", {
            cwd: process.cwd(),
            shell: true
        }).on('exit', (code, signal) => {
            assert.strictEqual(code, 0, "Could not install alt:V Server");
            done();
        });
    });
    it("Run alt:V Server without problems", (done) => {
        spawn(`${process.platform === 'linux' ? './altv-server' : 'altv-server.exe'}`, {
            cwd: __dirname,
            shell: true
        }).on('exit', (code, signal) => {
            assert.strictEqual(code, 0, "Error occured while running");
            done();
        }).on('error', (code) => {
            throw new Error(code);
        });
    });
});