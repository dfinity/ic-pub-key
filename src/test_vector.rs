use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct TestVector {
    pub name: String,
    pub public_key: String,
    pub chain_code: String,
    pub derivation_path: String,
    pub expected_public_key: String,
    pub expected_chain_code: String,
}

/// Loads the test vectors for a given algorithm and curve.
pub fn load_test_vectors(algorithm: &str, curve: &str) -> Vec<TestVector> {
    let test_vectors = include_str!("../test/samples.json");
    let samples: Value = serde_json::from_str(test_vectors).unwrap();
    let test_vectors = &samples[algorithm][curve]["test_vectors"];
    serde_json::from_value(test_vectors.clone()).unwrap()
}


/// Derivation path, as serialized in the test vectors.
#[derive(Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct SerializedDerivationPath {
    pub elements: Vec<Vec<u8>>,
}
impl SerializedDerivationPath {
    /// Parse a derivation path from a blob.
    ///
    /// # Example
    /// ```
    /// use ic_pub_key_tests::test_vector::SerializedDerivationPath;
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
    /// use ic_pub_key_tests::test_vector::SerializedDerivationPath;
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

#[derive(Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct ChainCode(pub [u8; ChainCode::LENGTH]);
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
