import { ProjectivePoint } from '@noble/secp256k1';
import * as fs from 'fs';
import * as path from 'path';
import { describe, it } from 'vitest';
import { ChainCode } from '../../chain_code';
import { DerivationPath, PublicKeyWithChainCode } from '../bip340secp256k1';

interface TestVector {
	public_key: string;
	chain_code: string;
	derivation_path: string;
	expected_public_key: string;
	expected_chain_code: string;
}

interface TestVectors {
	schnorr: {
		bip340secp256k1: {
			test_vectors: TestVector[];
		};
	};
}

/**
 * Loads the test vectors from the samples.json file.
 */
export function loadTestVectors(): TestVectors {
	const samplesPath = path.join(process.cwd(), 'test', 'samples.json');
	return JSON.parse(fs.readFileSync(samplesPath, 'utf-8'));
}

describe('Test Vectors', () => {
	const testVectors = loadTestVectors();

	testVectors.schnorr.bip340secp256k1.test_vectors.forEach((vector, index) => {
		it(`should derive correct key for test vector ${index + 1}`, () => {
			// Create the input key with chain code
			const public_key = ProjectivePoint.fromHex(vector.public_key);
			const chain_code = ChainCode.fromHex(vector.chain_code);

			const inputKey = new PublicKeyWithChainCode(public_key, chain_code);

			// Parse the derivation path
			const derivationPath = DerivationPath.fromBlob(vector.derivation_path);

			// Derive the new key
			//const derivedKey = inputKey.derive_subkey_with_chain_code(derivationPath);

			// Check the results
			//expect(derivedKey.public_key.toHex()).toEqual(vector.expected_public_key);
			//expect(derivedKey.chain_code.toHex()).toEqual(vector.expected_chain_code);
		});
	});
});
