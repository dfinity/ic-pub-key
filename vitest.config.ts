import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			include: ['src/**/*.ts'],
			exclude: ['**/*.d.ts', '**/*.test.ts'],
			all: true,
			thresholds: {
				branches: 80,
				functions: 80,
				lines: 80,
				statements: 80
			}
		}
	}
});
