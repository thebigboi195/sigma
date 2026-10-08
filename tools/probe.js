#!/usr/bin/env node
/* Fight probe: a solo (or party) hero wearing the reference gear for each round fights each kind of encounter many times.
   Usage: node tools/probe.js [--len 30] [--n 300] [--party 1] [--set FK.key=value,...] */
const load = require('./load.js');
const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => (x.startsWith('--') ? a.concat([[x.slice(2), arr[i + 1]]]) : a), []));
const {D, C} = load(); const LEN = +(args.len || 30), N = +(args.n || 300), NP = +(args.party || 1);
C.setWeb(true); C.setLMAX(LEN); C.setDiff(args.diff || 'hard');
if (args.set) for (const kv of args.set.split(',')){ const [k, v] = kv.split('='); C.FK[k.replace('FK.', '')] = +v; }
const r = Math.random;
const kinds = [['n', 2], ['n', 3], ['n', 4], ['n', 5], ['mini', 5], ['boss', 4], ['god', 6], ['promised', 7], ['outer', 10], ['final', 10]];
const rounds = [3, Math.round(LEN * 0.25), Math.round(LEN * 0.5), Math.round(LEN * 0.75), LEN];
const out = {};
for (const L of rounds){ const rr = C.expRar(L); const lv = C.enemyLv(0, L); const w = 1;
  for (const [k, st] of kinds){ if (k === 'final' && L !== LEN) continue; if (k === 'outer' && L < LEN * 0.5) continue; if (k === 'promised' && L < LEN * 0.25) continue;
    let win = 0, turns = 0, hpl = 0;
    for (let i = 0; i < N; i++){ const ps = [];
      for (let j = 0; j < NP; j++){ const rar = Math.max(0, Math.min(6, Math.floor(rr) + (r() < rr % 1 ? 1 : 0)));
        const wp = rar >= 4 ? C.makeTop(rar, r, null, 'weapon', w) : C.makeWeapon(w, Math.floor(r() * 5), rar, r); const ar = C.makeArmour(w, rar, Math.floor(r() * 3), r);
        ps.push({hid:'h' + j, P:{lv, st:{STR:200, AGI:200, INT:200, FOR:200, WPN:200}, boons:[], eq:{weapon:wp, armour:ar, trinkets:[]}}, belt:{hp:1}}); }
      const path = {kind:k === 'n' ? 'normal' : k === 'final' ? 'boss' : k, stars:st, final:k === 'final', idx:0};
      let g = C.makeGroup(w, L, path, r); g = C.scaleForParty(g, NP, w, L, path, r); const B = C.newParty(ps, g, {world:w});
      let t = 0; while (!B.over && t < 60){ const acts = {}; for (const h of B.heroes) if (!h.down) acts[h.hid] = C.autoAct(B, h, r); C.partyRound(B, acts, r); t++; }
      if (B.over === 'win'){ win++; hpl += B.heroes.reduce((a, h) => a + Math.max(0, h.hp) / h.max, 0) / NP; } turns += t; }
    (out[k + st] = out[k + st] || []).push(`R${L}:${(100 * win / N).toFixed(0)}%/${(turns / N).toFixed(1)}t`); } }
console.log(`len ${LEN} party ${NP} ${args.set || ''}`); for (const k in out) console.log(k.padEnd(10), out[k].join('  '));
