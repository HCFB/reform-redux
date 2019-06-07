import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';
import nodeResolve from 'rollup-plugin-node-resolve';

const common = {
  external: [
    'react',
    'prop-types',
    'redux',
    'react-redux',
    'lodash/debounce',
    'lodash/get',
    'lodash/isEqual',
    // polyfills
    'core-js/modules/web.timers',
    'core-js/modules/web.dom.iterable',
    'core-js/modules/web.immediate',
  ],
  plugins: [
    babel({
      exclude: 'node_modules/**',
      babelrc: false,
      presets: [
        [
          '@babel/preset-env',
          {
            targets: 'last 3 Chrome versions',
            useBuiltIns: 'entry',
          },
        ],
        '@babel/preset-react',
      ],
      plugins: ['@babel/plugin-proposal-class-properties', '@babel/proposal-optional-chaining'],
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
      file: 'reform-redux.es.js',
      format: 'es',
    },
  },

  // CommonJS

  {
    ...common,
    input: 'source/index.js',
    output: {
      name: 'reform-redux',
      file: 'reform-redux.js',
      format: 'cjs',
    },
    plugins: [...common.plugins, nodeResolve(), commonjs()],
  },
];
