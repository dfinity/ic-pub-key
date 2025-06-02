use elliptic_curve::PrimeField;
use ic_secp256k1::{DerivationIndex, DerivationPath};
use ic_secp256k1::PublicKey;
use pretty_assertions::assert_eq;

#[derive(Debug, PartialEq, Eq)]
pub struct ECDSAPublicKey {
    chain_code: Vec<u8>,
    public_key: Vec<u8>,
}

#[cfg(test)]
mod tests {

    use super::*;

    #[test]
    pub fn derivation_works() {
        print_test_vectors();
    }
}

pub fn print_test_vectors() {
    let pub_key_without_derivation_path = ECDSAPublicKey {
        chain_code: vec![
            33, 40, 145, 188, 3, 47, 40, 211, 105, 186, 207, 57, 220, 54, 159, 235, 81, 110,
            206, 217, 163, 216, 52, 152, 36, 106, 234, 209, 84, 111, 140, 209,
        ],
        public_key: vec![
            2, 184, 79, 243, 248, 131, 41, 168, 135, 101, 125, 3, 9, 189, 26, 26, 249, 227,
            118, 1, 229, 209, 165, 53, 214, 254, 125, 66, 227, 127, 121, 244, 10,
        ],
    };
    {
        // Print point of the public key:
        let public_key_point = PublicKey::deserialize_sec1(&pub_key_without_derivation_path.public_key)
            .expect("Failed to parse ECDSA public key");
        println!("Public key point: {:?}", public_key_point);
    }

        let derivation_path: Vec<Vec<u8>> = vec![
        "2".repeat(1).as_bytes().to_vec(),
        "4".repeat(3).as_bytes().to_vec(),
        "6".repeat(5).as_bytes().to_vec(),
    ];
    let pub_key_with_derivation_path = ECDSAPublicKey {
        chain_code: vec![
            188, 53, 184, 81, 95, 3, 170, 21, 67, 8, 30, 42, 244, 232, 120, 242, 139, 39, 243,
            206, 0, 192, 53, 244, 6, 135, 2, 211, 62, 232, 133, 134,
        ],
        public_key: vec![
            2, 75, 247, 142, 64, 187, 81, 210, 198, 193, 76, 17, 170, 143, 58, 241, 84, 151,
            65, 222, 90, 205, 249, 37, 230, 220, 35, 13, 252, 93, 170, 34, 217,
        ],
    };
    assert_eq!(
        derive_public_key(&pub_key_without_derivation_path, &derivation_path),
        pub_key_with_derivation_path
    );
}

pub fn derivation_path(simple: &Vec<Vec<u8>>) -> DerivationPath {
    DerivationPath::new(simple.iter().map(|x| DerivationIndex(x.to_vec())).collect())
}

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

    println!("derive_public_key:");
    println!("derive_public_key: arg1: pubkey: {pk}");
    println!("derive_public_key: arg1: chain code: {:?}", hex::encode(&ecdsa_public_key.chain_code));
    println!("derive_public_key: arg2: {:?}", &simple_derivation_path);
    

    println!("Modulus: {}", k256::Scalar::MODULUS);

    let (derived_public_key, derived_chain_code) =
        pk.derive_subkey_with_chain_code(&path, &chain_code);

    ECDSAPublicKey {
        public_key: derived_public_key.serialize_sec1(true),
        chain_code: derived_chain_code.to_vec(),
    }
}
