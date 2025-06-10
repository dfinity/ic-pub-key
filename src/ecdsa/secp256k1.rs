use ic_secp256k1::{DerivationIndex, DerivationPath, PublicKey};
use serde::{Deserialize, Serialize};
use serde_json::Value;

/// Detivation path, as serialized in the test vectors.
#[derive(Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct SerializedDerivationPath {
    pub elements: Vec<Vec<u8>>,
}
impl SerializedDerivationPath {
    /// Parse a derivation path from a blob.
    /// 
    /// # Example
    /// ```
    /// use ic_pub_key_tests::ecdsa::secp256k1::SerializedDerivationPath;
    /// let path = SerializedDerivationPath::from_blob("part1/part2/part3").unwrap();
    /// assert_eq!(path.elements, vec!["part1".as_bytes(), "part2".as_bytes(), "part3".as_bytes()]);
    /// ```
    pub fn from_blob(blob: &str) -> Result<Self, String> {
        // Split the string at '/' and parse each element:
        let elements = blob
            .split('/')
            .map(Self::element_from_blob)
            .collect::<Result<Vec<_>, _>>()?;
        Ok(Self { elements })
    }
    /// Parse a single derivation path element from a blob.
    /// 
    /// Note: A blob here refers to a candid string encoded blob, in which non-ASCII-alphanumeric characters are represented as hex escaped with a backslash.
    /// 
    /// # Example
    /// ```
    /// use ic_pub_key_tests::ecdsa::secp256k1::SerializedDerivationPath;
    /// let element = SerializedDerivationPath::element_from_blob(r#"SETI\40home"#).unwrap();
    /// assert_eq!(element, "SETI@home".as_bytes());
    /// ```
    pub fn element_from_blob(blob: &str) -> Result<Vec<u8>, String> {
        let mut elements = Vec::new();
        let mut chars = blob.chars();
        while let Some(next) = chars.next() {
            let byte = if next == '\\' {
                // Parse the next 2 chars as a hex byte:
                let mut byte = 0u8;
                for _ in 0..2 {
                    byte = byte * 16
                        + chars
                            .next()
                            .expect("Expect two hex chars after a backslash.")
                            .to_digit(16)
                            .unwrap() as u8;
                }
                byte
            } else {
                // Parse the next char as ASCII:
                next as u8
            };
            elements.push(byte);
        }
        Ok(elements)
    }
}
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

#[derive(Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct ChainCode([u8; ChainCode::LENGTH]);
impl ChainCode {
    const LENGTH: usize = 32;
    pub fn from_hex(hex: &str) -> Result<Self, String> {
        if hex.len() != Self::LENGTH * 2 {
            return Err(format!(
                "Invalid chain code hex length: Expected {}, got {}",
                Self::LENGTH * 2,
                hex.len()
            ));
        }
        let bytes = hex::decode(hex).map_err(|e| format!("Invalid chain code hex: {}", e))?;
        let mut chain_code = [0u8; Self::LENGTH];
        chain_code.copy_from_slice(&bytes);
        Ok(Self(chain_code))
    }
}

#[derive(Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct TestVector {
    pub name: String,
    pub public_key: String,
    pub chain_code: String,
    pub derivation_path: String,
    pub expected_public_key: String,
    pub expected_chain_code: String,
}

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

pub fn load_test_vectors() -> Vec<TestVector> {
    let test_vectors = include_str!("../../test/samples.json");
    let samples: Value = serde_json::from_str(test_vectors).unwrap();
    let test_vectors = &samples["schnorr"]["bip340secp256k1"]["test_vectors"];
    serde_json::from_value(test_vectors.clone()).unwrap()
}

#[test]
fn key_derivation_works() {
    let test_vectors = load_test_vectors();
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