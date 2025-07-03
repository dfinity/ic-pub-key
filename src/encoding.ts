/**
 * Encodes an array of bytes as a Candid blob string.
 * @param path
 * @returns
 */
export function blobEncode(bytes: Uint8Array): string {
	return [...bytes].map((p) => blobEncodeU8(p)).join('');
}
/**
 * Decodes a Candid blob string as an array of bytes.
 * @param s
 * @returns
 */
export function blobDecode(s: string): Uint8Array {
	const ans = [];
	let skip = 0;
	let byte = 0;
	for (const char of s) {
		if (skip == 2) {
			byte = parseInt(char, 16);
			skip--;
			continue;
		}
		if (skip == 1) {
			byte = byte * 16 + parseInt(char, 16);
			ans.push(byte);
			skip--;
			continue;
		}
		if (char === '\\') {
			skip = 2;
			byte = 0;
			continue;
		}
		ans.push(char.charCodeAt(0));
	}
	// Handle incomplete escape sequences
	if (skip > 0) {
		throw new Error('Incomplete escape sequence at the end of the input string.');
	}
	return new Uint8Array(ans);
}

/**
 * @returns True if the character is an ASCII alphanumeric character.
 */
function isAsciiAlphanumeric(code: number): boolean {
	return (
		(code >= 48 && code <= 57) || // 0-9
		(code >= 65 && code <= 90) || // A-Z
		(code >= 97 && code <= 122) // a-z
	);
}
/**
 * Encodes a single byte as a Candid blob string.
 * @param u8
 * @returns
 */
function blobEncodeU8(u8: number): string {
	if (isAsciiAlphanumeric(u8)) {
		return String.fromCharCode(u8);
	}
	// Backslash and two hex chars:
	return `\\${u8.toString(16).padStart(2, '0')}`;
}

/**
 * Convert bytes arranged most significant first to a bigint.
 * @param bytes The bytes to convert.
 * @returns The converted number.
 */
export function bigintFromBigEndianBytes(bytes: Uint8Array): bigint {
	let big_endian_hex = '0x' + Buffer.from(bytes).toString('hex');
	return BigInt(big_endian_hex);
}

/**
 * Convert little endian hex to a bigint.
 * @param hex The hex to convert.
 * @returns The converted number.
 */
export function bigintFromLittleEndianHex(hex: string): bigint {
	let big_endian_hex = '0x' + Buffer.from(hex, 'hex').reverse().toString('hex');
	return BigInt(big_endian_hex);
}

/**
 * Convert an array of bytes to a hex string.
 * @param array The array to convert.
 * @returns The converted string.
 */
export function arrayAsHex(array: Uint8Array): string {
	return Buffer.from(array).toString('hex');
}
