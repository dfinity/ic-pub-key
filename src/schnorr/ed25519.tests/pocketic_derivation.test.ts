import { Principal } from '@dfinity/principal';
import { describe, expect, it } from 'vitest';
import { DerivationPath, PublicKeyWithChainCode } from '../ed25519';

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
			'Test Derivation For PocketIC Ed25519 key_1',
			'41a958daab5eded78e32e06be097ff85563a0d71230114bf52cfb7d633110393'
		);
	});

	it('should match test_key_1 derivation', () => {
		derivePocketIcKey(
			'test_key_1',
			'uzt4z-lp777-77774-qaabq-cai',
			'Test Derivation For PocketIC Ed25519 test_key_1',
			'6a0d9ea275f24797b451a42b824bda2a8576d35c73de08417092cbe0128849dc'
		);
	});

	it('should match dfx_test_key derivation', () => {
		derivePocketIcKey(
			'dfx_test_key',
			'uzt4z-lp777-77774-qaabq-cai',
			'Test Derivation For PocketIC Ed25519 dfx_test_key',
			'3e9346f7c29d9c3a651309edbf92afbe1ac2eb6c02f2d384f6c105a5b6e8c75f'
		);
	});
});
