/**
 * Browser entry point. The game is played IN THE TAB: it renders into the
 * favicon and the score goes into the document title. You control your paddle
 * by scrolling the page. Nothing of the game is drawn in the page body, except
 * a small favicon preview for mobile (where tab icons are hidden).
 */

import './style.css';
import { FIELD, cfg } from './settings.js';
import { createState, step } from './engine.js';
import { draw } from './renderer.js';
import { setFavicon } from './favicon.js';
import { createInput } from './input.js';
import { runChecks } from './checks.js';
import { renderSelfTest, renderCode } from './page.js';

// The actual source, imported as text - so the on-page code is never a copy.
import settingsSrc from './settings.js?raw';
import engineSrc from './engine.js?raw';
import rasterSrc from './raster.js?raw';

function gameCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = FIELD.w;
  canvas.height = FIELD.h;
  return { canvas, ctx: canvas.getContext('2d') };
}

function boot() {
  // Static documentation, straight from the real modules and the real tests.
  renderSelfTest(document.getElementById('selftest'), runChecks());
  renderCode(document.getElementById('code'), [
    { name: 'src/settings.js', src: settingsSrc },
    { name: 'src/engine.js', src: engineSrc },
    { name: 'src/raster.js', src: rasterSrc },
  ]);

  const game = createState();
  const { canvas, ctx } = gameCanvas();
  const input = createInput(window);
  const preview = /** @type {HTMLImageElement | null} */ (
    document.getElementById('tab-favicon')
  );

  let lastFavicon = 0;
  const interval = 1000 / cfg.FAVICON_FPS;
  let prev = performance.now();

  function frame(now) {
    const dt = Math.min((now - prev) / (1000 / 60), 3); // cap big gaps
    prev = now;

    step(game, input.consume(), dt);

    if (now - lastFavicon >= interval) {
      draw(ctx, game);
      const url = setFavicon(canvas);
      document.title = `${game.score.player}:${game.score.ai} - Pong in a Favicon`;
      if (preview) preview.src = url;
      lastFavicon = now;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
