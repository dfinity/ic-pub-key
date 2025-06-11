import { ProjectivePoint } from '@noble/secp256k1';
import { describe, expect, it } from 'vitest';
import { ChainCode, DerivationPath } from '../secp256k1';

interface DeriveOffsetTestVector {
	path: string;
	pt: string;
	chain_code: string;
	expected_pt: string;
	expected_offset: bigint;
	expected_chain_code: string;
}

const testVectors: DeriveOffsetTestVector[] = [
	{
		path: '32/343434/3636363636',
		pt: '02b84ff3f88329a887657d0309bd1a1af9e37601e5d1a535d6fe7d42e37f79f40a',
		chain_code: '212891bc032f28d369bacf39dc369feb516eced9a3d83498246aead1546f8cd1',
		expected_pt: '024bf78e40bb51d2c6c14c11aa8f3af1549741de5acdf925e6dc230dfc5daa22d9',
		expected_offset: 0x5846fde4ab7e56e02a9631b460221746a74e236a8a5dee9681b1b1c646d6b661n,
		expected_chain_code: 'bc35b8515f03aa1543081e2af4e878f28b27f3ce00c035f4068702d33ee88586'
	}
];

describe('DerivationPath', () => {
	describe('derive_offset', () => {
		it('should return the correct values', () => {
			for (const testVector of testVectors) {
				const derivation_path = new DerivationPath(
					testVector.path.split('/').map((part) => Buffer.from(part, 'hex'))
				);
				const pt = ProjectivePoint.fromHex(testVector.pt).toAffine();
				const chain_code = new ChainCode(Buffer.from(testVector.chain_code, 'hex'));
				const [derived_pt, derived_offset, derived_chain_code] = derivation_path.derive_offset(
					pt,
					chain_code
				);
				expect(ProjectivePoint.fromAffine(derived_pt).toHex(true)).toBe(testVector.expected_pt);
				expect(derived_offset).toBe(testVector.expected_offset);
				expect(derived_chain_code.asHex()).toBe(testVector.expected_chain_code);
			}
		});
	});
});
