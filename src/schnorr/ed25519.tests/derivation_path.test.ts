import { ExtendedPoint } from '@noble/ed25519';
import { describe, expect, it } from 'vitest';
import { ChainCode } from '../../chain_code';
import { DerivationPath, PathComponent } from '../ed25519';

interface BlobEncodingTestVector {
	name: string;
	blob: string | null;
	path: DerivationPath;
}

const blobEncodingTestVectors: BlobEncodingTestVector[] = [
	{
		name: 'empty path',
		blob: null,
		path: new DerivationPath([])
	},
	{
		name: 'simple path',
		blob: 'hello',
		path: new DerivationPath([Buffer.from('68656c6c6f', 'hex')])
	},
	{
		name: 'multi part path',
		blob: 'multi/part/path',
		path: new DerivationPath([
			Buffer.from('6d756c7469', 'hex'),
			Buffer.from('70617274', 'hex'),
			Buffer.from('70617468', 'hex')
		])
	},
	{
		name: 'path with empty elements',
		blob: '//aloha/',
		path: new DerivationPath([
			Buffer.alloc(0),
			Buffer.alloc(0),
			Buffer.from('616c6f6861', 'hex'),
			Buffer.alloc(0)
		])
	}
];

describe('DerivationPath', () => {
	describe('toBlob', () => {
		for (const testVector of blobEncodingTestVectors) {
			it(testVector.name, () => {
				const encoded = testVector.path.toBlob();
				expect(encoded).toBe(testVector.blob);
			});
		}
	});
	describe('fromBlob', () => {
		for (const testVector of blobEncodingTestVectors) {
			it(testVector.name, () => {
				const decoded = DerivationPath.fromBlob(testVector.blob);
				const encoded = decoded.toBlob(); // TODO: Implement equality on derivation paths.
				expect(encoded).toBe(testVector.blob);
			});
		}
	});
	describe('derive_offset', () => {
		it('the helper should be able to derive one offset', () => {
			let pt = ExtendedPoint.fromHex(
				'5dc497e58f2eaaa2acb80f8f235e754ea243ab2c1d5683d55eec5b3275b31691'
			);
			let sum = 0n;
			const path = new DerivationPath([Buffer.from('68656c6c6f', 'hex')]);
			const offset = derive_one_offset(new ExtendedPoint(0, 0), 0, new ChainCode(0));
			expect(offset).toBe(0);
		});
	});
});

interface OffsetState {
	pt: ExtendedPoint;
	sum: bigint;
	chain_code: ChainCode;
}
interface OffsetTestVector {
	input: OffsetState;
	idx: PathComponent;
	expected_output: OffsetState;
}

function offset_test_vectors(): OffsetTestVector[] {
	// Sequential states from a derivation, as computed in Rust:
	let steps = [
		{
			pt: 'da38b16641af7626e372070ff9f844b7c89d1012850d2198393849d79d3d2d5d',
			sum: '0000000000000000000000000000000000000000000000000000000000000000',
			chain_code: '985be5283a68fc22540930ca02680f86c771419ece571eb838b33eb5604cfbc0',
			idx: '32'
		},
		{
			pt: '361e2e8b824c8c4610382b17776c9c78e6515d7201ce58085065927b65c226b7',
			sum: '9d992a59112cdcef2cc029a1d1583a92f512a96c495cb50d11606dbb581ce209',
			chain_code: 'eeba809d98289f13ee5fba958f62ed27eb2da7534f794ac2bd2d8345a23a9991',
			idx: '343434'
		},
		{
			pt: '45fca9854206a9c0ee3916a9fb894e5737a9a73006df055a7ee6a70344913095',
			sum: '5b54f98facbf122b55142f4515f05ae3321d8038073e250a21779a73e94d7d00',
			chain_code: 'e39beae5510a2249b0a50a21283d8ca4b69d77b4e71fa5c3228201719f6ac1f8',
			idx: '3636363636'
		}
	];
	let parsed = steps.map(({ pt, sum, chain_code, idx }) => {
		return {
			pt: ExtendedPoint.fromHex(pt),
			sum: BigInt(sum),
			chain_code: ChainCode.fromHex(chain_code),
			idx: Buffer.from(idx, 'hex')
		};
	});
	return parsed.slice(1).map((expected_output, index) => {
		return {
			input: parsed[index],
			idx: parsed[index].idx,
			expected_output: expected_output
		};
	});
}

function derive_one_offset(arg0: ExtendedPoint, arg1: number, arg2: ChainCode) {
	throw new Error('Function not implemented.');
}
