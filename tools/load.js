// Loads the game's data + core modules (everything up to 10_core.js) in Node, with no browser, for tests and balance sims.
const fs = require('fs'), path = require('path'), vm = require('vm');
module.exports = function load(dir = path.join(__dirname, '..', 'src', 'js')){
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort().filter(f => f <= '10_core.js');
  const ctx = {console, Math, JSON, Object, Array, Set, Map, Date, setTimeout, window: {}};
  vm.createContext(ctx);
  vm.runInContext(files.map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n') + '\n;globalThis.DATA = DATA; globalThis.CORE = CORE;', ctx, {filename: 'game-core.js'});
  return {D: ctx.DATA, C: ctx.CORE};
};
