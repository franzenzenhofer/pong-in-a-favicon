/**
 * ASCII renderer. Same {@link rasterize} grid as the canvas, drawn with glyphs
 * so the game is fully visible - and therefore fully AI-readable - in a plain
 * terminal. This is what `pong show` prints.
 */

import { CELL, rasterize } from './raster.js';

const GLYPH = Object.freeze({
  [CELL.EMPTY]: ' ',
  [CELL.NET]: '┊', // ┊
  [CELL.PADDLE]: '█', // █
  [CELL.BALL]: '●', // ●
});

/**
 * Render the current frame as a bordered, score-topped ASCII block.
 * @param {import('./engine.js').GameState} state
 * @returns {string}
 */
export function toAscii(state) {
  const { w, h, cells } = rasterize(state);
  const top = `┌${'─'.repeat(w)}┐`;
  const bottom = `└${'─'.repeat(w)}┘`;

  const rows = [];
  for (let y = 0; y < h; y++) {
    let row = '';
    for (let x = 0; x < w; x++) row += GLYPH[cells[y * w + x]];
    rows.push(`│${row}│`);
  }

  const score = `  YOU ${state.score.player} : ${state.score.ai} CPU`;
  return [score, top, ...rows, bottom].join('\n');
}
