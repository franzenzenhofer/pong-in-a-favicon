/**
 * Shared assertions over the pure game code. Defined once, run three ways:
 *   - by Vitest at build time (test/engine.test.js)
 *   - by the on-page self-test panel in the browser (selftest.js)
 *   - (extendable) anywhere else that imports CHECKS
 * Each check throws on failure; that is the only contract.
 */

import { FIELD, cfg, SETTINGS } from './settings.js';
import { createState, step, PLAYER_X, AI_X } from './engine.js';
import { rasterize, CELL } from './raster.js';
import { toAscii } from './ascii.js';

const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

/** @type {ReadonlyArray<{ name: string, run: () => void }>} */
export const CHECKS = Object.freeze([
  {
    name: 'cfg is derived from the single source of truth',
    run() {
      for (const s of SETTINGS) assert(cfg[s.key] === s.value, `cfg.${s.key} drifted from SETTINGS`);
    },
  },
  {
    name: 'a fresh game starts centered and scoreless',
    run() {
      const s = createState();
      assert(s.score.player === 0 && s.score.ai === 0, 'score not zero');
      assert(s.playerY === (FIELD.h - cfg.PADDLE_H) / 2, 'paddle not centered');
    },
  },
  {
    name: 'the ball moves every tick',
    run() {
      const s = createState();
      const { x, y } = s.ball;
      step(s, 0, 1);
      assert(s.ball.x !== x || s.ball.y !== y, 'ball did not move');
    },
  },
  {
    name: 'the player paddle clamps to the field',
    run() {
      const s = createState();
      step(s, -1000, 1);
      assert(s.playerY === 0, 'paddle escaped the top');
      step(s, 1000, 1);
      assert(s.playerY === FIELD.h - cfg.PADDLE_H, 'paddle escaped the bottom');
    },
  },
  {
    name: 'the ball bounces off the top wall',
    run() {
      const s = createState();
      s.ball = { x: 16, y: 0.5, vx: 0, vy: -1, speed: 1 };
      step(s, 0, 1);
      assert(s.ball.vy > 0 && s.ball.y >= 0, 'no top-wall bounce');
    },
  },
  {
    name: 'the AI scores when the ball passes the player',
    run() {
      const s = createState();
      s.ball = { x: -cfg.BALL_SIZE - 1, y: 16, vx: -1, vy: 0, speed: 1 };
      step(s, 0, 1);
      assert(s.score.ai === 1, 'AI did not score');
    },
  },
  {
    name: 'the player paddle returns the ball',
    run() {
      const s = createState();
      s.playerY = 11;
      s.ball = { x: PLAYER_X + cfg.PADDLE_W - 0.1, y: 14, vx: -0.6, vy: 0, speed: 0.6 };
      step(s, 0, 1);
      assert(s.ball.vx > 0, 'ball was not returned');
    },
  },
  {
    name: 'paddles sit inside the field',
    run() {
      assert(PLAYER_X >= 0, 'player paddle off-field');
      assert(AI_X + cfg.PADDLE_W <= FIELD.w, 'AI paddle off-field');
    },
  },
  {
    name: 'the rasterizer draws paddles and the ball',
    run() {
      const grid = rasterize(createState());
      assert(grid.cells.length === FIELD.w * FIELD.h, 'grid is the wrong size');
      assert(grid.cells.includes(CELL.PADDLE), 'no paddle in grid');
      assert(grid.cells.includes(CELL.BALL), 'no ball in grid');
    },
  },
  {
    name: 'the ASCII view spans the full field width',
    run() {
      const widest = Math.max(...toAscii(createState()).split('\n').map((l) => [...l].length));
      assert(widest >= FIELD.w, 'ASCII frame too narrow');
    },
  },
]);

/**
 * Run every check, catching failures.
 * @returns {Array<{ name: string, ok: boolean, error?: string }>}
 */
export function runChecks() {
  return CHECKS.map((c) => {
    try {
      c.run();
      return { name: c.name, ok: true };
    } catch (err) {
      return { name: c.name, ok: false, error: String(err && err.message) };
    }
  });
}
