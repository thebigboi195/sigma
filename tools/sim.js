// Balance simulator: parties of auto-playing heroes vs generated encounters.
const load = require('./load-core.js');
const { DATA, CORE: C } = load();
C.setWeb(true);
function rngSeed(seed){ return C.rng(seed); }
function hero(L, tier, w = 0, seed = 1) {
  const r = rngSeed(seed * 7919 + L);
  const ref = C.refP(L);
  const st = Object.assign({}, ref.st);
  const rar = tier === 'ref' ? [0, 1] : tier === 'good' ? [2, 2] : tier === 'great' ? [3, 3] : tier === 'myth' ? [4, 4] : tier === 'prom' ? [5, 5] : [6, 6];
  const wi = Math.floor(r() * 5);
  let wpn, arm;
  if (rar[0] >= 5) { wpn = C.makeTop(rar[0], r, L, 'weapon', w); arm = C.makeTop(rar[1], r, L, 'armour', w); }
  else { wpn = C.makeWeapon(w, wi, Math.min(4, rar[0]), r, L); arm = C.makeArmour(w, Math.min(4, rar[1]), Math.floor(r() * 3), r, L); }
  if (tier === 'ref') { wpn.dmg = Math.round(wpn.dmg * 1.1); }
  // boost stats to meet requirements if needed
  const eq = { weapon: wpn, armour: arm, trinkets: [] };
  for (const it of [wpn, arm]) for (const [k, v] of Object.entries(it.req || {})) if ((st[k] || 0) < v) st[k] = v;
  return { P: { lv: L, st, boons: [], eq }, belt: { hp: 3, hp2: 1, iron: 1, str: 1 } };
}
function fight(n, L, tier, path, w = 0, seed = 1, opts = {}) {
  const r = rngSeed(seed);
  C.setPL(L);
  const g = C.makeGroup(w, L, path, r);
  C.scaleForParty(g, n, w, L, path, r);
  const list = [...Array(n)].map((_, i) => { const h = hero(L, tier, w, seed + i); return { hid: 'h' + i, P: h.P, belt: Object.assign({}, h.belt), hp: undefined }; });
  const B = C.newParty(list, g, { world: w });
  let rounds = 0, dmgTaken = 0;
  while (!B.over && rounds < 80) {
    const acts = {};
    for (const h of B.heroes) if (!h.down && h.hp > 0) acts[h.hid] = C.autoAct(B, h, r);
    C.partyRound(B, acts, r); rounds++;
  }
  return { win: B.over === 'win', rounds, left: B.heroes.filter(h => !h.down).length, hpPct: B.heroes.reduce((a, h) => a + h.hp / h.max, 0) / n };
}
function batch(label, n, L, tier, path, w = 0, N = 40) {
  let wins = 0, rounds = 0, hp = 0;
  for (let i = 0; i < N; i++) { const o = fight(n, L, tier, path, w, 100 + i); if (o.win) { wins++; hp += o.hpPct; } rounds += o.rounds; }
  console.log(`${label.padEnd(34)} n=${n} L=${L} ${tier.padEnd(5)} win ${(wins / N * 100).toFixed(0).padStart(3)}%  avg rounds ${(rounds / N).toFixed(1).padStart(5)}  hp left(win) ${(wins ? hp / wins * 100 : 0).toFixed(0)}%`);
}
module.exports = { C, DATA, hero, fight, batch };
if (require.main === module) {
  const W = 0;
  for (const tier of ['ref', 'good', 'great']) {
    batch('normal ★3', 3, 20, tier, { stars: 3, kind: 'normal' });
    batch('normal ★5', 3, 20, tier, { stars: 5, kind: 'normal' });
    batch('god ★6', 3, 20, tier, { stars: 6, kind: 'god', key: 'zeusGod' });
    batch('boss', 3, 20, tier, { stars: 4, kind: 'boss', key: 'watcher' });
    batch('final boss L30', 3, 30, tier, { stars: 4, kind: 'boss', key: 'watcher', final: true });
  }
}
if (require.main === module && process.argv[2] === 'top') {
  for (const n of [1, 3, 5]) {
    for (const tier of ['myth', 'prom', 'outer']) {
      batch('god ★6', n, 25, tier, { stars: 6, kind: 'god', key: 'zeusGod' }, 0, 30);
      batch('★7 Zeus+Atlas', n, 25, tier, { stars: 7, kind: 'promised', key: 0 }, 0, 30);
      batch('★7 Red+Musashi', n, 25, tier, { stars: 7, kind: 'promised', key: 1 }, 0, 30);
      batch('★10 Grin', n, 25, tier, { stars: 10, kind: 'outer', key: 'batGrin' }, 0, 30);
      batch('final L30', n, 30, tier, { stars: 10, kind: 'boss', key: 'watcher', final: true }, 0, 30);
    }
  }
}
