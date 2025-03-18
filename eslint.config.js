const javascriptPlugin = require('@eslint/js');
const stylisticPlugin = require('@stylistic/eslint-plugin-ts');
const typescriptPlugin = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const perfectionistPlugin = require('eslint-plugin-perfectionist');
const globals = require('globals');
const importOrderPlugin = require('eslint-plugin-import-order');
const prettier = require('eslint-config-prettier');

module.exports = [
  {
    files: ['sources/**/*.ts', 'tests/**/*.ts'],

    ignores: ['tests/test-utilities/graphql/graphql-sdk.ts', 'test_react/*'],

    languageOptions: {
      globals: {
        ...globals.mocha,
        ...globals.node,
      },

      parser: typescriptParser,

      parserOptions: {
        project: ['./tsconfig.json'],
      },
    },

    plugins: {
      '@stylistic': stylisticPlugin,
      '@typescript-eslint': typescriptPlugin,
      perfectionist: perfectionistPlugin,
      'import-order': importOrderPlugin,
    },

    rules: {
      ...javascriptPlugin.configs.recommended.rules,
      ...typescriptPlugin.configs.recommended.rules,

      '@typescript-eslint/array-type': ['error'],
      '@typescript-eslint/explicit-function-return-type': ['error'],
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          overrides: {
            properties: 'no-public',
          },
        },
      ],

      '@typescript-eslint/no-confusing-void-expression': ['error'],
      '@typescript-eslint/no-explicit-any': ['error'],
      '@typescript-eslint/no-inferrable-types': ['off'],
      '@typescript-eslint/no-namespace': ['off'],
      '@typescript-eslint/no-non-null-assertion': ['error'],

      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error'],

      '@typescript-eslint/prefer-readonly': ['error'],
      '@typescript-eslint/promise-function-async': ['error'],

      'require-await': 'off',
      '@typescript-eslint/require-await': ['error'],

      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/comma-spacing': ['error', { before: false, after: true }],

      indent: 'off',
      '@stylistic/indent': ['error', 2],

      'lines-between-class-members': 'off',
      '@stylistic/lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],

      '@stylistic/member-delimiter-style': ['error'],
      '@stylistic/object-curly-spacing': ['error', 'always'],

      'padding-line-between-statements': 'off',
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: ['const', 'let', 'var'] },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
        { blankLine: 'always', prev: '*', next: 'block' },
        { blankLine: 'always', prev: '*', next: 'return' },
      ],

      '@stylistic/semi': ['error'],
      '@stylistic/type-annotation-spacing': ['error'],

      'array-bracket-spacing': ['error'],
      camelcase: ['error', { properties: 'always' }],
      'comma-spacing': ['error'],
      'computed-property-spacing': ['error'],
      'eol-last': ['error', 'always'],
      eqeqeq: ['error'],
      'key-spacing': ['error'],
      'keyword-spacing': ['error'],
      'max-len': ['error', { code: 140 }],
      'no-dupe-class-members': 'off',
      'no-multi-spaces': ['error'],
      'no-multiple-empty-lines': ['error', { max: 1, maxBOF: 0, maxEOF: 0 }],
      'no-plusplus': ['error'],
      'no-redeclare': 'off',
      'no-return-await': ['error'],
      'no-trailing-spaces': ['error'],
      'object-shorthand': ['error'],
      quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      'semi-spacing': ['error'],

      'perfectionist/sort-imports': [
        'error',
        {
          type: 'natural',
          groups: [
            'builtin',
            'nestjs',
            'external',
            'internal-type',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
            'unknown',
          ],
          customGroups: {
            value: {
              nestjs: '@nestjs/.+',
              'common-core': ['@common/.+', '@core/.+'],
              'core-modules': '@core-module/.+',
              types: '@domain/[^/]+/types',
              services: '@domain/[^/]+/services/.+',
              controllers: '@domain/[^/]+/rest',
              dto: '@domain/[^/]+/rest/dto',
              'parent-5x': '\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/.*',
              'parent-4x': '\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/.*',
              'parent-3x': '\\.\\.\\/\\.\\.\\/\\.\\.\\/.*',
              'parent-2x': '\\.\\.\\/\\.\\.\\/.*',
              'index-file': '\\.\\/.*',
            },
          },
        },
      ],

      'perfectionist/sort-named-imports': ['error', { type: 'natural', ignoreCase: false, ignoreAlias: true }],
      'perfectionist/sort-exports': ['error', { type: 'natural' }],
      'perfectionist/sort-named-exports': ['error', { type: 'natural', ignoreCase: false }],

      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/semi': 'error',
    },
  },
  prettier,
];
