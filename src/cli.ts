import { Principal } from '@dfinity/principal';
import { Command } from 'commander';
import {
	DerivationPath,
	derive_public_key as derive_secp256k1_public_key,
	Sec1EncodedPublicKey,
	PublicKeyWithChainCode as Secp256k1PublicKeyWithChainCode,
	test_derive_public_key as test_derive_secp256k1_public_key
} from './ecdsa/secp256k1.js';
import { keccak256 } from 'ethers/crypto';
import { computeAddress } from 'ethers/transaction';

export const program = new Command();

program
	.name('ic-pub-key')
	.description('Tools for Internet Computer Protocol public keys')
	.version('1.0.0');

let derive = program.command('derive').description('Derive a public key');

derive.command('test-secp256k1').description('Self test').action(test_derive_secp256k1_public_key);

let ecdsa = derive.command('ecdsa').description('Derive an ECDSA public key');
ecdsa
	.command('secp256k1')
	.description('Derive a key')
	.requiredOption('-k, --pubkey <pubkey>', 'The parent public key', String)
	.requiredOption('-c, --chaincode <chaincode>', 'The parent chain code', String)
	.option('-d, --derivationpath <derivationpath>', 'The derivation path', String)
	.action(({ pubkey, chaincode, derivationpath }) => {
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
	.command('caller-secp256k1')
	.description('Derive a key for the given principal')
	.requiredOption('-p, --principal <principal>', "The caller's principal", String)
	.requiredOption('-k, --pubkey <pubkey>', 'The parent public key', String)
	.requiredOption('-c, --chaincode <chaincode>', 'The parent chain code', String)
	.option('-d, --derivationpath <derivationpath>', 'The derivation path', String)
	.action(({ principal, pubkey, chaincode, derivationpath }) => {
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

function say_hello(name: string) {
	console.log(`Hello, ${name}!`);
}

function principal_derivation_path(principal: Principal): DerivationPath {
	let schema = Uint8Array.from([0xff]);
	let principal_bytes = principal.toUint8Array();
	return new DerivationPath([schema, principal_bytes]);
}



let eth = program.command('eth').description('Get Ethereum address');

eth
	.command('address')
	.description("Get a user's Ethereum address")
	.requiredOption('-p, --pubkey <pubkey>', 'The signer canister\'s public key', String)
	.requiredOption('-c, --chaincode <chaincode>', 'The signer canister\'s chain code', String)
	.requiredOption('-u, --user <user>', 'The user\'s principal', String)
	.action(({ pubkey, chaincode, user }) => {
		console.log({ pubkey, chaincode, user });
		let principal = Principal.fromText(user);
		let principal_as_bytes = principal.toUint8Array();
		let derivation_path = new DerivationPath([
			Uint8Array.from([0x01]),
			principal_as_bytes
		]);
		let signer_pubkey_with_chain_code = Secp256k1PublicKeyWithChainCode.fromBlob(pubkey, chaincode);
        let eth_pubkey_with_chaincode = signer_pubkey_with_chain_code.derive_subkey_with_chain_code(derivation_path);
		let eth_pubkey = eth_pubkey_with_chaincode.public_key;
		let eth_address = computeAddress("0x" + eth_pubkey.asHex());
		console.log(eth_address);
	});
