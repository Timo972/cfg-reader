import swc from 'unplugin-swc'
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
    swc.rollup({
      tsconfigFile: './tsconfig.json',
    }),
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

