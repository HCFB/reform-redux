import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';
import nodeResolve from 'rollup-plugin-node-resolve';

const common = {
  external: ['react', 'prop-types', 'immutable', 'redux'],
  plugins: [
    babel({
      exclude: 'node_modules/**',
      babelrc: false,
      presets: [
        [
          '@babel/preset-env',
          {
            targets: 'last 2 version',
          },
        ],
        '@babel/preset-flow',
      ],
      plugins: ['@babel/plugin-proposal-class-properties'],
    }),
    uglify({}, minify),
  ],
};

export default [
  // ES modules

  {
    ...common,
    input: 'source/index.js',
    output: {
      name: 'reform-redux',
      file: 'dist/reform-redux.es.js',
      format: 'es',
    },
  },
  {
    ...common,
    input: 'source/immutable.js',
    output: {
      name: 'reform-redux',
      file: 'dist/immutable.es.js',
      format: 'es',
    },
  },

  // CommonJS

  {
    ...common,
    input: 'source/index.js',
    output: {
      name: 'reform-redux',
      file: 'dist/reform-redux.js',
      format: 'cjs',
    },
    plugins: [...common.plugins, nodeResolve(), commonjs()],
  },
  {
    ...common,
    input: 'source/immutable.js',
    output: {
      name: 'reform-redux',
      file: 'dist/immutable.js',
      format: 'cjs',
    },
    plugins: [...common.plugins, nodeResolve(), commonjs()],
  },
];
