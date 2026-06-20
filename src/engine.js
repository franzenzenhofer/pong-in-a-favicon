/**
 * Pure Pong physics. No DOM, no canvas, no globals - just data in, data out,
 * so the whole game is unit-testable. Everything is measured in field pixels
 * (see {@link FIELD}); the renderer is the only thing that knows about screens.
 */

import { FIELD, cfg } from './settings.js';

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

/** X position (left edge) of each paddle, derived once from the settings. */
export const PLAYER_X = cfg.PADDLE_MARGIN;
export const AI_X = FIELD.w - cfg.PADDLE_MARGIN - cfg.PADDLE_W;

/** Centre the paddles vertically. */
const centerPaddleY = () => (FIELD.h - cfg.PADDLE_H) / 2;

/**
 * @typedef {Object} GameState
 * @property {{x:number,y:number,vx:number,vy:number,speed:number}} ball
 * @property {number} playerY Top edge of the player's (left) paddle.
 * @property {number} aiY     Top edge of the computer's (right) paddle.
 * @property {{player:number, ai:number}} score
 */

/**
 * Serve the ball from the centre toward `dir` (-1 = to player, +1 = to AI).
 * @param {-1|1} dir
 */
function serve(dir) {
  const angle = (Math.random() * 0.6 - 0.3) * Math.PI; // shallow-ish
  return {
    x: FIELD.w / 2,
    y: FIELD.h / 2,
    vx: dir * cfg.BALL_SPEED * Math.cos(angle),
    vy: cfg.BALL_SPEED * Math.sin(angle),
    speed: cfg.BALL_SPEED,
  };
}

/** Build a fresh game. @returns {GameState} */
export function createState() {
  return {
    ball: serve(Math.random() < 0.5 ? -1 : 1),
    playerY: centerPaddleY(),
    aiY: centerPaddleY(),
    score: { player: 0, ai: 0 },
  };
}

/** True when ball square overlaps a paddle rectangle. */
function hits(ball, paddleX, paddleY) {
  return (
    ball.x < paddleX + cfg.PADDLE_W &&
    ball.x + cfg.BALL_SIZE > paddleX &&
    ball.y < paddleY + cfg.PADDLE_H &&
    ball.y + cfg.BALL_SIZE > paddleY
  );
}

/** Reflect the ball off a paddle, adding spin and a small speed-up. */
function bounceOff(ball, paddleX, paddleY, towardRight) {
  const paddleCenter = paddleY + cfg.PADDLE_H / 2;
  const ballCenter = ball.y + cfg.BALL_SIZE / 2;
  const offset = (ballCenter - paddleCenter) / (cfg.PADDLE_H / 2); // -1..1
  ball.speed = Math.min(ball.speed * cfg.BALL_SPEEDUP, cfg.BALL_MAX_SPEED);

  const dirX = towardRight ? 1 : -1;
  ball.vy += offset * cfg.SPIN;
  // Re-normalise to keep total speed controlled, then re-apply X direction.
  const mag = Math.hypot(dirX, ball.vy) || 1;
  ball.vx = (dirX / mag) * ball.speed;
  ball.vy = (ball.vy / mag) * ball.speed;
  // Push the ball clear of the paddle so it cannot get stuck inside it.
  ball.x = towardRight ? paddleX + cfg.PADDLE_W : paddleX - cfg.BALL_SIZE;
}

/** Move the AI paddle toward the ball, capped by its (beatable) top speed. */
function moveAi(state, dt) {
  const target = state.ball.y + cfg.BALL_SIZE / 2 - cfg.PADDLE_H / 2;
  const diff = target - state.aiY;
  if (Math.abs(diff) <= cfg.AI_DEADZONE) return;
  const stepY = clamp(diff, -cfg.AI_SPEED * dt, cfg.AI_SPEED * dt);
  state.aiY = clamp(state.aiY + stepY, 0, FIELD.h - cfg.PADDLE_H);
}

/**
 * Advance the simulation by `dt` frames (1 = one 60fps tick).
 * @param {GameState} state   Mutated in place and returned.
 * @param {number} playerMove Player paddle delta in field px for this tick.
 * @param {number} [dt=1]
 * @returns {GameState}
 */
export function step(state, playerMove = 0, dt = 1) {
  const { ball } = state;

  state.playerY = clamp(state.playerY + playerMove, 0, FIELD.h - cfg.PADDLE_H);
  moveAi(state, dt);

  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  // Top / bottom walls.
  if (ball.y <= 0) {
    ball.y = 0;
    ball.vy = Math.abs(ball.vy);
  } else if (ball.y + cfg.BALL_SIZE >= FIELD.h) {
    ball.y = FIELD.h - cfg.BALL_SIZE;
    ball.vy = -Math.abs(ball.vy);
  }

  // Paddle returns.
  if (ball.vx < 0 && hits(ball, PLAYER_X, state.playerY)) {
    bounceOff(ball, PLAYER_X, state.playerY, true);
  } else if (ball.vx > 0 && hits(ball, AI_X, state.aiY)) {
    bounceOff(ball, AI_X, state.aiY, false);
  }

  // Scoring - ball leaves the field through a side wall.
  if (ball.x + cfg.BALL_SIZE < 0) {
    state.score.ai += 1;
    state.ball = serve(1);
  } else if (ball.x > FIELD.w) {
    state.score.player += 1;
    state.ball = serve(-1);
  }

  return state;
}
