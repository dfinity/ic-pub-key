import { describe, expect, it } from 'vitest';
import { DerivationPath } from '../secp256k1';

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
				let encoded = testVector.path.toBlob();
				expect(encoded).toBe(testVector.blob);
			});
		}
	});
});
