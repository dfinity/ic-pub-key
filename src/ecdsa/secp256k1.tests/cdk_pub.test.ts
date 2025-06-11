import { ProjectivePoint } from '@noble/secp256k1';
import { describe, expect, it } from 'vitest';
import { ChainCode, DerivationPath } from '../secp256k1';

type HexString = string;

interface CkdPubTestVector {
	idx: HexString;
	pt: HexString;
	chain_code: HexString;
	expected_chain_code: HexString;
	expected_offset: bigint;
	expected_pt: HexString;
}

// Source: These are arguments and corresponding outputs from calling the ckd_pub function in Rust.
//
// See: [ic_secp256k1::DerivationPath::ckd_pub](https://github.com/dfinity/ic/blob/bb6e758c739768ef6713f9f3be2df47884544900/packages/ic-secp256k1/src/lib.rs#L138)
const testVectors: CkdPubTestVector[] = [
	{
		idx: '32',
		pt: '02b84ff3f88329a887657d0309bd1a1af9e37601e5d1a535d6fe7d42e37f79f40a',
		chain_code: '212891bc032f28d369bacf39dc369feb516eced9a3d83498246aead1546f8cd1',
		expected_chain_code: 'd3b43395240d28d15c964eea25335f14a8503408a4db7f43e064f221bbe25538',
		expected_offset: BigInt('0x836D7173E13272F2E7D24D16769A6F10C98B895D5F2197AD69BE29E076A4ABB8'),
		expected_pt: '0294ec9089b53c8d937cfb18ccdb4e9f39dcf2fae87eb24deb8143bcb2168150d9'
	}
];

describe('DerivationPath', () => {
	describe('ckd', () => {
		it('should return values matching rust', () => {
			for (const testVector of testVectors) {
				let [derived_chain_code, derived_offset, derived_pt] = DerivationPath.ckd_pub(
					Buffer.from(testVector.idx, 'hex'),
					ProjectivePoint.fromHex(testVector.pt).toAffine(),
					ChainCode.fromHex(testVector.chain_code)
				);
				expect(derived_chain_code.asHex()).toBe(testVector.expected_chain_code);
				expect(derived_offset).toBe(testVector.expected_offset);
				expect(ProjectivePoint.fromAffine(derived_pt).toHex()).toBe(testVector.expected_pt);
			}
		});
	});
});
