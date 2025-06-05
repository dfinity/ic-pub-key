import { describe, expect, it } from 'vitest';
import { blobDecode, blobEncode } from '../encoding';

describe('encoding', () => {
	describe('blobEncode', () => {
		it('should encode ASCII alphanumeric characters as-is', () => {
			const input = new Uint8Array([65, 66, 67, 48, 49, 50]); // ABC012
			expect(blobEncode(input)).toBe('ABC012');
		});

		it('should encode non-ASCII characters with hex escape', () => {
			const input = new Uint8Array([0, 255, 10]); // null, max byte, newline
			expect(blobEncode(input)).toBe('\\00\\ff\\0a');
		});

		it('should handle mixed ASCII and non-ASCII characters', () => {
			const input = new Uint8Array([65, 0, 66, 255, 67]); // A\0B\ffC
			expect(blobEncode(input)).toBe('A\\00B\\ffC');
		});

		it('should handle empty array', () => {
			const input = new Uint8Array([]);
			expect(blobEncode(input)).toBe('');
		});
	});

	describe('blobDecode', () => {
		it('should decode ASCII alphanumeric characters', () => {
			const input = 'ABC012';
			const expected = new Uint8Array([65, 66, 67, 48, 49, 50]);
			expect(blobDecode(input)).toEqual(expected);
		});

		it('should decode hex escape sequences', () => {
			const input = '\\00\\ff\\0a';
			const expected = new Uint8Array([0, 255, 10]);
			expect(blobDecode(input)).toEqual(expected);
		});

		it('should handle mixed ASCII and hex escape sequences', () => {
			const input = 'A\\00B\\ffC';
			const expected = new Uint8Array([65, 0, 66, 255, 67]);
			expect(blobDecode(input)).toEqual(expected);
		});

		it('should handle empty string', () => {
			const input = '';
			expect(blobDecode(input)).toEqual(new Uint8Array([]));
		});
	});

	describe('round-trip tests', () => {
		it('should encode and decode back to original for ASCII', () => {
			const original = new Uint8Array([65, 66, 67, 48, 49, 50]);
			const encoded = blobEncode(original);
			const decoded = blobDecode(encoded);
			expect(decoded).toEqual(original);
		});

		it('should encode and decode back to original for non-ASCII', () => {
			const original = new Uint8Array([0, 255, 10, 32, 127]);
			const encoded = blobEncode(original);
			const decoded = blobDecode(encoded);
			expect(decoded).toEqual(original);
		});

		it('should handle all possible byte values', () => {
			const original = new Uint8Array(256);
			for (let i = 0; i < 256; i++) {
				original[i] = i;
			}
			const encoded = blobEncode(original);
			const decoded = blobDecode(encoded);
			expect(decoded).toEqual(original);
		});
	});
});
