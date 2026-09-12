import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'

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
  },
  {
    files: ['src/shared/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    ignores: [
      'src/features/**/*.test.ts',
      'src/features/**/*.test.tsx',
      'src/features/**/*TestSetup.ts',
      'src/features/**/*TestSetup.tsx',
      'src/features/export/backupActions.ts',
      'src/features/export/csvActions.ts',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'dexie',
              message:
                'Features must not import Dexie. Use backup/csv action modules.',
            },
          ],
          patterns: [
            {
              group: [
                '@/infrastructure/persistence/indexeddb',
                '@/infrastructure/persistence/indexeddb/**',
              ],
              message:
                'Features must not import IndexedDB. Use backup/csv action modules.',
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
