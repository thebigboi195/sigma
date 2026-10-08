#!/usr/bin/env node
/* Design catalogue: renders every armour design, monster and weapon to labelled sheets (PNG) for the review PDF.
   node tools/catalog.js outDir [armour|mobs|weapons|all] */
const path = require('path'), fs = require('fs');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const [,, OUT, WHAT = 'all'] = process.argv; fs.mkdirSync(OUT, {recursive: true});
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1600, height: 1000 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, '..', 'dist', 'index.html')); await p.waitForTimeout(1500);
  await p.addStyleTag({content: `#panel,#hud,#chat,#feed,#dockbtns,.cut{display:none!important} .lbl{position:absolute;transform:translate(-50%,2px);font:700 12px Nunito,sans-serif;color:#fff;text-align:center;
    text-shadow:0 1px 2px #000,0 0 6px #000;max-width:250px;line-height:1.15;pointer-events:none} .lbl small{display:block;font-weight:600;font-size:10px;color:var(--c,#ccc)} .sheetT{position:absolute;left:24px;top:14px;font:700 26px Fredoka,sans-serif;color:#ffcf3a;text-shadow:0 2px 0 #000}`});
  const sheet = async (name, title, kind, list, cols) => {
    await p.evaluate(({title, kind, list, cols}) => { const C = CORE, D = DATA, r = Math.random; document.querySelectorAll('.lbl,.sheetT').forEach(x => x.remove());
      const items = list.map(x => { if (kind === 'armour'){ const d = D.ARMOUR_BY[x.key]; const a = C.legendArmour(0, null, x.rar, r, x.key); const w = C.makeWeapon(0, 1, Math.min(3, x.rar), r); return {lv: 20, look: {skin: x.i % 6, hair: (x.i*3) % 10, hairStyle: ['short', 'spiky', 'long', 'ponytail', 'swept', 'bun'][x.i % 6]}, eq: {weapon: w, armour: a, trinkets: []}}; }
        if (kind === 'enemy'){ const e = C.makeEnemyPub(x.key, 100, 1); if (x.boss) e.boss = true; if (x.mini) e.mini = true; return e; }
        const it = x.legend ? C.legendWeapon(0, null, 4, r, x.legend) : C.makeWeapon(x.w, x.ti, x.rar, r); return Object.assign({}, it, {rar: D.OLDR[it.rar]}); });
      const pos = ART3D.gallery(kind, items, cols); const st = document.querySelector('.stage');
      const t = document.createElement('div'); t.className = 'sheetT'; t.textContent = title; st.appendChild(t);
      pos.forEach((q, i) => { const d = document.createElement('div'); d.className = 'lbl'; d.style.left = q.x + '%'; d.style.top = Math.min(97, q.y) + '%'; d.style.setProperty('--c', list[i].c || '#ccc'); d.innerHTML = `${list[i].n}<small>${list[i].s || ''}</small>`; st.appendChild(d); }); }, {title, kind, list, cols});
    await p.waitForTimeout(2200); await p.screenshot({path: path.join(OUT, name + '.png')}); console.log('sheet', name, list.length); };
  const D = await p.evaluate(() => ({RAR: DATA.RAR, ARM: DATA.ARMOURS.map(a => ({key: a.key, name: a.name, role: a.role, tier: a.tier, origin: a.origin || '', lands: a.lands})),
    W: DATA.WORLDS.map(w => ({name: w.name, country: w.country || '', enemies: w.enemies, mini: w.mini, boss: w.bossKeys || [w.bossKey], gods: w.gods || [], types: w.types})), E: DATA.ENEMIES,
    LEG: DATA.LEGENDS.filter(x => x[2] === 'weapon').map(x => [x[0], x[1], x[3], x[4], x[5]]), P7: (DATA.PROMISED_DUOS || []).flatMap(d => d.keys), P10: DATA.OUTER_BOSSES || [], NAMES: DATA.ARMOURS.map(a => a.name)}));
  const chunk = (a, n) => { const o = []; for (let i = 0; i < a.length; i += n) o.push(a.slice(i, i + n)); return o; };
  const land = l => l.length && l.length < 6 ? l.map(i => D.W[i].name).join(', ') : 'any land';
  if (WHAT === 'all' || WHAT === 'armour'){
    const base = D.ARM.filter(a => a.tier === 'base');
    for (const r of [0, 1, 2]) await sheet(`a-base-${r}`, `${D.RAR[r].n} armour · the 15 base designs`, 'armour', base.map((a, i) => ({key: a.key, rar: r, i, n: a.name, s: `${a.role} · ${land(a.lands)}`, c: D.RAR[r].c})), 5);
    for (const [tier, rar, ttl] of [['epic', 3, 'Epic armour · 15 designs'], ['legend', 4, 'Legendary armour · 13 myth designs'], ['myth', 5, 'Mythical armour · 12 myth designs'], ['outer', 6, 'Outerversal armour · 15 designs']]){
      const L = D.ARM.filter(a => a.tier === tier); await sheet(`a-${tier}`, ttl, 'armour', L.map((a, i) => ({key: a.key, rar, i, n: a.name, s: `${a.role}${a.origin ? ' · ' + a.origin : ''} · ${land(a.lands)}`, c: D.RAR[rar].c})), 5); } }
  if (WHAT === 'all' || WHAT === 'mobs'){
    for (const [wi, w] of D.W.entries()){ const L = w.enemies.map(k => ({key: k})).concat(w.mini.map(k => ({key: k, mini: 1})), w.boss.map(k => ({key: k, boss: 1})), w.gods.map(k => ({key: k, boss: 1})));
      chunk(L, 12).forEach((c, ci) => {}); let ci = 0; for (const c of chunk(L, 12)) await sheet(`m-${wi}-${ci++}`, `${w.name}${w.country ? ' (' + w.country + ')' : ''} · monsters${ci > 1 ? ' (cont.)' : ''}`, 'enemy', c.map(x => ({key: x.key, boss: x.boss, mini: x.mini, n: D.E[x.key][0], s: x.boss ? 'BOSS' : x.mini ? 'MINI-BOSS' : D.E[x.key][3], c: x.boss ? '#ff6a6a' : x.mini ? '#ffaa50' : '#ccc'})), 4); }
    const top = D.P7.map(k => ({key: k, s: '★7 Promised boss'})).concat(D.P10.map(k => ({key: k, s: '★10 Outerversal horror'})), [{key: 'giratina', s: 'Final boss (20 / 30 rounds)'}, {key: 'primalArceus', s: 'Final boss (50 rounds)'}]);
    let ci = 0; for (const c of chunk(top, 12)) await sheet(`m-top-${ci++}`, 'The great bosses: ★7, ★10 and the final pair', 'enemy', c.map(x => ({key: x.key, boss: 1, n: (D.E[x.key] || [x.key])[0], s: x.s, c: '#ff6a6a'})), 4); }
  if (WHAT === 'all' || WHAT === 'weapons'){
    const rn = ['Common', 'Uncommon', 'Rare', 'Epic']; for (const [wi, w] of D.W.entries()){ const L = []; w.types.forEach((t, ti) => [0, 1, 2, 3].forEach(r => L.push({w: wi, ti, rar: r, n: t[2][r], s: `${rn[r]} ${t[0]}`, c: D.RAR[r].c}))); await sheet(`w-land-${wi}`, `${w.name} · weapons, Common to Epic`, 'weapon', L, 5); }
    let ci = 0; for (const c of chunk(D.LEG, 20)) await sheet(`w-leg-${ci++}`, 'Legendary, Mythical and Outerversal weapons', 'weapon', c.map(x => ({legend: x[0], n: x[1], s: `${D.RAR[x[3]].n} ${x[2]} · ${x[4]}`, c: D.RAR[x[3]].c})), 5); }
  if (errs.length) console.log('errors', [...new Set(errs)].slice(0, 10));
  await b.close();
})();
