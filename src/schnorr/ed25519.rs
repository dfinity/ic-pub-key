//! Derives public keys locally with the ic-ed25519 library.

use ic_ed25519::PublicKey;
use serde::{Deserialize, Serialize};
use serde_json::Value;
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
    pub public_key: String,
    pub chain_code: String,
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
        let public_key = PublicKey::deserialize_raw(&public_key_bytes)
            .map_err(|e| format!("Invalid public key: {}", e))?;
        let chain_code = ChainCode::from_hex(chain_code)?;
        Ok(Self {
            public_key,
            chain_code,
        })
    }
}

pub fn load_test_vectors() -> Vec<PublicKeyWithChainCode> {
    let test_vectors = include_str!("../../test/samples.json");
    let samples: Value = serde_json::from_str(test_vectors).unwrap();
    let test_vectors = &samples["schnorr"]["test_vectors"];
    let test_vectors: Vec<TestVector> =
        serde_json::from_value(test_vectors.clone()).unwrap();
    test_vectors
        .into_iter()
        .map(|v| PublicKeyWithChainCode::from_hex(&v.public_key, &v.chain_code).unwrap())
        .collect()
}
