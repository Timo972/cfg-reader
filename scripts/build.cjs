const path = require('path');
const { spawn } = require('child_process');

if(process.platform !== 'linux' && process.platform !== 'win32')
    throw new Error(`This platform (${process.platform}) does not support alt-node`);

const nodePath = process.platform === 'linux' ? './deps/alt-node' : path.join(__dirname, '..', 'deps', 'alt-node');

const proc = spawn(`npx node-gyp rebuild --nodedir ${nodePath}`, {
    cwd: process.cwd(),
    shell: true
});

proc.on('error', console.error);

proc.stdout.pipe(process.stdout);
proc.stderr.pipe(process.stderr);
process.stdin.pipe(proc.stdin);