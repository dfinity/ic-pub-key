import { AffinePoint, ProjectivePoint } from '@noble/secp256k1';
import { strict as assert } from 'assert';
import { createHmac } from 'crypto';

export class PublicKeyWithChainCode {
	constructor(
		public readonly chain_code: ChainCode,
		public readonly public_key: Sec1EncodedPublicKey
	) {}

	static fromArray(chain_code_array: number[], public_key_array: number[]): PublicKeyWithChainCode {
		return new PublicKeyWithChainCode(
			ChainCode.fromArray(chain_code_array),
			Sec1EncodedPublicKey.fromArray(public_key_array)
		);
	}

	static fromHex(chain_code_hex: string, public_key_hex: string): PublicKeyWithChainCode {
		let chain_key = new ChainCode(new Uint8Array(Buffer.from(chain_code_hex, 'hex')));
		let public_key = new Sec1EncodedPublicKey(new Uint8Array(Buffer.from(public_key_hex, 'hex')));
		return new PublicKeyWithChainCode(chain_key, public_key);
	}

	derive_subkey_with_chain_code(derivation_path: DerivationPath): PublicKeyWithChainCode {
		let public_key = this.public_key.asAffinePoint();
		let [affine_pt, _offset, chain_code] = derivation_path.derive_offset(
			public_key,
			this.chain_code
		);
		let pt = ProjectivePoint.fromAffine(affine_pt);
		return new PublicKeyWithChainCode(chain_code, Sec1EncodedPublicKey.fromProjectivePoint(pt));
	}
}
/**
 * A public key, represented as a 33 byte array using sec1 encoding.
 */
export class Sec1EncodedPublicKey {
	static readonly LENGTH = 33;

	constructor(public readonly bytes: Uint8Array) {
		if (bytes.length !== Sec1EncodedPublicKey.LENGTH) {
			throw new Error(
				`Invalid PublicKey length: expected ${Sec1EncodedPublicKey.LENGTH} bytes, got ${bytes.length}`
			);
		}
	}

	static fromArray(array: number[]): Sec1EncodedPublicKey {
		return new Sec1EncodedPublicKey(new Uint8Array(array));
	}

	static fromProjectivePoint(point: ProjectivePoint): Sec1EncodedPublicKey {
		const hex = point.toHex();
		const bytes = Buffer.from(hex, 'hex');
		return new Sec1EncodedPublicKey(new Uint8Array(bytes));
	}

	static fromAffinePoint(point: AffinePoint): Sec1EncodedPublicKey {
		const projective_point = ProjectivePoint.fromAffine(point);
		return Sec1EncodedPublicKey.fromProjectivePoint(projective_point);
	}

	asHex(): string {
		return Buffer.from(this.bytes).toString('hex');
	}

	asProjectivePoint(): ProjectivePoint {
		return ProjectivePoint.fromHex(this.asHex());
	}

	asAffinePoint(): AffinePoint {
		return this.asProjectivePoint().toAffine();
	}

	asAffineHex(): string {
		let affine_point = this.asAffinePoint();
		const x = affine_point.x;
		const y = affine_point.y;
		return 'x: ' + x.toString(16) + ' y: ' + y.toString(16);
	}
	x_as_hex(): string {
		const x = this.asAffinePoint().x;
		return x.toString(16);
	}
}
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

	static fromArray(array: number[]): ChainCode {
		return new ChainCode(new Uint8Array(array));
	}

	asHex(): string {
		return Buffer.from(this.bytes).toString('hex');
	}
}

/**
 * One part of a derivation path.
 */
type PathComponent = Uint8Array;

class DerivationPath {
	constructor(public readonly path: PathComponent[]) {}

	/**
	 * @returns A string representation of the derivation path: Hex with a '/' between each path component.
	 */
	toString(): string {
		return this.path.map((p) => Buffer.from(p).toString('hex')).join('/');
	}

	/**
	 * A typescript translation of [ic_secp256k1::DerivationPath::derive_offset](https://github.com/dfinity/ic/blob/bb6e758c739768ef6713f9f3be2df47884544900/packages/ic-secp256k1/src/lib.rs#L168)
	 * @param pt The public key to derive the offset from.
	 * @param chain_code The chain code to derive the offset from.
	 * @returns A tuple containing the derived public key, the offset, and the chain code.
	 */
	derive_offset(pt: AffinePoint, chain_code: ChainCode): [AffinePoint, bigint, ChainCode] {
		let offset = BigInt(0);

		for (let idx of this.path) {
			let [next_chain_code, next_offset, next_pt] = DerivationPath.ckd_pub(idx, pt, chain_code);
			chain_code = next_chain_code;
			pt = next_pt;
			offset += next_offset;
		}
		return [pt, offset, chain_code];
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
		pt: AffinePoint,
		chain_code: ChainCode
	): [ChainCode, bigint, AffinePoint] {
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
		// The k256 modulus:
		const MODULUS = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');
		// If iL >= order, try again with the "next" index as described in SLIP-10
		if (next_offset >= MODULUS) {
			let next_input = new Uint8Array(33);
			next_input[0] = 0x01;
			next_input.set(next_chain_key, 1);
			return DerivationPath.ckd(idx, next_input, chain_code);
		}

		return [new ChainCode(next_chain_key), next_offset];
	}
}

// Translated from Rust: mkpubkey::ecdsa_public_key::secp256k1_public_key
export function derive_public_key(
	ecdsa_public_key: PublicKeyWithChainCode,
	simple_derivation_path: DerivationPath
): PublicKeyWithChainCode {
	let derived_key = ecdsa_public_key.derive_subkey_with_chain_code(simple_derivation_path);
	return derived_key;
}

// TODO: Test error thrown on invalid chain code
// TODO: Test error thrown on invalid derivation path
// TODO: Test error thrown on invalid public key

// Tests the public key derivation
export function test_derive_public_key() {
	const pub_key_without_derivation_path = PublicKeyWithChainCode.fromArray(
		[
			33, 40, 145, 188, 3, 47, 40, 211, 105, 186, 207, 57, 220, 54, 159, 235, 81, 110, 206, 217,
			163, 216, 52, 152, 36, 106, 234, 209, 84, 111, 140, 209
		],
		[
			2, 184, 79, 243, 248, 131, 41, 168, 135, 101, 125, 3, 9, 189, 26, 26, 249, 227, 118, 1, 229,
			209, 165, 53, 214, 254, 125, 66, 227, 127, 121, 244, 10
		]
	);

	{
		console.log('Public key without derivation path: ');
		console.log(pub_key_without_derivation_path);
		assert.equal(
			pub_key_without_derivation_path.public_key.x_as_hex(),
			'b84ff3f88329a887657d0309bd1a1af9e37601e5d1a535d6fe7d42e37f79f40a'
		);
		// Check that conversion to/from projective point is identity
		const projective_point = pub_key_without_derivation_path.public_key.asProjectivePoint();
		const converted_back = Sec1EncodedPublicKey.fromProjectivePoint(projective_point);
		assert.deepEqual(
			converted_back,
			pub_key_without_derivation_path.public_key,
			'Conversion to/from projective point is not identity'
		);
	}

	const derivation_path = new DerivationPath(
		['2', '444', '66666'].map((s) => new TextEncoder().encode(s))
	);

	console.log('Derivation path: ');
	console.log(derivation_path);

	const expected_pub_key_with_derivation_path = new PublicKeyWithChainCode(
		new ChainCode(
			new Uint8Array([
				188, 53, 184, 81, 95, 3, 170, 21, 67, 8, 30, 42, 244, 232, 120, 242, 139, 39, 243, 206, 0,
				192, 53, 244, 6, 135, 2, 211, 62, 232, 133, 134
			])
		),
		new Sec1EncodedPublicKey(
			Buffer.from(
				new Uint8Array([
					2, 75, 247, 142, 64, 187, 81, 210, 198, 193, 76, 17, 170, 143, 58, 241, 84, 151, 65, 222,
					90, 205, 249, 37, 230, 220, 35, 13, 252, 93, 170, 34, 217
				])
			)
		)
	);

	let before = Date.now();
	const pub_key_with_derivation_path = derive_public_key(
		pub_key_without_derivation_path,
		derivation_path
	);
	let after = Date.now();
	console.log(`derive_public_key took ${after - before}ms`);

	console.log('Derived public key: ');
	console.log(pub_key_with_derivation_path);

	console.log('Expected public key: ');
	console.log(expected_pub_key_with_derivation_path);

	// Verify that the derived public key matches the expected public key
	if (!deepEqual(pub_key_with_derivation_path, expected_pub_key_with_derivation_path)) {
		throw new Error('Derived public key does not match expected public key');
	}
}

function deepEqual(x: any, y: any): boolean {
	const ok = Object.keys,
		tx = typeof x,
		ty = typeof y;
	return x && y && tx === 'object' && tx === ty
		? ok(x).length === ok(y).length && ok(x).every((key) => deepEqual(x[key], y[key]))
		: x === y;
}
