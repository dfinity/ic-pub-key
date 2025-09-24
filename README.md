# IC Public Key

TypeScript library for working with ICP public keys.

The Internet Computer protcol supports several threshold signature schemes
including ECDSA, Ed25519, and BIP340 Schnorr. In these schemes, the various user
public keys are derived from a master key which is split among the nodes in a
subnet. This derivation can be done online, using the `ecdsa_public_key` and
`schnorr_public_key` management canister calls, but since no secret is involved
in the derivation process it can also be performed offline.

This library contains TypeScript implementations of this derivation, allowing
keys to be derived by frontend applications without a call to the IC.

You can find Rust implementations of this same functionality in the
[`ic_secp256k1`](https://docs.rs/ic-secp256k1/) and [`ic_ed25519`](https://docs.rs/ic-ed25519/)
crates.

# Usage

## `npm`

```
npm install @dfinity/ic-pub-key
```

## Command line

To derive one public key from another:

```
npx @dfinity/ic-pub-key derive ecdsa secp256k1 --pubkey 02b84ff3f88329a887657d0309bd1a1af9e37601e5d1a535d6fe7d42e37f79f40a --chaincode 212891bc032f28d369bacf39dc369feb516eced9a3d83498246aead1546f8cd1 --derivationpath fee/fie/foo/fum
```

The command line also includes tools for working with the [Chain Fusion Signer](https://github.com/dfinity/chain-fusion-signer). For example, to get the Ethereum address of a principal on the chain fusion signer:

```
npx @dfinity/ic-pub-key signer eth address -u nggqm-p5ozz-i5hfv-bejmq-2gtow-4dtqw-vjatn-4b4yw-s5mzs-i46su-6ae
```

Or to get the Bitcoin mainnet address of a principal on the chain fusion signer:

```
npx @dfinity/ic-pub-key signer btc address -u nggqm-p5ozz-i5hfv-bejmq-2gtow-4dtqw-vjatn-4b4yw-s5mzs-i46su-6ae -n mainnet
```
