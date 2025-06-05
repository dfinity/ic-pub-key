import { execSync } from 'child_process';
import * as path from 'path';
import { describe, expect, it } from 'vitest';

describe('CLI', () => {
	const cliPath = path.join(process.cwd(), 'dist', 'cli.js');

	it('should show help message', () => {
		const output = execSync(`node ${cliPath} --help`).toString();
		expect(output).toContain('Tools for Internet Computer Protocol public keys');
	});
});
