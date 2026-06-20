#!/usr/bin/env node
/** Thin executable wrapper around the testable CLI in src/cli.js. */
import { run } from '../src/cli.js';

const { out, code } = run(process.argv.slice(2));
process.stdout.write(`${out}\n`);
process.exit(code);
