import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { describe, expect, it } from 'vitest';
import * as z from 'zod/v4';
import { program } from '../cli';
import { loadTestVectors as loadEllipticCurveTestVectors } from '../ecdsa/secp256k1.tests/test_vectors.test';
import { CliTestVectorsSchema } from './cli_test_vectors.schema';

type CliTestVectors = z.infer<typeof CliTestVectorsSchema>;

/**
 * Loads the cli test vectors
 */
export function loadCliTestVectors(): CliTestVectors {
	const cliTestVectorsPath = path.join(process.cwd(), 'test', 'cli.json');

	const cliTestVectorsContent = fs.readFileSync(cliTestVectorsPath, 'utf-8');
	const { success, data, error } = CliTestVectorsSchema.safeParse(
		JSON.parse(cliTestVectorsContent)
	);

	if (!success) {
		throw new Error(`Invalid CLI test vectors: ${JSON.stringify(error, null, 2)}`);
	}

	return data;
}

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
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
		const testVectors = loadEllipticCurveTestVectors();
		testVectors.ecdsa.secp256k1.test_vectors.forEach((vector) => {
			const {
				name,
				public_key,
				chain_code,
				derivation_path,
				expected_public_key,
				expected_chain_code
			} = vector;
			let command = `node ${cliPath} derive ecdsa secp256k1 --pubkey ${public_key} --chaincode ${chain_code}`;
			if (derivation_path !== null) {
				command += ` --derivationpath ${derivation_path}`;
			}
			console.log(command);
			const output = execSync(command).toString();
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const parsedOutput = JSON.parse(output);
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			expect(parsedOutput.response, `Failed for vector ${name}: ${command}`).toEqual({
				public_key: expected_public_key,
				chain_code: expected_chain_code
			});
		});
	});

	it('should derive btc address correctly', () => {
		const testVectors = loadCliTestVectors()['signer']['btc']['address'];
		testVectors.forEach((vector) => {
			const { name, args, request, response } = vector;
			const output = execSync(`node ${cliPath} signer btc address ${args.join(' ')}`).toString();
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const parsedOutput = JSON.parse(output);
			expect(parsedOutput, `Failed for vector ${name}: ${args.join(' ')}`).toEqual({
				request,
				response
			});
		});
	});

	it('should derive eth address correctly', () => {
		const testVectors = loadCliTestVectors()['signer']['eth']['address'];
		testVectors.forEach((vector) => {
			const { name, args, request, response } = vector;
			const output = execSync(`node ${cliPath} signer eth address ${args.join(' ')}`).toString();
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const parsedOutput = JSON.parse(output);
			expect(parsedOutput, `Failed for vector ${name}: ${args.join(' ')}`).toEqual({
				request,

				response
			});
		});
	});
});
