import js from '@eslint/js';

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'smart'],
    },
  },
  {
    // Browser surface.
    files: ['src/main.js', 'src/favicon.js', 'src/input.js', 'src/page.js', 'src/renderer.js'],
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        performance: 'readonly',
        requestAnimationFrame: 'readonly',
        HTMLElement: 'readonly',
        HTMLLinkElement: 'readonly',
        HTMLCanvasElement: 'readonly',
        CanvasRenderingContext2D: 'readonly',
      },
    },
  },
  {
    // Engine touches Math.random; allow browser+node neutral globals.
    files: ['src/engine.js', 'src/raster.js', 'src/ascii.js', 'src/settings.js', 'src/checks.js'],
    languageOptions: { globals: { Math: 'readonly' } },
  },
  {
    // Node CLI surface.
    files: ['bin/**/*.js', 'src/cli.js', 'vite.config.js'],
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
      },
    },
  },
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        process: 'readonly',
      },
    },
  },
];
