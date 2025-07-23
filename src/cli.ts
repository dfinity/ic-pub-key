/* eslint-disable no-console */

import { Principal } from '@dfinity/principal';
import { isNullish } from '@dfinity/utils';
import { Command, Option } from 'commander';
import {
	ChainCode,
	DerivationPath,
	Sec1EncodedPublicKey,
	PublicKeyWithChainCode as Secp256k1PublicKeyWithChainCode
} from './ecdsa/secp256k1.js';
import { schnorr_ed25519_derive } from './schnorr/ed25519.js';
import {
	BITCOIN_ADDRESS_TYPES,
	BITCOIN_NETWORKS,
	chain_fusion_signer_btc_address_for,
	DEFAULT_BITCOIN_ADDRESS_TYPE
} from './signer/btc.js';
import { chain_fusion_signer_eth_address_for } from './signer/eth.js';

export const program = new Command();

program
	.name('ic-pub-key')
	.description('Tools for Internet Computer Protocol public keys')
	.version('1.0.0');

const derive = program.command('derive').description('Derive a public key');

const ecdsa = derive.command('ecdsa').description('Derive an ECDSA public key');

ecdsa
	.command('secp256k1')
	.description('Derive a key')
	.requiredOption('-k, --pubkey <pubkey>', 'The parent public key', String)
	.requiredOption('-c, --chaincode <chaincode>', 'The parent chain code', String)
	.option('-d, --derivationpath <derivationpath>', 'The derivation path', String)
	.action(({ pubkey, chaincode, derivationpath }) => {
		// TODO: Make this call type-safe
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		console.log(ecdsa_secp256k1_derive(pubkey, chaincode, derivationpath));
	});

function ecdsa_secp256k1_derive(pubkey: string, chaincode: string, derivationpath: string): string {
	const pubkey_with_chain_code = Secp256k1PublicKeyWithChainCode.fromString({
		public_key: pubkey,
		chain_code: chaincode
	});
	const parsed_derivationpath = DerivationPath.fromBlob(derivationpath);
	const derived_pubkey = pubkey_with_chain_code.deriveSubkeyWithChainCode(parsed_derivationpath);
	const ans = {
		request: {
			key: pubkey_with_chain_code,
			derivation_path: parsed_derivationpath
		},
		response: derived_pubkey.toHex()
	};
	return JSON.stringify(ans, null, 2);
}

const schnorr = derive.command('schnorr').description('Derive a Schnorr public key');

schnorr
	.command('ed25519')
	.description('Computes the public key of a Schnorr ed25519 threshold key held on ICP.')
		.addHelpText('after', `
This is a cheap and fast way of obtaining the public key of a Schnorr ed25519 threshold key held on ICP.

For example, to get the Solana address of an actor golding funds with the chain fusion signer, the command might be:

derive schnorr ed25519 -d "\${CANISTER_PRINCIPAL}/\\fe/\${ACTOR_PRINCIPAL}/SOL/mainnet'
e.g.:
derive schnorr ed25519 -d '\\00\\00\\00\\00\\02\\30\\00\\71\\01\\01/\\fe/\\9b\\c6\\c0\\a1\\09\\02\\12\\e2\\a3\\55\\86\\d4\\37\\1b\\a9\\9e\\63\\93\\b0\\1f\\21\\75\\dc\\95\\55\\91\\cd\\0b\\02/SOL/mainnet'

That yields the actor's public key.  Encoding as base58 yields the Solana address:

$ echo db5dae1b737f8d694b8fba6ce2430dc75e1096ccfa33397a6c352252c7e72268 | xxd -r -p | base58  ; echo
FmK8wmdFM72z4vKzzyYWYi7W5sReALBS72BHn6mDDJPh
`)
	.addOption(
		new Option('-k, --pubkey <string>', 'The public key').default(
			'da38b16641af7626e372070ff9f844b7c89d1012850d2198393849d79d3d2d5d'
		)
	)
	.addOption(
		new Option('-c, --chaincode <string>', 'The chain code').default(
			'985be5283a68fc22540930ca02680f86c771419ece571eb838b33eb5604cfbc0'
		)
	)
	.addOption(new Option('-d, --derivationpath <string>', 'The derivation path'))
	.action(({ pubkey, chaincode, derivationpath }) => {
		const pubkey_or_default: string = isNullish(pubkey)
			? 'da38b16641af7626e372070ff9f844b7c89d1012850d2198393849d79d3d2d5d'
			: String(pubkey);
		const chaincode_or_default: string = isNullish(chaincode)
			? '985be5283a68fc22540930ca02680f86c771419ece571eb838b33eb5604cfbc0'
			: String(chaincode);
		const derivationpath_or_null: string | null = isNullish(derivationpath)
			? null
			: String(derivationpath);
		console.log(
			schnorr_ed25519_derive(pubkey_or_default, chaincode_or_default, derivationpath_or_null)
		);
	});

const signer = program.command('signer').description('Get chain fusion signer token address');

const btc = signer.command('btc').description('Get Bitcoin address');

// TODO: write the correct example, since the Signer Canister does not have an endpoint for principals as input.
btc
	.command('address')
	.description("Get a user's Bitcoin address")
	.addHelpText(
		'after',
		`

This is a cheap and fast way of obtaining a user's Chain Fusion Signer Bitcoin address.  It is equivalent to API calls such as:

$ dfx canister call signer --with-cycles 1000000000 --ic btc_caller_address '(record{ "network" = "mainnet"; address_type = { P2WPKH: null }}, null)' --wallet "$(dfx identity get-wallet --ic)"
(
  variant {
    Ok = record { address = "bc1qwug6tj9z7tgvsp4u8sfzvjzatzs9rmwwck6qky" }
  },
)

`
	)
	.option('-p, --pubkey <pubkey>', "The signer canister's public key", String)
	.option('-c, --chaincode <chaincode>', "The signer canister's chain code", String)
	.requiredOption('-u, --user <user>', "The user's principal", String)
	.addOption(
		new Option('-n, --network <network>', 'The Bitcoin network')
			.choices(BITCOIN_NETWORKS)
			.makeOptionMandatory()
	)
	.addOption(
		new Option('-t, --address-type <network>', 'The Bitcoin address type')
			.choices(BITCOIN_ADDRESS_TYPES)
			.default(DEFAULT_BITCOIN_ADDRESS_TYPE)
	)
	.action(
		({
			pubkey,
			chaincode,
			user,
			network,
			addressType
		}: {
			pubkey?: string | null;
			chaincode?: string | null;
			user: string;
			network: string;
			addressType: string;
		}) => {
			const decodedPubkey = isNullish(pubkey) ? undefined : Sec1EncodedPublicKey.fromString(pubkey);
			const decodedChaincode = isNullish(chaincode) ? undefined : ChainCode.fromString(chaincode);
			const userPrincipal = Principal.fromText(user);
			const btcNetwork = network as (typeof BITCOIN_NETWORKS)[number];
			const addressTypeValue = addressType as (typeof BITCOIN_ADDRESS_TYPES)[number];

			const ans = chain_fusion_signer_btc_address_for(
				userPrincipal,
				btcNetwork,
				addressTypeValue,
				decodedPubkey,
				decodedChaincode
			);
			console.log(JSON.stringify(ans, null, 2));
		}
	);

const eth = signer.command('eth').description('Get Ethereum address');

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
	.action(
		({
			pubkey,
			chaincode,
			user
		}: {
			pubkey?: string | null;
			chaincode?: string | null;
			user: string;
		}) => {
			const decodedPubkey = isNullish(pubkey) ? undefined : Sec1EncodedPublicKey.fromString(pubkey);
			const decodedChaincode = isNullish(chaincode) ? undefined : ChainCode.fromString(chaincode);
			const userPrincipal = Principal.fromText(user);

			const ans = chain_fusion_signer_eth_address_for(
				userPrincipal,
				decodedPubkey,
				decodedChaincode
			);
			console.log(JSON.stringify(ans, null, 2));
		}
	);
