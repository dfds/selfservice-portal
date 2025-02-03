module.exports = {
  root: true,

  parser: '@typescript-eslint/parser',
  extends: ['eslint:recommended'],

  rules: {
    'no-irregular-whitespace': [
      'warn',
      {
        skipComments: true,
        skipRegExps: true,
        skipTemplates: true,
      },
    ],
    'no-extra-boolean-cast': 'off', // TODO: this will trigger in a few files. Consider enabling
  },

  settings: {
    react: {
      version: 'detect',
    },
    'import/extensions': ['.ts', '.tsx', '.d.ts', '.js', '.jsx'],

    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx', '.d.ts'],
    },

    'import/resolver': {
      typescript: { alwaysTryTypes: true },
    },
  },

  overrides: [
    // typescript overrides
    {
      files: ['*.ts', '*.tsx'],
      plugins: ['@typescript-eslint', 'react-hooks', 'simple-import-sort', 'import', 'deprecation'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:react/recommended',
      ],
      rules: {
        'prefer-rest-params': 'off',
        'no-console': 'warn',
        // prevent import of modules from other packages in the workspace using relative paths
        'no-restricted-imports': [
          'error',
          {
            patterns: ['../**/src'],
          },
        ],

        // Ordering of imports
        'sort-imports': 'off', // turned off since we use simple-import-sort to handle ordering
        'import/order': 'off', // turned off since we use simple-import-sort to handle ordering
        'simple-import-sort/sort': 'off',
        'import/no-extraneous-dependencies': 'error',
        'import/no-named-as-default-member': 'off', // TODO: consider enable this?
        'import/no-named-as-default': 'off', // TODO: consider enable this?
        'import/default': 'off',
        'import/export': 'error',
        'import/no-unresolved': ['error'],
        'import/namespace': ['error', { allowComputed: true }],

        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/member-delimiter-style': [
          'warn',
          {
            multiline: {
              delimiter: 'none',
              requireLast: false,
            },
            singleline: {
              delimiter: 'semi',
              requireLast: false,
            },
          },
        ],
        '@typescript-eslint/interface-name-prefix': ['warn', { prefixWithI: 'always' }],
        '@typescript-eslint/no-use-before-define': 'off', // TODO: maybe enable this?
        '@typescript-eslint/no-explicit-any': 'off',
        //TODO: use naming-convention
        //'@typescript-eslint/camelcase': 'warn',
        '@typescript-eslint/type-annotation-spacing': 'warn',
        //TODO: use ban-ts-comment
        //'@typescript-eslint/ban-ts-ignore': 'error',

        '@typescript-eslint/explicit-module-boundary-types': 'off', // TODO: TS4 consider enabling
        '@typescript-eslint/no-unsafe-argument': 'off', // TODO: Consider eabling
        '@typescript-eslint/no-unsafe-assignment': 'off', // TODO: TS4 consider enabling
        '@typescript-eslint/no-unsafe-call': 'off', // TODO: TS4 consider enabling
        '@typescript-eslint/no-unsafe-member-access': 'off', // TODO: TS4 consider enabling
        '@typescript-eslint/no-unsafe-return': 'off', // TODO: TS4 consider enabling
        '@typescript-eslint/restrict-template-expressions': 'off',
        '@typescript-eslint/no-misused-promises': 'error',

        // TODO: enable this again when babel-lint supports it
        // Using babel-eslint (v11 beta ATTOW) as the parser have issues with this rule so it's disabled
        // The rule is currently covered by 'noUnusedLocals' in tsconfig.json
        // https://github.com/babel/babel-eslint/milestone/1
        '@typescript-eslint/no-unused-vars': [
          'off',
          {
            vars: 'all',
            args: 'after-used',
            ignoreRestSiblings: false,
            argsIgnorePattern: '^_',
          },
        ],

        'react/display-name': 'off',
        'react/prop-types': 'off',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        'react/no-unescaped-entities': 'off', // TODO: maybe enable this?
        'react/no-unknown-property': ['error', { ignore: ['css'] }],
        'react/jsx-no-literals': 'off', // TODO: maybe enable this?

        'deprecation/deprecation': 'warn',
      },
    },
    // javascript overrides
    {
      files: ['*.js'],
      env: {
        node: true,
      },
    },
    {
      files: ['scripts/jest/setup.js'],
      env: {
        browser: true,
      },
    },
  ],
}
