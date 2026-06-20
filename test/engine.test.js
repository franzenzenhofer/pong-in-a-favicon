import { describe, it } from 'vitest';
import { CHECKS } from '../src/checks.js';

// The very same checks run live on the page (see src/checks.js + selftest).
describe('engine + raster + ascii (shared checks)', () => {
  for (const check of CHECKS) {
    it(check.name, () => check.run());
  }
});
