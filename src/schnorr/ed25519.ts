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
	 * Creates a new PublicKeyWithChainCode from two hex strings.
	 * @param public_key_hex The public key in hex format.
	 * @param chain_code_hex The chain code in hex format.
	 * @returns A new PublicKeyWithChainCode.
	 */
	static fromHex(public_key_hex: string, chain_code_hex: string): PublicKeyWithChainCode {
		const public_key = PublicKey.fromHex(public_key_hex);
		const chain_key = ChainCode.fromHex(chain_code_hex);
		return new PublicKeyWithChainCode(public_key, chain_key);
	}

	/**
	 * Creates a new PublicKeyWithChainCode from two strings.
	 * @param public_key_string The public key in any format supported by PublicKey.fromString.
	 * @param chain_code_string The chain code in any format supported by ChainCode.fromString.
	 * @returns A new PublicKeyWithChainCode.
	 */
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
