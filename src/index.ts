#!/usr/bin/env node

import { Principal } from '@dfinity/principal';
import { Command } from 'commander';
import {
	DerivationPath,
	derive_public_key as derive_secp256k1_public_key,
	PublicKeyWithChainCode as Secp256k1PublicKeyWithChainCode,
	test_derive_public_key as test_derive_secp256k1_public_key
} from './ecdsa_public_key/secp256k1_public_key';

const program = new Command();

program.name('mycli').description('A simple CLI app written in TypeScript').version('1.0.0');

program.command('greet <name>').description('Greet a user').action(say_hello);

// Create a parent command for secp256k1 operations
const secp256k1 = program.command('secp256k1').description('Operations related to secp256k1 keys');

// Add subcommands under the secp256k1 command
secp256k1
	.command('test')
	.description('Test key derivation')
	.action(test_derive_secp256k1_public_key);

secp256k1
	.command('derive')
	.description('Derive a key from a public key and chain code')
	.requiredOption('--pubkey <pubkey>', 'The public key')
	.requiredOption('--chaincode <chaincode>', 'The chain code')
	.option('--path <derivationpath>', 'The derivation path (optional)')
	.action((options) => {
		let pubkey_with_chain_code = Secp256k1PublicKeyWithChainCode.fromBlob(
			options.pubkey,
			options.chaincode
		);
		let parsed_derivationpath = options.path
			? DerivationPath.fromBlob(options.path)
			: new DerivationPath([]);
		let derived_pubkey = derive_secp256k1_public_key(pubkey_with_chain_code, parsed_derivationpath);
		let ans = {
			request: {
				key: pubkey_with_chain_code,
				derivation_path: parsed_derivationpath
			},
			response: {
				key: derived_pubkey
			}
		};
		console.log(JSON.stringify(ans, null, 2));
	});

secp256k1
	.command('caller')
	.description('Derive a key for the given principal')
	.requiredOption('--principal <principal>', 'The principal ID')
	.requiredOption('--pubkey <pubkey>', 'The public key')
	.requiredOption('--chaincode <chaincode>', 'The chain code')
	.option('--path <derivationpath>', 'The derivation path')
	.action((options) => {
		let parsed_principal = Principal.fromText(options.principal);
		let caller_derivation_path = principal_derivation_path(parsed_principal);
		let pubkey_with_chain_code = Secp256k1PublicKeyWithChainCode.fromBlob(
			options.pubkey,
			options.chaincode
		);
		let combined_derivation_path = new DerivationPath([
			...caller_derivation_path.path,
			...(options.path ? DerivationPath.fromBlob(options.path).path : [])
		]);
		let derived_pubkey = derive_secp256k1_public_key(
			pubkey_with_chain_code,
			combined_derivation_path
		);
		let ans = {
			request: {
				key: pubkey_with_chain_code,
				derivation_path: combined_derivation_path
			},
			response: {
				key: derived_pubkey
			}
		};
		console.log(JSON.stringify(ans, null, 2));
	});

program.parse(process.argv);

function say_hello(name: string) {
	console.log(`Hello, ${name}!`);
}

function principal_derivation_path(principal: Principal): DerivationPath {
	let schema = Uint8Array.from([0xff]);
	let principal_bytes = principal.toUint8Array();
	return new DerivationPath([schema, principal_bytes]);
}
