module.exports = {
    extends: ['@wesp-up/eslint-config-react', '@wesp-up/eslint-config-react/jest-testing-library'],
    overrides: [
        {
            files: ['**/routes/**/*', '**/app/{entry,root}.*'],
            rules: {
                'import/no-default-export': 'off',
            },
        },
    ],
    rules: {
        'jsx-a11y/label-has-associated-control': ['error', { controlComponents: ['TextField'] }],
        'import/extensions': 'off',
    },
};
