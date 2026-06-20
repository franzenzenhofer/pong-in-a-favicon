import { describe, it, expect, beforeEach } from 'vitest';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { rmSync, existsSync } from 'node:fs';
import { run } from '../src/cli.js';
import { toAscii } from '../src/ascii.js';
import { createState } from '../src/engine.js';

const FILE = join(tmpdir(), `pong-test-${process.pid}.json`);
const args = (s) => [...s.split(' ').filter(Boolean), '--file', FILE];

describe('cli', () => {
  beforeEach(() => {
    if (existsSync(FILE)) rmSync(FILE);
  });

  it('starts a new game and persists it', () => {
    const { out, code } = run(args('new'));
    expect(code).toBe(0);
    expect(out).toContain('YOU 0 : 0 CPU');
    expect(existsSync(FILE)).toBe(true);
  });

  it('moves the paddle up across calls', () => {
    run(args('new'));
    const before = JSON.parse(run(args('state')).out).playerY;
    run(args('up 5'));
    const after = JSON.parse(run(args('state')).out).playerY;
    expect(after).toBeLessThan(before); // up = smaller y
  });

  it('advances ticks', () => {
    run(args('new'));
    const x0 = JSON.parse(run(args('state')).out).ball.x;
    run(args('tick 5'));
    const x1 = JSON.parse(run(args('state')).out).ball.x;
    expect(x1).not.toBe(x0);
  });

  it('prints the SSOT settings', () => {
    const { out } = run(args('settings'));
    expect(out).toContain('BALL_SPEED');
    expect(out).toContain('single source of truth');
  });

  it('rejects unknown commands with a non-zero code', () => {
    const { code } = run(args('frobnicate'));
    expect(code).toBe(1);
  });

  it('ascii renderer matches the field width', () => {
    const ascii = toAscii(createState());
    const widest = Math.max(...ascii.split('\n').map((l) => [...l].length));
    expect(widest).toBeGreaterThanOrEqual(32);
  });
});
