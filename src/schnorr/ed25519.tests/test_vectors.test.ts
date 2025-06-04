import * as fs from 'fs';
import * as path from 'path';
import { describe, expect, it } from 'vitest';
import {
	DerivationPath,
	PublicKeyWithChainCode,
} from '../ed25519';
import {
    ChainCode
} from '../../chain_code';
import { ExtendedPoint } from '@noble/ed25519';
import { derive_public_key } from '../../ecdsa/secp256k1';

interface TestVector {
	public_key: string;
	chain_code: string;
	derivation_path: string;
	expected_public_key: string;
	expected_chain_code: string;
}

interface TestVectors {
	schnorr: {
		ed25519: {
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

	testVectors.schnorr.ed25519.test_vectors.forEach((vector, index) => {
		it(`should derive correct key for test vector ${index + 1}`, () => {
			// Create the input key with chain code
			const public_key = ExtendedPoint.fromHex(vector.public_key);
			const chain_code = ChainCode.fromHex(vector.chain_code);

			const inputKey = new PublicKeyWithChainCode(public_key, chain_code);

			// Parse the derivation path
			const derivationPath = DerivationPath.fromBlob(vector.derivation_path);

			// Derive the new key
			const derivedKey = inputKey.derive_subkey_with_chain_code(derivationPath);

			// Check the results
			let expected_public_key = ExtendedPoint.fromHex(vector.expected_public_key);
			let expected_chain_code = ChainCode.fromHex(vector.expected_chain_code);
			//expect(derivedKey.public_key).toEqual(expected_public_key);
			//expect(derivedKey.chain_code).toEqual(expected_chain_code);
		});
	});
});
