import { strict as assert } from 'assert';
import { createHmac } from 'crypto';

/**
 * A chain code is a 32 byte array
 */
export class ChainCode {
	static readonly LENGTH = 32;

	constructor(public readonly bytes: Uint8Array) {
		if (bytes.length !== ChainCode.LENGTH) {
			throw new Error(
				`Invalid ChainCode length: expected ${ChainCode.LENGTH} bytes, got ${bytes.length}`
			);
		}
	}

	static fromHex(hex: string): ChainCode {
		const bytes = Buffer.from(hex, 'hex');
		return new ChainCode(new Uint8Array(bytes));
	}

	static fromArray(array: number[]): ChainCode {
		return new ChainCode(new Uint8Array(array));
	}

	asHex(): string {
		return Buffer.from(this.bytes).toString('hex');
	}

	toJSON(): string {
		return this.asHex();
	}
}

/**
 * One part of a derivation path.
 */
export type PathComponent = Uint8Array;

export class DerivationPath {
	/**
	 * The k256 modulus.
	 */
	static MODULUS = 2n ** 256n - 2n ** 32n - 977n;

	constructor(public readonly path: PathComponent[]) {}

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
		// Treat the bytes as an integer.
		//
		// Note: I don't see a better way of converting bytes to a BigInt in typescript than converting to a hex string and then
		// parsing the hex string.  That is embarassing.  If better is possible, please update this!
		//
		// Note: The Rust code performs this same check by reducing and checking whether the value has changed.
		//
		// Note: The modulus is so close to 2**256 that this branch will be taken extremely rarely.
		let next_offset = BigInt(`0x${fb_hex}`);
		if (next_offset >= DerivationPath.MODULUS) {
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
