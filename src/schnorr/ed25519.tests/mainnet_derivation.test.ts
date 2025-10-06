import { Principal } from '@dfinity/principal';
import { describe, expect, it } from 'vitest';
import { DerivationPath, PublicKeyWithChainCode } from '../ed25519';

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
			'd9a2ce6a3cd33fe16dce37e045609e51ff516e93bb51013823d6d7a915e3cfb9'
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
			'43f0008b26564b6da51f585ad47669dfeb1db6d94d7dd216bd304fc1f5f5e997'
		);
	});
});
