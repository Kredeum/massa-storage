import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		open: true
	},
	resolve: {
		alias: {
			'$styles': fileURLToPath(new URL('./src/styles', import.meta.url))
		}
	},
	test: {
		include: ['test/unit/**/*.{t,spec}.{js,ts}'],
		environment: 'jsdom',
		setupFiles: ['src/setupTests.ts']
	}
});
