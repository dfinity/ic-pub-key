import * as ed from '@noble/ed25519';
import { ChainCode } from '../chain_code';
import { DerivationPath } from '../ecdsa/secp256k1';
import { blobDecode } from '../encoding';
/**
 * The response type for the ICP management canister's `schnorr_public_key` method.
 *
 * TODO: See whether this can be shared across curves.
 */
export type EcdsaPublicKeyResponse = PublicKeyWithChainCode;

/**
 * A public key with its chain code.
 */
export class PublicKeyWithChainCode {
	/**
	 * @param public_key The public key.
	 * @param chain_code A hash of the derivation path.
	 */
	constructor(
		public readonly public_key: ed.ExtendedPoint,
		public readonly chain_code: ChainCode
	) {}

	/**
	 * A convenience function that accepts the format provided by dfx calls to the signer canister.
	 * @param public_key_array The public key as a byte array.
	 * @param chain_code_array The chain code as a byte array.
	 */
	static fromArray(public_key_array: number[], chain_code_array: number[]): PublicKeyWithChainCode {
		let public_key_hex = public_key_array.map((p) => p.toString(16).padStart(2, '0')).join('');
		return new PublicKeyWithChainCode(
			ed.ExtendedPoint.fromHex(public_key_hex),
			ChainCode.fromArray(chain_code_array)
		);
	}
	static fromUint8Array(
		public_key_array: Uint8Array,
		chain_code_array: Uint8Array
	): PublicKeyWithChainCode {
		return PublicKeyWithChainCode.fromArray([...public_key_array], [...chain_code_array]);
	}

	static fromHex(public_key_hex: string, chain_code_hex: string): PublicKeyWithChainCode {
		let public_key = ed.ExtendedPoint.fromHex(public_key_hex);
		let chain_key = new ChainCode(new Uint8Array(Buffer.from(chain_code_hex, 'hex')));
		return new PublicKeyWithChainCode(public_key, chain_key);
	}

	static fromBlob(public_key_blob: string, chain_code_blob: string): PublicKeyWithChainCode {
		let public_key_array = blobDecode(public_key_blob);
		let chain_code_array = blobDecode(chain_code_blob);
		return PublicKeyWithChainCode.fromUint8Array(public_key_array, chain_code_array);
	}

	derive_subkey_with_chain_code(derivation_path: DerivationPath): PublicKeyWithChainCode {
		return this; // TODO: Implement
	}
}

export {};
