import { execSync } from 'child_process';
import * as path from 'path';
import { describe, expect, it } from 'vitest';

describe('CLI', () => {
	const cliPath = path.join(process.cwd(), 'dist', 'cli.js');

	it('should show help message', () => {
		const output = execSync(`node ${cliPath} --help`).toString();
		expect(output).toContain('Tools for Internet Computer Protocol public keys');
	});

	/*
    it('should derive secp256k1 key with valid inputs', () => {
        const pubkey = '02b84ff3f88329a887657d0309bd1a1af9e37601e5d1a535d6fe7d42e37f79f40a';
        const chaincode = '212891bc032f28d369bacf39dc369feb516eced9a3d83498246aead1546f8cd1';
        const derivationPath = '2/444/66666';

        const output = execSync(
            `node ${cliPath} derive ecdsa secp256k1 -k ${pubkey} -c ${chaincode} -d ${derivationPath}`
        ).toString();

        const result = JSON.parse(output);
        expect(result.response.key.public_key).toBe('024bf78e40bb51d2c6c14c11aa8f3af1549741de5acdf925e6dc230dfc5daa22d9');
        expect(result.response.key.chain_code).toBe('bc35b8515f03aa1543081e2af4e878f28b27f3ce00c035f4068702d33ee88586');
    });

    it('should handle caller-secp256k1 command', () => {
        const principal = '2vxsx-fae';
        const pubkey = '02b84ff3f88329a887657d0309bd1a1af9e37601e5d1a535d6fe7d42e37f79f40a';
        const chaincode = '212891bc032f28d369bacf39dc369feb516eced9a3d83498246aead1546f8cd1';
        const derivationPath = '2/444/66666';

        const output = execSync(
            `node ${cliPath} derive ecdsa caller-secp256k1 -p ${principal} -k ${pubkey} -c ${chaincode} -d ${derivationPath}`
        ).toString();

        const result = JSON.parse(output);
        expect(result.response.key).toBeDefined();
        expect(result.response.key.public_key).toBeDefined();
        expect(result.response.key.chain_code).toBeDefined();
    });

    it('should handle missing required options', () => {
        expect(() => {
            execSync(`node ${cliPath} derive ecdsa secp256k1`).toString();
        }).toThrow();
    });

    it('should handle invalid public key format', () => {
        const invalidPubkey = 'invalid';
        const chaincode = '212891bc032f28d369bacf39dc369feb516eced9a3d83498246aead1546f8cd1';
        const derivationPath = '2/444/66666';

        expect(() => {
            execSync(
                `node ${cliPath} derive ecdsa secp256k1 -k ${invalidPubkey} -c ${chaincode} -d ${derivationPath}`
            ).toString();
        }).toThrow();
    });
   */
});
