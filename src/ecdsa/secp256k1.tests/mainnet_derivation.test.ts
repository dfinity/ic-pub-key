import { Principal } from '@dfinity/principal';
import { describe, expect, it } from 'vitest';
import { DerivationPath, PublicKeyWithChainCode } from '../secp256k1';

describe('Mainnet Derivation', () => {
	it('should match mainnet test_key_1 derivation', () => {
		const mk = PublicKeyWithChainCode.forMainnetKey('test_key_1');
		const canisterId = Principal.fromText('h5jwf-5iaaa-aaaan-qmvoa-cai');
		const path = DerivationPath.withCanisterPrefix(canisterId, [
			Buffer.from('48656C6C6F', 'hex'),
			Buffer.from('5468726573686F6C64', 'hex'),
			Buffer.from('5369676E617475726573', 'hex')
		]);

		// Derive the new key
		const derivedKey = mk.deriveSubkeyWithChainCode(path);

		// Check the results
		expect(derivedKey.public_key.toHex()).toEqual(
			'0315ae8bb8c6e9f78eec2167f5ac773067f37a39da1a1efbc585f9e90658d1c620'
		);
	});

	it('should match mainnet key_1 derivation', () => {
		const mk = PublicKeyWithChainCode.forMainnetKey('key_1');
		const canisterId = Principal.fromText('h5jwf-5iaaa-aaaan-qmvoa-cai');
		const path = DerivationPath.withCanisterPrefix(canisterId, [
			Buffer.from('ABCDEF', 'hex'),
			Buffer.from('012345', 'hex')
		]);

		// Derive the new key
		const derivedKey = mk.deriveSubkeyWithChainCode(path);

		// Check the results
		expect(derivedKey.public_key.toHex()).toEqual(
			'02735ca28b5c3e380016d7f28bf4703b540a8bbe8e24beffdc021455ca2ab93fe3'
		);
	});

	it('should raise an error for any other key', () => {
		expect(() => PublicKeyWithChainCode.forMainnetKey('another-key')).toThrowError(
			'Unknown master public key id'
		);
	});
});
