import { Principal } from '@dfinity/principal';
import { networks, payments } from 'bitcoinjs-lib';
import { Network } from 'bitcoinjs-lib/src/networks';
import {
	ChainCode,
	DerivationPath,
	PublicKeyWithChainCode,
	Sec1EncodedPublicKey
} from '../ecdsa/secp256k1.js';

/**
 * The Bitcoin networks that are supported by the Chain Fusion Signer.
 */
export type BitcoinNetwork = 'testnet' | 'mainnet' | 'regtest';

/**
 * The public key of the chain fusion signer canister.
 */
export let CHAIN_FUSION_SIGNER_PUBKEY = Sec1EncodedPublicKey.fromHex(
	'0259761672ec7ee3bdc5eca95ba5f6a493d1133b86a76163b68af30c06fe3b75c0'
);

/**
 * The chain code of the chain fusion signer canister.
 */
export let CHAIN_FUSION_SIGNER_CHAINCODE = ChainCode.fromHex(
	'f666a98c7f70fe281ca8142f14eb4d1e0934a439237da83869e2cfd924b270c0'
);

/**
 * The domain separator used by the chain fusion signer for Bitcoin addresses.
 */
export let CHAIN_FUSION_SIGNER_BTC_DOMAIN_SEPARATOR = Uint8Array.from([0x00]);

/**
 * A pretty-printable version of the `chain_fusion_signer_btc_address_for` request.
 */
class ChainFusionSignerBtcAddressForRequest {
	constructor(
		public pubkey: Sec1EncodedPublicKey,
		public chaincode: ChainCode,
		public principal: Principal,
		public network: BitcoinNetwork
	) {}
	public toJSON() {
		return {
			pubkey: this.pubkey.toHex(),
			chaincode: this.chaincode.toHex(),
			principal: this.principal.toText(),
			network: this.network
		};
	}
}

/**
 * A pretty-printable response.
 */
class ChainFusionSignerBtcAddressForResponse {
	constructor(
		public btc_address: string,
		public network: BitcoinNetwork
	) {}
	public toJSON() {
		return {
			btc_address: this.btc_address,
			network: this.network
		};
	}
}

/**
 * Maps a Bitcoin network type to the corresponding bitcoinjs-lib network.
 *
 * @param {BitcoinNetwork} network The Bitcoin network type.
 * @returns {Network} The corresponding bitcoinjs-lib Network object.
 * @throws {Error} If the provided network is not supported.
 */
function mapBitcoinNetworkToBitcoinJS(network: BitcoinNetwork): Network {
	switch (network) {
		case 'mainnet':
			return networks.bitcoin;
		case 'testnet':
			return networks.testnet;
		case 'regtest':
			return networks.regtest;
		default:
			throw new Error(`Unsupported Bitcoin network: ${network}`);
	}
}

// TODO: Accept strings as alternative forms.
export function chain_fusion_signer_btc_address_for(
	user: Principal,
	network: BitcoinNetwork,
	pubkey?: Sec1EncodedPublicKey,
	chaincode?: ChainCode
): {
	request: ChainFusionSignerBtcAddressForRequest;
	response: ChainFusionSignerBtcAddressForResponse;
} {
	if (pubkey === undefined || pubkey === null) {
		pubkey = CHAIN_FUSION_SIGNER_PUBKEY;
	}
	if (chaincode === undefined || chaincode === null) {
		chaincode = CHAIN_FUSION_SIGNER_CHAINCODE;
	}
	let pubkey_with_chain_code = new PublicKeyWithChainCode(pubkey, chaincode);
	let principal_as_bytes = user.toUint8Array();
	let derivation_path = new DerivationPath([
		CHAIN_FUSION_SIGNER_BTC_DOMAIN_SEPARATOR,
		principal_as_bytes
	]);
	let btc_pubkey_with_chaincode = pubkey_with_chain_code.deriveSubkeyWithChainCode(derivation_path);
	let btc_pubkey = btc_pubkey_with_chaincode.public_key;

	let networkJs = mapBitcoinNetworkToBitcoinJS(network);

	let { address: btc_address } = payments.p2wpkh({
		pubkey: btc_pubkey.toBuffer(),
		network: networkJs
	});

	if (btc_address === undefined) {
		throw new Error('Failed to derive Bitcoin address from public key.');
	}

	return {
		request: new ChainFusionSignerBtcAddressForRequest(pubkey, chaincode, user, network),
		response: new ChainFusionSignerBtcAddressForResponse(btc_address, network)
	};
}
