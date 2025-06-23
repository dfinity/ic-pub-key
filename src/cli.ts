import { Principal } from '@dfinity/principal';
import { Command, Option } from 'commander';
import { computeAddress } from 'ethers';
import { Command } from 'commander';
import {
	ChainCode,
	DerivationPath,
	Sec1EncodedPublicKey,
	PublicKeyWithChainCode as Secp256k1PublicKeyWithChainCode
} from './ecdsa/secp256k1.js';
import { BITCOIN_NETWORKS, chain_fusion_signer_btc_address_for } from './signer/btc.js';
import { chain_fusion_signer_eth_address_for } from './signer/eth.js';

export const program = new Command();

program
	.name('ic-pub-key')
	.description('Tools for Internet Computer Protocol public keys')
	.version('1.0.0');

let derive = program.command('derive').description('Derive a public key');

let ecdsa = derive.command('ecdsa').description('Derive an ECDSA public key');

ecdsa
	.command('secp256k1')
	.description('Derive a key')
	.requiredOption('-k, --pubkey <pubkey>', 'The parent public key', String)
	.requiredOption('-c, --chaincode <chaincode>', 'The parent chain code', String)
	.option('-d, --derivationpath <derivationpath>', 'The derivation path', String)
	.action(({ pubkey, chaincode, derivationpath }) => {
		console.log(ecdsa_secp256k1_derive(pubkey, chaincode, derivationpath));
	});

function ecdsa_secp256k1_derive(pubkey: string, chaincode: string, derivationpath: string): string {
	let pubkey_with_chain_code = Secp256k1PublicKeyWithChainCode.fromString({
		public_key: pubkey,
		chain_code: chaincode
	});
	let parsed_derivationpath = DerivationPath.fromBlob(derivationpath);
	let derived_pubkey = pubkey_with_chain_code.deriveSubkeyWithChainCode(parsed_derivationpath);
	let ans = {
		request: {
			key: pubkey_with_chain_code,
			derivation_path: parsed_derivationpath
		},
		response: derived_pubkey.toHex()
	};
	return JSON.stringify(ans, null, 2);
}

let signer = program.command('signer').description('Get chain fusion signer token address');

let eth = signer.command('eth').description('Get Ethereum address');

eth
	.command('address')
	.description("Get a user's Ethereum address")
	.addHelpText(
		'after',
		`

This is a cheap and fast way of obtaining a user's Chain Fusion Signer Ethereum address.  It is equivalent to API calls such as:

$ dfx canister call signer --with-cycles 1000000000 --ic eth_address '(record{ "principal" = opt principal "nggqm-p5ozz-i5hfv-bejmq-2gtow-4dtqw-vjatn-4b4yw-s5mzs-i46su-6ae"}, null)' --wallet "$(dfx identity get-wallet --ic)"
(
  variant {
    Ok = record { address = "0xf53e047376e37eAc56d48245B725c47410cf6F1e" }
  },
)

`
	)
	.option('-p, --pubkey <pubkey>', "The signer canister's public key", String)
	.option('-c, --chaincode <chaincode>', "The signer canister's chain code", String)
	.requiredOption('-u, --user <user>', "The user's principal", String)
	.action(({ pubkey, chaincode, user }) => {
		pubkey = pubkey == null ? null : Sec1EncodedPublicKey.fromString(pubkey);
		chaincode = chaincode == null ? null : ChainCode.fromString(chaincode);
		user = Principal.fromText(user);

		let ans = chain_fusion_signer_eth_address_for(user, pubkey, chaincode);
		console.log(JSON.stringify(ans, null, 2));
	});

let btc = signer.command('btc').description('Get Bitcoin address');

// TODO: write the correct example, since the Signer Canister does not have an endpoint for principals as input.
btc
	.command('address')
	.description("Get a user's Bitcoin address")
	.addHelpText(
		'after',
		`

This is a cheap and fast way of obtaining a user's Chain Fusion Signer Bitcoin address.  It is equivalent to API calls such as:

$ dfx canister call signer --with-cycles 1000000000 --ic btc_caller_address '(record{ "principal" = opt principal "nggqm-p5ozz-i5hfv-bejmq-2gtow-4dtqw-vjatn-4b4yw-s5mzs-i46su-6ae"}, null)' --wallet "$(dfx identity get-wallet --ic)"
(
  variant {
    Ok = record { address = "0xf53e047376e37eAc56d48245B725c47410cf6F1e" }
  },
)

`
	)
	.option('-p, --pubkey <pubkey>', "The signer canister's public key", String)
	.option('-c, --chaincode <chaincode>', "The signer canister's chain code", String)
	.requiredOption('-u, --user <user>', "The user's principal", String)
	.addOption(new Option('-n, --network <network>', 'The Bitcoin network').choices(BITCOIN_NETWORKS))
	.action(({ pubkey, chaincode, user, network }) => {
		pubkey = pubkey == null ? null : Sec1EncodedPublicKey.fromString(pubkey);
		chaincode = chaincode == null ? null : ChainCode.fromString(chaincode);
		user = Principal.fromText(user);

		let ans = chain_fusion_signer_btc_address_for(user, network, pubkey, chaincode);
		console.log(JSON.stringify(ans, null, 2));
	});
