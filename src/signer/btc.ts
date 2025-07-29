import { Principal } from '@dfinity/principal';
import { Network, networks, payments } from 'bitcoinjs-lib';
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
	// TODO: Check if this chaincode is technically correct. For now it should not matter, and it works everything correctly.
	'f666a98c7f70fe281ca8142f14eb4d1e0934a439237da83869e2cfd924b270c0'
);

/**
 * The domain separator used by the chain fusion signer for Bitcoin addresses.
 */
export const CHAIN_FUSION_SIGNER_BTC_DOMAIN_SEPARATOR = Uint8Array.from([0x00]);

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
 * The supported Bitcoin networks for the Chain Fusion Signer.
 */
export const BITCOIN_NETWORKS = ['mainnet', 'testnet', 'regtest'] as const;

/**
 * The type of the Bitcoin networks that are supported by the Chain Fusion Signer.
 */
export type BitcoinNetwork = (typeof BITCOIN_NETWORKS)[number];

/**
 * The supported Bitcoin address for the Chain Fusion Signer.
 */
export const BITCOIN_ADDRESS_TYPES = ['p2wpkh'] as const;

/**
 * The type of Bitcoin addresses that are supported by the Chain Fusion Signer.
 */
export type BitcoinAddressType = (typeof BITCOIN_ADDRESS_TYPES)[number];

/**
 * The default Bitcoin address type.
 */
export const DEFAULT_BITCOIN_ADDRESS_TYPE: BitcoinAddressType = 'p2wpkh';

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
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions -- This is just a fail-safe error message.
			throw new Error(`Unsupported Bitcoin network: ${network}`);
	}
}

// TODO: Accept strings as alternative forms.
export function chainFusionSignerBtcAddressFor(
	user: Principal,
	network: BitcoinNetwork,
	addressType?: BitcoinAddressType,
	pubkey?: Sec1EncodedPublicKey,
	chaincode?: ChainCode
): {
	request: ChainFusionSignerBtcAddressForRequest;
	response: ChainFusionSignerBtcAddressForResponse;
} {
	if (addressType === undefined || addressType === null) {
		addressType = DEFAULT_BITCOIN_ADDRESS_TYPE;
	}
	if (pubkey === undefined || pubkey === null) {
		pubkey = CHAIN_FUSION_SIGNER_PUBKEY;
	}
	if (chaincode === undefined || chaincode === null) {
		chaincode = CHAIN_FUSION_SIGNER_CHAINCODE;
	}
	const publicKeyWithChainCode = new PublicKeyWithChainCode(pubkey, chaincode);
	const principalAsBytes = user.toUint8Array();
	const derivationPath = new DerivationPath([
		CHAIN_FUSION_SIGNER_BTC_DOMAIN_SEPARATOR,
		principalAsBytes
	]);
	const btcPubkeyWithChaincode = publicKeyWithChainCode.deriveSubkeyWithChainCode(derivationPath);
	const btcPubkey = btcPubkeyWithChaincode.public_key;

	const networkJs = mapBitcoinNetworkToBitcoinJS(network);

	let btcAddress: string | undefined;

	if (addressType === 'p2wpkh') {
		({ address: btcAddress } = payments.p2wpkh({
			pubkey: btcPubkey.toBuffer(),
			network: networkJs
		}));
	} else {
		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions -- This is just a fail-safe error message.
		throw new Error(`Unsupported Bitcoin address type: ${addressType}`);
	}

	if (btcAddress === undefined) {
		throw new Error('Failed to derive Bitcoin address from public key.');
	}

	return {
		request: new ChainFusionSignerBtcAddressForRequest(pubkey, chaincode, user, network),
		response: new ChainFusionSignerBtcAddressForResponse(btcAddress, network)
	};
}
