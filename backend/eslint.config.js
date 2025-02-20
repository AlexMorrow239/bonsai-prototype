import { createRequire } from 'module';

import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';

const require = createRequire(import.meta.url);
const importResolverTypescript = require('eslint-import-resolver-typescript');
const importResolverAlias = require('eslint-import-resolver-alias');

export default [
  eslint.configs.recommended,
  {
    files: ['**/*.ts'],
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '*.config.js',
      '*.config.ts',
    ],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
      globals: {
        node: true,
        jest: true,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-unsafe-declaration-merging': 'off',
      'import/order': 'off',
      'sort-imports': 'off',
      'prettier/prettier': ['error', {}, { usePrettierrc: true }],
      'import/no-unresolved': 'error',
      'import/prefer-default-export': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],
      'no-return-await': 'off',
      'require-await': 'error',
    },
    settings: {
      'import/resolver': {
        [importResolverTypescript.name]: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: {
          paths: ['.'],
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          moduleDirectory: ['node_modules', 'src/'],
        },
        [importResolverAlias.name]: {
          map: [
            ['@', './src'],
            ['@test', './test'],
            ['@common', './src/common'],
            ['@modules', './src/modules'],
            ['@filters', './src/common/filters'],
            ['@pipes', './src/common/pipes'],
            ['@swagger', './src/common/docs'],
            ['@validators', './src/common/validators'],
          ],
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        },
      },
    },
  },
];
