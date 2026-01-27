import type { Principal } from '@dfinity/principal';
import { computeAddress } from 'ethers';
import {
	ChainCode,
	DerivationPath,
	PublicKeyWithChainCode,
	Sec1EncodedPublicKey
} from '../ecdsa/secp256k1.js';

/**
 * The public key of the chain fusion signer canister.
 */
export const CHAIN_FUSION_SIGNER_PUBKEY = Sec1EncodedPublicKey.fromHex(
	'0259761672ec7ee3bdc5eca95ba5f6a493d1133b86a76163b68af30c06fe3b75c0'
);

/**
 * The chain code of the chain fusion signer canister.
 */
export const CHAIN_FUSION_SIGNER_CHAINCODE = ChainCode.fromHex(
	'f666a98c7f70fe281ca8142f14eb4d1e0934a439237da83869e2cfd924b270c0'
);

/**
 * The domain separator used by the chain fusion signer for Ethereum addresses.
 */
export const CHAIN_FUSION_SIGNER_ETH_DOMAIN_SEPARATOR = Uint8Array.from([0x01]);

/**
 * A pretty-printable version of the `chain_fusion_signer_eth_address_for` request.
 */
class ChainFusionSignerEthAddressForRequest {
	constructor(
		public pubkey: Sec1EncodedPublicKey,
		public chaincode: ChainCode,
		public principal: Principal
	) {}
	public toJSON() {
		return {
			pubkey: this.pubkey.toHex(),
			chaincode: this.chaincode.toHex(),
			principal: this.principal.toText()
		};
	}
}

/**
 * A pretty-printable response.
 */
class ChainFusionSignerEthAddressForResponse {
	constructor(public eth_address: string) {}
	public toJSON() {
		return {
			eth_address: this.eth_address
		};
	}
}

// TODO: Accept strings as alternative forms.
export function chainFusionSignerEthAddressFor(
	user: Principal,
	pubkey?: Sec1EncodedPublicKey,
	chaincode?: ChainCode
): {
	request: ChainFusionSignerEthAddressForRequest;
	response: ChainFusionSignerEthAddressForResponse;
} {
	if (pubkey === undefined || pubkey === null) {
		pubkey = CHAIN_FUSION_SIGNER_PUBKEY;
	}
	if (chaincode === undefined || chaincode === null) {
		chaincode = CHAIN_FUSION_SIGNER_CHAINCODE;
	}
	const publicKeyWithChainCode = new PublicKeyWithChainCode(pubkey, chaincode);
	const principalAsBytes = user.toUint8Array();
	const derivationPath = new DerivationPath([
		CHAIN_FUSION_SIGNER_ETH_DOMAIN_SEPARATOR,
		principalAsBytes
	]);
	const ethPubkeyWithChaincode = publicKeyWithChainCode.deriveSubkeyWithChainCode(derivationPath);
	const ethPubkey = ethPubkeyWithChaincode.public_key;

	const ethAddress = computeAddress('0x' + ethPubkey.toHex());

	return {
		request: new ChainFusionSignerEthAddressForRequest(pubkey, chaincode, user),
		response: new ChainFusionSignerEthAddressForResponse(ethAddress)
	};
}
