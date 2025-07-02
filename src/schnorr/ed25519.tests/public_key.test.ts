import { ExtendedPoint } from '@noble/ed25519';
import { describe, expect, it } from 'vitest';
import { PublicKey } from '../ed25519';

describe('PublicKey', () => {
	describe('constructor', () => {
		it('should succeed for a valid point', () => {
			const point = ExtendedPoint.fromHex(
				'0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
			);
			const publicKey = new PublicKey(point);
			expect(publicKey).toBeDefined();
		});
		it('should fail for the point at infinity', () => {
			expect(() => new PublicKey(ExtendedPoint.ZERO)).toThrow();
		});
	});
	describe('fromHex', () => {
		it('should be able to hex decode and encode', () => {
			const hex = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
			const publicKey = PublicKey.fromHex(hex);
			const encoded = publicKey.toHex();
			expect(encoded).toBe(hex);
		});
		it('should fail for a hex string that is too long', () => {
			const hex = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0';
			expect(() => PublicKey.fromHex(hex)).toThrow();
		});
		it('should fail for a hex string that is too short', () => {
			const hex = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcde';
			expect(() => PublicKey.fromHex(hex)).toThrow();
		});
	});
});
