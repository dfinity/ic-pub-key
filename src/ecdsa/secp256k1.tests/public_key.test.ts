import { describe, expect, it } from 'vitest';
import { ChainCode, Sec1EncodedPublicKey } from '../secp256k1';

describe('Sec1EncodedPublicKey', () => {
	it('should create a new Sec1EncodedPublicKey', () => {
		const _publicKey = new Sec1EncodedPublicKey(
			Buffer.from('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20', 'hex')
		);
	});
	it('should throw an exception if the key is less than 33 bytes', () => {
		expect(
			() =>
				new Sec1EncodedPublicKey(
					Buffer.from('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f', 'hex')
				)
		).toThrow();
	});
	it('should throw an exception if the key is more than 33 bytes', () => {
		expect(
			() =>
				new Sec1EncodedPublicKey(
					Buffer.from('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f2021', 'hex')
				)
		).toThrow();
	});
	it('should hex encode', () => {
		const publicKey = new Sec1EncodedPublicKey(
			Buffer.from('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20', 'hex')
		);
		expect(publicKey.toHex()).toBe(
			'000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20'
		);
	});
	it('should hex decode and encode back to the same key', () => {
		const hex_key = '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20';
		const publicKey = Sec1EncodedPublicKey.fromHex(hex_key);
		expect(publicKey.toHex()).toBe(hex_key);
	});
});

describe('ChainCode', () => {
	it('should create a new ChainCode from 32 bytes', () => {
		const chainCode = new ChainCode(
			Buffer.from('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f', 'hex')
		);
	});
	it('should fail to create a chain code from less than 32 bytes', () => {
		expect(
			() =>
				new ChainCode(
					Buffer.from('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e', 'hex')
				)
		).toThrow();
	});
	it('should fail to create a chain code from more than 32 bytes', () => {
		expect(
			() =>
				new ChainCode(
					Buffer.from('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20', 'hex')
				)
		).toThrow();
	});
});
