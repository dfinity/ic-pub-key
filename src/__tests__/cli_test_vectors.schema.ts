import * as z from 'zod/v4';

const EthCommandSchema = z.object({
	address: z.array(
		z.object({
			name: z.string(),
			args: z.array(z.string()),
			request: z.object({
				pubkey: z.string(),
				chaincode: z.string(),
				principal: z.string()
			}),
			response: z.object({
				eth_address: z.string()
			})
		})
	)
});

const BtcCommandSchema = z.object({
	address: z.array(
		z.object({
			name: z.string(),
			args: z.array(z.string()),
			request: z.object({
				pubkey: z.string(),
				chaincode: z.string(),
				principal: z.string()
			}),
			response: z.object({
				btc_address: z.string(),
				network: z.string()
			})
		})
	)
});

export const CliTestVectorsSchema = z.object({
	signer: z.object({
		btc: BtcCommandSchema,
		eth: EthCommandSchema
	})
});
