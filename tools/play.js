#!/usr/bin/env node
/* Automated multiplayer test: N browser tabs play one web-edition run together over the same-device BroadcastChannel transport.
   node tools/play.js [--players 3] [--len 20] [--rounds 6] [--nq 1] [--video out.webm] [--shots dir] [--jump 10] [--gear 4] [--keep 0]
   --jump N    the host's admin console jumps the run to round N (e.g. a boss round) after the first map vote
   --gear R    every player gives themself a rarity-R weapon and armour from the admin console's catalogue (host only can; others use the bag)
   Every tab votes for the first path, readies up, picks a move bar each round and continues after chests. Page errors are printed. */
const path = require('path'), http = require('http'), fs = require('fs');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => (x.startsWith('--') ? a.concat([[x.slice(2), arr[i + 1]]]) : a), []));
const NP = +(args.players || 3), LEN = +(args.len || 20), ROUNDS = +(args.rounds || 6), SHOTS = args.shots || null;
const PORT = 8200 + Math.floor(Math.random()*700);
const DIST = path.resolve(__dirname, '..', 'dist');
const KEYHASH = require('crypto').createHash('sha256').update('test').digest('hex');
const ESSAY = 'Literature reveals truth through story. Writers shape how we see power. Readers learn to question what they are told.\n\nIn Nineteen Eighty-Four, Orwell shows control through language. The Party rewrites history every day. Winston resists by keeping a diary.';
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const srv = http.createServer((q, s) => { const f = path.join(DIST, (q.url.split('?')[0] === '/' ? '/index.html' : q.url.split('?')[0])); fs.readFile(f, (e, b) => { if (e){ s.writeHead(404); s.end(); return; } s.writeHead(200, {'Content-Type': f.endsWith('.html') ? 'text/html' : 'application/octet-stream'}); s.end(b); }); }).listen(PORT);
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required', '--no-proxy-server'] });
  const ctx = await browser.newContext({ viewport: { width: +(args.w || 1280), height: +(args.h || 720) }, recordVideo: args.video ? { dir: path.dirname(path.resolve(args.video)), size: { width: +(args.w || 1280), height: +(args.h || 720) } } : undefined });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());   // no font downloads in the sandbox
  await ctx.addInitScript(kh => { window.EQ_TESTNET = true; if (location.search.includes('slow')) window.EQ_SLOW = 1;   // other players' tabs barely render, so the recorded tab stays smooth
    Object.defineProperty(window, 'EQ_KEYHASH', {get: () => kh, set: () => {}, configurable: true}); }, KEYHASH);
  const pages = [], errs = [];
  for (let i = 0; i < NP; i++){ const p = await ctx.newPage(); p.on('pageerror', e => errs.push(`[p${i}] ${e.message} :: ${(e.stack || '').split('\n').slice(1, 3).join(' | ')}`)); p.on('console', m => { if (m.type() === 'error') errs.push(`[p${i}] console: ${m.text().slice(0, 300)}`); }); await p.goto('http://127.0.0.1:' + PORT + '/' + (i ? '?slow' : ''), {waitUntil: 'commit'}); await p.waitForSelector('#nick', {timeout: 180000}); pages.push(p); }
  await sleep(2500);
  const H = pages[0]; const names = ['Aria', 'Bram', 'Cleo', 'Dax', 'Eve', 'Finn'];
  const ui = async (tag) => { if (!args.ui) return; fs.mkdirSync(args.ui, {recursive: true}); await H.screenshot({path: path.join(args.ui, tag + '.png')}); };
  await ui('01-home'); if (args.ui){ await H.evaluate(() => document.querySelector('#cust').click()); await sleep(2500); await ui('02-customiser');
    await H.evaluate(() => { const b = [...document.querySelectorAll('.ch')].find(x => x.dataset.v === 'spiky'); if (b) b.click(); }); await sleep(1500); await H.evaluate(() => document.querySelector('#cdone').click()); await sleep(800); }
  await H.fill('#nick', names[0]); await H.fill('#mkey', 'test'); await H.evaluate(() => document.querySelector('#mk').click()); await sleep(2500);
  if (args.nq !== '0') await H.evaluate(() => { const b = document.querySelector('.hnq[data-q="1"]'); if (b) b.click(); }); await sleep(400);
  await H.evaluate(n => { const b = document.querySelector(`.hlen[data-l="${n}"]`); if (b) b.click(); }, LEN); await sleep(400);
  if (args.world) { await H.evaluate(w => document.querySelector(`.hw[data-w="${w}"]`).click(), +args.world); await sleep(300); }
  const code = await H.evaluate(() => (document.querySelector('.code b') || {}).textContent); console.log('room', code); await ui('03-lobby');
  for (let i = 1; i < NP; i++){ const p = pages[i]; await p.fill('#nick', names[i]); await p.fill('#wes', ESSAY); await p.fill('#jc', code); await p.evaluate(() => document.querySelector('#jn').click()); await sleep(2000); }
  await sleep(2500); await H.evaluate(() => document.querySelector('#start').click()); await sleep(2000);
  const state = p => p.evaluate(() => { const G = PARTY.G; return G ? {ph: G.ph, lvl: G.lvl} : null; });
  let shot = 0; const snap = async (tag) => { if (!SHOTS) return; fs.mkdirSync(SHOTS, {recursive: true}); await H.screenshot({path: path.join(SHOTS, `${String(shot++).padStart(3, '0')}-${tag}.png`)}); };
  let jumped = !args.jump, geared = !args.gear, lastKey = '', t0 = Date.now();
  while (Date.now() - t0 < (+(args.maxsec || 900))*1000){
    const st = await state(H); if (!st) { await sleep(500); continue; }
    const key = st.ph + ':' + st.lvl; if (key !== lastKey){ lastKey = key; console.log('phase', key, Math.round((Date.now() - t0)/1000) + 's'); if (['battle', 'chest', 'map', 'camp'].includes(st.ph)) setTimeout(() => snap(key.replace(':', '-')), st.ph === 'battle' ? 6000 : 1500); }
    if (st.ph === 'end' || st.lvl > ROUNDS + (+(args.jump) || 0)) break;
    if (!geared && st.ph === 'camp'){ geared = true;
      for (const p of pages) await p.evaluate(({r, lv}) => { try { const C = CORE, D = DATA; const w = C.makeTop(r, Math.random, null, 'weapon', 0); const a = C.makeArmour(0, r, 0, Math.random); for (const it of [w, a]){ S.bag.push(it); S.eq[it.kind] = it.uid; } if (lv) S.hlv = lv; S.hp = null; window.drawApp(); } catch(e){ console.error('gear', e.message); } }, {r: +args.gear, lv: +(args.lv || 0)}); }
    if (!jumped && st.ph === 'map'){ jumped = true; await H.evaluate(n => { const h = PARTY._H(); h.lvl = n; h.ph = 'map'; h.paths = CORE.rollPaths(Math.random, n, h.w); h.vk = 'm' + n + ':' + h.seq; h.deadline = Date.now() + 15000; }, +args.jump); await H.evaluate(() => PARTY._hostCheck()); }
    if (args.ui && st.ph === 'camp' && !ui.camp){ ui.camp = 1; await sleep(1500); for (const [t, n] of [['gear', '04-camp-gear'], ['stats', '05-camp-stats'], ['tavern', '06-camp-boons'], ['shop', '07-camp-shop']]){ await H.evaluate(t => { const b = document.querySelector(`.tab[data-t="${t}"]`); if (b) b.click(); }, t); await sleep(900); await ui(n); }
      await H.evaluate(() => { const s = document.querySelector('.statpill'); if (s) s.focus(); }); await sleep(500); await ui('08-hud-stats'); }
    if (args.ui && st.ph === 'map' && !ui.map){ ui.map = 1; await sleep(800); await ui('09-map-vote'); }
    if (args.ui && st.ph === 'chest' && !ui.chest){ ui.chest = 1; await sleep(2500); await ui('11-chest'); }
    if (args.seq && st.ph === 'battle'){ fs.mkdirSync(args.seq, {recursive: true}); ui.n = (ui.n || 0) + 1; await H.screenshot({path: path.join(args.seq, `f${String(ui.n).padStart(3, '0')}.png`)}); }
    for (const p of pages){
      await p.evaluate(() => { const c = s => document.querySelector(s); const ph = PARTY.G && PARTY.G.ph;
        if ((ph === 'map' || ph === 'event' || ph === 'terrain') && !document.querySelector('.path.voted')){ const b = c('.path'); if (b) b.click(); }
        if (ph === 'camp'){ const go = c('#go'); if (go && !go.disabled) go.click(); }
        if (ph === 'battle'){ const bars = [...document.querySelectorAll('.mvb.bar:not([disabled])')]; if (bars.length){ const pick = bars[bars.length > 1 && Math.random() < 0.6 ? bars.length - 1 - Math.floor(Math.random()*2) : 0]; pick.click(); } }
        if (ph === 'chest'){ const b = c('#cont'); if (b && !b.disabled) b.click(); } }).catch(e => errs.push('drive: ' + e.message));
    }
    await sleep(1200);
  }
  await snap('final');
  console.log('errors:', errs.length); for (const e of [...new Set(errs)].slice(0, 25)) console.log('  ' + e);
  const vids = []; if (args.video){ for (const p of pages) vids.push(p.video()); }
  if (args.keep) await sleep(+args.keep);
  await ctx.close(); await browser.close(); srv.close();
  if (args.video && vids[0]){ const v = await vids[0].path(); fs.renameSync(v, path.resolve(args.video)); console.log('video', args.video); }
})();
