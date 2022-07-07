import swc from 'unplugin-swc'

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
  external: [],
  plugins: [
    swc.rollup({
      tsconfigFile: './tsconfig.json',    
    }),
  ]
}];

