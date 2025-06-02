#!/usr/bin/env node

import { Principal } from '@dfinity/principal';
import { Command } from 'commander';
import {
	DerivationPath,
	derive_public_key as derive_secp256k1_public_key,
	PublicKeyWithChainCode as Secp256k1PublicKeyWithChainCode,
	test_derive_public_key as test_derive_secp256k1_public_key
} from './ecdsa/secp256k1';

const program = new Command();

program.name('mycli').description('A simple CLI app written in TypeScript').version('1.0.0');

program.command('greet <name>').description('Greet a user').action(say_hello);

program
	.command('test-secp256k1')
	.description('Derive a key')
	.action(test_derive_secp256k1_public_key);

let ecdsa = program.command('ecdsa');
ecdsa
	.command('secp256k1 <pubkey> <chaincode> <derivationpath>')
	.description('Derive a key')
	.action((pubkey, chaincode, derivationpath) => {
		let pubkey_with_chain_code = Secp256k1PublicKeyWithChainCode.fromBlob(pubkey, chaincode);
		let parsed_derivationpath = DerivationPath.fromBlob(derivationpath);
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

ecdsa
	.command('caller-secp256k1 <principal> <pubkey> <chaincode> [derivationpath]')
	.description('Derive a key for the given principal')
	.action((principal, pubkey, chaincode, derivationpath) => {
		let parsed_principal = Principal.fromText(principal);
		let caller_derivation_path = principal_derivation_path(parsed_principal);
		let pubkey_with_chain_code = Secp256k1PublicKeyWithChainCode.fromBlob(pubkey, chaincode);
		let combined_derivation_path = new DerivationPath([
			...caller_derivation_path.path,
			...DerivationPath.fromBlob(derivationpath).path
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
