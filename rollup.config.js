import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';

const format = 'es';
const common = {
  external: ['react', 'prop-types', 'immutable', 'redux'],
  plugins: [
    babel({
      exclude: 'node_modules/**',
      babelrc: false,
      presets: [
        [
          '@babel/preset-stage-2',
          {
            loose: true,
            useBuiltIns: true,
            decoratorsLegacy: true,
          },
        ],
        '@babel/preset-flow',
      ],
    }),
    uglify({}, minify),
  ],
};

export default [
  {
    input: 'source/index.js',
    output: {
      name: 'reform-redux',
      file: 'dist/reform-redux.js',
      format,
    },
    ...common,
  },
  {
    input: 'source/immutable.js',
    output: {
      name: 'reform-redux',
      file: 'dist/immutable.js',
      format,
    },
    ...common,
  },
];
