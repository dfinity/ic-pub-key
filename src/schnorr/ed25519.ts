import { ExtendedPoint } from '@noble/ed25519';
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
	 * Creates a new PublicKey from a hex string.
	 * @param hex The hex string to create the public key from.
	 * @throws If the hex string has the wrong length for a public key.
	 * @throws If the public key is the point at infinity.
	 * @returns A new PublicKey.
	 */
	static fromHex(hex: string): PublicKey {
		return new PublicKey(ExtendedPoint.fromHex(hex));
	}

	/**
	 * Returns the public key as a hex string.
	 * @returns A 64 character hex string.
	 */
	toHex(): string {
		return this.key.toHex();
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
