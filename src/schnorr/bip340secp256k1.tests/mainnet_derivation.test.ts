import { Principal } from '@dfinity/principal';
import { describe, expect, it } from 'vitest';
import { DerivationPath, PublicKeyWithChainCode } from '../bip340secp256k1';

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
			'0237ca6a41c1db8ab40410445250a5d46fbec7f3e449c8f40f86d8622a4106cebd'
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
			'03e5e92c2399985f82521b110ac3dbf697a6b9522002c0d31d0b7cd5352c343457'
		);
	});
});
