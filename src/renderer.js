/**
 * Canvas renderer. Paints the shared {@link rasterize} grid onto any 2D context
 * sized to the field. The produced frame is reused verbatim as both the favicon
 * and the magnified on-page mirror, so tab and page can never drift apart.
 */

import { CELL, rasterize } from './raster.js';

export const COLORS = Object.freeze({
  bg: '#0a0e14',
  net: '#1b2430',
  paddle: '#39d353',
  ball: '#e6f1ff',
});

/** Map a cell kind to its fill colour (EMPTY is left as background). */
const CELL_COLOR = Object.freeze({
  [CELL.NET]: COLORS.net,
  [CELL.PADDLE]: COLORS.paddle,
  [CELL.BALL]: COLORS.ball,
});

/**
 * @param {CanvasRenderingContext2D} ctx Context of a FIELD.w x FIELD.h canvas.
 * @param {import('./engine.js').GameState} state
 */
export function draw(ctx, state) {
  const { w, h, cells } = rasterize(state);

  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, w, h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const color = CELL_COLOR[cells[y * w + x]];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }
}
