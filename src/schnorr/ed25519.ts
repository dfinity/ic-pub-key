import * as ed from '@noble/ed25519';
import { hkdf as noble_hkdf } from '@noble/hashes/hkdf.js';
import { sha512 } from '@noble/hashes/sha2';
import { strict as assert } from 'assert';
import { createHmac } from 'crypto';
import { ChainCode } from '../chain_code';
import { blobDecode, blobEncode } from '../encoding';

const MODULUS = 2n ** 252n + 27742317777372353535851937790883648493n; // The order of the curve

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
			ed.ExtendedPoint.fromHex(public_key_hex, true), // Reduced mod 2**255-19
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
		let public_key = ed.ExtendedPoint.fromHex(public_key_hex, true); // Reduced mod 2**255-19
		let chain_key = new ChainCode(new Uint8Array(Buffer.from(chain_code_hex, 'hex')));
		return new PublicKeyWithChainCode(public_key, chain_key);
	}

	static fromBlob(public_key_blob: string, chain_code_blob: string): PublicKeyWithChainCode {
		let public_key_array = blobDecode(public_key_blob);
		let chain_code_array = blobDecode(chain_code_blob);
		return PublicKeyWithChainCode.fromUint8Array(public_key_array, chain_code_array);
	}

	derive_subkey_with_chain_code(derivation_path: DerivationPath): PublicKeyWithChainCode {
		/**
        let pt = CompressedEdwardsY(self.pk.to_bytes()).decompress().unwrap();

        let (pt, _sum, chain_code) = derivation_path.derive_offset(pt, chain_code);

        let key = Self::new(VerifyingKey::from(pt));

        (key, chain_code)	
        */
		derivation_path.derive_offset(this.public_key, this.chain_code);
		// TODO:
		throw new Error('Not implemented');
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
		// Deep copy the point: (Is there a better way?)
		pt = new ed.ExtendedPoint(pt.ex, pt.ey, pt.ez, pt.et);
		// Deep copy of the chain code:
		let working_chain_code = new ChainCode(chain_code.bytes.slice());
		let sum = BigInt(0);

		for (let idx of this.path) {
			console.error(`derive_offset:32 bytes of public key: ${pt.toHex()}`);
			// First loop:
			/*
			assert.equal(pt.toHex(), '5dc497e58f2eaaa2acb80f8f235e754ea243ab2c1d5683d55eec5b3275b31691');
			*/
			let pt_bytes = pt.toRawBytes();
			let ikm = new Uint8Array(pt_bytes.length + idx.length);
			ikm.set(pt_bytes, 0);
			ikm.set(idx, pt_bytes.length);

			let ikm_hex = [...ikm].map((c) => c.toString(16).padStart(2, '0')).join('');
			console.error(`derive_offset:ikm: ${ikm_hex}`);
			// First loop:
			/*
			assert.equal(ikm_hex, '5dc497e58f2eaaa2acb80f8f235e754ea243ab2c1d5683d55eec5b3275b3169132');
			*/

			let okm = noble_hkdf(sha512, ikm, chain_code.bytes, 'Ed25519', 96);
			let okm_hex = [...okm].map((c) => c.toString(16).padStart(2, '0')).join('');
			console.error(`derive_offset:okm: ${okm_hex}`);
			// First loop:
			/*
			assert.equal(
				okm_hex,
				'4c3c57859e14fd4bf76d26d5089a2c409d246151a4f1848aa917a82f80fc6268fce6cb45ccd89f326ad7759e9a09e3ea03917cce58b7309088a40a0f23df5abc71f04d8c92317647d6b20d1f83e6dfdce8411b66b9b7f78339442616cd6e3364'
			);
            */

			let offset = DerivationPath.offset_from_okm(okm);
			console.error(`derive_offset:offset: ${offset.toString(16)}  > mod? ${offset > MODULUS}`);
			offset = offset % MODULUS; // TODO: Maybe use the special `mod` function from noble/ed25519 - it may be faster.
			console.error(`derive_offset:offset: ${offset.toString(16)}`);
			// First loop:
            /*
			assert.equal(
				le_hex(offset.toString(16).padStart(64, '0')),
				'8ca4ea9be78a8e0748050291e6944d209aba69209170d0981e2db792242dd70c',
				'offset_mod - little endian'
			);
            */
			pt = pt.add(ed.ExtendedPoint.BASE.mul(offset));
            sum += offset;
			console.error(`derive_offset:pt plus base: ${pt.toHex()}`);
			// First loop:
            /*
			assert.equal(
				pt.toHex(),
				'd98cff36b6fe4868cfdacd51eea8ec963ef64616300bc2a78271b92935d57d22',
				'pt plus base'
			);
            */

            chain_code = new ChainCode(okm.subarray(64, 96));
		}
		return [pt, sum, chain_code];
	}

	static offset_from_okm(okm: Uint8Array): bigint {
		let offset_bytes = okm.subarray(0, 64);
		// Interpret those bytes as a big endian number:
		let offset = BigInt('0x' + Buffer.from(offset_bytes).toString('hex'));
		return offset % MODULUS; // TODO: Maybe use the special `mod` function from noble/ed25519 - it may be faster.
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

function le_hex(hex: string): string {
	return hex.match(/.{2}/g)!.reverse().join('');
}

export {};
