/**
 * Headless command interface to the very same Pong engine the browser runs.
 *
 * Design goals:
 *   - 100% AI-drivable: every command is discrete, the game state lives in a
 *     JSON file between calls, and each command prints the resulting frame, so
 *     an agent can `up`, `down`, `tick`, then read the board - no TTY needed.
 *   - 100% readable: `show` prints ASCII, `state` prints JSON, `settings`
 *     prints the single source of truth.
 *   - DRY: imports engine/settings/ascii directly - zero gameplay logic here.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { SETTINGS } from './settings.js';
import { createState, step } from './engine.js';
import { toAscii } from './ascii.js';

const DEFAULT_FILE = process.env.PONG_STATE || join(process.cwd(), '.pong-state.json');
const STEP_PX = 3; // default paddle move per up/down command

const load = (file) =>
  existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : createState();
const save = (file, state) => writeFileSync(file, JSON.stringify(state));

const HELP = `pong - play Pong from the command line (same engine as the favicon)

USAGE
  pong <command> [n] [--file <path>]

COMMANDS
  new            Start a fresh game
  show           Print the current board as ASCII
  state          Print the current game state as JSON
  up [n]         Move your paddle up n px (default ${STEP_PX}) and advance 1 tick
  down [n]       Move your paddle down n px (default ${STEP_PX}) and advance 1 tick
  tick [n]       Advance n ticks (default 1) without moving
  settings       Print every tunable (the single source of truth)
  help           Show this help

STATE FILE
  Defaults to .pong-state.json in the current directory.
  Override with --file <path> or the PONG_STATE env var.

EXAMPLES
  pong new && pong up 4 && pong tick 10 && pong show
`;

function settingsText() {
  const rows = SETTINGS.map(
    (s) => `  ${s.key.padEnd(16)} ${String(s.value).padStart(6)} ${s.unit.padEnd(10)} ${s.doc}`,
  );
  return ['SETTINGS (single source of truth)', ...rows].join('\n');
}

/** Pull `--file <path>` out of argv, returning [cleanArgs, file]. */
function extractFile(args) {
  const i = args.indexOf('--file');
  if (i === -1) return [args, DEFAULT_FILE];
  const file = args[i + 1];
  return [[...args.slice(0, i), ...args.slice(i + 2)], file || DEFAULT_FILE];
}

/**
 * Run one CLI invocation.
 * @param {string[]} argv Arguments after `node pong.js`.
 * @returns {{ out: string, code: number }}
 */
export function run(argv) {
  const [args, file] = extractFile(argv);
  const [cmd = 'help', arg] = args;
  const n = Number.isFinite(Number(arg)) && arg !== undefined ? Number(arg) : undefined;

  switch (cmd) {
    case 'new': {
      const state = createState();
      save(file, state);
      return { out: toAscii(state), code: 0 };
    }
    case 'show':
      return { out: toAscii(load(file)), code: 0 };
    case 'state':
      return { out: JSON.stringify(load(file), null, 2), code: 0 };
    case 'up':
    case 'down': {
      const state = load(file);
      const move = (cmd === 'up' ? -1 : 1) * (n ?? STEP_PX);
      step(state, move, 1);
      save(file, state);
      return { out: toAscii(state), code: 0 };
    }
    case 'tick': {
      const state = load(file);
      const ticks = Math.max(1, n ?? 1);
      for (let i = 0; i < ticks; i++) step(state, 0, 1);
      save(file, state);
      return { out: toAscii(state), code: 0 };
    }
    case 'settings':
      return { out: settingsText(), code: 0 };
    case 'help':
    case '--help':
    case '-h':
      return { out: HELP, code: 0 };
    default:
      return { out: `Unknown command: ${cmd}\n\n${HELP}`, code: 1 };
  }
}
