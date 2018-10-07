module.exports = {
  "parser": "babel-eslint",
  "plugins": [
    "flowtype",
    "prettier"
  ],
  "env": {
    "browser": true,
    "node": true,
    "es6": true,
    "jest": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:flowtype/recommended",
    "plugin:prettier/recommended"
  ],
  "parserOptions": {
    "sourceType": "module"
  },
  "rules": {
    "flowtype/no-types-missing-file-annotation": 0,
    "prettier/prettier": ["error"],
    "strict": 0,
    "eol-last": [
      "error",
      "always"
    ],
    "indent": 0,
    "linebreak-style": [
      "error",
      "unix"
    ],
    "quotes": 0,
    "semi": [
      "error",
      "always"
    ]
  }
};
