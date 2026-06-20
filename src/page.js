/**
 * Pure DOM helpers for the page: the live self-test panel and the core-code
 * viewer. Both take data and build elements - no game logic lives here.
 */

/**
 * Render self-test results as a pass/fail list.
 * @param {HTMLElement} container
 * @param {Array<{ name: string, ok: boolean, error?: string }>} results
 */
export function renderSelfTest(container, results) {
  const passed = results.filter((r) => r.ok).length;
  const summary = document.createElement('p');
  summary.className = `selftest-summary ${passed === results.length ? 'ok' : 'fail'}`;
  summary.textContent = `${passed} / ${results.length} checks passing`;

  const list = document.createElement('ul');
  list.className = 'selftest';
  for (const r of results) {
    const li = document.createElement('li');
    li.className = r.ok ? 'ok' : 'fail';
    li.textContent = `${r.ok ? '✓' : '✗'} ${r.name}${r.error ? ` - ${r.error}` : ''}`;
    list.appendChild(li);
  }
  container.replaceChildren(summary, list);
}

/**
 * Render the real source files as collapsible code blocks. The strings are the
 * actual modules (imported with `?raw`), so this can never show stale code.
 * @param {HTMLElement} container
 * @param {Array<{ name: string, src: string }>} files
 */
export function renderCode(container, files) {
  container.replaceChildren(
    ...files.map(({ name, src }) => {
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = name;
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.textContent = src.trim();
      pre.appendChild(code);
      details.append(summary, pre);
      return details;
    }),
  );
}
