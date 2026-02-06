import eslintPluginTs from '@typescript-eslint/eslint-plugin';
import parserTs from '@typescript-eslint/parser';

export default [
    {
        ignores: [
            'node_modules/**',
            'dist/**',
            'src/views/**'
        ]
    },
    {
        files: ['src/**/*.ts', 'test/**/*.test.ts'],
        languageOptions: {
            parser: parserTs,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module'
            },
            globals: {
                jest: true
            }
        },
        plugins: {
            '@typescript-eslint': eslintPluginTs
        },
        rules: {
            indent: ['error', 4],
            quotes: ['error', 'double', { allowTemplateLiterals: true }],
            semi: ['error', 'always'],
            'no-unused-vars': 'off',
            'import/first': 'off',
            '@typescript-eslint/no-unused-vars': ['warn'],
            'padded-blocks': 'off'
        }
    },
    {
        files: ['test/**/*.test.ts'],
        rules: {
            'no-unused-expressions': 'off'
        }
    }
];