import { blobDecode, blobEncode } from '../encoding.js';

/**
 * One part of a derivation path.
 */
export type PathComponent = Uint8Array;

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
	 * @returns A string representation of the derivation path: Candid blob encoded with a '/' between each path component.
	 */
	toBlob(): string | null {
		if (this.path.length === 0) {
			return null;
		}
		return this.path.map((p) => blobEncode(p)).join('/');
	}

	/**
	 * Compares this DerivationPath with another to check for equality.
	 * @param other The DerivationPath to compare with.
	 * @returns True if both paths are equal, false otherwise.
	 */
	equals(other: DerivationPath): boolean {
		if (!(other instanceof DerivationPath)) {
			return false;
		}
		if (this.path.length !== other.path.length) {
			return false;
		}
		return this.path.every((component, index) =>
			component.length === other.path[index].length &&
			component.every((byte, byteIndex) => byte === other.path[index][byteIndex])
		);
	}
	// TODO: Curve-specific methods.
}
