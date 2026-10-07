// Loads the pure-logic part of the game (DATA + CORE) into node for simulations and tests.
const fs = require('fs'), path = require('path'), vm = require('vm');
module.exports = function load() {
  const dir = path.join(__dirname, '..', 'src');
  let app = fs.readFileSync(path.join(dir, 'app.html'), 'utf8');
  app = app.replace(/\/\*@@include ([\w.\-]+)@@\*\//g, (_, f) => fs.readFileSync(path.join(dir, 'parts', f), 'utf8'));
  const a = app.indexOf('/* ===== Essay Quest v2 data ===== */');
  const b = app.indexOf('/* ===== Essay Quest v7 — ASM');
  if (a < 0 || b < 0) throw new Error('markers not found');
  const code = app.slice(a, b) + '\n;({DATA, CORE})';
  const ctx = { console, Math, Date, JSON, Object, Array, Number, String, Set, Map, Symbol, window: {}, localStorage: { getItem() { return null; }, setItem() {} } };
  return vm.runInNewContext(code, ctx, { filename: 'core.js' });
};
