module.exports = {
  "parser": "babel-eslint",
  "plugins": [
    "prettier",
    "react-hooks"
  ],
  "env": {
    "browser": true,
    "node": true,
    "es6": true,
    "jest": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:prettier/recommended",
    "plugin:react/recommended"
  ],
  "parserOptions": {
    "sourceType": "module"
  },
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react/display-name": "off",
    "react-hooks/exhaustive-deps": "warn",
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
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
};
