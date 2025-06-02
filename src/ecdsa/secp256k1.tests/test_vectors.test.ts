import * as fs from 'fs';
import * as path from 'path';
import { describe, expect, it } from 'vitest';
import {
	ChainCode,
	DerivationPath,
	derive_public_key,
	PublicKeyWithChainCode,
	Sec1EncodedPublicKey
} from '../secp256k1';

interface TestVector {
	'public-key': string;
	'chain-code': string;
	'derivation-path': string;
	'expected-public-key': string;
	'expected-chain-code': string;
}

interface TestVectors {
	ecdsa: {
		secp256k1: {
			'test-vectors': TestVector[];
		};
	};
}

/**
 * Loads the test vectors from the samples.json file.
 */
function loadTestVectors(): TestVectors {
	const samplesPath = path.join(process.cwd(), 'test', 'samples.json');
	return JSON.parse(fs.readFileSync(samplesPath, 'utf-8'));
}

describe('Test Vectors', () => {
	const testVectors = loadTestVectors();

	testVectors.ecdsa.secp256k1['test-vectors'].forEach((vector, index) => {
		it(`should derive correct key for test vector ${index + 1}`, () => {
			// Create the input key with chain code
			const public_key = Sec1EncodedPublicKey.fromHex(vector['public-key']);
			const chain_code = ChainCode.fromHex(vector['chain-code']);

			const inputKey = new PublicKeyWithChainCode(public_key, chain_code);

			// Parse the derivation path
			const derivationPath = DerivationPath.fromBlob(vector['derivation-path']);

			// Derive the new key
			const derivedKey = derive_public_key(inputKey, derivationPath);

			// Check the results
			let expected_public_key = Sec1EncodedPublicKey.fromHex(vector['expected-public-key']);
			let expected_chain_code = ChainCode.fromHex(vector['expected-chain-code']);
			expect(derivedKey.public_key).toEqual(expected_public_key);
			expect(derivedKey.chain_code).toEqual(expected_chain_code);
		});
	});
});
