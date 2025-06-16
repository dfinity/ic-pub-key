import { describe, expect, it } from 'vitest';
import { ChainCode, PublicKeyWithChainCode, Sec1EncodedPublicKey } from '../secp256k1';

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
	it('should blob decode and encode back to the same key', () => {
		const blob_key =
			'\\00\\01\\02\\03\\04\\05\\06\\07\\08\\09\\0a\\0b\\0c\\0d\\0e\\0f\\10\\11\\12\\13\\14\\15\\16\\17\\18\\19\\1a\\1b\\1c\\1d\\1e\\1f\\20';
		const key = Sec1EncodedPublicKey.fromBlob(blob_key);
		const blob_encoded = key.toBlob();
		expect(blob_encoded).toBe(blob_key);
	});
	it('should parse both hex and blob keys', () => {
		const hex_key = '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20';
		const blob_key =
			'\\00\\01\\02\\03\\04\\05\\06\\07\\08\\09\\0a\\0b\\0c\\0d\\0e\\0f\\10\\11\\12\\13\\14\\15\\16\\17\\18\\19\\1a\\1b\\1c\\1d\\1e\\1f\\20';
		const blob2hex = Sec1EncodedPublicKey.fromString(blob_key).toHex();
		const hex2blob = Sec1EncodedPublicKey.fromString(hex_key).toBlob();
		expect(blob2hex).toBe(hex_key);
		expect(hex2blob).toBe(blob_key);
	});
});

describe('ChainCode', () => {
	it('should create a new ChainCode from 32 bytes', () => {
		const _chainCode = new ChainCode(
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

describe('PublicKeyWithChainCode', () => {
	it('should hex decode and encode', () => {
		const public_key = '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20';
		const chain_code = '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f';
		const public_key_with_chain_code = PublicKeyWithChainCode.fromHex({ public_key, chain_code });
		const public_key_with_chain_code_hex = public_key_with_chain_code.toHex();
		expect(public_key_with_chain_code_hex).toStrictEqual({ public_key, chain_code });
	});
});
