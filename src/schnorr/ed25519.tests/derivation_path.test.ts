import { ExtendedPoint } from '@noble/ed25519';
import { describe, expect, it } from 'vitest';
import { ChainCode } from '../../chain_code';
import { bigintFromLittleEndianHex } from '../../encoding';
import { DerivationPath, deriveOneOffset, offsetFromOkm, PathComponent } from '../ed25519';

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
		for (const test_vector of offsetTestVectors()) {
			it(`the helper should be able to derive one offset for ${test_vector.name}`, () => {
				const [pt, sum, chain_code] = deriveOneOffset(
					[test_vector.input.pt, test_vector.input.sum, test_vector.input.chain_code],
					test_vector.idx
				);
				expect(pt.toHex()).toBe(test_vector.expected_output.pt.toHex());
				expect(sum.toString(16)).toBe(test_vector.expected_output.sum.toString(16));
				expect(chain_code.toHex()).toBe(test_vector.expected_output.chain_code.toHex());
			});
		}
	});
	describe('offset_from_okm', () => {
		for (const test_vector of offsetFromOkmTestVectors()) {
			it(`should be able to convert an okm to an offset for ${test_vector.name}`, () => {
				const offset = offsetFromOkm(Buffer.from(test_vector.okm, 'hex'));
				expect(offset.toString(16)).toBe(test_vector.expected_offset.toString(16));
			});
		}
	});
});

interface OffsetState {
	pt: ExtendedPoint;
	sum: bigint;
	chain_code: ChainCode;
}
interface OffsetTestVector {
	name: string;
	input: OffsetState;
	idx: PathComponent;
	expected_output: OffsetState;
}

function offsetTestVectors(): OffsetTestVector[] {
	// Sequential states from a derivation, as computed in Rust:
	const steps = [
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
	const parsed = steps.map(({ pt, sum, chain_code, idx }) => {
		// The sum is little endian, so we need to reverse it.
		return {
			pt: ExtendedPoint.fromHex(pt),
			sum: bigintFromLittleEndianHex(sum),
			chain_code: ChainCode.fromHex(chain_code),
			idx: Buffer.from(idx, 'hex')
		};
	});
	return parsed.slice(1).map((expected_output, index) => {
		return {
			name: `step ${index}`,
			input: parsed[index],
			idx: parsed[index].idx,
			expected_output: expected_output
		};
	});
}

interface OffsetFromOkmTestVector {
	name: string;
	okm: string;
	expected_offset: bigint;
}

function offsetFromOkmTestVectors(): OffsetFromOkmTestVector[] {
	// Test vectors obtained from the Rust implementation.
	const vectors = [
		{
			name: 'zero',
			okm: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
			expected_offset: '0000000000000000000000000000000000000000000000000000000000000000'
		},
		{
			name: 'one',
			okm: '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000',
			expected_offset: '0100000000000000000000000000000000000000000000000000000000000000' // Little endian
		},
		{
			name: 'top byte is 1',
			//123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef-123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef-123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
			okm: '000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
			expected_offset: '0000000000000000000000000000000000000000000000000000000000000001' // Little endian
		},
		{
			name: 'top byte is 2',
			//123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef-123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef-123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
			okm: '000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
			expected_offset: '0000000000000000000000000000000000000000000000000000000000000002' // Little endian
		},
		{
			name: 'top byte is 4',
			//123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef-123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef-123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
			okm: '000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
			expected_offset: '0000000000000000000000000000000000000000000000000000000000000004' // Little endian
		},
		{
			name: 'top byte is 8',
			//123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef-123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef-123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
			okm: '000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
			expected_offset: '0000000000000000000000000000000000000000000000000000000000000008' // Little endian
		},
		{
			name: 'top byte is 16',
			//123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef-123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef-123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
			okm: '000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
			expected_offset: '0000000000000000000000000000000000000000000000000000000000000010' // Little endian
		},
		{
			name: 'modulus',
			//123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef-123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef-123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
			okm: '00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed0000000000000000000000000000000000000000000000000000000000000000',
			expected_offset: '0000000000000000000000000000000000000000000000000000000000000000'
		},
		{
			name: 'modulus+1',
			//123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef-123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef-123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
			okm: '00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ee0000000000000000000000000000000000000000000000000000000000000000',
			expected_offset: '0100000000000000000000000000000000000000000000000000000000000000' // Little endian
		},
		{
			name: 'random',
			okm: '4c3c57859e14fd4bf76d26d5089a2c409d246151a4f1848aa917a82f80fc6268fce6cb45ccd89f326ad7759e9a09e3ea03917cce58b7309088a40a0f23df5abc71f04d8c92317647d6b20d1f83e6dfdce8411b66b9b7f78339442616cd6e3364',
			expected_offset: '8ca4ea9be78a8e0748050291e6944d209aba69209170d0981e2db792242dd70c' // Little endian
		}
	];
	return vectors.map(({ name, okm, expected_offset }) => {
		return {
			name,
			okm,
			expected_offset: bigintFromLittleEndianHex(expected_offset)
		};
	});
}
