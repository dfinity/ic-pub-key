import { Principal } from '@dfinity/principal';
import { describe, expect, it } from 'vitest';
import { DerivationPath, PublicKeyWithChainCode } from '../bip340secp256k1';

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
			'Test Derivation For PocketIC Bip340secp256k1 key_1',
			'024f77f16549f46e56ef2d33223487dddce3ca4fab7368e2b2cb5c03286d59756a'
		);
	});

	it('should match test_key_1 derivation', () => {
		derivePocketIcKey(
			'test_key_1',
			'uzt4z-lp777-77774-qaabq-cai',
			'Test Derivation For PocketIC Bip340secp256k1 test_key_1',
			'029b3356b7f6070eb611f88a9a0ea1071131269ed4a6765ce8809796d048aafb33'
		);
	});

	it('should match dfx_test_key derivation', () => {
		derivePocketIcKey(
			'dfx_test_key',
			'uzt4z-lp777-77774-qaabq-cai',
			'Test Derivation For PocketIC Bip340secp256k1 dfx_test_key',
			'02cf1cf363bf09db82d48a8e18a58abbc7d95a9c9e85167a6cc5dea5d81cac2904'
		);
	});

	it('should raise an error for any other key', () => {
		expect(() => PublicKeyWithChainCode.forPocketIcKey('another-key')).toThrowError(
			'Unknown master public key id'
		);
	});
});
