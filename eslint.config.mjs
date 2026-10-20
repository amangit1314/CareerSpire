import nextConfig from 'eslint-config-next';

// Next.js 16 dropped the built-in `next lint` command, so ESLint now runs
// directly via `eslint .` (see package.json's "lint" script). This flat
// config replaces the old .eslintrc.json equivalent.
export default [
    ...nextConfig,
    {
        // .claude/** is Claude Code tooling config, not app source.
        ignores: ['.next/**', 'node_modules/**', 'dist/**', 'build/**', '.claude/**'],
    },
];
