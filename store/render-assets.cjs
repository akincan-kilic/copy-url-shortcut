// Optional artwork tooling; not part of the extension runtime or store ZIP.
// Requires Playwright and Sharp available as development tools.
const { chromium } = require('playwright');
const sharp = require('sharp');
const { createServer } = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const repo = path.resolve(__dirname, '..');

(async () => {
  const { runPageCopy } = await import(pathToFileURL(path.join(repo, 'page-copy.js')).href);
  const server = createServer(async (request, response) => {
    try {
      const file = path.resolve(repo, '.' + new URL(request.url, 'http://localhost').pathname);
      if (!file.startsWith(repo + path.sep)) { response.writeHead(403).end(); return; }
      const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png' };
      response.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
      response.end(await fs.readFile(file));
    } catch { response.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    // Render the actual production confirmation function, including its closed shadow root.
    for (const [name, options] of [
      ['text', {}], ['markdown', { format: 'markdown' }],
      ['check', { confirmation: 'check' }], ['error', { error: true }],
    ]) {
      await page.setContent('<!doctype html><title>Copy URL artwork</title><style>html,body{margin:0;background:transparent}</style>');
      await page.evaluate(`(${runPageCopy.toString()})("", true, ${JSON.stringify(options)})`);
      // Wait for the entrance animation to settle, before the normal dismissal.
      await page.waitForTimeout(180);
      const cdp = await page.context().newCDPSession(page);
      const { root } = await cdp.send('DOM.getDocument', { depth: -1, pierce: true });
      function findToast(node) {
        const attributes = node.attributes || [];
        const classIndex = attributes.indexOf('class');
        if (classIndex >= 0 && /^toast(?: |$)/.test(attributes[classIndex + 1])) return node;
        for (const child of [...(node.children || []), ...(node.shadowRoots || [])]) {
          const found = findToast(child); if (found) return found;
        }
      }
      const toast = findToast(root);
      if (!toast) throw new Error(`Missing ${name} confirmation`);
      const { model } = await cdp.send('DOM.getBoxModel', { nodeId: toast.nodeId });
      const xs = model.border.filter((_, i) => i % 2 === 0);
      const ys = model.border.filter((_, i) => i % 2 === 1);
      const x = Math.floor(Math.min(...xs) - 20), y = Math.floor(Math.min(...ys) - 18);
      await page.screenshot({
        path: path.join(__dirname, `artwork/captures/confirmation-${name}.png`), omitBackground: true,
        clip: { x, y, width: Math.ceil(Math.max(...xs) - x + 20), height: Math.ceil(Math.max(...ys) - y + 24) },
      });
      await cdp.detach();
    }
    await page.setViewportSize({ width: 1280, height: 800 });
    for (const [source, output] of [['menu', 'screenshot-menu'], ['confirmations', 'screenshot-confirmations']]) {
      await page.goto(`${base}/store/artwork/${source}.html`);
      await page.evaluate(() => Promise.all(Array.from(document.images, image => image.decode())));
      const png = await page.screenshot();
      await sharp(png).resize(1280, 800).removeAlpha().png().toFile(path.join(__dirname, `${output}.png`));
      console.log(`Rendered store/${output}.png (1280×800, RGB)`);
    }
    if (errors.length) throw new Error(errors.join('\n'));
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
