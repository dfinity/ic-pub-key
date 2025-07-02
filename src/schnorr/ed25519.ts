import { ExtendedPoint } from '@noble/ed25519';
import { ChainCode } from '../chain_code.js';
import { blobDecode, blobEncode } from '../encoding.js';

/**
 * One part of a derivation path.
 */
export type PathComponent = Uint8Array;

export class PublicKey {
	/**
	 * The length of a public key in bytes.  As hex it is twice this.
	 */
	static readonly LENGTH = 32;

	constructor(public readonly key: ExtendedPoint) {
		if (key.is0()) {
			throw new Error('Invalid public key');
		}
	}

	/**
	 * Parses a public key from a string in any supported format.
	 */
	static fromString(public_key_string: string): PublicKey {
		// At present only hex is supported, so this is easy:
		return PublicKey.fromHex(public_key_string);
	}

	/**
	 * Creates a new PublicKey from a hex string.
	 * @param hex The hex string to create the public key from.
	 * @throws If the hex string has the wrong length for a public key.
	 * @throws If the public key is the point at infinity.
	 * @returns A new PublicKey.
	 */
	static fromHex(hex: string): PublicKey {
		return new PublicKey(ExtendedPoint.fromHex(hex, true));
	}

	/**
	 * Returns the public key as a hex string.
	 * @returns A 64 character hex string.
	 */
	toHex(): string {
		return this.key.toHex();
	}
}

/**
 * A public key with its chain code.
 */
export class PublicKeyWithChainCode {
	/**
	 * @param public_key The public key.
	 * @param chain_code A hash of the derivation path.
	 */
	constructor(
		public readonly public_key: PublicKey,
		public readonly chain_code: ChainCode
	) {}

	/**
	 * A convenience function that accepts the format provided by dfx calls to the signer canister.
	 * @param public_key_array The public key as a byte array.
	 * @param chain_code_array The chain code as a byte array.
	 */
	static fromArray(public_key_array: number[], chain_code_array: number[]): PublicKeyWithChainCode {
		const public_key_hex = public_key_array.map((p) => p.toString(16).padStart(2, '0')).join('');
		return new PublicKeyWithChainCode(
			PublicKey.fromHex(public_key_hex),
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
		const public_key = PublicKey.fromHex(public_key_hex);
		const chain_key = new ChainCode(new Uint8Array(Buffer.from(chain_code_hex, 'hex')));
		return new PublicKeyWithChainCode(public_key, chain_key);
	}

	static fromBlob(public_key_blob: string, chain_code_blob: string): PublicKeyWithChainCode {
		const public_key_array = blobDecode(public_key_blob);
		const chain_code_array = blobDecode(chain_code_blob);
		return PublicKeyWithChainCode.fromUint8Array(public_key_array, chain_code_array);
	}

	static fromString(public_key_string: string, chain_code_string: string): PublicKeyWithChainCode {
		const public_key = PublicKey.fromString(public_key_string);
		const chain_code = ChainCode.fromString(chain_code_string);
		return new PublicKeyWithChainCode(public_key, chain_code);
	}
}

export class DerivationPath {
	constructor(public readonly path: PathComponent[]) {}

	/**
	 * Creates a new DerivationPath from / separated candid blobs.
	 * @param blob The / separated blobs to create the derivation path from.
	 * @returns A new DerivationPath.
	 */
	static fromBlob(blob: string | undefined | null): DerivationPath {
		if (blob === undefined || blob === null) {
			return new DerivationPath([]);
		}
		return new DerivationPath(blob.split('/').map((p) => blobDecode(p)));
	}

	/**
	 * @returns A string representation of the derivation path: Candid blob encoded with a '/' between each path component.  Or `null` for a derivation path with no components.
	 */
	toBlob(): string | null {
		if (this.path.length === 0) {
			return null;
		}
		return this.path.map((p) => blobEncode(p)).join('/');
	}

	// TODO: Curve-specific methods.
}
