//! Tests that the key derivation test vectors are consistent with the Rust implementation.
#[cfg(test)]
pub mod ecdsa;

#[cfg(test)]
pub mod schnorr;

pub mod test_vector;
