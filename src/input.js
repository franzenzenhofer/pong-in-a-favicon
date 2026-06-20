/**
 * The page scroll IS the controller. Scrolling up/down moves your paddle while
 * the page scrolls normally - the gesture does double duty. Two device sources
 * feed one accumulator:
 *
 *   - desktop: mouse-wheel / trackpad (`wheel`, fires even at scroll limits)
 *   - mobile:  one-finger swipe (`touchmove`)
 *
 * Down-scroll moves the paddle down; up-scroll moves it up. The loop calls
 * `consume()` once per frame to read and reset the accumulated movement.
 */

import { cfg } from './settings.js';

/**
 * @param {Window | HTMLElement} [target=window]
 * @returns {{ consume: () => number, dispose: () => void }}
 */
export function createInput(target = window) {
  let pending = 0;
  let lastTouchY = null;

  const add = (deltaPx) => {
    pending += deltaPx * cfg.SCROLL_GAIN;
  };

  // Passive: we do NOT preventDefault, so the page keeps scrolling naturally.
  const onWheel = (e) => add(e.deltaY);

  const onTouchStart = (e) => {
    lastTouchY = e.touches[0] ? e.touches[0].clientY : null;
  };
  const onTouchMove = (e) => {
    if (lastTouchY === null || !e.touches[0]) return;
    const y = e.touches[0].clientY;
    add(lastTouchY - y); // swipe up -> positive -> paddle down, matching wheel
    lastTouchY = y;
  };
  const onTouchEnd = () => {
    lastTouchY = null;
  };

  target.addEventListener('wheel', onWheel, { passive: true });
  target.addEventListener('touchstart', onTouchStart, { passive: true });
  target.addEventListener('touchmove', onTouchMove, { passive: true });
  target.addEventListener('touchend', onTouchEnd, { passive: true });

  return {
    consume() {
      const v = pending;
      pending = 0;
      return v;
    },
    dispose() {
      target.removeEventListener('wheel', onWheel);
      target.removeEventListener('touchstart', onTouchStart);
      target.removeEventListener('touchmove', onTouchMove);
      target.removeEventListener('touchend', onTouchEnd);
    },
  };
}
