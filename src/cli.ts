import { Command } from 'commander';
import {
	DerivationPath,
	PublicKeyWithChainCode as Secp256k1PublicKeyWithChainCode
} from './ecdsa/secp256k1.js';

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
			response: {
				key: derived_pubkey
			}
		};
		console.log(JSON.stringify(ans, null, 2));
	});
