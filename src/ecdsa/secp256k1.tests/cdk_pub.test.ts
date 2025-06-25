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
	},
	{
		idx: '32',
		pt: '030466da666fe067f52cb5337a72e7722123ab3fc82f92b8a5f92b89d0e9bbd6e1',
		chain_code: '8b51936ff7862e556e31f1116a657469f00083497062db2e8ee9573e3346a83a',
		expected_chain_code: 'dba76c03b90277cc32aaac3537bb5089866b21203704d00ac00ca9056e9b3e26',
		expected_offset: BigInt('0xCAC00A9834CCFAB17DAE8A6F56EADAC08EF6C8E005A449DADA7A79248812E681'),
		expected_pt: '0311ed203a11691bd67280c80855066661313681a2de6f757561b86008bbc88781'
	},
	{
		idx: '343434',
		pt: '0294ec9089b53c8d937cfb18ccdb4e9f39dcf2fae87eb24deb8143bcb2168150d9',
		chain_code: 'd3b43395240d28d15c964eea25335f14a8503408a4db7f43e064f221bbe25538',
		expected_chain_code: '699dd6e531b15000ddb1ddb52231542696a3e11b7e2cb3fef54ecb0c8f96ff61',
		expected_offset: BigInt('0x76AC3EA7B3C895B438CD96B3FBE084126DB92E66C090562D6748BB77546E7115'),
		expected_pt: '03485ca57ebe59374af37a7d4dd7d2a151e0ab6cdc3c60cc03e808329ddf7cc61c'
	},
	{
		idx: '343434',
		pt: '0311ed203a11691bd67280c80855066661313681a2de6f757561b86008bbc88781',
		chain_code: 'dba76c03b90277cc32aaac3537bb5089866b21203704d00ac00ca9056e9b3e26',
		expected_chain_code: 'c50374a8085c276b142f5bcf685d3eb952795c25562817dacce61db7f409af34',
		expected_offset: BigInt('0x3D853DAFCB4D63BAB8F78EDBE3A23CC8FDEFCF19594DA60E8C09B10DAF4AC121'),
		expected_pt: '02efef21368c880869698c42477b32cb58b1bd3ff8395a2dbab138e2c23296675e'
	},
	{
		idx: '3636363636',
		pt: '03485ca57ebe59374af37a7d4dd7d2a151e0ab6cdc3c60cc03e808329ddf7cc61c',
		chain_code: '699dd6e531b15000ddb1ddb52231542696a3e11b7e2cb3fef54ecb0c8f96ff61',
		expected_chain_code: 'bc35b8515f03aa1543081e2af4e878f28b27f3ce00c035f4068702d33ee88586',
		expected_offset: BigInt('0x5E2D4DC916834E3909F64DE9EDA724222AB8488D19F4A0F7707D2AFB4BF9DAD5'),
		expected_pt: '024bf78e40bb51d2c6c14c11aa8f3af1549741de5acdf925e6dc230dfc5daa22d9'
	},
	{
		idx: '3636363636',
		pt: '02efef21368c880869698c42477b32cb58b1bd3ff8395a2dbab138e2c23296675e',
		chain_code: 'c50374a8085c276b142f5bcf685d3eb952795c25562817dacce61db7f409af34',
		expected_chain_code: '4741d01b413e340d0a253e8adf860fd28cea1eebfad71493bac7476e6d20b1ab',
		expected_offset: BigInt('0xD8472603120A3DDE9D15BD0652036ED533FDA06F63240879C4A2BBAB1E384029'),
		expected_pt: '0329d1f060d8225b2547abd7b7cdccc56ea675cfacd46a75863bd98d9a5dcafca7'
	},
	{
		idx: '32',
		pt: '03d81a2def33c99ce5e60138d66e68474ab3560ee26882c26ea790bf6ecfa2a213',
		chain_code: '4698afadc51f3b38434e66f35ae73d37347446cf0a0bcbda43ed7a7e0cd9efa7',
		expected_chain_code: 'cdee7e11e08bbf40133987e5e6d9fd53dd032d4c7e4a358e79cb2f0a20bab3a6',
		expected_offset: BigInt('0xFFDE916B1BFCC426C1FEC9BFCA3D8DB0334B2196A775436E7E0D8909E2A27BC2'),
		expected_pt: '03bd5065474724a065bde3a4f5bfc6629137dc70e7c6eeb4119b509712b8aba2ba'
	},
	{
		idx: '343434',
		pt: '03bd5065474724a065bde3a4f5bfc6629137dc70e7c6eeb4119b509712b8aba2ba',
		chain_code: 'cdee7e11e08bbf40133987e5e6d9fd53dd032d4c7e4a358e79cb2f0a20bab3a6',
		expected_chain_code: '4640384f8e6cebd9d821ae2dd654528fedbb64673429c9dc31810d54ad551cdd',
		expected_offset: BigInt('0x3E11E62E5B879910757F1D0641E06393C2D1A3B244FEB2B1AD6E733CB008B942'),
		expected_pt: '02c50fccc58d99d932415f9f092b9850ad8d08f3c37f2457023925b1f7f4ebafc2'
	},
	{
		idx: '3636363636',
		pt: '02c50fccc58d99d932415f9f092b9850ad8d08f3c37f2457023925b1f7f4ebafc2',
		chain_code: '4640384f8e6cebd9d821ae2dd654528fedbb64673429c9dc31810d54ad551cdd',
		expected_chain_code: '2e04ed5006d04725fea1508a00c35da2f033b39d8a8ab3d86d0b66ed347656ce',
		expected_offset: BigInt('0x748CB5631D1105775F4954F6617BD9130448E14679FB8D9289752B1C54BCA8F6'),
		expected_pt: '024e1e180ae1a1b685a5834e40ecd239e1624bd2a8bdee4e7f0fa70e8de9804765'
	}
];

describe('DerivationPath', () => {
	describe('ckd', () => {
		it('should return values matching rust', () => {
			for (const testVector of testVectors) {
				const [derived_chain_code, derived_offset, derived_pt] = DerivationPath.ckd_pub(
					Buffer.from(testVector.idx, 'hex'),
					ProjectivePoint.fromHex(testVector.pt).toAffine(),
					ChainCode.fromHex(testVector.chain_code)
				);
				expect(derived_chain_code.toHex()).toBe(testVector.expected_chain_code);
				expect(derived_offset).toBe(testVector.expected_offset);
				expect(ProjectivePoint.fromAffine(derived_pt).toHex()).toBe(testVector.expected_pt);
			}
		});
	});
});
