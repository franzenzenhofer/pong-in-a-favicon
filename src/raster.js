/**
 * The single rasterizer. Turns a {@link GameState} into a flat grid of cells.
 *
 * This is the DRY hinge of the whole project: every surface the game appears on
 * - the favicon, the magnified on-page mirror, and the terminal ASCII view -
 * is painted from this one grid. Nothing else decides "what is where".
 */

import { FIELD, cfg } from './settings.js';
import { PLAYER_X, AI_X } from './engine.js';

/** Cell kinds stored in the grid. */
export const CELL = Object.freeze({ EMPTY: 0, NET: 1, PADDLE: 2, BALL: 3 });

/**
 * @typedef {Object} Grid
 * @property {number} w
 * @property {number} h
 * @property {Uint8Array} cells Row-major, length w*h, values from {@link CELL}.
 */

/**
 * @param {import('./engine.js').GameState} state
 * @returns {Grid}
 */
export function rasterize(state) {
  const { w, h } = FIELD;
  const cells = new Uint8Array(w * h);

  const put = (x, y, v) => {
    if (x >= 0 && x < w && y >= 0 && y < h) cells[y * w + x] = v;
  };
  const rect = (x, y, rw, rh, v) => {
    const x0 = Math.round(x);
    const y0 = Math.round(y);
    for (let yy = y0; yy < y0 + rh; yy++) {
      for (let xx = x0; xx < x0 + rw; xx++) put(xx, yy, v);
    }
  };

  const mid = Math.floor(w / 2);
  for (let y = 1; y < h; y += 4) {
    put(mid, y, CELL.NET);
    put(mid, y + 1, CELL.NET);
  }

  rect(PLAYER_X, state.playerY, cfg.PADDLE_W, cfg.PADDLE_H, CELL.PADDLE);
  rect(AI_X, state.aiY, cfg.PADDLE_W, cfg.PADDLE_H, CELL.PADDLE);
  rect(state.ball.x, state.ball.y, cfg.BALL_SIZE, cfg.BALL_SIZE, CELL.BALL);

  return { w, h, cells };
}
