/**
 * Single Source of Truth.
 *
 * Every tunable lives here exactly once, as a self-describing descriptor.
 * The game engine reads `cfg.<KEY>`; the on-page documentation table is
 * generated from these same descriptors. Change a number once and both the
 * gameplay and the docs update together - that is the whole DRY trick.
 *
 * @typedef {Object} Setting
 * @property {string} key   Stable identifier, also the `cfg` lookup key.
 * @property {number} value The actual value used by the engine.
 * @property {string} unit  Human-readable unit, shown in the docs.
 * @property {string} doc   One-line explanation, shown in the docs.
 */

/** The play-field is a tiny square - the exact size of a crisp favicon. */
export const FIELD = Object.freeze({ w: 32, h: 32 });

/** @type {ReadonlyArray<Setting>} */
export const SETTINGS = Object.freeze([
  { key: 'BALL_SIZE', value: 3, unit: 'px', doc: 'Side length of the square ball.' },
  { key: 'BALL_SPEED', value: 0.65, unit: 'px/frame', doc: 'Starting ball speed; nudged up on every paddle hit.' },
  { key: 'BALL_SPEEDUP', value: 1.04, unit: 'x', doc: 'Speed multiplier applied each time a paddle returns the ball.' },
  { key: 'BALL_MAX_SPEED', value: 1.8, unit: 'px/frame', doc: 'Hard cap so the rally stays winnable.' },
  { key: 'PADDLE_W', value: 3, unit: 'px', doc: 'Paddle thickness.' },
  { key: 'PADDLE_H', value: 11, unit: 'px', doc: 'Paddle length.' },
  { key: 'PADDLE_MARGIN', value: 0, unit: 'px', doc: 'Gap between each paddle and its wall (0 = flush to the edge).' },
  { key: 'SCROLL_GAIN', value: 0.05, unit: 'px/Δ', doc: 'How far your paddle moves per unit of scroll / drag.' },
  { key: 'AI_SPEED', value: 0.42, unit: 'px/frame', doc: 'Top speed of the computer paddle - kept below yours so you can win.' },
  { key: 'AI_DEADZONE', value: 2, unit: 'px', doc: 'The AI ignores tiny offsets, giving it a beatable wobble.' },
  { key: 'SPIN', value: 0.9, unit: 'px/frame', doc: 'Extra vertical kick based on where the ball strikes the paddle.' },
  { key: 'FAVICON_FPS', value: 15, unit: 'fps', doc: 'How often the favicon image is rebuilt (kept modest so Chrome renders every frame).' },
]);

/**
 * Flat, frozen `{ KEY: value }` map derived from {@link SETTINGS}.
 * This is what the engine consumes - never hand-write these numbers elsewhere.
 * @type {Readonly<Record<string, number>>}
 */
export const cfg = Object.freeze(
  Object.fromEntries(SETTINGS.map((s) => [s.key, s.value])),
);
