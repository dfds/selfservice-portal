module.exports = {
  rules: {
    'import/no-extraneous-dependencies': 'off',
    'react/no-unknown-property': ['error', { ignore: ['css'] }],
    '@typescript-eslint/no-unsafe-argument': 'off', // TODO: Consider eabling
  },
}
