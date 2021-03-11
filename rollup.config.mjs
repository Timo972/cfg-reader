import typescript from 'rollup-plugin-typescript2';

export default [
    {
        input: 'src/index.ts',
        output: {
            //dir: './dist/index.js',
            file: './dist/index.js',
            format: 'cjs',
        },
        plugins: [typescript()],
        external: [
            'fs',
            'path',
            'readline'
        ],
    },
    {
        input: 'src/index.ts',
        output: {
            //dir: './dist/index.esm.js',
            file: './dist/index.esm.mjs',
            format: 'esm',
        },
        plugins: [typescript()],
        external: [
            'fs',
            'path',
            'readline'
        ],
    },
];
