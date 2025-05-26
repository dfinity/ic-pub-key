import { AffinePoint, ProjectivePoint } from '@noble/secp256k1';
import { strict as assert } from 'assert';
import { createHmac } from 'crypto';

class PublicKeyWithChainCode {
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

	derive_subkey_with_chain_code(derivation_path: DerivationPath): PublicKeyWithChainCode {
		/*
        let public_key: AffinePoint = *self.key.as_affine();
        let (pt, _offset, chain_code) = derivation_path.derive_offset(public_key, chain_code);
    
        let derived_key = Self {
            key: k256::PublicKey::from(
                k256::PublicKey::from_affine(pt).expect("Derived point is valid"),
            ),
        };
    
        (derived_key, chain_code)
        */
		let public_key = this.public_key.asAffinePoint();
		let todo = derivation_path.derive_offset(public_key, this.chain_code);
		throw new Error('Not finished: derive_subkey_with_chain_code');
	}
}
/**
 * A public key, represented as a 33 byte array using sec1 encoding.
 */
class Sec1EncodedPublicKey {
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
class ChainCode {
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
}

/**
 * One part of a derivation path.
 */
type PathComponent = Uint8Array;

class DerivationPath {
	constructor(public readonly path: PathComponent[]) {}

	derive_offset(pt: AffinePoint, chain_code: ChainCode): [AffinePoint, bigint, ChainCode] {
		/*
        fn derive_offset(
        &self,
        pt: AffinePoint,
        chain_code: &[u8; 32],
    ) -> (AffinePoint, Scalar, [u8; 32]) {
        let mut offset = Scalar::ZERO;
        let mut pt = pt;
        let mut chain_code = *chain_code;

        for idx in self.path() {
            let (next_chain_code, next_offset, next_pt) = Self::ckd_pub(&idx.0, pt, &chain_code);
            chain_code = next_chain_code;
            pt = next_pt;
            offset = offset.add(&next_offset);
        }

        (pt, offset, chain_code)
    }
    */
		let offset = BigInt(0);

		for (let idx of this.path) {
			let [next_chain_code, next_offset, next_pt] = DerivationPath.ckd_pub(idx, pt, chain_code);
		}
		throw new Error('Not implemented: DerivationPath.derive_offset');
	}

	static ckd_pub(
		idx: PathComponent,
		pt: AffinePoint,
		chain_code: ChainCode
	): [ChainCode, bigint, AffinePoint] {
		/*
            fn ckd_pub(
            idx: &[u8],
            pt: AffinePoint,
            chain_code: &[u8; 32],
        ) -> ([u8; 32], Scalar, AffinePoint) {
            use k256::elliptic_curve::{
                group::prime::PrimeCurveAffine, group::GroupEncoding, ops::MulByGenerator,
            };
            use k256::ProjectivePoint;
    
            let mut ckd_input = pt.to_bytes();
    
            let pt: ProjectivePoint = pt.into();
    
            loop {
                let (next_chain_code, next_offset) = Self::ckd(idx, &ckd_input, chain_code);
    
                let next_pt = (pt + k256::ProjectivePoint::mul_by_generator(&next_offset)).to_affine();
    
                // If the new key is not infinity, we're done: return the new key
                if !bool::from(next_pt.is_identity()) {
                    return (next_chain_code, next_offset, next_pt);
                }
    
                // Otherwise set up the next input as defined by SLIP-0010
                ckd_input[0] = 0x01;
                ckd_input[1..].copy_from_slice(&next_chain_code);
            }
        }
    
    */
		let ckd_input = ProjectivePoint.fromAffine(pt).toRawBytes(true);
		let projective_point = ProjectivePoint.fromAffine(pt);

		while (true) {
			let [next_chain_code, next_offset] = DerivationPath.ckd(idx, ckd_input, chain_code);

			//let next_pt = (pt + k256::ProjectivePoint::mul_by_generator(&next_offset)).to_affine();
		}

		throw new Error('Not implemented: DerivationPath.ckd_pub');
	}

	static ckd(
		idx: PathComponent,
		ckd_input: Uint8Array,
		chain_code: ChainCode
	): [ChainCode, bigint] {
		/*
            fn ckd(idx: &[u8], input: &[u8], chain_code: &[u8; 32]) -> ([u8; 32], Scalar) {
        use hmac::{Hmac, Mac};
        use k256::{elliptic_curve::ops::Reduce, sha2::Sha512};

        let mut hmac = Hmac::<Sha512>::new_from_slice(chain_code)
            .expect("HMAC-SHA-512 should accept 256 bit key");

        hmac.update(input);
        hmac.update(idx);

        let hmac_output: [u8; 64] = hmac.finalize().into_bytes().into();

        let fb = k256::FieldBytes::from_slice(&hmac_output[..32]);
        let next_offset = <k256::Scalar as Reduce<k256::U256>>::reduce_bytes(fb);
        let next_chain_key: [u8; 32] = hmac_output[32..].to_vec().try_into().expect("Correct size");

        // If iL >= order, try again with the "next" index as described in SLIP-10
        if next_offset.to_bytes().to_vec() != hmac_output[..32] {
            let mut next_input = [0u8; 33];
            next_input[0] = 0x01;
            next_input[1..].copy_from_slice(&next_chain_key);
            Self::ckd(idx, &next_input, chain_code)
        } else {
            (next_chain_key, next_offset)
        }
    }
        */
        let hmac = createHmac('sha512', chain_code.bytes);
        hmac.update(ckd_input);
        hmac.update(idx);
        let hmac_output = hmac.digest();
        assert.equal(hmac_output.length, 64);

        //let fb = hmac_output.slice(0, 32);
        //let next_offset = reduce(fb);


		throw new Error('Not implemented: DerivationPath.ckd');
	}
}

// Translated from Rust: mkpubkey::ecdsa_public_key::secp256k1_public_key
export function derive_public_key(
	ecdsa_public_key: PublicKeyWithChainCode,
	simple_derivation_path: DerivationPath
): PublicKeyWithChainCode {
	/*
pub fn derive_public_key(
    ecdsa_public_key: &ECDSAPublicKey,
    simple_derivation_path: &Vec<Vec<u8>>,
) -> ECDSAPublicKey {
    use ic_secp256k1::PublicKey;

    let path = derivation_path(simple_derivation_path);

    let pk = PublicKey::deserialize_sec1(&ecdsa_public_key.public_key)
        .expect("Failed to parse ECDSA public key");

    let chain_code: [u8; 32] = ecdsa_public_key
        .chain_code
        .clone()
        .try_into()
        .expect("Incorrect chain code size");

    let (derived_public_key, derived_chain_code) =
        pk.derive_subkey_with_chain_code(&path, &chain_code);

    ECDSAPublicKey {
        public_key: derived_public_key.serialize_sec1(true),
        chain_code: derived_chain_code.to_vec(),
    }
}

*/

	console.log('Affine hex: ', ecdsa_public_key.public_key.asAffineHex());

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
			new Uint8Array([
				2, 75, 247, 142, 64, 187, 81, 210, 198, 193, 76, 17, 170, 143, 58, 241, 84, 151, 65, 222,
				90, 205, 249, 37, 230, 220, 35, 13, 252, 93, 170, 34, 217
			])
		)
	);

	const pub_key_with_derivation_path = derive_public_key(
		pub_key_without_derivation_path,
		derivation_path
	);

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
