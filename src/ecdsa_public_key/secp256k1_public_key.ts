import { ProjectivePoint } from "@noble/secp256k1";

type ECDSAPublicKey = {
    chain_code: Uint8Array;
    public_key: Uint8Array;
}
function public_key_derive_subkey_with_chain_code(
    public_key_with_chain_code: ECDSAPublicKey,
    derivation_path: DerivationPath,
) : ECDSAPublicKey {
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
    throw new Error("Not implemented");
}


type DerivationPath = Uint8Array[];
function derivation_path_derive_offset(derivation_path: DerivationPath, public_key: ProjectivePoint): ProjectivePoint {
    /*
    const projective_point = ProjectivePoint.fromHex(hex_public_key);
    console.log("Projective point: ", projective_point);
    const affine_point = projective_point.toAffine();
    console.log("Affine point: ", affine_point);
    */
    throw new Error("Not implemented");
}



export function derive_public_key(
    ecdsa_public_key: ECDSAPublicKey,
    simple_derivation_path: DerivationPath,
) : ECDSAPublicKey {


    const hex_public_key = Buffer.from(ecdsa_public_key.public_key).toString('hex');
    console.log("Hex public key: ", hex_public_key);
    const projective_point = ProjectivePoint.fromHex(hex_public_key);
    console.log("Projective point: ", projective_point);
    const affine_point = projective_point.toAffine();
    console.log("Affine point: ", affine_point);

    // Verify that eth chain code has the correct length
    if (ecdsa_public_key.chain_code.length !== 32) {
        throw new Error("Invalid chain code length");
    }



    return {
        chain_code: new Uint8Array(),
        public_key: new Uint8Array(),
    }
}

// TODO: Test error thrown on invalid chain code
// TODO: Test error thrown on invalid derivation path
// TODO: Test error thrown on invalid public key


// Tests the public key derivation
export function test_derive_public_key() {
    const pub_key_without_derivation_path = {
        chain_code: new Uint8Array([
            33, 40, 145, 188, 3, 47, 40, 211, 105, 186, 207, 57, 220, 54, 159, 235, 81, 110,
            206, 217, 163, 216, 52, 152, 36, 106, 234, 209, 84, 111, 140, 209,
        ]),
        public_key: new Uint8Array([
            2, 184, 79, 243, 248, 131, 41, 168, 135, 101, 125, 3, 9, 189, 26, 26, 249, 227,
            118, 1, 229, 209, 165, 53, 214, 254, 125, 66, 227, 127, 121, 244, 10,
        ]),
    };

    console.log("Public key without derivation path: ");
    console.log(pub_key_without_derivation_path);


    const derivation_path: DerivationPath = [ "2", "444", "66666"].map(s => new TextEncoder().encode(s));

    console.log("Derivation path: ");
    console.log(derivation_path);

    const expected_pub_key_with_derivation_path = {
        chain_code: new Uint8Array([
            188, 53, 184, 81, 95, 3, 170, 21, 67, 8, 30, 42, 244, 232, 120, 242, 139, 39, 243,
            206, 0, 192, 53, 244, 6, 135, 2, 211, 62, 232, 133, 134,
        ]),
        public_key: new Uint8Array([
            2, 75, 247, 142, 64, 187, 81, 210, 198, 193, 76, 17, 170, 143, 58, 241, 84, 151,
            65, 222, 90, 205, 249, 37, 230, 220, 35, 13, 252, 93, 170, 34, 217,
        ]),
    };

    const pub_key_with_derivation_path = derive_public_key(pub_key_without_derivation_path, derivation_path);

    console.log("Derived public key: ");
    console.log(pub_key_with_derivation_path);

    console.log("Expected public key: ");
    console.log(expected_pub_key_with_derivation_path);

    // Verify that the derived public key matches the expected public key
    if (!deepEqual(pub_key_with_derivation_path, expected_pub_key_with_derivation_path)) {
        throw new Error("Derived public key does not match expected public key");
    }
}


function deepEqual(x: any, y: any): boolean {
    const ok = Object.keys, tx = typeof x, ty = typeof y;
    return x && y && tx === 'object' && tx === ty ? (
      ok(x).length === ok(y).length &&
        ok(x).every(key => deepEqual(x[key], y[key]))
    ) : (x === y);
  }