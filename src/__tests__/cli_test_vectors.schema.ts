import * as z from 'zod/v4';

const EthCommandSchema = z.strictObject({
	address: z.array(
		z.strictObject({
			name: z.string(),
			args: z.array(z.string()),
			request: z.strictObject({
				pubkey: z.string(),
				chaincode: z.string(),
				principal: z.string()
			}),
			response: z.strictObject({
				eth_address: z.string()
			})
		})
	)
});

const BtcCommandSchema = z.strictObject({
	address: z.array(
		z.strictObject({
			name: z.string(),
			args: z.array(z.string()),
			request: z.strictObject({
				pubkey: z.string(),
				chaincode: z.string(),
				principal: z.string(),
				network: z.string()
			}),
			response: z.strictObject({
				btc_address: z.string(),
				network: z.string()
			})
		})
	)
});

export const CliTestVectorsSchema = z.strictObject({
	signer: z.strictObject({
		btc: BtcCommandSchema,
		eth: EthCommandSchema
	})
});
