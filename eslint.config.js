import js from '@eslint/js'
import globals from 'globals'
import { createNodeResolver, importX } from 'eslint-plugin-import-x'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'

const featureTestIgnores = [
  'src/features/**/*.test.ts',
  'src/features/**/*.test.tsx',
  'src/features/**/*TestSetup.ts',
  'src/features/**/*TestSetup.tsx',
]

export default tseslint.config(
  { ignores: ['dist', 'android', 'ios', '**/*.d.ts'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    plugins: {
      'import-x': importX,
    },
    settings: {
      'import-x/resolver-next': [
        createNodeResolver({
          extensions: ['.ts', '.tsx', '.js', '.jsx'],
        }),
      ],
    },
  },
  {
    files: ['src/shared/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: ['src/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              message: 'domain must stay free of React, Zustand, and Dexie.',
            },
            {
              name: 'react-dom',
              message: 'domain must stay free of React, Zustand, and Dexie.',
            },
            {
              name: 'zustand',
              message: 'domain must stay free of React, Zustand, and Dexie.',
            },
            {
              name: 'dexie',
              message: 'domain must stay free of React, Zustand, and Dexie.',
            },
          ],
          patterns: [
            {
              group: ['react/*', 'react-dom/*', 'zustand/*', 'dexie/*'],
              message: 'domain must stay free of React, Zustand, and Dexie.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    ignores: featureTestIgnores,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'dexie',
              message:
                'Features must not import persistence. Use stores or domain repository interfaces.',
            },
          ],
          patterns: [
            {
              group: [
                '@/infrastructure/persistence',
                '@/infrastructure/persistence/**',
                '**/infrastructure/persistence',
                '**/infrastructure/persistence/**',
              ],
              message:
                'Features must not import persistence. Use stores or domain repository interfaces.',
            },
          ],
        },
      ],
      'import-x/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/features',
              from: './src/infrastructure/persistence',
              message:
                'Features must not import persistence. Use stores or domain repository interfaces.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}', 'src/app/**/*.{ts,tsx}'],
    ignores: ['src/data/**', '**/*.test.*'],
    rules: {
      'max-lines': ['warn', { max: 500 }],
    },
  },
  eslintConfigPrettier,
)
