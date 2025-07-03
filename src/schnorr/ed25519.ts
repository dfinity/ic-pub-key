import * as ed from '@noble/ed25519';
import { ExtendedPoint } from '@noble/ed25519';
import { hkdf as noble_hkdf } from '@noble/hashes/hkdf.js';
import { sha512 } from '@noble/hashes/sha2';
import { ChainCode } from '../chain_code.js';
import { blobDecode, blobEncode } from '../encoding.js';

/**
 * The order of ed25519.
 */
const ORDER = 2n ** 252n + 27742317777372353535851937790883648493n;

/**
 * One part of a derivation path.
 */
export type PathComponent = Uint8Array;

function pathComponentHex(component: PathComponent): string {
	return Buffer.from(component).toString('hex');
}

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

	/**
	 * A typescript translation of [ic_secp256k1::DerivationPath::derive_offset](https://github.com/dfinity/ic/blob/bb6e758c739768ef6713f9f3be2df47884544900/packages/ic-secp256k1/src/lib.rs#L168)
	 * @param pt The public key to derive the offset from.
	 * @param chain_code The chain code to derive the offset from.
	 * @returns A tuple containing the derived public key, the offset, and the chain code.
	 */
	derive_offset(
		pt: ed.ExtendedPoint,
		chain_code: ChainCode
	): [ed.ExtendedPoint, bigint, ChainCode] {
		return this.path.reduce(derive_one_offset, [pt, 0n, chain_code]);
	}
}

/**
 * One iteration of the main loop of `DerivationPath.derive_offset`.
 *
 * This should also correspond to the main loop of [ic_secp256k1::DerivationPath::derive_offset](https://github.com/dfinity/ic/blob/bb6e758c739768ef6713f9f3be2df47884544900/packages/ic-secp256k1/src/lib.rs#L168).
 * @param pt The public key to derive the offset from.
 * @param sum The sum of the offsets of the previous iterations.
 * @param chain_code The chain code to derive the offset from.
 * @param idx The next component or index of the derivation path.
 * @returns A tuple containing the derived public key, the offset, and the chain code.
 */
export function derive_one_offset(
	[pt, sum, chain_code]: [ed.ExtendedPoint, bigint, ChainCode],
	idx: PathComponent
): [ed.ExtendedPoint, bigint, ChainCode] {
	console.error(`derive_one_offset:args:`);
	console.error(`    pt: ${pt.toHex()}`);
	console.error(`    sum: 0x${sum.toString(16)}`);
	console.error(`    chain_code: ${chain_code.toHex()}`);
	console.error(`    idx: ${pathComponentHex(idx)}`);
	console.error(`derive_offset:32 bytes of public key: ${pt.toHex()}`);
	let ikm_hex = pt.toHex() + pathComponentHex(idx);
	let ikm = Buffer.from(ikm_hex, 'hex');

	console.error(`derive_offset:ikm: ${ikm_hex}`);

	let okm = noble_hkdf(sha512, ikm, chain_code.bytes, 'Ed25519', 96);
	let okm_hex = [...okm].map((c) => c.toString(16).padStart(2, '0')).join('');
	console.error(`derive_offset:okm: ${okm_hex}`);

	let offset = offset_from_okm(okm);
	console.error(`derive_offset:offset: ${offset.toString(16)}  > mod? ${offset > ORDER}`);
	offset = offset % ORDER; // TODO: Maybe use the special `mod` function from noble/ed25519 - it may be faster.
	console.error(`derive_offset:offset: ${offset.toString(16)}`);

	pt = pt.add(ed.ExtendedPoint.BASE.multiply(offset));
	sum += offset;
	console.error(`derive_offset:pt plus base: ${pt.toHex()}`);

	chain_code = new ChainCode(okm.subarray(64, 96));

	throw new Error('Not implemented');
}

export function offset_from_okm(okm: Uint8Array): bigint {
	let offset_bytes = new Uint8Array(okm.subarray(0, 64));
	let big_endian_hex = '0x' + Buffer.from(offset_bytes).toString('hex');
	console.error(`offset_from_okm:big_endian: ${big_endian_hex}`);
	// Interpret those bytes as a big endian number:
	let offset = BigInt(big_endian_hex);
	let reduced = offset % ORDER; // TODO: Maybe use the special `mod` function from noble/ed25519 - it may be faster.
	console.error(`offset_from_okm:reduced: 0x${reduced.toString(16)}`);
	return reduced;
}
