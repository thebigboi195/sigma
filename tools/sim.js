#!/usr/bin/env node
/* Balance simulator: plays whole web-edition runs with bot heroes, using the real game core (src/js up to 10_core.js).
   Usage: node tools/sim.js [--runs 200] [--len 30] [--diff hard] [--party dps|dps,support|dps,dps,dps] [--plan 1] [--quest 0.85] [--seed 1]
   A run is won when the final boss falls; a party wipe ends the run (checkpoints off). Each bot passes quests at the --quest rate,
   rests at camp, spends stat points (a "planner" saves for its build; a non-planner spreads them), and equips the best gear it can. */
const load = require('./load.js');
const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => (x.startsWith('--') ? a.concat([[x.slice(2), arr[i + 1]]]) : a), []));
const RUNS = +(args.runs || 200), LEN = +(args.len || 30), DIFF = args.diff || 'hard', PARTY = (args.party || 'dps').split(','), PLAN = args.plan !== '0', QP = +(args.quest || 0.85);
const VERBOSE = !!args.v, NODEATH = !!args.nodeath;
const FIGHTS = {}, GEAR = {};   // per fight kind: [fought, won]

function sim(seed){
  const {D, C} = load();
  let s = seed >>> 0; const r = () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  C.setWeb(true); C.setLMAX(LEN); C.setDiff(DIFF);
  if (args.set) for (const kv of args.set.split(',')){ const [k, v] = kv.split('='); C.FK[k] = +v; }
  const w = Math.floor(r() * D.WORLDS.length);
  const BUILD = {dps:{arch:['blade', 'heavy', 'pole', 'scythe', 'katana'], role:'plate', want:{WPN:0.36, STR:0.32, FOR:0.32}}, support:{arch:['tome', 'psalter', 'staff', 'grimoire', 'lyre'], role:'robe', want:{WPN:0.34, INT:0.38, FOR:0.28}}};
  const heroes = PARTY.map((kind, i) => { const st = C.starter(); return {firstFind:0, kind, id:'h' + i, lv:1, xp:0, pts:D.SP_START, st:{STR:0, AGI:0, INT:0, FOR:0, WPN:0}, bag:[st.weapon, st.armour], eq:{weapon:st.weapon, armour:st.armour, trinkets:[null, null]}, belt:{hp:2}, hp:null, down:false, firstLeg:0}; });
  const P = h => ({lv:h.lv, st:h.st, boons:[], eq:h.eq});
  const maxHP = h => C.derive(P(h)).max;
  const heal = (h, f) => { const m = maxHP(h); h.hp = Math.min(m, (h.hp == null ? m : h.hp) + Math.round(m * f)); };
  // a planner saves its points for the best piece in its bag that it can't wear yet (the cheapest such upgrade first)
  const target = h => { const p = P(h); const cur = {weapon:C.power(h.eq.weapon), armour:C.power(h.eq.armour)};
    const fits = it => it.kind === 'weapon' ? BUILD[h.kind].arch.includes(it.arch) || it.rar >= 4 : it.role === BUILD[h.kind].role || (h.kind === 'support' && it.role === 'vestment');
    const want = h.bag.filter(it => (it.kind === 'weapon' || it.kind === 'armour') && fits(it) && !C.canEquip(p, it) && C.power(it) > cur[it.kind] * 1.15)
      .map(it => ({it, cost:Object.entries(it.req || {}).reduce((a, [k, v]) => a + Math.max(0, v - (h.st[k] || 0)), 0)})).sort((a, b) => a.cost - b.cost);
    return want[0] && want[0].cost <= h.pts + C.XPK.sp * 6 ? want[0].it : null; };
  const spend = h => { const B = BUILD[h.kind];
    if (PLAN){ const t = target(h); if (t){ for (const [k, v] of Object.entries(t.req)){ while (h.pts > 0 && (h.st[k] || 0) < v){ h.st[k] = (h.st[k] || 0) + 1; h.pts--; } } } }
    const bank = PLAN && h.lv >= 6 ? 30 : 0;   // a planner keeps a bank of points for the next big piece
    while (h.pts > bank){ let k;
      if (PLAN){ let best = -1e9; const sum = Object.values(h.st).reduce((a, b) => a + b, 0); for (const x in B.want){ const g = B.want[x] * (sum + 1) - h.st[x]; if (g > best){ best = g; k = x; } } }
      else k = D.REQ_STATS[Math.floor(r() * 5)];
      h.st[k]++; h.pts--; } };
  const equip = h => { const p = P(h);
    const score = it => { const pw = C.power(it); if (it.kind === 'weapon') return pw * (BUILD[h.kind].arch.includes(it.arch) ? 1.25 : 1); return pw * ((it.role === BUILD[h.kind].role || (h.kind === 'support' && it.role === 'vestment')) ? 1.15 : 1); };
    for (const kind of ['weapon', 'armour']){ const ok = h.bag.filter(it => it.kind === kind && C.canEquip(p, it)).sort((a, b) => score(b) - score(a)); if (ok[0]) h.eq[kind] = ok[0]; }
    if (!h.firstLeg && Math.max(h.eq.weapon.rar, h.eq.armour.rar) >= 4) h.firstLeg = L; };
  const gainXP = (h, x) => { h.xp += x; while (h.xp >= C.XPK.perLevel){ h.xp -= C.XPK.perLevel; h.lv++; h.pts += C.XPK.sp; heal(h, 0.2); } };
  let L = 1; const log = [];
  for (L = 1; L <= LEN; L++){
    const E = C.enemyLv(w, L);
    // camp: rest, quests, spend, equip
    for (const h of heroes){ if (h.down) continue; heal(h, 0.3);
      const qs = C.rollQuests(L, [{c:'x', s:['a b c d e f'], e:'web'}], r).slice(0, 3);
      for (const q of qs){ if (r() < QP){ gainXP(h, Math.round(C.questXP(q.pts, L, h.lv - E))); heal(h, 0.1); } } spend(h); equip(h); }
    // path vote
    const paths = C.rollPaths(r, L, w); const bestRar = Math.min(...heroes.map(h => Math.max(h.eq.weapon.rar, h.eq.armour.rar)));
    const pref = p => p.kind === 'event' ? 1.5 : p.kind === 'mini' || p.kind === 'boss' ? 99 : p.kind === 'outer' ? (bestRar >= 5 ? 6 : -9) : p.kind === 'promised' ? (bestRar >= 5 ? 5 : bestRar >= 4 ? 2.6 : -5) : p.kind === 'god' ? (bestRar >= 3 ? 4 : 0) : 3 - Math.abs(p.stars - 3.5);
    const path = paths.slice().sort((a, b) => pref(b) - pref(a))[0];
    if (path.kind === 'event'){ for (const h of heroes) if (!h.down) heal(h, 0.6); log.push(`R${L} event`); continue; }
    if (path.kind === 'boss' && L === LEN) path.final = true;
    let g = C.makeGroup(w, L, path, r); g = C.scaleForParty(g, heroes.filter(h => !h.down).length, w, L, path, r);
    if (!heroes.some(h => !h.down)) for (const h of heroes){ h.down = false; h.hp = Math.round(maxHP(h) * 0.5); }
    const live = heroes.filter(h => !h.down);
    const B = C.newParty(live.map(h => ({hid:h.id, P:P(h), belt:h.belt, hp:h.hp})), g, {world:w});
    let t = 0; if (args.nofight){ B.over = 'win'; for (const e of B.es){ e.hp = 0; e.xpTo = B.heroes.map(h => h.hid); } }
    while (!B.over && t < 60){ const acts = {}; for (const bh of B.heroes) if (!bh.down) acts[bh.hid] = C.autoAct(B, bh, r); C.partyRound(B, acts, r); t++; }
    const fk = path.final ? 'final' : path.kind === 'normal' ? 'n' + path.stars : path.kind; FIGHTS[fk] = FIGHTS[fk] || [0, 0, 0]; FIGHTS[fk][0]++; FIGHTS[fk][2] += t; if (B.over === 'win') FIGHTS[fk][1]++;
    if (B.over !== 'win' && NODEATH){ if (VERBOSE) log.push(`R${L} LOST ${path.kind}★${path.stars} lv${heroes[0].lv} t${t} gear ${heroes[0].eq.weapon.rar}/${heroes[0].eq.armour.rar} st ${JSON.stringify(heroes[0].st)}`); for (const h of heroes){ h.down = false; h.hp = Math.round(maxHP(h) * 0.5); } continue; }
    if (B.over !== 'win'){ return {won:false, at:L, path:path.kind + path.stars, lv:heroes[0].lv, w, log, firstLeg:heroes[0].firstLeg, rounds:t}; }
    const xs = C.xpShares(B);
    for (const bh of B.heroes){ const h = heroes.find(x => x.id === bh.hid); h.hp = bh.hp; h.down = bh.down || bh.hp <= 0;
      gainXP(h, Math.round(C.killXP(path.stars, path.final ? 'final' : path.kind, h.lv - E) * (xs[h.id] || 0)));
      for (const it of C.rollChest(r, w, path.stars, path.final ? 'final' : path.kind, 0, false)){ if (it.kind === 'consumable'){ h.belt[it.key] = Math.min(5, (h.belt[it.key] || 0) + 1); } else if (it.kind !== 'tome'){ h.bag.push(it); if (it.rar >= 4 && !h.firstFind) h.firstFind = L; } } }
    if (args.dbg && L === +args.dbg){ const h = heroes[0]; console.log('R' + L, 'lv', h.lv, 'pts', h.pts, JSON.stringify(h.st), 'legs:', h.bag.filter(i => i.rar >= 4).map(i => `${i.name}(${i.kind}/${i.arch || i.role}) ${JSON.stringify(i.req)} ok=${C.canEquip(P(h), i)}`).join(' ; ')); }
    for (const h of heroes){ GEAR[L] = GEAR[L] || [0, 0, 0]; GEAR[L][0] += h.eq.weapon.rar; GEAR[L][1] += h.eq.armour.rar; GEAR[L][2]++; }
    if (L % 5 === 0 || path.kind === 'mini') for (const h of heroes) if (h.down){ h.down = false; h.hp = Math.round(maxHP(h) * 0.5); }
    if (VERBOSE) log.push(`R${L} ${path.kind}★${path.stars} lv${heroes[0].lv} t${t} hp${heroes.map(h => Math.round(100 * h.hp / maxHP(h))).join('/')} gear ${heroes[0].eq.weapon.rar}/${heroes[0].eq.armour.rar}`);
  }
  return {won:true, at:LEN, lv:heroes[0].lv, w, log, firstLeg:heroes[0].firstLeg, firstFind:heroes[0].firstFind};
}

const res = []; for (let i = 0; i < RUNS; i++) res.push(sim(1000 + i * 7919 + (+(args.seed || 0)) * 13));
const won = res.filter(x => x.won).length; const deaths = {};
for (const x of res) if (!x.won){ const k = x.path; deaths[k] = (deaths[k] || 0) + 1; }
const atR = {}; for (const x of res) if (!x.won){ const b = Math.ceil(x.at / 5) * 5; atR[b] = (atR[b] || 0) + 1; }
const leg = res.map(x => x.firstLeg).filter(Boolean); leg.sort((a, b) => a - b);
console.log(`len ${LEN} ${DIFF} party [${PARTY}] plan ${PLAN} quests ${QP}: won ${won}/${RUNS} = ${(100 * won / RUNS).toFixed(1)}%`);
console.log('  deaths by fight:', JSON.stringify(deaths));
console.log('  deaths by round bucket:', JSON.stringify(atR));
console.log(`  first Legendary equipped: median round ${leg.length ? leg[Math.floor(leg.length / 2)] : '-'} (${leg.length}/${RUNS} runs ever equip one)`);
const ff = res.map(x => x.firstFind).filter(Boolean).sort((a, b) => a - b); console.log(`  first Legendary found: median round ${ff.length ? ff[Math.floor(ff.length / 2)] : '-'}`);
console.log(`  hero level at end (avg): ${(res.reduce((a, x) => a + x.lv, 0) / RUNS).toFixed(1)}`);
console.log('  avg equipped rarity w/a by round:', Object.entries(GEAR).map(([L, [a, b, n]]) => `${L}:${(a / n).toFixed(1)}/${(b / n).toFixed(1)}`).join(' '));
console.log('  fight win rates:', Object.entries(FIGHTS).sort().map(([k, [n, w, t]]) => `${k} ${(100 * w / n).toFixed(0)}% (${n}, ${(t / n).toFixed(1)}t)`).join('  '));
if (VERBOSE) console.log(res[0].log.join('\n'));
