use ic_ed25519::{DerivationIndex, DerivationPath, PublicKey};

use pretty_assertions::assert_eq;

use crate::test_vector::{ChainCode, SerializedDerivationPath, load_test_vectors};

/// Converts a derivation path from the test vectors into the equivalent type in the `ic_secp256k1` crate.
impl From<SerializedDerivationPath> for DerivationPath {
    fn from(path: SerializedDerivationPath) -> Self {
        Self::new(path.elements.into_iter().map(DerivationIndex).collect())
    }
}

/// A public key together with the corresponding chain code.
#[derive(Debug)]
pub struct PublicKeyWithChainCode {
    pub public_key: PublicKey,
    pub chain_code: ChainCode,
}
impl PublicKeyWithChainCode {
    pub fn from_hex(public_key: &str, chain_code: &str) -> Result<Self, String> {
        let public_key_bytes =
            hex::decode(public_key).map_err(|e| format!("Invalid public key hex: {}", e))?;
        let public_key = PublicKey::deserialize_raw(&public_key_bytes)
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
    let test_vectors = load_test_vectors("schnorr", "ed25519");
    for test_vector in test_vectors {
        let parent_key =
            PublicKeyWithChainCode::from_hex(&test_vector.public_key, &test_vector.chain_code)
                .unwrap_or_else(|err| {
                    panic!(
                        "Failed to parse parent public key hex: {}\n{}",
                        test_vector.public_key, err
                    )
                });
        let derivation_path: DerivationPath =
            SerializedDerivationPath::from_blob(test_vector.derivation_path.as_deref())
                .unwrap_or_else(|err| {
                    panic!(
                        "Failed to parse derivation path for test vector: {:?}\n{}",
                        test_vector.derivation_path, err
                    )
                })
                .into();
        let expected_derived_key = PublicKeyWithChainCode::from_hex(
            &test_vector.expected_public_key,
            &test_vector.expected_chain_code,
        )
        .unwrap_or_else(|err| {
            panic!(
                "Failed to parse expected derived public key hex: {}\n{}",
                test_vector.expected_public_key, err
            )
        });
        let (derived_key, derived_chain_code) = parent_key
            .public_key
            .derive_subkey_with_chain_code(&derivation_path, &parent_key.chain_code.0);
        assert_eq!(derived_key, expected_derived_key.public_key);
        assert_eq!(derived_chain_code, expected_derived_key.chain_code.0);
    }
}
