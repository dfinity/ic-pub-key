#!/usr/bin/env node

import { Command } from "commander";

const program = new Command();

program
  .name("mycli")
  .description("A simple CLI app written in TypeScript")
  .version("1.0.0");

program
  .command("greet <name>")
  .description("Greet a user")
  .action(say_hello);

program.parse(process.argv);

function say_hello(name: string) {
    console.log(`Hello, ${name}!`);
}


function derive_key() {

}
