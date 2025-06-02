import { strict as assert } from 'assert';
import { DerivationPath } from '../secp256k1';

describe('DerivationPath', () => {
    describe('toBlob', () => {
        it('should return undefined for empty path', () => {
            const path = new DerivationPath([]);
            assert.equal(path.toBlob(), undefined);
        });

        it('should encode simple ASCII characters', () => {
            const path = new DerivationPath([
                new TextEncoder().encode('abc'),
                new TextEncoder().encode('123')
            ]);
            assert.equal(path.toBlob(), 'abc/123');
        });

        it('should escape non-ASCII characters', () => {
            const path = new DerivationPath([
                new Uint8Array([0x00, 0xFF, 0x0A])
            ]);
            assert.equal(path.toBlob(), '\\0\\ff\\a');
        });
    });
}); 