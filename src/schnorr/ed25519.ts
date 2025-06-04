import * as ed from '@noble/ed25519';
import { strict as assert } from 'assert';
import { createHmac } from 'crypto';
import { ChainCode } from '../chain_code';
import { blobDecode, blobEncode } from '../encoding';
import { encode } from 'punycode';

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

/**
 * One part of a derivation path.
 */
export type PathComponent = Uint8Array;

export class DerivationPath {
	constructor(public readonly path: PathComponent[]) {}

	/**
	 * @returns A string representation of the derivation path: Candid blob encoded with a '/' between each path component.
	 */
	toString(): string | undefined {
		return this.toBlob();
	}

	toJSON(): string {
		return this.toHex();
	}

	/**
	 * @returns A string representation of the derivation path: Hex with a '/' between each path component.
	 */
	toHex(): string {
		return this.path.map((p) => Buffer.from(p).toString('hex')).join('/');
	}

	/**
	 * @returns A string representation of the derivation path: Candid blob encoded with a '/' between each path component.
	 */
	toBlob(): string | undefined {
		if (this.path.length === 0) {
			return undefined;
		}
		return this.path.map((p) => blobEncode(p)).join('/');
	}

	static fromBlob(blob: string | undefined): DerivationPath {
		if (blob === undefined) {
			return new DerivationPath([]);
		}
		return new DerivationPath(blob.split('/').map((p) => blobDecode(p)));
	}

	static fromString(s: string): DerivationPath {
		return DerivationPath.fromBlob(s);
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
        // Deep copy of the chain code:
        let working_chain_code = new ChainCode(chain_code.bytes.slice());
        let sum = BigInt(0);

        for (let idx of this.path) {
            console.error(`derive_offset:32 bytes of public key: ${pt.toHex()}`);
        }
		/*
        let offset = BigInt(0);

		for (let idx of this.path) {
			let [next_chain_code, next_offset, next_pt] = DerivationPath.ckd_pub(idx, pt, chain_code);
			chain_code = next_chain_code;
			pt = next_pt;
			offset += next_offset;
		}
		return [pt, offset, chain_code];
        */
		// TODO:
		throw new Error('Not implemented');
	}

	/**
	 * A typescript translation of [ic_secp256k1::DerivationPath::ckd_pub](https://github.com/dfinity/ic/blob/bb6e758c739768ef6713f9f3be2df47884544900/packages/ic-secp256k1/src/lib.rs#L138)
	 * @param idx A part of the derivation path.
	 * @param pt The public key to derive the offset from.
	 * @param chain_code The chain code to derive the offset from.
	 * @returns A tuple containing the derived chain code, the offset, and the derived public key.
	 */
	static ckd_pub(
		idx: PathComponent,
		pt: ed.ExtendedPoint,
		chain_code: ChainCode
	): [ChainCode, bigint, ed.ExtendedPoint] {
		/*
		let ckd_input = ProjectivePoint.fromAffine(pt).toRawBytes(true);
		let projective_point = ProjectivePoint.fromAffine(pt);

		while (true) {
			let [next_chain_code, next_offset] = DerivationPath.ckd(idx, ckd_input, chain_code);

			let base_mul = ProjectivePoint.BASE.mul(next_offset);
			let next_pt = ProjectivePoint.fromAffine(pt).add(base_mul);

			if (!next_pt.equals(ProjectivePoint.ZERO)) {
				return [next_chain_code, next_offset, next_pt.toAffine()];
			}

			// Otherwise set up the next input as defined by SLIP-0010
			ckd_input[0] = 0x01;
			ckd_input.set(next_chain_code.bytes, 1);
		}
        */
		// TODO:
		throw new Error('Not implemented');
	}

	/**
	 * A typescript translation of [ic_secp256k1::DerivationPath::ckd](https://github.com/dfinity/ic/blob/bb6e758c739768ef6713f9f3be2df47884544900/packages/ic-secp256k1/src/lib.rs#L111)
	 * @param idx A part of the derivation path.
	 * @param ckd_input The input to derive the offset from.
	 * @param chain_code The chain code to derive the offset from.
	 * @returns A tuple containing the derived chain code and the offset.
	 */
	static ckd(
		idx: PathComponent,
		ckd_input: Uint8Array,
		chain_code: ChainCode
	): [ChainCode, bigint] {
		let hmac = createHmac('sha512', chain_code.bytes);
		hmac.update(ckd_input);
		hmac.update(idx);
		let hmac_output = hmac.digest();
		assert.equal(hmac_output.length, 64);

		let fb = hmac_output.subarray(0, 32);
		let fb_hex = Buffer.from(fb).toString('hex');
		let next_chain_key = hmac_output.subarray(32, 64);
		let next_chain_key_hex = Buffer.from(next_chain_key).toString('hex');
		// Treat the bytes as an integer
		let next_offset = BigInt(`0x${fb_hex}`); // Note: Do NOT reduce here; the reduction is handled below.
		// The k256 modulus: TODO: Change!
		const MODULUS = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');
		// If iL >= order, try again with the "next" index as described in SLIP-10
		if (next_offset >= MODULUS) {
			let next_input = new Uint8Array(33);
			next_input[0] = 0x01;
			next_input.set(next_chain_key, 1);
			return DerivationPath.ckd(idx, next_input, chain_code);
		}
		// Change the next_chain_key into a Uint8Array
		let next_chain_key_array = new Uint8Array(next_chain_key);

		return [new ChainCode(next_chain_key_array), next_offset];
	}
}

export {};
