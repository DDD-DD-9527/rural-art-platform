module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true
  },
  extends: ['eslint:recommended', 'plugin:vue/vue3-essential', '@vue/eslint-config-prettier'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  ignorePatterns: ['dist/**', 'backend/**', 'mongodb-backup/**'],
  rules: {
    'no-unused-vars': 'off',
    'vue/no-unused-vars': 'off',
    'vue/no-mutating-props': 'off'
  }
}

