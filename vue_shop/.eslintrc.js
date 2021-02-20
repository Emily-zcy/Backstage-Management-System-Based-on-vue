module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'space-before-function-paren': 0,
    'object-curly-newline': 0,
    'no-trailing-spaces': 0,
    'indent': 0,
    'object-property-newline': 0,
    'eol-last': 0,
    'vue/no-unused-vars': 0,
    'func-call-spacing': 0,
    'keyword-spacing': 0
  }
}
