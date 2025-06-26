# IC Public Key

TypeScript library for working with ICP public keys.

This library contains TypeScript translations of the following functions:

- [`ic_secp256k1::PublicKey::derive_subkey_with_chain_code()`](https://docs.rs/ic-secp256k1/0.1.0/ic_secp256k1/struct.PublicKey.html#method.derive_subkey_with_chain_code)
- COMING: [`ic_ed25519::PublicKey::derive_subkey_with_chain_code()`](https://docs.rs/ic-ed25519/0.2.0/ic_ed25519/struct.PublicKey.html#method.derive_subkey_with_chain_code)

# Usage

## `npm`

This library will be published on npm after the source code has been open sourced.

## Command line

Build the CLI as follows:

```
npm ci
npm run build
npx ic-pub-key --help
```

To derive one public key from another:

```
npx ic-pub-key derive ecdsa secp256k1 --pubkey 02b84ff3f88329a887657d0309bd1a1af9e37601e5d1a535d6fe7d42e37f79f40a --chaincode 212891bc032f28d369bacf39dc369feb516eced9a3d83498246aead1546f8cd1 --derivationpath fee/fie/foo/fum
```

The command line also includes tools for working with the [Chain Fusion Signer](https://github.com/dfinity/chain-fusion-signer). For example, to get the Ethereum address of a principal on the chain fusion signer:

```
npx ic-pub-key signer eth address -u nggqm-p5ozz-i5hfv-bejmq-2gtow-4dtqw-vjatn-4b4yw-s5mzs-i46su-6ae
```

Or to get the Bitcoin mainnet address of a principal on the chain fusion signer:

```
npx ic-pub-key signer btc address -u nggqm-p5ozz-i5hfv-bejmq-2gtow-4dtqw-vjatn-4b4yw-s5mzs-i46su-6ae -n mainnet
```
