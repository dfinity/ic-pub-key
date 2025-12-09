import { Principal } from '@dfinity/principal';
import { payments } from 'bitcoinjs-lib';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChainCode } from '../chain_code';
import { Sec1EncodedPublicKey } from '../ecdsa/secp256k1';
import { chainFusionSignerBtcAddressFor } from './btc';

describe('Signer BTC Address', () => {
	describe('chainFusionSignerBtcAddressFor', () => {
		const principalText = 'nggqm-p5ozz-i5hfv-bejmq-2gtow-4dtqw-vjatn-4b4yw-s5mzs-i46su-6ae';
		const user = Principal.fromText(principalText);

		beforeEach(() => {
			vi.clearAllMocks();
		});

		it('should return the correct address with request and response', () => {
			const { request, response } = chainFusionSignerBtcAddressFor(
				user,
				'mainnet',
				'p2wpkh',
				Sec1EncodedPublicKey.fromHex(
					'0259761672ec7ee3bdc5eca95ba5f6a493d1133b86a76163b68af30c06fe3b75c0'
				),
				ChainCode.fromHex('f666a98c7f70fe281ca8142f14eb4d1e0934a439237da83869e2cfd924b270c0')
			);

			const { pubkey, chaincode, principal, network: networkRequest } = request.toJSON();

			const { btc_address, network: networkResponse } = response.toJSON();

			expect(pubkey).toBe('0259761672ec7ee3bdc5eca95ba5f6a493d1133b86a76163b68af30c06fe3b75c0');
			expect(chaincode).toBe('f666a98c7f70fe281ca8142f14eb4d1e0934a439237da83869e2cfd924b270c0');
			expect(principal).toBe('nggqm-p5ozz-i5hfv-bejmq-2gtow-4dtqw-vjatn-4b4yw-s5mzs-i46su-6ae');
			expect(networkRequest).toBe('mainnet');

			expect(btc_address).toBe('bc1qwug6tj9z7tgvsp4u8sfzvjzatzs9rmwwck6qky');
			expect(networkResponse).toBe('mainnet');
		});

		it('should fallback to default values if params are undefined', () => {
			const { request, response } = chainFusionSignerBtcAddressFor(user, 'mainnet');

			const { pubkey, chaincode, principal, network: networkRequest } = request.toJSON();

			const { btc_address, network: networkResponse } = response.toJSON();

			expect(pubkey).toBe('0259761672ec7ee3bdc5eca95ba5f6a493d1133b86a76163b68af30c06fe3b75c0');
			expect(chaincode).toBe('f666a98c7f70fe281ca8142f14eb4d1e0934a439237da83869e2cfd924b270c0');
			expect(principal).toBe('nggqm-p5ozz-i5hfv-bejmq-2gtow-4dtqw-vjatn-4b4yw-s5mzs-i46su-6ae');
			expect(networkRequest).toBe('mainnet');

			expect(btc_address).toBe('bc1qwug6tj9z7tgvsp4u8sfzvjzatzs9rmwwck6qky');
			expect(networkResponse).toBe('mainnet');
		});

		it('should fallback to default values if params are null', () => {
			const { request, response } = chainFusionSignerBtcAddressFor(
				user,
				'mainnet',
				// @ts-expect-error -- We test this value on purpose
				null,
				null,
				null
			);

			const { pubkey, chaincode, principal, network: networkRequest } = request.toJSON();

			const { btc_address, network: networkResponse } = response.toJSON();

			expect(pubkey).toBe('0259761672ec7ee3bdc5eca95ba5f6a493d1133b86a76163b68af30c06fe3b75c0');
			expect(chaincode).toBe('f666a98c7f70fe281ca8142f14eb4d1e0934a439237da83869e2cfd924b270c0');
			expect(principal).toBe('nggqm-p5ozz-i5hfv-bejmq-2gtow-4dtqw-vjatn-4b4yw-s5mzs-i46su-6ae');
			expect(networkRequest).toBe('mainnet');

			expect(btc_address).toBe('bc1qwug6tj9z7tgvsp4u8sfzvjzatzs9rmwwck6qky');
			expect(networkResponse).toBe('mainnet');
		});

		it('should handle Bitcoin testnet network', () => {
			const { response } = chainFusionSignerBtcAddressFor(user, 'testnet');

			const { btc_address, network } = response.toJSON();

			expect(btc_address).toBe('tb1qwug6tj9z7tgvsp4u8sfzvjzatzs9rmwwjspndh');
			expect(network).toBe('testnet');
		});

		it('should handle Bitcoin regtest network', () => {
			const { response } = chainFusionSignerBtcAddressFor(user, 'regtest');

			const { btc_address, network } = response.toJSON();

			expect(btc_address).toBe('bcrt1qwug6tj9z7tgvsp4u8sfzvjzatzs9rmwwsec767');
			expect(network).toBe('regtest');
		});

		it('should throw for unsupported Bitcoin networks', () => {
			// @ts-expect-error -- We test this value on purpose
			expect(() => chainFusionSignerBtcAddressFor(user, 'testnet4')).toThrowError(
				'Unsupported Bitcoin network: testnet4'
			);
		});

		it('should throw if the address type is not supported', () => {
			// @ts-expect-error -- We test this value on purpose
			expect(() => chainFusionSignerBtcAddressFor(user, 'mainnet', 'p2wpkh-p2sh')).toThrowError(
				'Unsupported Bitcoin address type: p2wpkh-p2sh'
			);
		});

		it('should throw if the derived BTC address is undefined', () => {
			// @ts-expect-error -- We test this value on purpose
			vi.spyOn(payments, 'p2wpkh').mockReturnValueOnce(undefined);

			expect(() => chainFusionSignerBtcAddressFor(user, 'mainnet')).toThrowError(
				'Failed to derive Bitcoin address from public key.'
			);
		});
	});
});
