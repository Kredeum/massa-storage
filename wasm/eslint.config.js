import typescriptParser from '@typescript-eslint/parser';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';

export default [
  {
    // Global rules for all files
    files: ['**/*.js', '**/*.ts'],
    rules: {
      'no-console': 'off',
    }
  },
  {
    // AssemblyScript files
    files: ['assembly/**/*.ts'],
    ignores: ['assembly/**/*.d.ts'], // Ignore type declaration files
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin
    },
    rules: {
      ...typescriptPlugin.configs.recommended.rules,
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/ban-types': 'off',
      'no-var': 'error',
      'prefer-const': 'error',
      // More lenient rules for AssemblyScript files
      '@typescript-eslint/no-unused-vars': 'off' // AssemblyScript often has implicit uses
    }
  },
  {
    // Test files
    files: ['assembly/__tests__/**/*.ts', 'assembly/**/*.spec.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin
    },
    rules: {
      ...typescriptPlugin.configs.recommended.rules,
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/ban-types': 'off',
      'no-var': 'error',
      'prefer-const': 'error',
      // More relaxed rules for test files
      '@typescript-eslint/no-unused-vars': 'off'
    }
  },
  {
    // Regular TypeScript files
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json'
      }
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin
    },
    rules: {
      ...typescriptPlugin.configs.recommended.rules,
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      'no-var': 'error',
      'prefer-const': 'error',
      // Allow unused vars prefixed with underscore
      '@typescript-eslint/no-unused-vars': ['error', { 
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_'
      }]
    }
  }
];
