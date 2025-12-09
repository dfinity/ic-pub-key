import { Principal } from '@dfinity/principal';
import { describe, expect, it } from 'vitest';
import { DerivationPath, PublicKeyWithChainCode } from '../secp256k1';

function encodeTestPath(input: string): Uint8Array[] {
	return input.split(' ').map((str) => new TextEncoder().encode(str));
}

function derivePocketIcKey(
	keyId: string,
	canisterString: string,
	testPath: string,
	expected: string
) {
	const mk = PublicKeyWithChainCode.forPocketIcKey(keyId);
	const canisterId = Principal.fromText(canisterString);
	const path = DerivationPath.withCanisterPrefix(canisterId, encodeTestPath(testPath));

	// Derive the new key
	const derivedKey = mk.deriveSubkeyWithChainCode(path);

	// Check the results
	expect(derivedKey.public_key.toHex()).toEqual(expected);
}

describe('PocketIC Derivation', () => {
	it('should match key_1 derivation', () => {
		derivePocketIcKey(
			'key_1',
			'uzt4z-lp777-77774-qaabq-cai',
			'Test Derivation For PocketIC ECDSA secp256k1 key_1',
			'03bca84b5629dc70a37cadb5b3cda0bfc35abc5658f1d9bf8335b10199785a3836'
		);
	});

	it('should match test_key_1 derivation', () => {
		derivePocketIcKey(
			'test_key_1',
			'uzt4z-lp777-77774-qaabq-cai',
			'Test Derivation For PocketIC ECDSA secp256k1 test_key_1',
			'022ff35c84bd4cf899707789cfe5db76ce4a650563e678c53e8b128cb4bf4c3763'
		);
	});

	it('should match dfx_test_key derivation', () => {
		derivePocketIcKey(
			'dfx_test_key',
			'uzt4z-lp777-77774-qaabq-cai',
			'Test Derivation For PocketIC ECDSA secp256k1 dfx_test_key',
			'03f005cf69911ae75f622ce0a621ccddba1a30ea1f6c3d67dd56acbbddb88a9374'
		);
	});

	it('should raise an error for any other key', () => {
		expect(() => PublicKeyWithChainCode.forPocketIcKey('another-key')).toThrowError(
			'Unknown master public key id'
		);
	});
});
