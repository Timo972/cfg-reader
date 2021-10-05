import typescript from '@rollup/plugin-typescript';

export default {
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
  external: ['fs/promises', 'fs', 'stream'],
  plugins: [
    typescript({
      allowJs: true,
      allowSyntheticDefaultImports: true,
      alwaysStrict: true,
      baseUrl: './',
      rootDir: './src',
      esModuleInterop: true,
      moduleResolution: "node"
    })
  ]
};
