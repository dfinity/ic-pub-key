import { describe, expect, it } from 'vitest';
import { ChainCode, DerivationPath } from '../secp256k1';

interface CkdTestVector {
	idx: Uint8Array;
	input: Uint8Array;
	chain_code: ChainCode;
	expected_chain_code: ChainCode;
	expected_scalar: bigint;
}

// Source: These are arguments and corresponding outputs from calling the ckd function in Rust.
//
// See: [ic_secp256k1::DerivationPath::ckd](https://github.com/dfinity/ic/blob/bb6e758c739768ef6713f9f3be2df47884544900/packages/ic-secp256k1/src/lib.rs#L111)
const testVectors: CkdTestVector[] = [
	{
		idx: Buffer.from('32', 'hex'),
		input: Buffer.from('02b84ff3f88329a887657d0309bd1a1af9e37601e5d1a535d6fe7d42e37f79f40a', 'hex'),
		chain_code: new ChainCode(
			Buffer.from('212891bc032f28d369bacf39dc369feb516eced9a3d83498246aead1546f8cd1', 'hex')
		),
		expected_chain_code: new ChainCode(
			Buffer.from('d3b43395240d28d15c964eea25335f14a8503408a4db7f43e064f221bbe25538', 'hex')
		),
		expected_scalar: BigInt('0x836D7173E13272F2E7D24D16769A6F10C98B895D5F2197AD69BE29E076A4ABB8')
	},
	{
		idx: Buffer.from('32', 'hex'),
		input: Buffer.from('030466da666fe067f52cb5337a72e7722123ab3fc82f92b8a5f92b89d0e9bbd6e1', 'hex'),
		chain_code: new ChainCode(
			Buffer.from('8b51936ff7862e556e31f1116a657469f00083497062db2e8ee9573e3346a83a', 'hex')
		),
		expected_chain_code: new ChainCode(
			Buffer.from('dba76c03b90277cc32aaac3537bb5089866b21203704d00ac00ca9056e9b3e26', 'hex')
		),
		expected_scalar: BigInt('0xCAC00A9834CCFAB17DAE8A6F56EADAC08EF6C8E005A449DADA7A79248812E681')
	},
	{
		idx: Buffer.from('343434', 'hex'),
		input: Buffer.from('0311ed203a11691bd67280c80855066661313681a2de6f757561b86008bbc88781', 'hex'),
		chain_code: new ChainCode(
			Buffer.from('dba76c03b90277cc32aaac3537bb5089866b21203704d00ac00ca9056e9b3e26', 'hex')
		),
		expected_chain_code: new ChainCode(
			Buffer.from('c50374a8085c276b142f5bcf685d3eb952795c25562817dacce61db7f409af34', 'hex')
		),
		expected_scalar: BigInt('0x3D853DAFCB4D63BAB8F78EDBE3A23CC8FDEFCF19594DA60E8C09B10DAF4AC121')
	},
	{
		idx: Buffer.from('3636363636', 'hex'),
		input: Buffer.from('03485ca57ebe59374af37a7d4dd7d2a151e0ab6cdc3c60cc03e808329ddf7cc61c', 'hex'),
		chain_code: new ChainCode(
			Buffer.from('699dd6e531b15000ddb1ddb52231542696a3e11b7e2cb3fef54ecb0c8f96ff61', 'hex')
		),
		expected_chain_code: new ChainCode(
			Buffer.from('bc35b8515f03aa1543081e2af4e878f28b27f3ce00c035f4068702d33ee88586', 'hex')
		),
		expected_scalar: BigInt('0x5E2D4DC916834E3909F64DE9EDA724222AB8488D19F4A0F7707D2AFB4BF9DAD5')
	},
	{
		idx: Buffer.from('3636363636', 'hex'),
		input: Buffer.from('02efef21368c880869698c42477b32cb58b1bd3ff8395a2dbab138e2c23296675e', 'hex'),
		chain_code: new ChainCode(
			Buffer.from('c50374a8085c276b142f5bcf685d3eb952795c25562817dacce61db7f409af34', 'hex')
		),
		expected_chain_code: new ChainCode(
			Buffer.from('4741d01b413e340d0a253e8adf860fd28cea1eebfad71493bac7476e6d20b1ab', 'hex')
		),
		expected_scalar: BigInt('0xD8472603120A3DDE9D15BD0652036ED533FDA06F63240879C4A2BBAB1E384029')
	},
	{
		idx: Buffer.from('32', 'hex'),
		input: Buffer.from('03d81a2def33c99ce5e60138d66e68474ab3560ee26882c26ea790bf6ecfa2a213', 'hex'),
		chain_code: new ChainCode(
			Buffer.from('4698afadc51f3b38434e66f35ae73d37347446cf0a0bcbda43ed7a7e0cd9efa7', 'hex')
		),
		expected_chain_code: new ChainCode(
			Buffer.from('cdee7e11e08bbf40133987e5e6d9fd53dd032d4c7e4a358e79cb2f0a20bab3a6', 'hex')
		),
		expected_scalar: BigInt('0xFFDE916B1BFCC426C1FEC9BFCA3D8DB0334B2196A775436E7E0D8909E2A27BC2')
	},
	{
		idx: Buffer.from('343434', 'hex'),
		input: Buffer.from('03bd5065474724a065bde3a4f5bfc6629137dc70e7c6eeb4119b509712b8aba2ba', 'hex'),
		chain_code: new ChainCode(
			Buffer.from('cdee7e11e08bbf40133987e5e6d9fd53dd032d4c7e4a358e79cb2f0a20bab3a6', 'hex')
		),
		expected_chain_code: new ChainCode(
			Buffer.from('4640384f8e6cebd9d821ae2dd654528fedbb64673429c9dc31810d54ad551cdd', 'hex')
		),
		expected_scalar: BigInt('0x3E11E62E5B879910757F1D0641E06393C2D1A3B244FEB2B1AD6E733CB008B942')
	},
	{
		idx: Buffer.from('3636363636', 'hex'),
		input: Buffer.from('02c50fccc58d99d932415f9f092b9850ad8d08f3c37f2457023925b1f7f4ebafc2', 'hex'),
		chain_code: new ChainCode(
			Buffer.from('4640384f8e6cebd9d821ae2dd654528fedbb64673429c9dc31810d54ad551cdd', 'hex')
		),
		expected_chain_code: new ChainCode(
			Buffer.from('2e04ed5006d04725fea1508a00c35da2f033b39d8a8ab3d86d0b66ed347656ce', 'hex')
		),
		expected_scalar: BigInt('0x748CB5631D1105775F4954F6617BD9130448E14679FB8D9289752B1C54BCA8F6')
	}
];

describe('DerivationPath', () => {
	describe('ckd', () => {
		it('should return values matching rust', () => {
			for (const testVector of testVectors) {
				let [derived_chain_code, derived_scalar] = DerivationPath.ckd(
					testVector.idx,
					testVector.input,
					testVector.chain_code
				);
				expect(derived_chain_code.asHex()).toBe(testVector.expected_chain_code.asHex());
				expect(derived_scalar.toString()).toBe(testVector.expected_scalar.toString());
			}
		});
	});
});
