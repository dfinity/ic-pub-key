import { describe, expect, it } from 'vitest';
import { Sec1EncodedPublicKey } from '../secp256k1';

// Gets the test vectors:
import { loadTestVectors } from './test_vectors.test';

describe('Sec1EncodedPublicKey', () => {
	describe('fromHex', () => {
		it('should parse hex string', () => {
			let testVectors = loadTestVectors();
			const sample_hex_key = testVectors.ecdsa.secp256k1.test_vectors[0].public_key;
			const expectedPublicKey = Sec1EncodedPublicKey.fromHex(sample_hex_key);
			const actualPublicKey = Sec1EncodedPublicKey.fromString(sample_hex_key);
			expect(actualPublicKey).toEqual(expectedPublicKey);
		});
		it('should hex serialize back to the original key', () => {
			let testVectors = loadTestVectors();
			const sample_hex_key = testVectors.ecdsa.secp256k1.test_vectors[0].public_key;
			const parsed = Sec1EncodedPublicKey.fromHex(sample_hex_key);
			const serialized = parsed.asHex();
			expect(serialized).toEqual(sample_hex_key);
		});
	});
	describe('fromBlob', () => {
		it('should be able to serialize and parse as blob', () => {
			let testVectors = loadTestVectors();
			const sample_hex_key = testVectors.ecdsa.secp256k1.test_vectors[0].public_key;
			const key = Sec1EncodedPublicKey.fromHex(sample_hex_key);
			const serialized = key.asBlob();
			console.error(`serialized: '${serialized}'`);
			const parsed = Sec1EncodedPublicKey.fromBlob(serialized);
			expect(parsed).toEqual(key);
		});
	});
});
