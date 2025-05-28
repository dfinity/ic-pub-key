#!/usr/bin/env node

import { Command } from 'commander';
import { test_derive_public_key as test_derive_secp256k1_public_key, derive_public_key as derive_secp256k1_public_key, PublicKeyWithChainCode as Secp256k1PublicKeyWithChainCode } from './ecdsa_public_key/secp256k1_public_key';
const program = new Command();

program.name('mycli').description('A simple CLI app written in TypeScript').version('1.0.0');

program.command('greet <name>').description('Greet a user').action(say_hello);

program
	.command('test-secp256k1')
	.description('Derive a key')
	.action(test_derive_secp256k1_public_key);

program
    .command('secp256k1 <pubkey> <chaincode> <derivationpath>')
    .description('Derive a key')
    .action((pubkey, chaincode, derivationpath) => {
		let pubkey_with_chain_code = Secp256k1PublicKeyWithChainCode.fromHex(pubkey, chaincode);
		let derived_pubkey = derive_secp256k1_public_key(pubkey_with_chain_code, derivationpath);
		console.log("derived pubkey: ", derived_pubkey.public_key.asHex());
		console.log("derived chaincode: ", derived_pubkey.chain_code.asHex());
	});

program.parse(process.argv);

function say_hello(name: string) {
	console.log(`Hello, ${name}!`);
}
