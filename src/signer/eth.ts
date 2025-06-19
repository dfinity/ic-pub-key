import { Principal } from '@dfinity/principal';
import { computeAddress } from 'ethers';
import {
	ChainCode,
	DerivationPath,
	PublicKeyWithChainCode,
	Sec1EncodedPublicKey
} from '../ecdsa/secp256k1';

export const CHAIN_FUSION_SIGNER_PUBKEY = Sec1EncodedPublicKey.fromHex(
	'0259761672ec7ee3bdc5eca95ba5f6a493d1133b86a76163b68af30c06fe3b75c0'
);
export const CHAIN_FUSION_SIGNER_CHAINCODE = ChainCode.fromHex(
	'f666a98c7f70fe281ca8142f14eb4d1e0934a439237da83869e2cfd924b270c0'
);
export const CHAIN_FUSION_SIGNER_ETH_DOMAIN_SEPARATOR = Uint8Array.from([0x01]);

// TODO: Accept strings as alternative forms.
export function eth_pubkey(user: Principal, pubkey?: Sec1EncodedPublicKey, chaincode?: ChainCode) {
	if (pubkey === undefined) {
		pubkey = CHAIN_FUSION_SIGNER_PUBKEY;
	}
	if (chaincode === undefined) {
		chaincode = CHAIN_FUSION_SIGNER_CHAINCODE;
	}
	let pubkey_with_chain_code = new PublicKeyWithChainCode(pubkey, chaincode);
	let principal_as_bytes = user.toUint8Array();
	let derivation_path = new DerivationPath([
		CHAIN_FUSION_SIGNER_ETH_DOMAIN_SEPARATOR,
		principal_as_bytes
	]);
	let eth_pubkey_with_chaincode = pubkey_with_chain_code.deriveSubkeyWithChainCode(derivation_path);
	let eth_pubkey = eth_pubkey_with_chaincode.public_key;

	return computeAddress('0x' + eth_pubkey.toHex());
}
