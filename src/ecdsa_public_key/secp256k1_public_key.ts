
type ECDSAPublicKey = {
    chain_code: Uint8Array;
    public_key: Uint8Array;
}

type DerivationPath = Uint8Array[];


export function derive_public_key(
    ecdsa_public_key: ECDSAPublicKey,
    simple_derivation_path: DerivationPath,
) : ECDSAPublicKey {


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

    console.log(pub_key_without_derivation_path);


    const derivation_path: DerivationPath = [ "2", "444", "66666"].map(s => new TextEncoder().encode(s));

    //const pub_key_with_derivation_path = derive_public_key(pub_key_without_derivation_path, derivation_path);


    const pub_key_with_derivation_path = derive_public_key(pub_key_without_derivation_path, derivation_path);

    console.log(pub_key_with_derivation_path);
}
