#!/usr/bin/env node

import { Command } from 'commander';
import { test_derive_public_key as test_derive_secp256k1_public_key } from './ecdsa_public_key/secp256k1_public_key';
const program = new Command();

program.name('mycli').description('A simple CLI app written in TypeScript').version('1.0.0');

program.command('greet <name>').description('Greet a user').action(say_hello);

program
	.command('test-secp256k1')
	.description('Derive a key')
	.action(test_derive_secp256k1_public_key);

program.parse(process.argv);

function say_hello(name: string) {
	console.log(`Hello, ${name}!`);
}
