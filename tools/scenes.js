#!/usr/bin/env node
/* Renders a list of battle scenes to PNGs: node tools/scenes.js outDir '<JSON list of {name, world, theme, enemies:[keys], party:n, gear:rar}>' [w] [h] */
const path = require('path'), fs = require('fs');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const [,, out, json, w, h] = process.argv; const list = JSON.parse(json); fs.mkdirSync(out, {recursive: true});
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: +(w || 1600), height: +(h || 900) } }); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, '..', 'dist', 'index.html')); await p.waitForTimeout(1500);
  await p.addStyleTag({content: '#panel,#hud,#chat,#feed,#dockbtns,.cut{display:none!important}'});
  for (const s of list){
    await p.evaluate(s => { const C = CORE, D = DATA; const r = Math.random; const E = (s.enemies || []).map((k, i) => { const e = C.makeEnemyPub(k, 100, 1); e.lv = 20; if (s.boss && i === 0){ e.boss = true; } return e; });
      const heroes = []; for (let i = 0; i < (s.party || 1); i++){ const rar = s.gear != null ? s.gear : 4; const arm = s.armours ? C.legendArmour(0, null, rar, r, s.armours[i % s.armours.length]) : C.makeArmour(s.world || 0, rar, i % 3, r);
        const wp = s.weapons ? C.legendWeapon(0, null, rar, r, s.weapons[i % s.weapons.length]) : (rar >= 4 ? C.makeTop(rar, r, null, 'weapon', 0) : C.makeWeapon(s.world || 0, i, rar, r));
        heroes.push({id: i ? 'h' + i : 'p', P: {lv: 20, st: {}, boons: [], look: s.looks ? s.looks[i % s.looks.length] : {skin: i, hair: i + 1, hairStyle: ['short', 'spiky', 'long', 'ponytail'][i % 4]}, eq: {weapon: wp, armour: arm, trinkets: []}}}); }
      ART3D.setScene('battle', {world: s.world || 0, theme: s.theme || 0, enemies: E, heroes}); }, s);
    await p.waitForTimeout(s.wait || 2600); await p.screenshot({path: path.join(out, s.name + '.png')}); console.log('shot', s.name);
  }
  if (errs.length) console.log('errors', errs.slice(0, 10));
  await b.close();
})();
