//import typescript from '@rollup/plugin-typescript';
import typescript from 'rollup-plugin-typescript2';
import dts from 'rollup-plugin-dts';

export default [{
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.mjs",
      format: "es",
    },
    {
      file: "dist/index.cjs",
      format: "cjs",
    },
  ],
  external: ['fs', 'stream', 'util'],
  plugins: [
    typescript({
      allowJs: true,
      allowSyntheticDefaultImports: true,
      alwaysStrict: true,
      baseUrl: './',
      rootDir: './src',
      esModuleInterop: true,
      moduleResolution: "node",
      declaration: true,
      declarationDir: './types'
    })
  ]
},
{
  input: "./dist/index.d.ts",
  output: [{
    file: "types/index.d.ts",
    format: "es"
  }],
  plugins: [dts()],
}
];

