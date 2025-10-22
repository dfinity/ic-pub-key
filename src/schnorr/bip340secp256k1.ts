import { ChainCode } from '../chain_code.js';

import { DerivationPath, PathComponent, Sec1EncodedPublicKey } from '../ecdsa/secp256k1.js';

export { ChainCode, DerivationPath, PathComponent, Sec1EncodedPublicKey };

/**
 * A public key with its chain code.
 */
export class PublicKeyWithChainCode {
	/**
	 * @param public_key The public key.
	 * @param chain_code A hash of the derivation path.
	 */
	constructor(
		public readonly public_key: Sec1EncodedPublicKey,
		public readonly chain_code: ChainCode
	) {}

	/**
	 * Return the master public key used in the production mainnet
	 */
	static forMainnetKey(key_id: string): PublicKeyWithChainCode {
		const chain_key = ChainCode.fromHex(
			'0000000000000000000000000000000000000000000000000000000000000000'
		);

		if (key_id === 'key_1') {
			const public_key = Sec1EncodedPublicKey.fromHex(
				'02246e29785f06d37a8a50c49f6152a34df74738f8c13a44f59fef4cbe90eb13ac'
			);
			return new PublicKeyWithChainCode(public_key, chain_key);
		} else if (key_id === 'test_key_1') {
			const public_key = Sec1EncodedPublicKey.fromHex(
				'037a651a2e5ef3d1ef63e84c4c4caa029fa4a43a347a91e4d84a8e846853d51be1'
			);
			return new PublicKeyWithChainCode(public_key, chain_key);
		} else {
			throw new Error('Unknown master public key id');
		}
	}

	/**
	 * Return the master public key used by PocketIC for testing
	 */
	static forPocketIcKey(key_id: string): PublicKeyWithChainCode {
		const chain_key = ChainCode.fromHex(
			'0000000000000000000000000000000000000000000000000000000000000000'
		);

		if (key_id === 'key_1') {
			const public_key = Sec1EncodedPublicKey.fromHex(
				'036ad6e838b46811ad79c37b2f4b854b7a05f406715b2935edc5d3251e7666977b'
			);
			return new PublicKeyWithChainCode(public_key, chain_key);
		} else if (key_id === 'test_key_1') {
			const public_key = Sec1EncodedPublicKey.fromHex(
				'03cc365e15cb552589c7175717b2ac63d1050b9bb2e5aed35432b1b1be55d3abcf'
			);
			return new PublicKeyWithChainCode(public_key, chain_key);
		} else if (key_id === 'dfx_test_key') {
			const public_key = Sec1EncodedPublicKey.fromHex(
				'03e6f78b1a90e361c5cc9903f73bb8acbe3bc17ad01e82554d25cf0ecd70c67484'
			);
			return new PublicKeyWithChainCode(public_key, chain_key);
		} else {
			throw new Error('Unknown master public key id');
		}
	}

	/**
	 * Creates a new PublicKeyWithChainCode from two hex strings.
	 * @param public_key The public key as a 66 character hex string.
	 * @param chain_code The chain code as a 64 character hex string.
	 * @returns A new PublicKeyWithChainCode.
	 */
	static fromHex({
		public_key,
		chain_code
	}: {
		public_key: string;
		chain_code: string;
	}): PublicKeyWithChainCode {
		return new PublicKeyWithChainCode(
			Sec1EncodedPublicKey.fromHex(public_key),
			ChainCode.fromHex(chain_code)
		);
	}

	/**
	 * @returns The public key and chain code as hex strings.
	 */
	toHex(): { public_key: string; chain_code: string } {
		return { public_key: this.public_key.toHex(), chain_code: this.chain_code.toHex() };
	}

	/**
	 * @returns The public key and chain code as Candid blobs.
	 */
	toBlob(): { public_key: string; chain_code: string } {
		return { public_key: this.public_key.toBlob(), chain_code: this.chain_code.toBlob() };
	}

	/**
	 * Creates a new PublicKeyWithChainCode from two Candid blobs.
	 * @param public_key The public key as a Candid blob.
	 * @param chain_code The chain code as a Candid blob.
	 * @returns A new PublicKeyWithChainCode.
	 */
	static fromBlob({
		public_key,
		chain_code
	}: {
		public_key: string;
		chain_code: string;
	}): PublicKeyWithChainCode {
		return new PublicKeyWithChainCode(
			Sec1EncodedPublicKey.fromBlob(public_key),
			ChainCode.fromBlob(chain_code)
		);
	}

	/**
	 * Creates a new PublicKeyWithChainCode from two strings.
	 * @param public_key The public key in any supported format.
	 * @param chain_code The chain code in any supported format.
	 * @returns A new PublicKeyWithChainCode.
	 */
	static fromString({
		public_key,
		chain_code
	}: {
		public_key: string;
		chain_code: string;
	}): PublicKeyWithChainCode {
		return new PublicKeyWithChainCode(
			Sec1EncodedPublicKey.fromString(public_key),
			ChainCode.fromString(chain_code)
		);
	}

	/**
	 * Applies the given derivation path to obtain a new public key and chain code.
	 */
	deriveSubkeyWithChainCode(derivation_path: DerivationPath): PublicKeyWithChainCode {
		return this.public_key.deriveSubkeyWithChainCode(derivation_path, this.chain_code);
	}
}
