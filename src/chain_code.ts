/**
 * A chain code is a 32 byte hash of how a key was derived.
 */
export class ChainCode {
	static readonly LENGTH = 32;

	constructor(public readonly bytes: Uint8Array) {
		if (bytes.length !== ChainCode.LENGTH) {
			throw new Error(
				`Invalid ChainCode length: expected ${ChainCode.LENGTH} bytes, got ${bytes.length}`
			);
		}
	}

	static fromHex(hex: string): ChainCode {
		const bytes = Buffer.from(hex, 'hex');
		return new ChainCode(new Uint8Array(bytes));
	}

	static fromArray(array: number[]): ChainCode {
		return new ChainCode(new Uint8Array(array));
	}

	asHex(): string {
		return Buffer.from(this.bytes).toString('hex');
	}

	toJSON(): string {
		return this.asHex();
	}
}
