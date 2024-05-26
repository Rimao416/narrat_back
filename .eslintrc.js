module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  ignorePatterns: ['.eslintrc.js'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    'no-console': 'warn',
     '@typescript-eslint/no-explicit-any': 'off',
  },
};

// {
//     "extends": ["airbnb", "prettier", "plugin:node/recommended"],
//     "plugins": ["prettier"],
//     "rules": {

//     }
//   }
