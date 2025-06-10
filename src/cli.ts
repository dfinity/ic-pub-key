import { Command } from 'commander';

export const program = new Command();

program
	.name('ic-pub-key')
	.description('Tools for Internet Computer Protocol public keys')
	.version('1.0.0');
