import * as z from 'zod/v4';

const TestVectorSchema = z.object({
	name: z.string(),
	public_key: z.string(),
	chain_code: z.string(),
	derivation_path: z.string(),
	expected_public_key: z.string(),
	expected_chain_code: z.string()
});

export const TestVectorsSchema = z.object({
	ecdsa: z.object({
		secp256k1: z.object({
			test_vectors: z.array(TestVectorSchema)
		})
	})
});
