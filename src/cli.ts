#!/usr/bin/env node

import { Principal } from '@dfinity/principal';
import { Command } from 'commander';
import {
	DerivationPath,
	derive_public_key as derive_secp256k1_public_key,
	PublicKeyWithChainCode as Secp256k1PublicKeyWithChainCode,
	test_derive_public_key as test_derive_secp256k1_public_key
} from './ecdsa/secp256k1.js';

const program = new Command();

program
	.name('ic-pub-key')
	.description('Tools for Internet Computer Protocol public keys')
	.version('1.0.0');
