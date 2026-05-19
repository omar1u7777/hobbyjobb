// ESLint 9 — Flat Config
// Docs: https://eslint.org/docs/latest/use/configure/configuration-files

import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  // 1. Globala ignore-mönster (motsvarar gamla .eslintignore)
  {
    ignores: [
      'dist/**',
      'build/**',
      'coverage/**',
      'node_modules/**',
      '.vite/**',
      'public/**',
      '*.min.js',
    ],
  },

  // 2. Bas-regler från ESLint själv (recommended)
  js.configs.recommended,

  // 3. Recommended från React-pluginen (flat preset)
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'], // React 17+ JSX-transform: ingen "React in scope"-regel

  // 4. JSX-A11y recommended (flat preset)
  jsxA11y.flatConfigs.recommended,

  // 5. Projektspecifik konfiguration för käll-filer
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.es2024,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // React Hooks (eslint-plugin-react-hooks 5.x exporterar via "rules")
      ...reactHooks.configs.recommended.rules,

      // Stilval för det här projektet
      'react/prop-types': 'off',                      // Vi använder inte PropTypes
      'react/react-in-jsx-scope': 'off',              // React 17+ behöver inte importeras
      'no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // A11y — håll strikt men tillåt vanliga produktivitets-mönster
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
    },
  },

  // 6. Test-filer: Vitest-globala + lättare regler
  {
    files: [
      '**/*.test.{js,jsx}',
      '**/__tests__/**/*.{js,jsx}',
      '**/test/**/*.{js,jsx}',
      '**/setupTests.{js,jsx}',
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        // Vitest exponerar samma globaler som Jest
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        afterAll: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
    },
  },

  // 7. Konfigurationsfiler (eslint.config.js, vite.config.js, vitest.config.js)
  {
    files: ['*.config.{js,mjs}', 'vite.config.{js,mjs}', 'vitest.config.{js,mjs}'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
];
