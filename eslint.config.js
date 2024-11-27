const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const prettierConfig = require('eslint-config-prettier');
const airbnbConfig = require('eslint-config-airbnb-typescript/base');


// https://eslint.org/docs/rules
// https://typescript-eslint.io/rules
module.exports = {
    languageOptions: {
        parser: tsParser,
        parserOptions: {
            tsconfigRootDir: __dirname,
            project: './tsconfig.json',
        },
    },
    plugins:{
        '@typescript-eslint': tsPlugin
    },
    ignores: [
        '.eslintrc.js',
        'dist/**',
        'config/**',
    ],
    files: ['**/*.ts', '**/*.tsx'], 
    rules: {
        ...airbnbConfig.extends.rules,
        ...prettierConfig.rules,
        indent: 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'error',
        'react/jsx-filename-extension': 0,
        'import/extensions': 0,
        'import/no-extraneous-dependencies': 0,
        'no-multiple-empty-lines': [
            'error',
            {
                max: 1,
                maxBOF: 0,
                maxEOF: 0,
            },
        ],
        'lines-between-class-members': ['error', 'always', {
            exceptAfterSingleLine: true
        }],
        '@typescript-eslint/no-unused-vars': [
            'error',
            {
                vars: 'all',
                args: 'after-used',
                ignoreRestSiblings: true,
                argsIgnorePattern: '_',
                varsIgnorePattern: '(^_|Mock*|^[A-Z])', 
            },
        ],
        '@typescript-eslint/member-ordering': [
            'error',
            {
                default: [
                    'public-static-field',
                    'protected-static-field',
                    'private-static-field',
                    'public-static-method',
                    'protected-static-method',
                    'private-static-method',
                    'public-instance-field',
                    'protected-instance-field',
                    'private-instance-field',
                    'public-constructor',
                    'protected-constructor',
                    'private-constructor',
                    'public-set',
                    'public-get',
                    'public-instance-method',
                    'protected-set',
                    'protected-get',
                    'protected-instance-method',
                    'private-set',
                    'private-get',
                    'private-instance-method',
                ],
            },
        ],
    },
};
