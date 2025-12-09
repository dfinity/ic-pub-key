import { Principal } from '@dfinity/principal';
import { describe, expect, it } from 'vitest';
import { ChainCode } from '../chain_code';
import { Sec1EncodedPublicKey } from '../ecdsa/secp256k1';
import { chainFusionSignerEthAddressFor } from './eth';

describe('Signer ETH Address', () => {
	describe('chainFusionSignerEthAddressFor', () => {
		const principalText = 'nggqm-p5ozz-i5hfv-bejmq-2gtow-4dtqw-vjatn-4b4yw-s5mzs-i46su-6ae';
		const user = Principal.fromText(principalText);


		it('should return the correct address with request and response', () => {
			const { request, response } = chainFusionSignerEthAddressFor(
				user,
				Sec1EncodedPublicKey.fromHex(
					'0259761672ec7ee3bdc5eca95ba5f6a493d1133b86a76163b68af30c06fe3b75c0'
				),
				ChainCode.fromHex('f666a98c7f70fe281ca8142f14eb4d1e0934a439237da83869e2cfd924b270c0')
			);

			const { pubkey, chaincode, principal } = request.toJSON();

			const { eth_address } = response.toJSON();

			expect(pubkey).toBe('0259761672ec7ee3bdc5eca95ba5f6a493d1133b86a76163b68af30c06fe3b75c0');
			expect(chaincode).toBe('f666a98c7f70fe281ca8142f14eb4d1e0934a439237da83869e2cfd924b270c0');
			expect(principal).toBe('nggqm-p5ozz-i5hfv-bejmq-2gtow-4dtqw-vjatn-4b4yw-s5mzs-i46su-6ae');

			expect(eth_address).toBe('0xf53e047376e37eAc56d48245B725c47410cf6F1e');
		});

		it('should fallback to default values if params are undefined', () => {
			const { request, response } = chainFusionSignerEthAddressFor(user);

			const { pubkey, chaincode, principal } = request.toJSON();

			const { eth_address } = response.toJSON();

			expect(pubkey).toBe('0259761672ec7ee3bdc5eca95ba5f6a493d1133b86a76163b68af30c06fe3b75c0');
			expect(chaincode).toBe('f666a98c7f70fe281ca8142f14eb4d1e0934a439237da83869e2cfd924b270c0');
			expect(principal).toBe('nggqm-p5ozz-i5hfv-bejmq-2gtow-4dtqw-vjatn-4b4yw-s5mzs-i46su-6ae');

			expect(eth_address).toBe('0xf53e047376e37eAc56d48245B725c47410cf6F1e');
		});

		it('should fallback to default values if params are null', () => {
			const { request, response } = chainFusionSignerEthAddressFor(
				user,
				// @ts-expect-error -- We test this value on purpose
				null,
				null
			);

			const { pubkey, chaincode, principal } = request.toJSON();

			const { eth_address } = response.toJSON();

			expect(pubkey).toBe('0259761672ec7ee3bdc5eca95ba5f6a493d1133b86a76163b68af30c06fe3b75c0');
			expect(chaincode).toBe('f666a98c7f70fe281ca8142f14eb4d1e0934a439237da83869e2cfd924b270c0');
			expect(principal).toBe('nggqm-p5ozz-i5hfv-bejmq-2gtow-4dtqw-vjatn-4b4yw-s5mzs-i46su-6ae');

			expect(eth_address).toBe('0xf53e047376e37eAc56d48245B725c47410cf6F1e');
		});
	});
});
