import { defineConfig, transformWithOxc } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import react from '@vitejs/plugin-react';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => ({
  base: './',
  resolve: {
    ...(mode === 'angular' ? { mainFields: ['module'] } : {}),
  },
  plugins: [
    ...(mode === 'angular' ? [{
      name: 'angular-build-tsx',
      enforce: 'pre' as const,
      transform: (code: string, id: string) => /\.tsx(?:\?|$)/.test(id)
        ? transformWithOxc(code, id, { lang: 'tsx', jsx: { runtime: 'automatic' } })
        : undefined,
    }, angular()] : []),
    react(),
    vue({ template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith('revo-') || tag.startsWith('revogr-') } } }),
  ],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'recipes/**/*.test.ts'],
    exclude: ['tests/e2e/**'],
    server: { deps: { inline: true } },
  },
}));
