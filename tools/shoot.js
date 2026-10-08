#!/usr/bin/env node
/* Headless screenshots of the built game: node tools/shoot.js out.png "<js to run in the page>" [width] [height] [waitMs]
   The JS runs after boot; it may return a promise. Console errors are printed. */
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const [,, out, script, w, h, wait] = process.argv;
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: +(w || 1400), height: +(h || 900) } });
  const logs = [];
  p.on('console', m => { if (m.type() === 'error' || (m.type() === 'warning' && !/GL Driver|AudioContext|GroupMarker|swiftshader|GPU stall/.test(m.text()))) logs.push(m.type() + ': ' + m.text()); });
  p.on('pageerror', e => logs.push('PAGEERR: ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 4).join('\n')));
  await p.goto('file://' + path.resolve(__dirname, '..', 'dist', 'index.html'));
  await p.waitForTimeout(1500);
  if (script){ try { const r = await p.evaluate(script); if (r !== undefined) console.log('EVAL:', typeof r === 'string' ? r.slice(0, 4000) : JSON.stringify(r).slice(0, 4000)); } catch (e){ console.log('EVAL ERROR:', e.message); } }
  await p.waitForTimeout(+(wait || 1500));
  await p.screenshot({ path: out });
  if (logs.length) console.log(logs.slice(0, 30).join('\n'));
  await b.close();
})();
