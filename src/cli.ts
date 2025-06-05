#!/usr/bin/env node

import { Command } from "commander";

const program = new Command();

program
  .name("ic-pub-key")
  .description("Tools for Internet Computer Protocol public keys")
  .version("1.0.0");
program.parse(process.argv);
