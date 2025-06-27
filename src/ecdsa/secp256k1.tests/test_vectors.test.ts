import * as fs from 'fs';
import * as path from 'path';
import { describe, expect, it } from 'vitest';
import {
	ChainCode,
	DerivationPath,
	PublicKeyWithChainCode,
	Sec1EncodedPublicKey
} from '../secp256k1';

interface TestVector {
	name: string;
	public_key: string;
	chain_code: string;
	derivation_path: string;
	expected_public_key: string;
	expected_chain_code: string;
}

interface TestVectors {
	ecdsa: {
		secp256k1: {
			test_vectors: TestVector[]; // Populated by `loadTestVectors()`.
		};
	};
}

/**
 * Loads the test vectors from the samples.json file.
 */
export function loadTestVectors(): TestVectors {
	const samplesPath = path.join(process.cwd(), 'test', 'samples.json');
	return JSON.parse(fs.readFileSync(samplesPath, 'utf-8')) as TestVectors;
}

describe('Test Vectors', () => {
	const testVectors = loadTestVectors();

	testVectors.ecdsa.secp256k1.test_vectors.forEach((vector) => {
		it(`should derive correct key for test vector ${vector.name}`, () => {
			// Create the input key with chain code
			const public_key = new Sec1EncodedPublicKey(Buffer.from(vector.public_key, 'hex'));
			const chain_code = ChainCode.fromHex(vector.chain_code);
			const inputKey = new PublicKeyWithChainCode(public_key, chain_code);

			// Parse the derivation path
			const derivationPath = DerivationPath.fromBlob(vector.derivation_path);

			// Derive the new key
			const derivedKey = inputKey.deriveSubkeyWithChainCode(derivationPath);

			// Check the results
			expect(derivedKey.public_key.toHex()).toEqual(vector.expected_public_key);
			expect(derivedKey.chain_code.toHex()).toEqual(vector.expected_chain_code);
		});
	});
});
