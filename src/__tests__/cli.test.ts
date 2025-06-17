import { execSync } from 'child_process';
import * as path from 'path';
import { describe, expect, it } from 'vitest';
import { program } from '../cli';
import { loadTestVectors } from '../ecdsa/secp256k1.tests/test_vectors.test';

describe('CLI', () => {
	const cliPath = path.join(process.cwd(), 'dist', 'main.js');

	/**
	 * Note: This directly calls the CLI and checks the output, however the test coverage report cannot capture which lines are tested.
	 */
	it('should show help message', () => {
		const output = execSync(`node ${cliPath} --help`).toString();
		expect(output).toContain('Tools for Internet Computer Protocol public keys');
	});

	/**
	 * Note: This uses mocks to provide test coverage reports.
	 */
	it('should show help message - mocked', () => {
		// Mock console.log
		const originalConsoleLog = console.log;
		let output = '';
		console.log = (msg: string) => {
			output += msg + '\n';
		};

		// Get help text without exiting
		const helpText = program.helpInformation();

		// Restore console.log
		console.log = originalConsoleLog;

		// Check that the help text contains expected content
		expect(helpText).toContain('Usage:');
		expect(helpText).toContain('ic-pub-key');
		expect(helpText).toContain('Tools for Internet Computer Protocol public keys');
		expect(helpText).toContain('Options:');
		expect(helpText).toContain('--version');
		expect(helpText).toContain('--help');
	});

	it('should derive ecdsa/secp256k1 public keys correctly', () => {
		// For every entry in the test vectors, verify that the output matches.
		const testVectors = loadTestVectors();
		testVectors.ecdsa.secp256k1.test_vectors.forEach((vector) => {
			let {
				name,
				public_key,
				chain_code,
				derivation_path,
				expected_public_key,
				expected_chain_code
			} = vector;
			let command = `node ${cliPath} derive ecdsa secp256k1 --pubkey ${public_key} --chaincode ${chain_code} --derivationpath ${derivation_path}`;
			console.log(command);
			const output = execSync(command).toString();
			const parsedOutput = JSON.parse(output);
			expect(parsedOutput.response, `Failed for vector ${name}: ${command}`).toEqual({
				public_key: expected_public_key,
				chain_code: expected_chain_code
			});
		});
	});
});
