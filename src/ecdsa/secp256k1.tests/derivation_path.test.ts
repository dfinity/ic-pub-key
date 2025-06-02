import { describe, expect, it } from 'vitest';
import { DerivationPath } from '../secp256k1';

describe('DerivationPath', () => {
	describe('toBlob', () => {
		it('should return undefined for empty path', () => {
			const path = new DerivationPath([]);
			expect(path.toBlob()).toBeUndefined();
		});

		it('should encode simple ASCII characters', () => {
			const path = new DerivationPath([
				new TextEncoder().encode('abc'),
				new TextEncoder().encode('123')
			]);
			expect(path.toBlob()).toBe('abc/123');
		});

		it('should escape non-ASCII characters', () => {
			const path = new DerivationPath([new Uint8Array([0x00, 0xff, 0x0a])]);
			expect(path.toBlob()).toBe('\\00\\ff\\0a');
		});
	});
});
