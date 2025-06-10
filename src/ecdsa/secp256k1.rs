use ic_secp256k1::{DerivationIndex, DerivationPath, PublicKey};
use elliptic_curve::PrimeField;
use pretty_assertions::assert_eq;

use crate::test_vector::{load_test_vectors, ChainCode, SerializedDerivationPath, TestVector};

/// Converts a derivation path from the test vectors into the equivalent type in the `ic_secp256k1` crate.
impl From<SerializedDerivationPath> for DerivationPath {
    fn from(path: SerializedDerivationPath) -> Self {
        Self::new(
            path.elements
                .into_iter()
                .map(|element| DerivationIndex(element.clone()))
                .collect(),
        )
    }
}

/// A public key together with the corresponding chain code.
#[derive(Debug, PartialEq, Eq)]
pub struct PublicKeyWithChainCode {
    pub public_key: PublicKey,
    pub chain_code: ChainCode,
}
impl PublicKeyWithChainCode {
    pub fn from_hex(public_key: &str, chain_code: &str) -> Result<Self, String> {
        let public_key_bytes =
            hex::decode(public_key).map_err(|e| format!("Invalid public key hex: {}", e))?;
        let public_key = PublicKey::deserialize_sec1(&public_key_bytes) // The key type name is bip340secp256k1 but parsing is as sec1?
            .map_err(|e| format!("Invalid public key: {}", e))?;
        let chain_code = ChainCode::from_hex(chain_code)?;
        Ok(Self {
            public_key,
            chain_code,
        })
    }
}

#[test]
fn key_derivation_works() {
    let test_vectors = load_test_vectors("schnorr", "bip340secp256k1");
    for test_vector in test_vectors {
        let parent_key =
            PublicKeyWithChainCode::from_hex(&test_vector.public_key, &test_vector.chain_code)
                .unwrap();
        let derivation_path: DerivationPath =
            SerializedDerivationPath::from_blob(&test_vector.derivation_path)
                .unwrap()
                .into();
        let expected_derived_key = PublicKeyWithChainCode::from_hex(
            &test_vector.expected_public_key,
            &test_vector.expected_chain_code,
        )
        .unwrap();
        let (derived_key, derived_chain_code) = parent_key
            .public_key
            .derive_subkey_with_chain_code(&derivation_path, &parent_key.chain_code.0);
        assert_eq!(derived_key, expected_derived_key.public_key);
        assert_eq!(derived_chain_code, expected_derived_key.chain_code.0);
    }
}
