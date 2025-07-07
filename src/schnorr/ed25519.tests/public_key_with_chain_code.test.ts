import { ExtendedPoint } from '@noble/ed25519';
import { describe, expect, it } from 'vitest';
import { ChainCode } from '../../chain_code';
import { PublicKey, PublicKeyWithChainCode } from '../ed25519';

describe('PublicKeyWithChainCode', () => {
	describe('constructor', () => {
		it('should succeed for a valid point', () => {
			const point = ExtendedPoint.fromHex(
				'0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
			);
			const chain_code = ChainCode.fromString(
				'0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
			);
			const publicKey = new PublicKeyWithChainCode(new PublicKey(point), chain_code);
			expect(publicKey).toBeDefined();
			expect(publicKey).toBeInstanceOf(PublicKeyWithChainCode);
		});
	});
	describe('fromString', () => {
		it('should be able to parse a hex string', () => {
			// Public key and chain code have the same length.
			const hex = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
			const publicKey = PublicKeyWithChainCode.fromString(hex, hex);
			expect(publicKey).toBeDefined();
			expect(publicKey).toBeInstanceOf(PublicKeyWithChainCode);
		});
	});
	describe('fromHex', () => {
		it('should be able to parse a hex string', () => {
			// Public key and chain code have the same length.
			const hex = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
			const publicKey = PublicKeyWithChainCode.fromHex(hex, hex);
			expect(publicKey).toBeDefined();
			expect(publicKey).toBeInstanceOf(PublicKeyWithChainCode);
		});
	});
});
