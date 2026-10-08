/* ===== Essay Quest v2 core (pure logic) ===== */
const CORE = ((D) => {
const {RAR, WORLDS, LEG, MYTH, MYTH_DOWN, ARM_ROLE, LEG_ARM, MYTH_ARM, TRINKETS, CONSUMABLES, ENEMIES} = D;
function rng(seed){ return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const pick = (a, r) => a[Math.floor(r() * a.length)];
function wpick(ws, r){ const s = ws.reduce((a,b)=>a+b,0); let x = r()*s; for (let i=0;i<ws.length;i++){ x -= ws[i]; if (x <= 0) return i; } return ws.length-1; }
const clamp = (x,a,b) => Math.max(a, Math.min(b, x));
let UID = 1;
let WEB = false; const setWeb = v => { WEB = !!v; };
let NQ = false; const setNQ = v => { NQ = !!v; };   // battle-only mode: no study quests, XP only from fights, foes a little tougher   // web edition: one 50-level world, enemy level = stage
const DIFFS = {easy:{hp:0.5, atk:0.8, n:'Easy'}, normal:{hp:0.7, atk:0.9, n:'Normal'}, hard:{hp:0.9, atk:1.0, n:'Hard'}, brutal:{hp:1.3, atk:1.2, n:'Brutal'}, nightmare:{hp:1.9, atk:1.4, n:'Nightmare'}}; let DIFF = 'hard';
let LMAX = 30; let curW = 0; const miniLv = () => WEB ? [5,15,25,35,45].filter(x => x < LMAX) : [Math.round(LMAX/3), Math.round(2*LMAX/3)];
const isBossL = L => WEB ? (L % 10 === 0 || L === LMAX) : L === LMAX;
const K = {nqXP:3.5, nqHard:1.06, hpBase:120, hpPer:5, strPer:0.025, agiDodge:0.004, agiCrit:0.002, wpnSurplus:0.01, dodgeCap:0.45,
           ttk:3.2, ttd:7.2, bossTTK:1.6, bossTTD:0.62, miniTTK:1.45, miniTTD:0.85, lvAtk:0.02, lvDef:0.015, wm:[1.2,1.6,1.85,1.85], wlo:0.88, whi:1.2, webm:1.2, webLo:0.85, webHi:1.85, webPow:1, webFinal:{hp:1.4, atk:1.2}, webFinal30:{hp:1.8, atk:1.32}, p7:{hp:1.65, atk:1.15}, p10:{hp:7.0, atk:2.3}, finalX:{hp:3.2, atk:1.5}, hpAll:1.0, healerHp:0.06, godTTK:2.25, godTTD:1.3, pHp:0.12, pAtk:0.05, pHpM:0.07, pHpN:0.08, pAtkN:0.05};
const STAR = {hp:[0,0.7,0.95,1.15,1.4,1.85], atk:[0,0.7,0.95,1.05,1.15,1.35], count:[[0],[1],[1,1,2],[2,2,1,3],[2,3,3],[3]]};
const WBASE = [9, 22, 44, 78], AB = [24, 60, 120, 210], REQW = [0, 8, 18, 30], REQR = [0, 3, 6, 10, 14, 20, 28], SEC = [6, 14, 24, 36], SEC2 = [9, 18, 30, 44];
const ARCH = {fist:0.85, blade:1, pole:1, ranged:0.95, heavy:1.15, scythe:1, katana:1, staff:0.95, thrown:0.95, tome:0.7, grimoire:0.75, psalter:0.7, lyre:0.7};
const SECSTAT = {fist:'AGI', ranged:'AGI', blade:'STR', pole:'STR', heavy:'STR', scythe:'STR', katana:'AGI', staff:'FOR', thrown:'AGI', tome:'FOR', grimoire:'FOR', psalter:'FOR', lyre:'AGI'};

const TIERN = ['I','II','III','IV'];
/* ---------- item levels: gear scales with ITS level, which tracks the hero's level ---------- */
function pw(pts, x){ for (let i=1;i<pts.length;i++){ if (x <= pts[i][0] || i === pts.length-1){ const [x0,y0] = pts[i-1], [x1,y1] = pts[i]; return y0 + (y1-y0)*(x-x0)/(x1-x0); } } return pts[0][1]; }
const CURVE = {wb:[[1,50],[120,169]], ab:[[1,80],[120,378]], rw:[[1,0],[31,8],[61,18],[91,30],[120,42]], s1:[[1,6],[31,14],[61,24],[91,36],[120,48]], s2:[[1,9],[31,18],[61,30],[91,44],[120,58]]};
const WB = L => pw(CURVE.wb, L), ABf = L => pw(CURVE.ab, L), RW = L => Math.round(pw(CURVE.rw, L)), S1 = L => Math.round(pw(CURVE.s1, L)), S2 = L => Math.round(pw(CURVE.s2, L));
let PL = 1; const plOf = (w, L) => WEB ? Math.max(1, 2*L) : w*30 + Math.round((L-1)*29/(Math.max(2, LMAX)-1)) + 1;
function dropLevel(r, bonus=0){ r = r || Math.random; return Math.max(1, PL + Math.floor(r()*3) + bonus); }
const ROLEF = {plate:1.3, leather:0.9, robe:0.8, vestment:0.8};
/* v8: gear never levels and its requirements never change. Stats come from rarity, role/arch and the design; `L` is ignored. */
function statItem(it){ if (!it || it.kind === 'consumable' || it.kind === 'tome') return it; const rar = Math.max(0, Math.min(6, it.rar || 0)); delete it.lvl; delete it.grand;
  if (it.kind === 'weapon'){ const starterW = it.ti === -1; const cast = D.CASTER.includes(it.arch); const P0 = starterW ? 14 : D.WPN_POW[rar] * (D.ARCH_POW[it.arch] || 1) * (it.mod || 1) * (it.special ? 1.04 : 1);
    const v = it.vr || 1; const bs = {hp:0, atk:0, def:0, spa:0, spd:0, spe:0};
    if (cast) bs.spa = P0*v; else bs.atk = P0*v;
    if (!cast && (it.myth || it.special) && rar >= 4){ const t = D.itemTypes(it)[0]; if (t && !['normal','fighting','steel','rock','ground','bug'].includes(t)) bs.spa = P0*0.45*v; }   // elemental relics carry some Sp. Atk too
    if (it.support){ bs.spd = P0*0.25; bs.hp = P0*0.6; }
    bs.spe = P0*(D.ARCH_SPE[it.arch] || 0);
    if (it.bsFix) Object.assign(bs, it.bsFix); if (it.myth && D.LEGEND_BS && D.LEGEND_BS[it.myth]) Object.assign(bs, D.LEGEND_BS[it.myth]);
    for (const k in bs) bs[k] = Math.round(bs[k]); it.bs = bs; it.dmg = Math.max(bs.atk, bs.spa); it.cat = bs.spa > bs.atk ? 'spec' : 'phys';
    it.req = D.reqFor(it); }
  else if (it.kind === 'armour'){ const st = it.starter; const base = D.ARM_BS[rar], rf = D.ROLE_BS[it.role] || D.ROLE_BS.robe; const v = it.vr || 1; const bs = {hp:0, atk:0, def:0, spa:0, spd:0, spe:0};
    for (const k of ['hp','def','spd','spe']) bs[k] = Math.round(base[k]*rf[k]*v*(st ? 0.85 : 1));
    const dz = it.design && D.ARMOUR_BY[it.design]; if (dz && dz.bs) Object.assign(bs, dz.bs);
    it.bs = bs; it.hp = bs.hp; it.req = D.reqFor(it); }
  else if (it.kind === 'trinket' && it.tix != null && ['STR','AGI','WPN','INT','FOR'].includes(it.eff)){ it.v = Math.min(TCAP[it.eff] || 99, Math.round(TRINKETS[it.tix][2][Math.min(4, Math.max(0, rar-1))] * (rar > 5 ? 1.2 : 1))); }
  return it; }
function applyLevel(it){ return statItem(it); }
const vary = r => 0.92 + (r || Math.random)()*0.16;   // every drop rolls its stats within ±8%
const lv = (it, L) => { if (it && it.vr == null && it.ti !== -1 && !it.starter) it.vr = Math.round(vary()*100)/100; return statItem(it); };
/* ---------- v8 item makers ---------- */
const WNAME = [0, 1, 2, 3];   // Common, Uncommon, Rare, Epic use a land's weapon names 0-3; Legendary and up are named relics
const originsOf = w => (WORLDS[w] && WORLDS[w].origins) || [];
function pickLegend(kind, cls, rar, r, w){ r = r || Math.random; const any = r() < 0.45; let L = D.LEGENDS.filter(x => x[2]===kind && x[4]===rar && (any || x[3]===cls));
  const og = originsOf(w); if (rar <= 5 && og.length){ const local = L.filter(x => og.includes(x[5])); if (local.length && r() < 0.8) L = local; }   // a land's relics come from its own myths
  if (!L.length) L = D.LEGENDS.filter(x => x[2]===kind && x[4]===rar); return L[Math.floor(r()*L.length)]; }
function legendWeapon(w, arch, rar, r, key){ const x = key ? D.LEGENDS.find(l => l[0]===key) : pickLegend('weapon', arch, rar, r, w); if (!x) return null; const [k, n, , a2, rr, origin, lore, abil, down, fx, spec] = x;
  return lv({uid:UID++, kind:'weapon', world:w, ti:-3, type:n, arch:a2, name:n, rar:rr, myth:k, origin, fx, mod:(spec && spec.mod) || 1, abil:abil.map(a=>a.slice()), down: down ? down.slice() : null, lore, support: D.SUPPORT_ARCHS && D.SUPPORT_ARCHS.includes(a2) || undefined}); }
function armourAbil(d, rar){ const role = d.role;
  if (d.tier === 'base') return role === 'leather' ? [['evasion', [3,4,5][rar]]] : role === 'robe' ? [['regen', [1,1.5,2][rar]]] : rar >= 2 ? [['ward', 4]] : [];
  if (d.tier === 'epic') return role === 'plate' ? [['thorns', 15], ['ward', 6]] : role === 'leather' ? [['evasion', 7], ['counter', 15]] : [['regen', 2.5], ['mend', 1]];
  return (d.abil || []).map(a => a.slice()); }
function armourFrom(d, rar, w){ if (!d) return null; return lv({uid:UID++, kind:'armour', world:w, role:d.role, design:d.key, name:D.armourName(d, rar), rar, myth: d.tier !== 'base' && d.tier !== 'epic' ? d.key : undefined, origin:d.origin, lore:d.lore,
  abil: armourAbil(d, rar), down: d.down ? d.down.slice() : null}); }
function makeArmour(w, rar, i, r){ r = r || Math.random; rar = Math.max(0, Math.min(6, rar)); const role = i != null ? ARM_ROLE[i] : null; let pool = D.armourPool(w, rar);
  const pr = role ? pool.filter(d => d.role === role) : []; if (pr.length && r() < 0.7) pool = pr; if (!pool.length) pool = D.armourPool(0, rar);
  return armourFrom(pool[Math.floor(r()*pool.length)], rar, w); }
function legendArmour(w, role, rar, r, key){ if (key && D.ARMOUR_BY[key]){ const d = D.ARMOUR_BY[key]; return armourFrom(d, {legend:4, myth:5, outer:6, epic:3}[d.tier] != null ? {legend:4, myth:5, outer:6, epic:3}[d.tier] : rar, w); } return makeArmour(w, rar, ARM_ROLE.indexOf(role) >= 0 ? ARM_ROLE.indexOf(role) : null, r); }
function makeWeapon(w, ti, rar, r){ r = r || Math.random; rar = Math.max(0, Math.min(6, rar)); const T = WORLDS[w].types[ti] || WORLDS[w].types[0]; if (rar >= 4){ const it = legendWeapon(w, T[1], rar, r); if (it) return it; rar = 3; }
  const [type, arch, names] = T; let abil = [];
  if (rar === 3) abil = [LEG[arch] || ['crit', 20]].map(a => [a[0], Math.round(a[1]*0.7)]);
  return lv({uid:UID++, kind:'weapon', world:w, ti, type, arch, name:names[WNAME[rar]] || names[0], rar, abil, down:null}); }
function makeTrinket(w, ti, rar){
  const [name, eff, vals] = TRINKETS[ti]; const flat = ['STR','AGI','WPN','INT','FOR'].includes(eff); const oi = Math.min(4, Math.max(0, rar-1));
  const base = vals[oi] * (rar > 5 ? 1.2 : 1); return lv({uid:UID++, kind:'trinket', world:w, name, eff, tix:ti, v: Math.min(TCAP[eff] || 99, flat ? Math.round(base*1.4) : Math.round(base)), rar}); }
function makeSpecial(key, w){ return lv(makeSpecial0(key, w)); }
function makeSpecial0(key, w){ const sp = D.SPECIAL[key];
  if (sp.kind==='weapon') return {uid:UID++, kind:'weapon', world:w, ti:-2, type:sp.type, arch:sp.arch, name:sp.name, rar:5, special:key, abil:sp.abil.map(x=>x.slice()), down:sp.down.slice(), lore:sp.text};
  return {uid:UID++, kind:'armour', world:w, role:sp.role, design:'nightstalker', name:sp.name, rar:5, special:key, abil:sp.abil.map(x=>x.slice()), down:sp.down.slice(), lore:sp.text}; }
function starter(){ return {weapon:statItem({uid:UID++, kind:'weapon', world:0, ti:-1, type:'Stick', arch:'blade', name:'Wooden Stick', rar:0, abil:[], down:null}),
  armour:statItem({uid:UID++, kind:'armour', world:0, role:'leather', design:'ranger', name:'Traveller’s Rags', rar:0, abil:[], down:null, starter:true, types:['normal']})}; }
function essayRelic(w, score){
  const t = score>=0.95 ? [5,20] : score>=0.85 ? [4,12.5] : score>=0.70 ? [3,8] : score>=0.5 ? [2,5] : null; if (!t) return null;
  return {uid:UID++, kind:'trinket', world:w, name:(['Orwell’s Pen','Ariel’s Charm','The Unfinished Prayer','The Name Sign','The Poet’s Brush','Homer’s Stylus'][w] || 'Scholar’s Quill')+' (essay relic)', eff:'BOSSBANE', v:t[1], rar:t[0]};
}

// ---------- stats
function eff(P){
  const s = Object.assign({STR:0, AGI:0, INT:0, FOR:0, WPN:0}, P.st); if ((P.boons||[]).includes('trained')) for (const k of D.REQ_STATS) s[k] += 3;
  for (const k of D.REQ_STATS) s[k] += trink(P, k);
  return s;
}
function abilOf(it, id){ if (!it) return 0; let v = 0; for (const [a,x] of (it.abil||[])) if (a===id) v += x; if (it.down && it.down[0]===id) v += it.down[1]; return v; }
const TCAP = {STR:20, AGI:20, WPN:20, INT:20, FOR:20, HPPCT:30, BURN:40, LIFESTEAL:12, THORNS:30, POTION:60, QUILL:2, GUARD:30, BOSSBANE:5};   // per-trinket caps
const TTOT = {STR:30, AGI:30, WPN:30, INT:30, FOR:30, HPPCT:40, BURN:50, LIFESTEAL:15, THORNS:40, POTION:80, QUILL:2, GUARD:40, BOSSBANE:6};   // totals across both trinket slots
function trink(P, e){ const v = (P.eq.trinkets||[]).filter(Boolean).reduce((a,t)=> a + (t.eff===e && isFinite(t.v) ? t.v : 0), 0); return Math.min(v, TTOT[e] || 99); }
/* gear battle stats: the weapon and armour (and only them) add flat stats on top of the hero's level stats */
function gearBS(P){ const g = {hp:0, atk:0, def:0, spa:0, spd:0, spe:0}; for (const it of [P.eq.weapon, P.eq.armour]){ if (!it) continue; if (!it.bs) statItem(it); for (const k in g) g[k] += (it.bs && it.bs[k]) || 0; } return g; }
function heroBase(L){ const B = D.HERO_BASE; return {hp:D.pkStat(B.hp, L, true), atk:D.pkStat(B.atk, L), def:D.pkStat(B.def, L), spa:D.pkStat(B.spa, L), spd:D.pkStat(B.spd, L), spe:D.pkStat(B.spe, L)}; }
function derive(P){
  const s = eff(P), w = P.eq.weapon, a = P.eq.armour, bo = P.boons || [], has = id => bo.includes(id); const L = Math.max(1, P.lv || 1);
  const b = heroBase(L), g = gearBS(P); const st = {}; for (const k in b) st[k] = b[k] + g[k];
  const pct = {atk: (has('mighty')?0.1:0) + (has('glasscannon')?0.2:0), spa: (has('arcane')?0.1:0) + (has('glasscannon')?0.2:0), def: (has('stoneskin')?0.1:0) - (has('glasscannon')?0.15:0),
    spd: (has('spiritward')?0.1:0) - (has('glasscannon')?0.15:0), spe: has('swiftfoot')?0.1:0};
  for (const k in pct) st[k] = Math.max(1, Math.round(st[k]*(1 + pct[k])));
  const max = st.hp * (1 + trink(P,'HPPCT')/100 + (has('bulk')?0.1:0) + (has('titanblood')?0.18:0) - (has('berserk')?0.1:0)) * Math.max(0.3, 1 - (abilOf(w,'maxhp') + abilOf(a,'maxhp'))/100);
  const dodge = D.DODGE_PER_SPE*Math.max(0, g.spe) + (abilOf(a,'evasion') + abilOf(w,'evasion'))/100 + (has('dance')?0.08:0) + (has('evasive')?0.04:0) - (abilOf(w,'clumsy') + abilOf(a,'clumsy'))/100;
  return {s, max: Math.round(max), atk:st.atk, def:st.def, spa:st.spa, spd:st.spd, spe:st.spe, base:b, gear:g, dodge: clamp(dodge, 0, D.DODGE_CAP), mult:1,
          crit: 0.05 + abilOf(w,'crit')/100 + (has('keen')?0.06:0), speed: st.spe}; }
function canEquip(P, it){ if (!it.req) return true; const s = eff(P); return Object.entries(it.req).every(([k,v]) => (s[k]||0) >= v); }
function missing(P, it){ const s = eff(P); return Object.entries(it.req||{}).filter(([k,v]) => (s[k]||0) < v).map(([k,v]) => `${k} ${v}`); }
function power(it){ if (!it) return 0; const b = it.bs || {};
  if (it.kind==='weapon') return (Math.max(b.atk||0, b.spa||0) + 0.4*Math.min(b.atk||0, b.spa||0) + (b.spe||0)*0.5) * (1 + 0.1*(it.abil||[]).length) * (it.down?0.93:1);
  if (it.kind==='armour') return ((b.hp||0)*0.35 + (b.def||0) + (b.spd||0) + (b.spe||0)*0.8) * (1 + 0.1*(it.abil||[]).length);
  return 50 + it.rar*20; }

// ---------- loot (v8)
/* Normal dungeons (★1-★5) drop Common to Epic only. Legendary: ★6 (40%), ★7 (70%), mini-bosses (25%), main bosses (50%).
   Mythical: ★7 (25%) and main bosses (12%) only. Outerversal: ★10 only (50%). Lucky Find doubles every high-tier chance; Double Loot doubles the item count. */
const RARW = [[55,33,10,2],[55,33,10,2],[40,38,18,4],[28,38,26,8],[18,34,34,14],[10,28,38,24],[6,22,40,32],[3,17,40,40]];
const HIGH = {god:{L:0.40}, promised:{L:0.70, M:0.25}, mini:{L:0.30}, boss:{L:0.55, M:0.12}, outer:{O:0.50, M:1.0, L:0.5}, final:{O:0.5, M:1.0, L:1.0}};
function makeTop(rar, r, L, kind, w=0){ r = r || Math.random; if (!kind) kind = r() < 0.5 ? 'weapon' : 'armour';
  if (kind === 'armour') return makeArmour(w, rar, null, r); const it = legendWeapon(w, null, rar, r); return it || makeArmour(w, rar, null, r); }
/* support gear: Mana Tomes, Frost Grimoires, Warding Psalters, War Lyres and healer vestments */
function makeSupport(kind, w, rar, r){ r = r || Math.random; const oi = Math.min(4, Math.max(0, rar-1));
  if (rar >= 4){ const list = D.LEGENDS.filter(x => x[4] === rar && x[2] === 'weapon' && D.SUPPORT_ARCHS.includes(x[3])); if (kind === 'weapon' && list.length){ const x = list[Math.floor(r()*list.length)]; return legendWeapon(w, x[3], rar, r, x[0]); } }
  if (kind === 'weapon'){ const arch = D.SUPPORT_ARCHS[Math.floor(r()*4)];
    return lv({uid:UID++, kind:'weapon', world:w, ti:-4, type:D.SUPPORT_NAMES[arch], arch, name:D.supportName(arch, oi, Math.min(3, w)), rar, abil:D.supportAbil(arch, oi), down:null, support:true}); }
  const robes = D.armourPool(w, rar).filter(d => d.role === 'robe'); const d = robes.length ? robes[Math.floor(r()*robes.length)] : D.ARMOUR_BY.acolyte;
  return lv({uid:UID++, kind:'armour', world:w, role:'vestment', design:d.key, name: rar >= 4 ? d.name : D.VESTMENT_NAMES[oi], rar, abil:[['regen',[1,1.5,2,2.5,3][oi]]].concat(D.vestmentAbil(oi)), down:null, support:true, myth: rar >= 4 ? d.key : undefined, lore:d.lore}); }
/* a Common-Epic piece for an ordinary chest (stars 0-7 pick the weights) */
function rollItem(r, w, stars, lucky){
  const ws = RARW[Math.max(0, Math.min(7, stars|0))].slice(); if (lucky){ ws[2] *= 1.5; ws[3] *= 2; }
  const rar = wpick(ws, r); const c = wpick([18,18,12], r);
  if ((c===0 || c===1) && r() < 0.22) return makeSupport(c === 0 ? 'weapon' : 'armour', w, rar, r);
  if (c===0) return makeWeapon(w, Math.floor(r()*WORLDS[w].types.length), rar, r);
  if (c===1) return makeArmour(w, rar, Math.floor(r()*3), r);
  return makeTrinket(w, Math.floor(r()*TRINKETS.length), rar);
}
function rollConsumable(r){ const keys = Object.keys(CONSUMABLES); return keys[wpick(keys.map(k=>CONSUMABLES[k].w), r)]; }
const tome = n => ({uid:UID++, kind:'tome', name:'Tome of Wisdom', wis:n});
function rollChest(r, w, stars, kind, extra=0, lucky=false, dbl=false){
  const si = Math.min(7, stars >= 10 ? 7 : stars|0);
  const nW = [[60,30,10],[60,30,10],[50,35,15],[40,40,20],[25,45,30],[10,40,35,15],[0,30,45,25],[0,20,45,35]][si];
  let n = wpick(nW, r) + 1 + extra; if (kind==='mini') n = Math.max(n, 3); if (kind==='boss') n = Math.max(n, 4); if (kind==='god' || kind==='promised' || kind==='outer') n = Math.max(n, 3); if (kind==='final') n = 4;
  const out = [];
  for (let i=0;i<n;i++){
    const gearChance = 0.5 + 0.04*Math.min(stars, 7) + (stars >= 4 ? 0.1 : 0) + (kind!=='normal'?0.15:0);
    if (r() < gearChance) out.push(rollItem(r, w, kind==='normal' ? stars : Math.max(5, si), lucky));
    else out.push({uid:UID++, kind:'consumable', key: rollConsumable(r)});
  }
  const piece = rar => { const t = r(); return t < 0.45 ? makeWeapon(w, Math.floor(r()*WORLDS[w].types.length), rar, r) : t < 0.92 ? makeArmour(w, rar, Math.floor(r()*3), r) : makeTrinket(w, Math.floor(r()*TRINKETS.length), rar); };
  const top = rar => r() < 0.5 ? makeTop(rar, r, null, 'weapon', w) : makeArmour(w, rar, null, r);
  const H = HIGH[kind] || {}; const x2 = p => Math.min(0.95, lucky ? p*2 : p);
  if (kind === 'mini' || kind === 'god' || kind === 'boss' || kind === 'promised') out.push(piece(3));   // every boss-type fight guarantees an Epic
  if (H.O && r() < x2(H.O)) out.push(top(6));
  if (H.M && r() < x2(H.M)) out.push(top(5));
  if (H.L && r() < x2(H.L)) out.push(top(4));
  if (kind === 'final') out.push(top(4));
  if (kind==='boss' && r() < (WEB ? 0.27 : 0.54)){ const SIG = [['Glass Paperweight','HPPCT',35],['Prospero’s Book','LIFESTEAL',18],['The Silver Coffee Spoon','THORNS',40],['The Barn Owl Feather','BURN',45],['Orochi’s Eighth Fang','LIFESTEAL',18],['Typhon’s Storm-Heart','BURN',45]][w] || ['Glass Paperweight','HPPCT',35]; out.push({uid:UID++, kind:'trinket', world:w, name:SIG[0]+' (boss relic)', eff:SIG[1], v:SIG[2], rar:5}); }
  if (stars === 5 && r() < 0.02) out.push(makeSpecial(r() < 0.5 ? 'atomic' : 'shadow', w));
  if (kind==='promised') out.push(tome(40)); if (kind==='outer') out.push(tome(120)); if (kind==='final'){ out.push(tome(300)); out.push(tome(300)); }
  const res = out.filter(Boolean); if (dbl){ const more = rollChest(r, w, stars, kind, extra, lucky, false); res.push(...more); }
  return res;
}

// ---------- paths
// chance per level that the map offers a ★5 / ★6 path, rising with depth (level 5: ~6% / ~1%, level 40: ~25% / ~7%)
function starOdds(L){ const x = Math.min(1, Math.max(0, (L-1)/(Math.max(2, LMAX)-1))); const lv = WEB ? 1 + 49*x : 1 + 49*(L-1)/(Math.max(2, LMAX)-1);
  // v8: ★6 and ★7 are the main Legendary sources, so they turn up from early on; ★10 waits until halfway
  return {lv, p5: Math.min(0.32, 0.05 + 0.25*x), p6: L < 3 ? 0 : Math.min(0.40, 0.2 + 0.2*x), p7: x < 0.25 ? 0 : Math.min(0.3, 0.12 + 0.16*x), p10: x < 0.5 ? 0 : Math.min(0.10, 0.03 + 0.08*x), w:[0, 7 - 4*x, 40 - 18*x, 38 - 6*x, 12 + 10*x]}; }
function rollPaths(r, L, w){ if (w != null) curW = w;
  const ml = miniLv(); const W = WORLDS[curW] || WORLDS[0]; if (ml.includes(L)) return [{stars:5, kind:'mini', theme:L===ml[0]?2:3, idx:L===ml[0]?0:1, key: pick(W.mini, r)}];
  if (isBossL(L)) return [{stars: L === LMAX ? 10 : 4, kind:'boss', theme: L === LMAX ? 6 : 4, key: pick(W.bossKeys || [W.bossKey], r), final: L === LMAX}];
  const out = []; const n = 3; const od = starOdds(L);
  for (let i=0;i<n;i++){
    if (i===n-1 && r() < 0.3){ out.push({stars:1, kind:'event', ev: pick(['river','campsite','altar','aura','shrine','merchant'], r), theme: Math.floor(r()*4)}); continue; }
    const st = wpick(od.w, r); out.push({stars:st, kind:'normal', theme: Math.floor(r()*4)}); }
  // rarer, harder dungeons turn up more often the deeper you go (but never impossible early)
  const slots = () => out.map((p, i) => p.kind === 'normal' ? i : -1).filter(i => i >= 0);
  if (r() < od.p5){ const sl = slots(); if (sl.length) out[pick(sl, r)] = {stars:5, kind:'normal', theme:4}; }
  if (r() < od.p6 && W.gods){ const sl = slots().filter(i => out[i].stars < 5); if (sl.length) out[pick(sl, r)] = {stars:6, kind:'god', theme:4, key: pick(W.gods, r)}; }
  if (r() < od.p7){ const sl = slots(); if (sl.length){ const di = Math.floor(r()*D.PROMISED_DUOS.length); out[pick(sl, r)] = {stars:7, kind:'promised', theme:5, key:di}; } }
  if (r() < od.p10){ const sl = slots(); if (sl.length) out[pick(sl, r)] = {stars:10, kind:'outer', theme:6, key: pick(D.OUTER_BOSSES, r)}; }
  return out.sort((a,b)=>(a.kind==='event')-(b.kind==='event') || a.stars-b.stars);
}

// ---------- enemies
let EXP = null; // filled by calibration table below
/* ---------- levels: the hero levels from study XP; enemies have a level from where they stand (world + round) ---------- */
const XPK = {perLevel:100, perQuest:25, kill:[0,8,15,22,32,44,60], mini:45, boss:60, god:85, promised:140, outer:260, final:320, gapPen:0.12, catchUp:0.3, get sp(){ return D.SP_BY_LEN[LMAX] || 3; }, spStart: D.SP_START};
// v8: two hero levels a round in the web edition (round 25 ≈ level 50), and quests pay twice the XP they used to
const lvPerStage = () => WEB ? 2 : 29/(Math.max(2, LMAX)-1);
const enemyLv = (w, L) => plOf(w, L);
function avgPts(L){ const ws = tierWeights(L); let a = 0, b = 0; for (let t=1;t<ws.length;t++){ a += ws[t]*TIERS[t].pts; b += ws[t]; } return b ? a/b : 2; }
function gapMod(gap){ return gap > 0 ? Math.max(0.15, 1 - XPK.gapPen*gap) : 1 + XPK.catchUp*(-gap); }
function questXP(pts, L, gap){ return XPK.perQuest * pts / avgPts(L) * lvPerStage() * gapMod(gap); }
// XP for winning a fight: harder dungeons (more stars), mini-bosses and bosses pay more
function killXP(stars, kind, gap){ const base = kind === 'final' ? XPK.final : kind === 'outer' ? XPK.outer : kind === 'promised' ? XPK.promised : kind === 'god' ? XPK.god : kind === 'boss' ? XPK.boss : kind === 'mini' ? XPK.mini : XPK.kill[Math.max(0, Math.min(6, stars||0))]; return base * lvPerStage() * gapMod(gap) * (NQ ? K.nqXP : 1); }
/* ---------- v8 monster stats: every foe is a Pokémon with base stats from its body type, levelled to where it stands ----------
   Health = its Pokémon HP × an HP multiplier for the kind of fight, so fights last a few rounds rather than one hit. */
const FK = {nHp:1, eliteHp:1.5, eliteAtk:1.05, miniHp:2.7, miniAtk:1.0, bossHp:3, bossAtk:0.9, godHp:3.6, godAtk:0.7, p7Hp:2.2, p7Atk:0.4, p10Hp:4, p10Atk:0.5, finalHp:4.5, finalAtk:0.6,
  addHp:0.35, addAtk:0.8, pH:1.0, pA:0.75, pAb:0.3, foeDmg:1.0, heroDmg:1.0, modeHp:{20:0.85, 30:1, 50:1.1}, ramp0:0.8, hitsN:1.1, hitsD:17, stab:1.25};   // tuned with tools/sim.js: hard 30 rounds ≈ 25% solo, ≈ 50% with a support friend
/* ---------- v8 normalisation: the "reference hero" for a round ----------
   Gear stats are flat per rarity while the Pokémon formula grows with level, so on its own the early game would be lethal and the
   late game trivial. Monster HP and damage are therefore pegged to a reference hero: the base stats of the level they stand at, plus
   the gear rarity a planning player usually wears by that round (Legendary by round 11 / 14 / 20 in the 20 / 30 / 50 games).
   Everything relative — Attack vs Defense, special vs physical, types, STAB, crits — is still the Pokémon formula. */
const LEG_ROUND = {20:11, 30:14, 50:20};
// measured with tools/sim.js: the rarity a planning player is wearing, on average, at each point of the run (0 Common … 4 Legendary)
function expRar(L){ const x = (L-1)/(Math.max(2, LMAX)-1); return 0.95*pw([[0,0],[0.1,0.3],[0.2,1.0],[0.33,2.0],[0.5,2.8],[0.67,3.4],[0.83,3.85],[1,4.2]], x); }
const lerpT = (T, x) => { const i = Math.max(0, Math.min(T.length-2, Math.floor(x))), f = Math.max(0, Math.min(1, x - i)); return T[i] + (T[i+1] - T[i])*f; };
const REFC = {};
function refAt(E){ const key = E + ':' + LMAX; if (REFC[key]) return REFC[key]; const L = WEB ? E/2 : E; const rr = expRar(Math.max(1, L)); const b = heroBase(E);
  const arm = k => lerpT(D.ARM_BS.map(x => x[k]), rr); const hp = b.hp + arm('hp'), def = b.def + arm('def'), atk = b.atk + lerpT(D.WPN_POW, rr);
  const fAtk = D.pkStat(75, E), fDef = D.pkStat(75, E), fHp = D.pkStat(75, E, true);
  const hit = pkDamage(E, D.BASEPOW, atk, fDef)*0.925*FK.stab, fhit = pkDamage(E, D.BASEPOW, fAtk, def)*0.925*1.5;
  return (REFC[key] = {hp, atk, def, fHp, hit, fhit, foeHp: hit*FK.hitsN, dmgN: hp/(FK.hitsD*fhit), rr}); }
const ramp = E => E >= 12 ? 1 : FK.ramp0 + (1-FK.ramp0)*(E-1)/11;   // the first few levels ease in while the hero finds real gear
function foeHP(key, E){ const e = {art:ENEMIES[key][1], trait:ENEMIES[key][3]}; const R = refAt(E); return R.foeHp * D.pkStat(D.foeBase(e)[0], E, true)/R.fHp; }   // a reference foe takes hitsN hits; bulkier bodies take more
function foeSt(e){ const L = Math.max(1, e.lv || 1); if (e._stL === L && e.st) return e.st; const b = D.foeBase(e); const m = e.statMul || 1;
  e.st = {atk:Math.round(D.pkStat(b[1], L)*m), def:Math.round(D.pkStat(b[2], L)*m), spa:Math.round(D.pkStat(b[3], L)*m), spd:Math.round(D.pkStat(b[4], L)*m), spe:D.pkStat(b[5], L)}; e._stL = L; return e.st; }
function refP(E){ return refAt(Math.max(1, Math.round(E))); }
function budget(w, L){ const E = enemyLv(w, L); return {E, hp:1, dps:1}; }
function makeEnemy(key, hp, atk, opts={}){
  const [name, art, color, trait] = ENEMIES[key];
  return {id:UID++, key, name: (opts.elite?'Elite ':'') + name, art, color, trait, boss:trait==='boss', elite:!!opts.elite, hp:Math.round(hp), max:Math.round(hp), atk:Math.max(0.05, atk),
          status:{burn:0, burnDmg:0, stun:0}, charging:false, guard:false, enraged:false, types:D.enemyTypes(key, name, art)};
}
function makeGroup(w, L, path, r){ const E = enemyLv(w, L); const g = makeGroup0(w, L, path, r, E); const dm = DIFFS[DIFF] || DIFFS.hard; g.forEach(e => { e.lv = E; const hm = K.hpAll*dm.hp; e.max = e.hp = Math.max(1, Math.round(e.max*hm)); e.atk = e.atk*dm.atk; if (e.boss && !e.minion) e.statMul = path.kind === 'outer' || path.final ? 1.12 : 1.05; });
  if (WEB && path.kind === 'boss' && L === LMAX){ const b = g.find(e => e.boss && !e.minion); if (b) b.final = true; }   // the final boss is built at ★10 strength in makeGroup0
  if (!WEB && path.kind === 'boss' && L === LMAX && w === 3){ const b = g.find(e => e.boss && !e.minion); if (b) b.final = true; }
  return g; }
const kitMoves = key => D.BOSSKIT && D.BOSSKIT[key] ? D.BOSSKIT[key].moves.map(m => Object.assign({}, m)) : null;
function makeBoss(key, hp, atk, o){ const e = makeEnemy(key, hp, atk, o); const k = D.BOSSKIT && D.BOSSKIT[key]; if (k){ e.moves = kitMoves(key); e.kit = key; if (k.rot) e.rot = true; } return e; }
function makeHealer(key, boss){ const e = makeEnemy(key, boss.max*K.healerHp, boss.atk*0.25); e.minion = true; e.healer = true; e.moves = D.HEALERKIT.moves.map(m => Object.assign({}, m)); e.name = D.HEALER_NAMES[key] || e.name; return e; }
const FINAL_HEALER = ['healVoid','healDeep','healEmber','healStar'];
function makeGroup0(w, L, path, r, E){
  E = E || enemyLv(w, L); const W = WORLDS[w], rp = ramp(E) * (NQ ? K.nqHard : 1), H = (k, m) => foeHP(k, E) * m * rp * (path.kind !== 'normal' ? (FK.modeHp[LMAX] || 1) : 1);
  if (path.kind==='promised'){ const duo = D.PROMISED_DUOS[path.key] || D.PROMISED_DUOS[0];
    const out = duo.keys.map(k => { const kit = D.BOSSKIT[k] || {}; const e = makeBoss(k, H(k, FK.p7Hp*(kit.hp||1)), FK.p7Atk*(kit.atk||1)*rp); e.promised = true; return e; }); out.forEach((e, i) => { e.duo = i; }); return out; }
  if (path.kind==='outer'){ const k = path.key || pick(D.OUTER_BOSSES, r); const kit = D.BOSSKIT[k] || {}; const e = makeBoss(k, H(k, FK.p10Hp*(kit.hp||1)), FK.p10Atk*(kit.atk||1)*rp); e.outer = true; e.healerKey = kit.healers || 'healVoid';
    return [e, makeHealer(e.healerKey, e), makeHealer(e.healerKey, e)]; }
  if (path.kind==='boss' && path.final && WEB){ const k = LMAX >= 50 ? 'primalArceus' : 'giratina'; const kit = D.BOSSKIT[k] || {};   // 20/30-round game: Giratina; 50-round game: Primal Arceus
    const e = makeBoss(k, H(k, FK.finalHp*(kit.hp||1)), FK.finalAtk*(kit.atk||1)*rp); e.outer = true; e.final = true; e.noP2 = true; if (e.rot) e.types = [D.TYPES[0]]; return [e]; }
  if (path.kind==='boss'){
    const bk = path.key || W.bossKey; const out = [makeEnemy(bk, H(bk, FK.bossHp), FK.bossAtk*rp)]; if (['colossus','kraken','apophis','ymir','hydra','orochi','typhon'].includes(bk)) out[0].summoner = true;
    if (w >= 2){ const k = pick(W.enemies, r); out.push(makeEnemy(k, H(k, FK.nHp*FK.addHp*3), FK.addAtk*0.6*rp)); }
    return out; }
  if (path.kind==='god'){ const gk = path.key || pick(W.gods || W.bossKeys, r); const g = makeEnemy(gk, H(gk, FK.godHp), FK.godAtk*rp); g.god = true; g.boss = true; return [g]; }
  if (path.kind==='mini'){
    const mk = path.key || (Array.isArray(W.mini) ? W.mini[path.idx||0] : W.mini); const out = [makeEnemy(mk, H(mk, FK.miniHp), FK.miniAtk*rp)]; out[0].mini = true; if (path.idx === 1) out[0].summoner = true;
    if (w >= 1){ const k = pick(W.enemies, r); out.push(makeEnemy(k, H(k, FK.nHp*FK.addHp*2.5), FK.addAtk*0.5*rp)); }
    return out; }
  const n = pick(STAR.count[path.stars], r); const out = []; const eliteN = path.stars >= 4 ? 1 : 0;
  const hpEach = FK.nHp*STAR.hp[path.stars]*(1 + 0.3*(n-1))/n, atkEach = STAR.atk[path.stars]*(1 + 0.4*(n-1))/n;
  for (let i=0;i<n;i++){ const k = pick(W.enemies, r), el = i < eliteN; out.push(makeEnemy(k, H(k, hpEach*(el ? FK.eliteHp : 1)), atkEach*(el ? FK.eliteAtk : 1)*rp, {elite: el})); }
  return out;
}

// ---------- battle (v6: Pokémon-style moves, accuracy and status effects)
/* Heroes have four moves from their weapon:
     1 Basic  (no energy, +15 energy, 100% accurate)          — Mythical weapons have a unique one with a small rider
     2 Multi/Area (20 energy; 90% per hit for multi-hits, 85% per target for area)
     3 Heavy  (40–60 energy, 90–95% accurate, one big hit)
     4 Special (50 energy, every 3 rounds) — Legendary/Mythical: the weapon's own myth move; Mythical ones carry a downside
   Status effects: burn, poison, freeze, blind, slow, weak, vuln (bad) · empower, swift, enlight, god (good). */
const SKILLCOST = {fist:20, blade:20, pole:20, ranged:20, heavy:20, scythe:20, katana:20, staff:20, thrown:20};
const SPEED = {swift:16, brute:7, boss:13};
const T4COST = 50, T4CD = 3;
const BAD = ['burn','poison','freeze','blind','slow','weak','vuln','recharge'], GOOD = ['empower','swift','enlight','god'];
function heroOf(P, belt, opts={}){ const d = derive(P); const boons = P.boons || [];
  return {lv: P.lv || 1, hid: opts.hid || 'p', hp: Math.min(d.max, opts.hp != null ? Math.max(1, Math.round(opts.hp)) : d.max), max:d.max, speed:d.speed, atk:d.atk, def:d.def, spa:d.spa, spd:d.spd, spe:d.spe, spe0:d.spe, acts:0, energy: 40 + (boons.includes('quick')?30:0), first: boons.includes('first'), will:boons.includes('will'), dodge:d.dodge, mult:d.mult, crit:d.crit, w:P.eq.weapon, a:P.eq.armour, tr:(P.eq.trinkets||[]).filter(Boolean), cool:0,
    buff:{str:0, iron:0, smoke:0}, st:{}, guard:false, revived:false, at: D.itemTypes(P.eq.weapon)[0], dt: D.itemTypes(P.eq.armour), stand: abilOf(P.eq.armour,'lastStand') > 0 || abilOf(P.eq.weapon,'lastStand') > 0, combo:0, boons, focus:0, frozen:false, down:false, mcd:{}, belt: belt || {}}; }
function newBattle(P, enemies, belt, opts={}){ const p = heroOf(P, belt, opts); return {boons:p.boons, focus:0, frozen:false, p, es: enemies, turn:1, over:null, world: opts.world||0}; }
/* scale an encounter for n heroes: one extra enemy per extra hero, totals grow about n-fold */
/* scale an encounter for n heroes (v8): each extra hero adds FK.pH of the HP and FK.pA of the damage (an extra foe joins ordinary fights);
   the lone ★7/★10/final bosses gain HP the same way but only FK.pAb of their damage, since they still strike one hero at a time */
function scaleForParty(g, n, w, L, path, r){ if (n <= 1) return g;
  if (path && (path.kind === 'promised' || path.kind === 'outer' || path.final)){ const kh = 1 + FK.pH*(n-1), ka = 1 + FK.pAb*(n-1); for (const e of g){ e.max = e.hp = Math.max(1, Math.round(e.max*kh)); e.atk = e.atk*ka; e.extraActs = e.boss && !e.minion ? (n >= 5 ? 1 : 0) : 0; } return g; }
  const H0 = g.reduce((a,e)=>a+e.max,0), A0 = g.reduce((a,e)=>a+e.atk,0); const W = WORLDS[w]; const big = g.find(e => (e.boss || e.mini) && !e.minion);
  for (let i=1;i<n;i++){ const e = big ? makeEnemy(pick(W.enemies, r), big.max*0.25, big.atk*0.3) : makeEnemy(pick(W.enemies, r), H0/g.length, A0/g.length); e.partyAdd = true; e.lv = g[0].lv; g.push(e); }
  const H1 = g.reduce((a,e)=>a+e.max,0), A1 = g.reduce((a,e)=>a+e.atk,0);
  const kh = H0*(1 + FK.pH*(n-1))/H1, ka = A0*(1 + FK.pA*(n-1))/A1;
  for (const e of g){ e.max = e.hp = Math.max(1, Math.round(e.max*kh)); e.atk = Math.max(0.05, e.atk*ka); } return g; }
function newParty(list, enemies, opts={}){ // list: [{hid, P, belt, hp, insp}]
  const heroes = list.map(x => { const h = heroOf(x.P, x.belt, {hid:x.hid, hp:x.hp}); if (x.insp) h.mult *= 1 + 0.1*x.insp; return h; });
  return {party:true, heroes, p:heroes[0], boons:heroes[0].boons, focus:0, frozen:false, es:enemies, turn:1, over:null, world: opts.world||0}; }
function use(B, h){ B.p = h; B.boons = h.boons; B.focus = h.focus; B.frozen = h.frozen; }
function keep(B){ B.p.focus = B.focus; B.p.frozen = B.frozen; }
const alive = B => B.es.filter(e => e.hp > 0);
/* group XP: when a foe falls, every hero still standing at that moment earns its share (who landed the blow doesn't matter) */
function noteDeaths(B){ for (const e of B.es) if (e.hp <= 0 && !e.xpTo){ e.xpTo = (B.party ? B.heroes.filter(h => !h.down && h.hp > 0) : (B.p.hp > 0 ? [B.p] : [])).map(h => h.hid); } }
function xpShares(B){ noteDeaths(B); const tot = B.es.reduce((a, e) => a + (e.max||1), 0) || 1; const out = {};
  for (const e of B.es){ if (!e.xpTo) continue; for (const id of e.xpTo) out[id] = (out[id] || 0) + (e.max||1)/tot; } return out; }
const up = B => B.party ? B.heroes.filter(h => !h.down && h.hp > 0) : (B.p.hp > 0 ? [B.p] : []);
function heroTargets(B){ return up(B); }
function opening(B, r){ return []; /* no free strikes before anyone has chosen a move */
  if (B.party){ const fastest = Math.max(...B.heroes.map(h => h.speed)); if (B.heroes.some(h => h.first)) return [];
    const fast = alive(B).filter(e => (SPEED[e.trait] || 10) > fastest); if (!fast.length) return []; const ev = [{t:'msg', v:`${fast.map(e=>e.name).join(', ')} strike${fast.length>1?'':'s'} first!`}];
    for (const e of fast){ const tg = up(B); if (!tg.length) break; use(B, pick(tg, r)); enemyAct(B, e, r, ev); keep(B); } for (const h of B.heroes) if (h.hp <= 0 && !h.down){ h.down = true; ev.push({t:'down', h:h.hid}); } return ev; }
  if (B.p.first) return []; const fast = alive(B).filter(e => (SPEED[e.trait] || 10) > B.p.speed); if (!fast.length) return [];
  const keepEs = B.es; B.es = fast; const ev = [{t:'msg', v:`${fast.map(e=>e.name).join(', ')} ${fast.length>1?'are':'is'} faster than you and strike${fast.length>1?'':'s'} first!`}].concat(enemiesAct(B, r, B.p.belt)); B.es = keepEs; if (B.over==='win') B.over = null; return ev; }
const TRK = (B, e) => Math.min(B.p.tr.reduce((a,t)=>a+(t.eff===e && isFinite(t.v) ? t.v : 0),0), TTOT[e] || 99);
const ab = (p, id) => abilOf(p.w, id) + abilOf(p.a, id);   // an ability summed over a hero's weapon and armour
const standing = B => B.party ? B.heroes.filter(h => !h.down && h.hp > 0) : (B.p.hp > 0 ? [B.p] : []);
const warcryOf = B => Math.min(0.35, standing(B).reduce((a, h) => a + ab(h, 'warcry') + (h.boons.includes('inspireb') ? 8 : 0), 0)/100);
const bulwarkOf = B => Math.min(0.4, standing(B).reduce((a, h) => a + ab(h, 'bulwark') + (h.boons.includes('bulwarkb') ? 8 : 0), 0)/100);
const gapOf = (B, e) => ((B.p.lv || 0) && (e.lv || 0)) ? B.p.lv - e.lv : 0;
const lvAtkMod = g => 1, lvDefMod = g => 1;   // v8: the damage formula already uses both levels
/* ---------- v8 damage: the Pokémon formula ----------
   damage = ((2×Level/5 + 2) × Power × A/D) / 50 + 2, then × random 0.85-1 × STAB 1.5 × type × crit 1.5 × the rest.
   Physical moves use Attack against Defense; special moves use Sp. Atk against Sp. Def, and nothing else. */
function pkDamage(L, pow, A, Dv, r){ return ((2*Math.max(1, L)/5 + 2) * pow * Math.max(1, A)/Math.max(1, Dv))/50 + 2; }
const heroCat = (p, o) => (o && o.cat) || p.mcat || (p.w && p.w.cat) || 'phys';

/* ---------- status effects ---------- */
const IMMUNE = {purity:['poison'], fireproof:['burn'], clearsight:['blind'], unshaken:['slow','freeze']};
function heroStatus(B, x, name, turns, ev){ if (!x || x.down || x.hp <= 0) return false; if (BAD.includes(name) && x.st.god) return false;
  for (const bn of (x.boons || [])) if (IMMUNE[bn] && IMMUNE[bn].includes(name)){ ev.push({t:'msg', v:`Immune to ${name}!`, h:x.hid}); return false; }
  if (name === 'freeze'){ x.frozen = true; if (x === B.p) B.frozen = true; }
  x.st[name] = Math.max(x.st[name] || 0, turns); ev.push({t:'hstatus', h:x.hid, s:name}); return true; }
function foeStatus(e, name, turns, ev, r){ if (!e || e.hp <= 0) return false; const big = e.boss || e.mini;
  if (name === 'freeze' || name === 'stun'){ if (big && r && r() < 0.5) { ev.push({t:'msg', v:`${e.name} shrugs it off.`}); return false; } e.status.stun = 1; e.charging = false; ev.push({t:'status', id:e.id, s:'frozen'}); return true; }
  e.status[name] = Math.max(e.status[name] || 0, turns); if (name === 'burn') e.status.burnDmg = Math.max(1, Math.round(e.max*0.03));
  ev.push({t:'status', id:e.id, s:{burn:'burning', poison:'poisoned', blind:'blinded', slow:'slowed', weak:'weakened', vuln:'exposed', empower:'empowered'}[name] || name}); return true; }
/* accuracy: blind −20, the target being slowed +15, swift +10, godhood never misses; only (mini-)bosses can dodge, via their own move */
function heroHitChance(p, e, acc){ if (p.st.god) return 1; return Math.max(0.05, Math.min(1, acc/100 - (p.st.blind ? 0.2 : 0) + (e.status.slow ? 0.15 : 0) + (p.st.swift ? 0.1 : 0) - (e.status.dodge || 0) - ab(p, 'shortsight')/100 + (p.boons.includes('steady') ? 0.1 : 0))); }
function foeHitChance(e, p, acc){ return Math.max(0.05, Math.min(1, acc/100 - (e.status.blind ? 0.2 : 0) + (p.st.slow ? 0.15 : 0) - (p.st.swift ? 0.1 : 0) - p.dodge)); }

function dealTo(B, e, raw, r, ev, opts={}){
  const p = B.p, w = p.w; if (e.hp <= 0) return 0;
  const pierce = abilOf(w,'pierce') > 0 || opts.pierce;
  if (opts.acc != null && r() > heroHitChance(p, e, opts.acc)){ ev.push({t:'miss', id:e.id, h:p.hid}); return 0; }
  const cat = heroCat(p, opts), fs = foeSt(e); let dmg = pkDamage(p.lv, raw, cat === 'spec' ? p.spa : p.atk, cat === 'spec' ? fs.spd : fs.def) * (0.85 + r()*0.15) * FK.heroDmg * (e.status.vuln > 0 ? 1 + (e.status.vulnAmt || 0.3) : 1);
  if (B.boons.includes('opener') && p.acts === 1) dmg *= 1.3; if (B.boons.includes('finisher') && (e.boss || e.mini)) dmg *= 1.2;
  if (e.hp < e.max*0.3) dmg *= 1 + abilOf(w,'execute')/100 + (B.boons.includes('exec') ? 0.35 : 0);
  if (opts.exec && e.hp < e.max*0.35) dmg *= 1 + opts.exec;
  const crit = r() < Math.min(0.6, p.crit + (opts.critBonus || 0) + (p.st.enlight ? 0.15 : 0)) || opts.crit; if (crit) dmg *= Math.min(3, (B.boons.includes('critmaster') ? 2 : 1.5) + ab(p, 'critdmg')/200);   // crits: ×1.5 (Brutal Critic ×2), gear can lift it to at most ×3
  if (e.guard && !pierce) dmg *= 0.5;
  if (e.key==='watcher' && B.es.some(x => x.minion && !x.healer && x.hp > 0)) dmg *= 0.3;
  if (e.exposed) dmg *= 1.6;
  if (e.key==='troll') dmg *= 0.7;
  const at = opts.atype || p.mty || p.at, tm = D.typeMul(at, e.types); dmg *= tm * (p.dt.includes(at) ? (B.boons.includes('stab') ? 1.7 : 1.5) : 1) * (tm > 1.5 && B.boons.includes('supereff') ? 1.25 : 1);   // type matchup, and STAB when the move's type is one of your armour's types
  const bb = TRK(B,'BOSSBANE'); if (bb && e.boss) dmg = Math.max(dmg, e.max*bb/100);
  dmg = Math.max(1, Math.round(dmg)); let absorbed = 0; if (e.barrier > 0){ absorbed = Math.min(e.barrier, dmg); e.barrier -= absorbed; dmg -= absorbed; }
  e.hp = Math.max(0, e.hp - dmg); if (e.hp <= 0) noteDeaths(B); ev.push({t:'edmg', id:e.id, v:dmg, crit, h:p.hid, abs:absorbed || undefined, x:tm >= 1.9 ? 2 : tm <= 0.6 ? 0.5 : undefined});
  if (e.status.reflect > 0 && dmg > 0 && p.hp > 1){ const back = Math.max(1, Math.round(dmg*(e.status.reflectAmt || 0.25))); p.hp = Math.max(1, p.hp - back); ev.push({t:'pdot', v:back, h:p.hid, s:'reflect'}); }
  const ls = ab(p,'lifesteal') + TRK(B,'LIFESTEAL') + (opts.reap ? 30 : 0) + (opts.steal ? opts.steal*100 : 0) + (B.boons.includes('vamp') ? 5 : 0);
  if (ls){ const h = Math.round(dmg*ls/100); if (h){ p.hp = Math.min(p.max, p.hp + h); ev.push({t:'fx', k:'lifesteal', a:e.id, h:p.hid}); ev.push({t:'pheal', v:h, h:p.hid}); } }
  if (e.hp > 0){ const exC = ab(p,'expose'); if (exC && r() < exC/100){ e.status.vuln = Math.max(e.status.vuln||0, 2); e.status.vulnAmt = Math.max(e.status.vulnAmt||0, 0.3); ev.push({t:'status', id:e.id, s:'exposed'}); }
    const poC = ab(p,'poison'); if (poC && r() < poC/100) foeStatus(e, 'poison', 3, ev, r); const weC = ab(p,'weaken'); if (weC && r() < weC/100) foeStatus(e, 'weak', 2, ev, r);
    const burnC = abilOf(w,'burn') + TRK(B,'BURN') + (opts.burn || 0); if (burnC && r() < burnC/100) foeStatus(e, 'burn', 3, ev);
    if (opts.poison && r() < opts.poison/100) foeStatus(e, 'poison', 3, ev); if (opts.blind && r() < opts.blind/100) foeStatus(e, 'blind', 1, ev); if (opts.slow) foeStatus(e, 'slow', opts.slow, ev);
    const stn = abilOf(w,'stun') + (opts.stun||0); if (stn && r() < stn/100*(e.boss||e.mini ? 0.5 : 1)){ e.status.stun = 1; e.charging = false; ev.push({t:'status', id:e.id, s:'stunned'}); } }
  if (!opts.noChain){
    const others = alive(B).filter(x => x !== e);
    const ch = ab(p,'chain') + (opts.chain || 0); if (ch && others.length){ const o = pick(others, r); ev.push({t:'fx', k:'chain', a:e.id, b:o.id}); dealTo(B, o, dmg*ch/100, r, ev, {noChain:true}); }
    const qk = abilOf(w,'quake'); if (qk && others.length){ ev.push({t:'fx', k:'quake', a:others.map(o => o.id)}); for (const o of others) dealTo(B, o, dmg*qk/100, r, ev, {noChain:true}); }
  }
  return dmg;
}
function baseHit(B, r){ const p = B.p; let m = (B.boons.includes('berserk') ? 1.2 : 1) * (p.buff.str ? 1.4 : 1) * (B.focus ? 1.25 : 1) * (B.boons.includes('adrenaline') && p.hp < p.max*0.35 ? 1.25 : 1) * (p.st.empower ? 1.25 : 1) * (p.st.god ? 1.5 : 1);
  const amp = ab(p, 'amp'); if (amp) m *= 1 + amp/100; const ven = ab(p, 'vengeance'); if (ven) m *= 1 + ven/100*Math.floor((1 - p.hp/p.max)*10); m *= 1 + warcryOf(B);
  if (B.boons.includes('combo') && p.combo) m *= 1 + Math.min(0.4, 0.08*p.combo); if (B.boons.includes('bloodlust')) m *= 1 + Math.min(0.2, 0.04*B.es.filter(x => x.hp <= 0).length);
  return D.BASEPOW * (p.mult || 1) * m * (B.rally > 0 ? 1 + (B.rallyAmt||0.2) : 1); }   // v8: a move's power; the randomness lives in the damage formula
function selfBurn(B, r, ev){ const p = B.p, sb = ab(p,'selfburn'); if (sb && r() < sb/100) heroStatus(B, p, 'burn', 2, ev); }

/* ---------- the four hero moves ---------- */
const MOVES = Object.fromEntries(Object.entries(D.SIGS || {}).map(([k, v]) => [k, {n:v[0], d:v[1]}]));
const MOVECOST = T4COST, MOVECD = T4CD;
function sigKey(w){ const k = w && (w.myth || w.special); return k && D.SIGS && D.SIGS[k] ? k : null; }
function movesOf(w){ const k = sigKey(w); return k && (w.rar||0) >= 4 ? [k] : []; }
function optText(o){ o = o || {}; const t = []; if (o.stun) t.push(`${o.stun}% chance to stun`); if (o.burn) t.push(`${o.burn}% chance to burn`); if (o.slow) t.push('slows the target'); if (o.pierce) t.push('ignores shields'); if (o.critBonus) t.push(`+${Math.round(o.critBonus*100)}% crit chance`); if (o.exec) t.push(`+${Math.round(o.exec*100)}% damage to foes under 35% HP`); if (o.steal) t.push(`heals you ${Math.round(o.steal*100)}% of the damage`); return t.length ? '. ' + t.join(', ').replace(/^./, c => c.toUpperCase()) : ''; }
function hashOf(s){ let h = 7; for (const ch of String(s)) h = (h*31 + ch.charCodeAt(0)) >>> 0; return h; }
const RIDER = {burn:'25% chance to burn', stun:'15% chance to stun', poison:'25% chance to poison', blind:'20% chance to blind', slow:'slows the target', steal:'heals 15% of the damage', crit:'+20% crit chance', pierce:'ignores shields', energy:'+10 extra energy', chain:'arcs to a second foe for 40%'};
function heroMoves(w, a){ if (!w) return []; const arch = w.arch || 'blade'; const A = D.ARCHMOVES[arch] || D.ARCHMOVES.blade; const k = sigKey(w); const myth = (w.rar||0) >= 5 && k && D.MYTHT1[k];
  const t1 = myth ? {slot:0, type:1, n:D.MYTHT1[k][0], cost:0, gain:15, acc:100, mult:1.05, rider:D.MYTHT1[k][1], d:`Free Mythical strike: ${RIDER[D.MYTHT1[k][1]]}. Builds +15 energy${D.MYTHT1[k][1]==='energy' ? ' (+10 more)' : ''}.`, fx:'myth1'}
                  : {slot:0, type:1, n:D.BASICMOVE[arch] || 'Strike', cost:0, gain:15, acc:100, mult:1.0, d:'Free, reliable strike. Builds +15 energy for your bigger moves.', fx:'basic'};
  const [n2, kind2, hits2, m2, acc2, o2] = A.t2;
  const t2 = {slot:1, type:2, n:n2, cost:20, acc:acc2, kind:kind2, hits:hits2, mult:m2, opts:o2 || {}, d: (kind2 === 'area' ? 'Sweeps across every enemy; each hit rolls its own accuracy' : `${hits2} quick hits${(o2||{}).spread ? ' spread across the enemies' : ' on your target'}; each rolls its own accuracy`) + optText(o2), fx:'skill'};
  let [n3, c3, acc3, m3, o3] = A.t3; if ((w.rar||0) >= 4 && k){ const h = hashOf(k); c3 = Math.max(40, Math.min(60, c3 + (h % 3 - 1)*5)); m3 = Math.round((m3 + ((h >> 3) % 3 - 1)*0.1)*100)/100; acc3 = Math.max(90, Math.min(95, acc3 + ((h >> 5) % 3 - 1)*2)); }
  const t3 = {slot:2, type:3, n:n3, cost:c3, acc:acc3, mult:m3, opts:o3 || {}, d:'One crushing blow on your target' + optText(o3), fx:'heavy'};
  let t4; if (k && (w.rar||0) >= 4){ const sx = (w.rar >= 5 && D.SIGX[k]) || {}; const acc = sx.acc || 100;
    t4 = {slot:3, type:4, n:D.SIGS[k][0], cost:T4COST, cd:T4CD, acc, sig:k, down: sx.down || [], d:D.SIGS[k][1] + (sx.note ? `. DOWNSIDE: ${sx.note}` : ''), fx:'special'}; }
  else { const [n4, d4, ops4, acc4] = A.t4; t4 = {slot:3, type:4, n:n4, cost:T4COST, cd:T4CD, acc:acc4, ops:ops4, down:[], d:d4, fx:'special'}; }
  const slow = abilOf(w, 'slowskill') + (a ? abilOf(a, 'slowskill') : 0); if (slow){ t2.cost += 10*slow; t3.cost += 10*slow; }
  const pc = x => Math.round(x*100) + '%';
  t1.dmg = pc(t1.mult) + ' to one foe'; t2.dmg = kind2 === 'area' ? pc(m2) + ' to every foe' : hits2 + ' hits × ' + pc(m2); t3.dmg = pc(m3) + ' to one foe';
  const ops4 = t4.sig ? D.SIGS[t4.sig][2] : t4.ops; const dOp = ops4.find(o => ['hit','all','multi','judge','gentle'].includes(o[0]));
  const cr = dOp && ((dOp[0]==='multi' ? dOp[3] : dOp[2]) || {}).crit; t4.dmg = !dOp ? 'No damage (support)' : dOp[0] === 'hit' ? pc(dOp[1]*(cr?2:1)) + ' to one foe' + (cr ? ' (sure crit)' : '') : dOp[0] === 'all' ? pc(dOp[1]) + ' to every foe' : dOp[0] === 'multi' ? dOp[1] + ' hits × ' + pc(dOp[2]) : dOp[0] === 'judge' ? pc(dOp[1]) + ' of its current HP' : 'Kills a weakened foe outright';
  const pw = x => Math.round(D.BASEPOW*x); t4.powTxt = !dOp ? 'support' : dOp[0] === 'hit' ? pw(dOp[1]) + ' power' + (cr ? ' · sure crit' : '') : dOp[0] === 'all' ? pw(dOp[1]) + ' power to all' : dOp[0] === 'multi' ? dOp[1] + '×' + pw(dOp[2]) + ' power' : dOp[0] === 'judge' ? pc(dOp[1]) + ' of its HP' : 'finisher';
  const out4 = [t1, t2, t3, t4]; const wc = w.cat || (D.CASTER.includes(arch) ? 'spec' : 'phys'), b = w.bs || {}; const hyb = wc === 'phys' && (b.spa || 0) >= 0.4*(b.atk || 1);
  for (const m of out4){ m.ty = D.moveTypeOf(m, w); m.cat = wc; if (hyb && m.slot === 3) m.cat = 'spec'; if (hyb && m.slot === 1 && m.kind === 'area' && m.ty !== 'normal') m.cat = 'spec';
    m.pow = Math.round(D.BASEPOW * (m.mult || (m.slot === 3 ? 0 : 1))); } return out4; }
/* a move's effect list (shared by T4 specials) */
function runOps(B, name, ops, tgt, r, ev, acc){ const p = B.p, h = p.hid; const allies = () => B.party ? B.heroes.filter(x => !x.down && x.hp > 0) : [p];
  let dealt = 0, last = null;
  const hitOne = (e, m, o={}) => { if (!e || e.hp <= 0) return 0; let mult = m; if (o.boss && e.boss) mult *= o.boss; if (o.low && p.hp < p.max*0.4) mult *= o.low;
    const d = dealTo(B, e, baseHit(B, r)*mult, r, ev, Object.assign({acc}, o)); dealt += d || 0; return d; };
  const scopeOf = sc => sc === 'all' ? alive(B) : [tgt].filter(e => e && e.hp > 0);
  for (const op of ops){ const [k, a, b, c, d] = op;
    if (k === 'hit'){ if (!tgt || tgt.hp <= 0) tgt = alive(B)[0]; ev.push({t:'act', h, a:'special', tg:tgt ? [tgt.id] : []}); last = () => hitOne(tgt && tgt.hp > 0 ? tgt : alive(B)[0], a, b || {}); last(); }
    if (k === 'all'){ const all = alive(B); ev.push({t:'act', h, a:'special', tg:all.map(e => e.id), area:true}); for (const e of all) hitOne(e, a, Object.assign({noChain:true}, b || {})); }
    if (k === 'others'){ for (const e of alive(B).filter(e => e !== tgt)) hitOne(e, a, {noChain:true}); }
    if (k === 'multi'){ ev.push({t:'act', h, a:'special', tg:alive(B).map(e => e.id)}); for (let i=0;i<a;i++){ const al = alive(B); if (!al.length) break; const e = (c && c.spread) ? al[i % al.length] : (tgt && tgt.hp > 0 && r() < 0.5 ? tgt : pick(al, r)); hitOne(e, b, Object.assign({noChain:true}, c || {})); } }
    if (k === 'double' && last && r() < a/100){ ev.push({t:'msg', v:'It swings again!', h}); last(); }
    if (k === 'judge'){ const e = tgt && tgt.hp > 0 ? tgt : alive(B)[0]; if (e){ ev.push({t:'act', h, a:'special', tg:[e.id]}); if (r() > heroHitChance(p, e, acc)){ ev.push({t:'miss', id:e.id, h}); } else { const raw = Math.max(1, Math.min(e.hp*a, e.boss || e.mini ? e.max*0.04 : 1e9)); const dd = Math.max(1, Math.round(raw)); e.hp = Math.max(0, e.hp - dd); dealt += dd; ev.push({t:'edmg', id:e.id, v:dd, crit:false, h}); if (e.hp <= 0) noteDeaths(B); } } }
    if (k === 'gentle'){ const e = tgt && tgt.hp > 0 ? tgt : alive(B)[0]; if (e){ ev.push({t:'act', h, a:'special', tg:[e.id]}); if (e.hp < e.max*0.35 && !e.boss && !e.mini && r() <= heroHitChance(p, e, acc)){ const dd = e.hp; e.hp = 0; dealt += dd; ev.push({t:'edmg', id:e.id, v:dd, crit:true, h}); ev.push({t:'msg', v:'Death comes gently.', h}); noteDeaths(B); } else hitOne(e, e.hp < e.max*0.35 ? 3.0 : 1.0, {}); } }
    if (k === 'heal'){ ev.push({t:'act', h, a:'focus'}); for (const x of (a === 'self' ? [p] : allies())){ const hh = Math.round(x.max*b); x.hp = Math.min(x.max, x.hp + hh); ev.push({t:'pheal', v:hh, h:x.hid}); } }
    if (k === 'steal' && dealt > 0){ const hh = Math.round(dealt*a); p.hp = Math.min(p.max, p.hp + hh); ev.push({t:'fx', k:'lifesteal', a:(tgt||{}).id, h}); ev.push({t:'pheal', v:hh, h}); }
    if (k === 'judgeall'){ const all = alive(B); ev.push({t:'act', h, a:'special', tg:all.map(e => e.id), area:true}); for (const e of all){ if (r() > heroHitChance(p, e, acc)){ ev.push({t:'miss', id:e.id, h}); continue; } const raw = Math.max(1, Math.min(e.hp*a, e.boss || e.mini ? e.max*b : 1e9)); const dd = Math.max(1, Math.round(raw)); e.hp = Math.max(0, e.hp - dd); dealt += dd; ev.push({t:'edmg', id:e.id, v:dd, crit:true, h}); if (e.hp <= 0) noteDeaths(B); } }
    if (k === 'revive'){ const fallen = B.party ? B.heroes.filter(x => x.down || x.hp <= 0) : []; if (fallen.length){ for (const x of (b === 'all' ? fallen : fallen.slice(0, 1))){ x.down = false; x.hp = Math.round(x.max*a); x.st = {}; ev.push({t:'revive', h:x.hid}); ev.push({t:'pheal', v:x.hp, h:x.hid}); ev.push({t:'msg', v:'A fallen hero rises!', h:x.hid}); } }
      else for (const x of allies()){ const hh = Math.round(x.max*0.15); x.hp = Math.min(x.max, x.hp + hh); ev.push({t:'pheal', v:hh, h:x.hid}); } }
    if (k === 'rally'){ B.rally = b; B.rallyAmt = a; ev.push({t:'msg', v:`The party hits ${Math.round(a*100)}% harder!`, h}); }
    if (k === 'aegis'){ B.aegis = b; B.aegisAmt = a; ev.push({t:'fx', k:'aegis', h}); ev.push({t:'msg', v:`The party takes ${Math.round(a*100)}% less damage!`, h}); }
    if (k === 'weak') for (const e of scopeOf(b)) foeStatus(e, 'weak', a, ev, r);
    if (k === 'vuln') for (const e of scopeOf(b)){ e.status.vuln = Math.max(e.status.vuln||0, a); e.status.vulnAmt = Math.max(e.status.vulnAmt||0, c || 0.3); ev.push({t:'status', id:e.id, s:'exposed'}); }
    if (k === 'stun') for (const e of scopeOf(b)){ if (r() < a/100) foeStatus(e, 'freeze', 1, ev, r); }
    if (k === 'burn') for (const e of scopeOf(a)) foeStatus(e, 'burn', 3, ev);
    if (k === 'status') for (const e of scopeOf(c)){ if (r() < b/100) foeStatus(e, a, d || 2, ev, r); }
    if (k === 'buff') for (const x of (c === 'party' ? allies() : [p])) heroStatus(B, x, a, b, ev);
    if (k === 'cleanse') for (const x of allies()){ for (const bad of BAD) delete x.st[bad]; x.frozen = false; if (x === p) B.frozen = false; }
    if (k === 'energy') for (const x of (b === 'self' ? [p] : allies())) x.energy = Math.min(100, x.energy + a);
    if (k === 'selfhurt'){ const dd = Math.min(p.hp - 1, Math.round(p.max*a)); if (dd > 0){ p.hp -= dd; ev.push({t:'pdot', v:dd, h}); ev.push({t:'msg', v:'It costs you.', h}); } }
    if (k === 'teamhurt') for (const x of allies()){ if (x === p) continue; const dd = Math.min(x.hp - 1, Math.round(x.max*a)); if (dd > 0){ x.hp -= dd; ev.push({t:'pdot', v:dd, h:x.hid}); } }
    if (k === 'recharge'){ p.st.recharge = 1; ev.push({t:'msg', v:'You must recharge next turn.', h}); }
    if (k === 'exhaust'){ p.energy = 0; ev.push({t:'msg', v:'Your energy is spent.', h}); }
    if (k === 'selfstatus') heroStatus(B, p, a, b, ev);
    if (k === 'smoke') for (const x of (b === 'party' ? allies() : [p])) x.buff.smoke = Math.max(x.buff.smoke||0, a);
    if (k === 'shield'){ p.buff.iron = Math.max(p.buff.iron||0, a); ev.push({t:'msg', v:'Your skin turns hard as stone.', h}); } }
  return dealt; }
function doMove(B, mv, tgt, r, ev){ const p = B.p; const m = heroMoves(p.w, p.a)[3]; ev.push({t:'skill', v:D.SIGS[mv][0], h:p.hid, sig:true}); runOps(B, D.SIGS[mv][0], D.SIGS[mv][2], tgt, r, ev, m ? m.acc : 100); if (m && m.down && m.down.length) runOps(B, '', m.down, tgt, r, ev, 100); }
function tickBuffs(B){ if (B.rally > 0) B.rally--; if (B.aegis > 0) B.aegis--;
  for (const e of B.es){ for (const k of ['blind','slow','weak','empower','reflect']) if (e.status[k] > 0) e.status[k]--; if (e.status.vuln > 0){ e.status.vuln--; if (!e.status.vuln) e.status.vulnAmt = 0; } } }
function useMove(B, slot, tgt, r, ev){ const p = B.p, h = p.hid; const mv = heroMoves(p.w, p.a)[slot]; if (!mv) return; p.mty = mv.ty; p.mcat = mv.cat; p.acts = (p.acts || 0) + 1; if (mv.type === 3 && B.boons.includes('surge')) mv.cost = Math.max(0, mv.cost - 10);
  if (mv.type > 1 && (p.energy < mv.cost || (mv.cd && (p.mcd[slot] || 0) > B.turn))) return useMove(B, 0, tgt, r, ev);
  p.energy -= mv.cost || 0; if (mv.cd) p.mcd[slot] = B.turn + mv.cd;
  if (mv.type >= 3){ if (B.boons.includes('endurance')) p.energy = Math.min(100, p.energy + 10); const bp = ab(p, 'bloodprice'); if (bp){ const dd = Math.min(p.hp - 1, Math.round(p.max*bp/100)); if (dd > 0){ p.hp -= dd; ev.push({t:'pdot', v:dd, h, s:'blood'}); } } }
  p.combo = (p.combo || 0) + 1;
  if (mv.type === 1){ ev.push({t:'skill', v:mv.n, h, basic:true}); ev.push({t:'act', h, a:'attack', tg:[tgt.id], fx: mv.fx, rider: mv.rider}); p.energy = Math.min(100, p.energy + 15 + (mv.rider === 'energy' ? 10 : 0));
    const o = {acc:100}; if (mv.rider === 'burn') o.burn = 25; if (mv.rider === 'stun') o.stun = 15; if (mv.rider === 'poison') o.poison = 25; if (mv.rider === 'blind') o.blind = 20; if (mv.rider === 'slow') o.slow = 1; if (mv.rider === 'steal') o.steal = 0.15; if (mv.rider === 'crit') o.critBonus = 0.2; if (mv.rider === 'pierce') o.pierce = true; if (mv.rider === 'chain') o.chain = 40;
    dealTo(B, tgt, baseHit(B, r)*mv.mult, r, ev, o);
    const dbl = abilOf(p.w,'double'); if (dbl && r() < dbl/100){ const t2 = tgt.hp > 0 ? tgt : alive(B)[0]; if (t2){ ev.push({t:'fx', k:'double', a:t2.id, h}); ev.push({t:'msg', v:'Double strike!', h}); dealTo(B, t2, baseHit(B, r)*0.8, r, ev); } }
    if (abilOf(p.w,'multishot')){ const o2 = alive(B).filter(e=>e!==tgt); if (o2.length) dealTo(B, pick(o2,r), baseHit(B, r)*0.6, r, ev, {noChain:true}); }
    selfBurn(B, r, ev); return; }
  if (mv.type === 2){ ev.push({t:'skill', v:mv.n, h}); const all = alive(B);
    if (mv.kind === 'area'){ ev.push({t:'act', h, a:'skill', tg:all.map(e => e.id), area:true}); for (const e of all) dealTo(B, e, baseHit(B, r)*mv.mult, r, ev, Object.assign({acc:mv.acc, noChain:true}, mv.opts, mv.opts.stun ? {} : {})); }
    else { ev.push({t:'act', h, a:'skill', tg:[tgt.id]}); for (let i=0;i<mv.hits;i++){ const al = alive(B); if (!al.length) break; const e = mv.opts.spread ? al[i % al.length] : (tgt.hp > 0 ? tgt : al[0]); dealTo(B, e, baseHit(B, r)*mv.mult, r, ev, Object.assign({acc:mv.acc, noChain:true}, mv.opts)); } }
    selfBurn(B, r, ev); return; }
  if (mv.type === 3){ ev.push({t:'skill', v:mv.n, h}); ev.push({t:'act', h, a:'heavy', tg:[tgt.id]}); dealTo(B, tgt, baseHit(B, r)*mv.mult, r, ev, Object.assign({acc:mv.acc}, mv.opts)); selfBurn(B, r, ev); return; }
  if (mv.type === 4){ if (mv.sig) doMove(B, mv.sig, tgt, r, ev); else { ev.push({t:'skill', v:mv.n, h, sig:true}); runOps(B, mv.n, mv.ops, tgt, r, ev, mv.acc); } } }
/* one hero's action, no enemy response. act: 'move' (item = slot 0-3) | 'focus' | 'guard' | 'item'; old 'attack'/'skill' map to slots 0/1 */
function heroAction(B, act, targetId, r, belt={}, item=null){
  const p = B.p, h = p.hid; const before = Object.keys(p.st);
  const ev = heroAction0(B, act, targetId, r, belt, item, p, h);
  for (const k of before) if (k !== 'freeze' && k !== 'recharge' && p.st[k] > 0){ p.st[k]--; if (p.st[k] <= 0) delete p.st[k]; }
  return ev; }
function heroAction0(B, act, targetId, r, belt, item, p, h){ const ev = [];
  let tgt = B.es.find(e => e.id === targetId && e.hp > 0) || alive(B)[0]; if (!tgt) return ev;
  p.guard = false;
  if (act === 'skip'){ p.combo = 0; ev.push({t:'skipped', h}); ev.push({t:'msg', v:'The host skipped this turn.', h}); return ev; }
  if (act !== 'move' && act !== 'attack' && act !== 'skill') p.combo = 0;
  if (B.frozen || p.st.freeze){ B.frozen = false; p.frozen = false; delete p.st.freeze; ev.push({t:'fx', k:'thaw', h}); ev.push({t:'msg', v:'Frozen solid: you lose this turn!', h}); return ev; }
  if (p.st.recharge){ delete p.st.recharge; ev.push({t:'msg', v:'Recharging: you lose this turn.', h}); return ev; }
  if (act === 'attack'){ act = 'move'; item = 0; } else if (act === 'skill'){ act = 'move'; item = 1; }
  if (act === 'move'){ let slot = +item; if (!(slot >= 0 && slot <= 3)){ slot = movesOf(p.w)[0] === item ? 3 : 0; } useMove(B, slot, tgt, r, ev); if (B.focus && slot > 0) B.focus = 0; else if (B.focus) B.focus = 0; }
  else if (act === 'focus'){
    p.energy = Math.min(100, p.energy + (B.boons.includes('focusmind') ? 65 : 45)); B.focus = 1; ev.push({t:'act', h, a:'focus'}); ev.push({t:'focus', h});
  } else if (act === 'guard'){
    p.guard = true; const hh = Math.round(p.max*0.05); p.hp = Math.min(p.max, p.hp + hh); ev.push({t:'act', h, a:'guard'}); ev.push({t:'guard', h}); if (hh) ev.push({t:'pheal', v:hh, h});
  } else if (act === 'item'){
    if (!item || !(belt[item] > 0)) return [{t:'msg', v:'You have none of that', h}];
    belt[item]--; ev.push({t:'act', h, a:'item:'+item, tg: item==='fire' ? alive(B).map(e=>e.id) : []}); ev.push({t:'item', v:D.CONSUMABLES[item].n, k:item, h});
    const pot = 1 + TRK(B,'POTION')/100;
    if (item==='hp' || item==='hp2' || item==='cleanse'){ const hh = Math.round(p.max*({hp:0.35, hp2:0.65, cleanse:0.13}[item])*pot*(B.boons.includes('potion')?1.2:1)); p.hp = Math.min(p.max, p.hp + hh); ev.push({t:'pheal', v:hh, h}); if (B.party && B.boons.includes('healtouch') && item !== 'cleanse'){ const al = standing(B).filter(x => x !== p).sort((a, b) => a.hp/a.max - b.hp/b.max)[0]; if (al){ const h2 = Math.round(al.max*0.15); al.hp = Math.min(al.max, al.hp + h2); ev.push({t:'pheal', v:h2, h:al.hid}); } } if (item==='cleanse'){ for (const bad of BAD) delete p.st[bad]; p.frozen = false; B.frozen = false; } }
    const tn = B.boons.includes('tonic') ? 2 : 0; if (item==='str') p.buff.str = 5 + tn; if (item==='iron') p.buff.iron = 4 + tn; if (item==='smoke') p.buff.smoke = 4 + tn;   // Strength Tonic and Iron-Skin: 4 turns; Smoke Bomb: 4 attacks
    if (item==='fire') for (const e of alive(B)){ dealTo(B, e, baseHit(B,r)*0.6, r, ev, {noChain:true}); if (e.hp>0) foeStatus(e, 'burn', 3, ev); }
    if (item==='phoenix'){ p.feather = true; belt.phoenix++; }
  }
  for (const e of B.es) if (e.hp <= 0 && !e.dead){ e.dead = true; ev.push({t:'kill', id:e.id}); }
  return ev;
}
function enemyTicks(B, ev){
  for (const e of alive(B)){ const big = e.boss || e.mini;
    if (e.status.burn > 0){ const d = e.status.burnDmg || Math.max(1, Math.round(e.max*0.03)); e.hp = Math.max(0, e.hp - d); e.status.burn--; ev.push({t:'edot', id:e.id, v:d, s:'burn'}); }
    if (e.status.poison > 0 && e.hp > 0){ const d = Math.max(1, Math.round(e.max*(big ? 0.025 : 0.05))); e.hp = Math.max(0, e.hp - d); e.status.poison--; ev.push({t:'edot', id:e.id, v:d, s:'poison'}); }
    if (e.trait==='split' && e.hp > 0){ const h = Math.round(e.max*0.04); e.hp = Math.min(e.max, e.hp + h); }
  }
  noteDeaths(B); for (const e of B.es) if (e.hp <= 0 && !e.dead){ e.dead = true; ev.push({t:'kill', id:e.id}); }
}
function playerAct(B, act, targetId, r, belt={}, item=null){
  if (B.over) return [];
  const ev = heroAction(B, act, targetId, r, belt, item); if (ev.length === 1 && ev[0].t==='msg' && /none of that/.test(ev[0].v)) return ev;
  enemyTicks(B, ev);
  if (!alive(B).length){ B.over = 'win'; ev.push({t:'win'}); return ev; }
  ev.push(...enemiesAct(B, r, belt)); B.turn++; return ev;
}
/* an enemy's blow lands on B.p (or misses: accuracy, smoke, dodge) */
function hurt(B, e, raw, r, ev, label, acc=95){
  const p = B.p, h = p.hid;
  if (p.buff.smoke > 0){ p.buff.smoke--; ev.push({t:'dodge', id:e.id, h}); return 0; }
  if (r() > foeHitChance(e, p, acc)){ ev.push({t:'dodge', id:e.id, h, miss:true}); return 0; }
  const fs = foeSt(e), cat = e.mcat || 'phys', fcrit = r() < 1/24; let d = pkDamage(e.lv, D.BASEPOW*raw, cat === 'spec' ? fs.spa : fs.atk, cat === 'spec' ? p.spd : p.def) * (0.85 + r()*0.15) * 1.5 * (fcrit ? 1.5 : 1) * FK.foeDmg * refAt(Math.max(1, e.lv || 1)).dmgN * (e.status.weak > 0 ? 0.7 : 1) * (e.status.empower > 0 ? 1.25 : 1) * (B.aegis > 0 ? 1 - (B.aegisAmt||0.25) : 1) * (p.st.vuln ? 1.25 : 1);
  if (p.guard) d *= 0.4 * (1 - TRK(B,'GUARD')/100);
  if (B.focus && B.boons.includes('focusward')) d *= 0.5;   // Focused Guard boon
  d *= 1 - bulwarkOf(B);
  if (B.party && !p.guard){ const gd = B.heroes.find(h => h !== p && h.guard && !h.down && h.boons.includes('guardian')); if (gd){ const weakest = standing(B).slice().sort((a, b) => a.hp/a.max - b.hp/b.max)[0]; if (weakest === p) d *= 0.75; } }
  if (p.buff.iron > 0) d *= 0.55;
  const tmh = D.typeMul((e.types && e.types[e.tcur || 0]) || 'normal', p.dt); d *= tmh * (tmh > 1.5 && p.boons.includes('hardened') ? 0.75 : 1);
  d *= 1 - abilOf(p.a,'ward')/100; if (B.boons.includes('iron')) d *= 0.9; d *= 1 + (abilOf(p.w,'fragile') + abilOf(p.a,'fragile'))/100;
  d = Math.max(1, Math.round(d)); p.hp = Math.max(0, p.hp - d); ev.push({t:'pdmg', id:e.id, v:d, label, h, x:tmh >= 1.9 ? 2 : tmh <= 0.6 ? 0.5 : undefined});
  const th = abilOf(p.a,'thorns') + TRK(B,'THORNS') + (B.boons.includes('thorn') ? 12 : 0); if (th && e.hp > 0){ const t = Math.max(1, Math.round(d*th/100)); e.hp = Math.max(0, e.hp - t); ev.push({t:'fx', k:'thorns', h}); ev.push({t:'edot', id:e.id, v:t, s:'thorns'}); }
  const co = abilOf(p.a,'counter') + (p.boons.includes('riposte') ? 15 : 0); if (co && e.hp > 0 && r() < co/100){ ev.push({t:'fx', k:'counter', a:e.id, h}); ev.push({t:'msg', v:'Counter-attack!', h}); dealTo(B, e, baseHit(B, r)*0.6, r, ev, {noChain:true}); }
  if (e.trait==='vampiric'){ const hh = Math.round(d*0.4); e.hp = Math.min(e.max, e.hp + hh); if (hh) ev.push({t:'eheal', id:e.id, v:hh}); }
  return d;
}
/* ---------- enemy move sets: weak foes 2 moves, elites 3, mini-bosses and bosses 4 (each with its own animation) ---------- */
const EM = {
  strike:{n:'Strike', acc:100, k:'hit', m:1.0, anim:'basic'}, lunge:{n:'Lunge', acc:88, k:'hit', m:1.2, anim:'basic'},
  quick:{n:'Quick Strike', acc:90, k:'multi', hits:2, m:0.55, anim:'multi'}, smash:{n:'Wind-up Smash', acc:85, k:'charge', m:2.3, cd:3, anim:'smash'},
  shield:{n:'Shield Up', k:'guard', cd:3, anim:'shield'}, firebrand:{n:'Firebrand', acc:85, k:'hit', m:0.8, st:['burn',60,3], anim:'flame'},
  drain:{n:'Drain Bite', acc:90, k:'hit', m:0.9, drain:0.5, anim:'bite'}, mend:{n:'Mend', k:'heal', pct:0.15, cd:3, anim:'heal'},
  ooze:{n:'Toxic Ooze', acc:90, k:'hit', m:0.7, st:['poison',55,3], anim:'poison'}, flash:{n:'Blinding Flash', acc:80, k:'hit', m:0.5, st:['blind',70,1], anim:'flash'},
  web:{n:'Sticky Web', acc:85, k:'hit', m:0.4, st:['slow',80,2], anim:'web'}, venom:{n:'Venom Fang', acc:90, k:'hit', m:0.8, st:['poison',60,3], anim:'bite'},
  rockfall:{n:'Rockfall', acc:75, k:'aoe', m:0.6, cd:2, anim:'quake'}, gust:{n:'Gust', acc:85, k:'aoe', m:0.4, st:['blind',40,1], cd:2, anim:'gust'},
  frost:{n:'Frost Breath', acc:80, k:'hit', m:0.7, st:['freeze',35,1], cd:2, anim:'frost'}, sandstorm:{n:'Sandstorm', acc:70, k:'aoe', m:0.45, st:['blind',50,1], cd:3, anim:'gust'},
  hex:{n:'Hex', acc:85, k:'hit', m:0.5, st:['slow',70,2], anim:'orb'}, roar:{n:'War Cry', k:'buff', st:'empower', turns:2, cd:4, anim:'roar'},
  bomb:{n:'Bomb', acc:80, k:'aoe', m:0.6, st:['burn',40,3], cd:2, anim:'meteor'}, cleave:{n:'Cleaver Sweep', acc:85, k:'aoe', m:0.7, cd:2, anim:'smash'},
  spark:{n:'Spark Arc', acc:90, k:'hit', m:0.8, st:['slow',40,2], anim:'bolt'}, horde:{n:'Swarm', acc:85, k:'multi', hits:3, m:0.4, anim:'multi'},
  lash:{n:'Tentacle Lash', acc:85, k:'multi', hits:3, m:0.45, anim:'multi'}, beam:{n:'Searing Gaze', acc:85, k:'hit', m:1.1, st:['burn',40,3], anim:'beam'},
  dodge:{n:'Evasive Stance', k:'dodge', cd:3, anim:'shield'}, summon:{n:'Call Allies', k:'summon', cd:5, after:5, anim:'summon'}};
const ARTMOVE = {wisp:'flash', eye:'beam', drone:'flash', jelly:'flash', spider:'web', serpent:'venom', scorpion:'venom', golem:'rockfall', giant:'rockfall', colossus:'rockfall', treant:'rockfall',
  bird:'gust', harpy:'gust', bat:'gust', yeti:'frost', wolf:'frost', djinn:'sandstorm', mummy:'sandstorm', sphinx:'sandstorm', mage:'hex', inquisitor:'hex', scarecrow:'hex', ghoul:'drain',
  boar:'roar', beastman:'roar', bear:'roar', mammoth:'roar', cyclops:'roar', brute:'roar', bomber:'bomb', balloon:'bomb', furnace:'bomb', execut:'cleave', cart:'spark', horde:'horde',
  kraken:'lash', hydra:'lash', slime:'ooze', rat:'venom', fox:'quick', horse:'lunge', crab:'shield', knight:'shield', goblin:'quick', skeleton:'lunge', hound3:'firebrand', gorgon:'hex',
  wyrm:'frost', puffer:'ooze', beetle:'ooze', cat:'quick', rider:'lunge', ram:'smash', god:'beam',
  oni:'roar', kappa:'quick', tengu:'gust', kitsune:'firebrand', tanuki:'hex', yurei:'drain', kama:'quick', gashadokuro:'rockfall', orochi:'venom', ryu:'beam', centaur:'quick', griffin:'gust', chimera:'firebrand', lion:'roar', typhon:'gust', automaton:'shield'};
const TRAITMOVE = {swift:'quick', brute:'smash', shield:'shield', burn:'firebrand', vampiric:'drain', healer:'mend', split:'ooze', boss:'lunge'};
/* each boss and god's signature move: [name, kind, accuracy] — huge, no-downside moves are inaccurate; status storms hit everyone */
const BOSSMOVES = {watcher:['Total Surveillance','curse',85], colossus:['Ministry Quake','aoe',70], hydra:['Regrowth','regrow',100], prospero:['The Tempest','aoe',70], kraken:['Crushing Grip','grip',80], sycorax:['Witch’s Hex','plague',70],
  shadow:['Between the Idea and the Reality','drain',85], apophis:['Devouring Dark','drain',85], pharaoh:['Curse of the Tomb','burnall',70], wyrm:['Nightfall Breath','frostall',70], fenrir:['Ragnarök Howl','execute',55], ymir:['Glacial Collapse','aoe',65],
  zeusGod:['Olympian Storm','aoe',70], aresGod:['War Frenzy','frenzy',100], poseidonGod:['Tidal Surge','plague',70], susanooGod:['Eight-Fold Slash','flurry',85], raGod:['Solar Flare','burnall',70], sekhmetGod:['Bloodlust','drain',85], odinGod:['Gungnir','execute',55], thorGod:['Mjölnir Quake','frostall',70],
  captain:['Room 101','curse',85], oBrien:['Doublethink','drain',85]}; Object.assign(BOSSMOVES, D.BOSSMOVES2 || {});
const SIGANIM = {aoe:'quake', frostall:'frost', burnall:'meteor', curse:'orb', drain:'drain', grip:'grip', execute:'beam', flurry:'multi', frenzy:'roar', regrow:'heal', plague:'poison'};
function enemyMoves(e){ if (e.moves) return e.moves; const list = [Object.assign({id:'strike'}, EM.strike)]; const add = id => { if (id && EM[id] && !list.some(m => m.id === id)) { list.push(Object.assign({id}, EM[id])); return true; } return false; };
  const big = (e.boss || e.mini) && !e.minion, n = big ? 4 : e.elite ? 3 : 2;
  if (big){ add(ARTMOVE[e.art]) || add(TRAITMOVE[e.trait] === 'lunge' ? 'smash' : TRAITMOVE[e.trait]) || add('smash');
    const sg = BOSSMOVES[e.key]; if (sg) list.push({id:'sig', n:sg[0], k:'sig', kind:sg[1], acc:sg[2], cd:4, anim:SIGANIM[sg[1]] || 'beam', sig:true}); else add('roar') || add('lunge');
    if (e.mini) add('dodge'); else add('summon'); }
  else { add(ARTMOVE[e.art]); if (n > 2) add(TRAITMOVE[e.trait]); let i = 0; while (list.length < n && i < 8) add(['lunge','quick','roar','hex','web','flash'][(e.id + i++) % 6]); }
  e.moves = list.slice(0, n); return e.moves; }
function bossSummon(B, e, ev, n=1){ const W = WORLDS[B.world||0] || WORLDS[0]; for (let i=0;i<n;i++){ const m = makeEnemy(pick(W.enemies, Math.random), e.max*0.11, e.atk*0.35); m.minion = true; m.lv = e.lv; m.name = 'Summoned ' + m.name; B.es.push(m); ev.push({t:'summon', id:m.id, by:e.id}); }
  ev.push({t:'msg', v:`${e.name} calls ${n > 1 ? 'reinforcements' : 'a servant'} to the fight!`}); }
const hasOp = (m, name) => m.ops && m.ops.some(o => o[0] === name);
function pickFoeMove(B, e, r, bonus){ const ms = enemyMoves(e); e.cd = e.cd || {}; const nMin = B.es.filter(x => x.minion && x.hp > 0).length; const nHeal = B.es.filter(x => x.healer && x.hp > 0).length;
  if (e.turns === 1 && !bonus){ const f = ms.find(m => m.first && !(e.used && e.used[m.id])); if (f) return f; }
  const scriptOk = m => { if (m.k !== 'script') return true; if (bonus && (m.cd || m.pending || hasOp(m, 'summon') || hasOp(m, 'healers') || hasOp(m, 'guard') || hasOp(m, 'heal'))) return false;
    if (m.once && e.used && e.used[m.id]) return false; if (m.first && e.used && e.used[m.id]) return false;
    if (hasOp(m, 'healers') && (nHeal >= 2 || !e.healerKey)) return false; if (hasOp(m, 'summon') && !m.ops.find(o => o[0] === 'summon')[1].all && nMin >= (e.promised ? 4 : 3)) return false;
    if ((hasOp(m, 'heal') || hasOp(m, 'cleanseSelf')) && e.hp > e.max*0.75) return false; if (hasOp(m, 'healAllies') && !alive(B).some(x => x.hp < x.max*0.7)) return false;
    if (hasOp(m, 'dodge') && (e.status.dodge || 0) >= 0.3) return false; if (hasOp(m, 'buff') && e.status.empower) return false; if (hasOp(m, 'guard') && e.guard) return false; if (hasOp(m, 'reflect') && e.status.reflect > 0) return false; if (hasOp(m, 'barrier') && e.barrier > 0) return false; return true; };
  const ok = ms.filter(m => (e.cd[m.id] || 0) <= e.turns && !(m.after && e.turns < m.after) && !(m.k === 'heal' && !alive(B).some(x => x.hp < x.max*0.65)) && !(m.k === 'summon' && nMin >= 2) && !(m.k === 'dodge' && (e.status.dodge || 0) >= 0.4) && !(m.k === 'buff' && e.status.empower) && scriptOk(m));
  const wt = m => m.w ? (m.heal && nHeal < 2 ? 9 : m.w) : m.id === 'strike' ? 3 : m.sig ? 3 : m.k === 'summon' ? 2.5 : 2; const tot = ok.reduce((a, m) => a + wt(m), 0); let x = r()*tot; for (const m of ok){ x -= wt(m); if (x <= 0) return m; } return ok[0] || ms[0]; }
/* ---------- scripted boss moves (the ★7 and ★10 bosses): a move is a list of ops, see BOSSKIT in the data ---------- */
const BADNAMES = ['burn','poison','blind','slow','weak','vuln'];
function runScript(B, e, mv, r, ev){
  const orig = B.p, party = !!B.party; let dealt = 0, lastHit = []; const ops = mv.ops; e.mcat = D.moveCat(mv, e);
  const hasDmg = ops.some(o => ['hit','hits','all','rand','exec','gems','snap'].includes(o[0]));
  const selfKind = hasDmg ? null : ops.some(o => o[0]==='summon' || o[0]==='healers') ? 'summon' : ops.some(o => o[0]==='heal' || o[0]==='healAllies' || o[0]==='cleanseSelf') ? 'heal' : ops.some(o => o[0]==='guard' || o[0]==='barrier') ? 'shield' : ops.some(o => o[0]==='dodge') ? 'dodge' : 'buff';
  const banner = e.boss && !e.minion && !e.healer && (mv.pending || (mv.w || 2) >= 2.2 || (hasDmg && mv.cd >= 3));
  ev.push({t:'emove', id:e.id, an:mv.anim, n:mv.n, sig:!!banner, self:selfKind ? {summon:'summon', heal:'heal', shield:'shield', dodge:'dodge', buff:'roar'}[selfKind] : null}); if (banner) ev.push({t:'bspecial', id:e.id, n:mv.n});
  const asHero = (x, fn) => { if (party && B.p !== x) use(B, x); const res = fn(); if (party){ keep(B); use(B, orig); } return res; };
  const strike = (x, mult, ch) => asHero(x, () => { ev.push({t:'attack', id:e.id, h:x.hid, anim:mv.anim, ch:!!ch}); const d = hurt(B, e, e.atk*mult, r, ev, mv.n, mv.acc); if (d > 0){ dealt += d; if (!lastHit.includes(x)) lastHit.push(x); } return d; });
  const status = (x, name, chance, turns) => { if (x && x.hp > 0 && !x.down && r() < chance/100) asHero(x, () => heroStatus(B, x, name, turns, ev)); };
  const newTgt = () => { const u = up(B); return u.length ? u[Math.floor(r()*u.length)] : null; };
  let tgt = orig; const retarget = () => { if (!tgt || tgt.down || tgt.hp <= 0) tgt = newTgt(); return tgt; };
  const healE = (t, pct) => { const hh = Math.round(t.max*pct); if (hh > 0 && t.hp > 0){ t.hp = Math.min(t.max, t.hp + hh); ev.push({t:'eheal', id:t.id, v:hh}); } };
  const spawn = (key, hp, atk, o) => { const m = makeEnemy(key, hp, atk, {}); m.minion = true; m.lv = e.lv; if (o && o.mini) m.mini = true; if (D.MINIONKIT && D.MINIONKIT[key]) m.moves = D.MINIONKIT[key].map(x => Object.assign({}, x)); B.es.push(m); ev.push({t:'summon', id:m.id, by:e.id}); return m; };
  for (const op of ops){ const k = op[0]; if (B.over) break;
    if (k === 'hit'){ const x = retarget(); if (x) strike(x, op[1], true); }
    else if (k === 'hits'){ for (let i=0;i<op[1];i++){ const x = retarget(); if (!x) break; strike(x, op[2]); } }
    else if (k === 'all'){ for (const x of up(B).slice()) strike(x, op[1], true); }
    else if (k === 'rand'){ for (let i=0;i<op[1];i++){ const x = newTgt(); if (!x) break; strike(x, op[2]); } }
    else if (k === 'exec'){ const u = up(B).slice().sort((a, b) => a.hp/a.max - b.hp/b.max); if (u[0]) strike(u[0], op[1], true); }
    else if (k === 'gems'){ const gem = [['poison',70,3],['burn',70,3],['blind',70,2],['slow',70,2],['weak',70,2],['recharge',25,1]]; for (let i=0;i<6;i++){ const x = newTgt(); if (!x) break; const d = strike(x, 0.36); if (d > 0) status(x, gem[i][0], gem[i][1], gem[i][2]); } }
    else if (k === 'snap'){ for (const x of up(B).slice()){ const d = strike(x, 0); void d; asHero(x, () => { if (x.hp > 1){ const dd = Math.min(x.hp - 1, Math.max(1, Math.round(x.hp*op[1]*(x.guard ? 0.4 : 1)*(x.buff.iron > 0 ? 0.55 : 1)))); x.hp -= dd; ev.push({t:'pdmg', id:e.id, v:dd, label:mv.n, h:x.hid}); if (lastHit.indexOf(x) < 0) lastHit.push(x); } }); } }
    else if (k === 'st'){ for (const x of lastHit) status(x, op[1], op[2], op[3]); }
    else if (k === 'stall1'){ for (const x of lastHit) status(x, op[1], op[2], op[3]); }
    else if (k === 'stall'){ for (const x of lastHit){ for (const n of BADNAMES) status(x, n, op[1], op[2]); status(x, 'freeze', op[1]*0.4, 1); status(x, 'recharge', op[1]*0.3, 1); } }
    else if (k === 'drainE'){ const list = lastHit.length ? lastHit : up(B); for (const x of list){ x.energy = Math.max(0, x.energy - op[1]); } ev.push({t:'msg', v:'Energy drained!'}); }
    else if (k === 'heal'){ healE(e, op[1]); }
    else if (k === 'healAllies' || k === 'reviveAlly'){ for (const x of alive(B)) healE(x, op[1]); }
    else if (k === 'leech'){ const hh = Math.round(dealt*op[1]); if (hh > 0){ e.hp = Math.min(e.max, e.hp + hh); ev.push({t:'eheal', id:e.id, v:hh}); } }
    else if (k === 'buff'){ foeStatus(e, op[1], op[2], ev); ev.push({t:'fx', k:'enrage', a:e.id}); }
    else if (k === 'buffAllies'){ for (const x of alive(B)) foeStatus(x, op[1], op[2], ev); }
    else if (k === 'enrage'){ e.atk = (e.atk*(1 + op[1])); ev.push({t:'fx', k:'enrage', a:e.id}); }
    else if (k === 'guard'){ e.guard = true; }
    else if (k === 'reflect'){ e.status.reflect = op[2]; e.status.reflectAmt = op[1]; }
    else if (k === 'barrier'){ e.barrier = (e.barrier || 0) + Math.round(e.max*op[1]); ev.push({t:'fx', k:'barrier', a:e.id}); }
    else if (k === 'dodge'){ e.status.dodge = Math.min(0.4, (e.status.dodge || 0) + op[1]); }
    else if (k === 'cleanseSelf'){ for (const n of BADNAMES.concat(['stun'])) e.status[n] = 0; }
    else if (k === 'summon'){ const sp = op[1]; if (sp.all){ for (const key of sp.keys) spawn(key, e.max*sp.hp, e.atk*sp.atk, sp); } else for (let i=0;i<sp.n;i++) spawn(sp.keys[i % sp.keys.length], e.max*sp.hp, e.atk*sp.atk, sp); }
    else if (k === 'healers'){ const nH = B.es.filter(x => x.healer && x.hp > 0).length; for (let i = nH; i < 2; i++){ const m = makeHealer(e.healerKey || 'healVoid', e); m.lv = e.lv; B.es.push(m); ev.push({t:'summon', id:m.id, by:e.id}); } ev.push({t:'msg', v:`${e.name} calls its healers to its side! Kill them first, or it will keep mending.`}); }
    else if (k === 'healBoss'){ const t = alive(B).filter(x => !x.healer).sort((a, b) => b.max - a.max)[0] || e; healE(t, op[1]); }
    else if (k === 'barrierBoss'){ const t = alive(B).filter(x => !x.healer).sort((a, b) => b.max - a.max)[0] || e; t.barrier = (t.barrier || 0) + Math.round(t.max*op[1]); ev.push({t:'fx', k:'barrier', a:t.id}); }
    else if (k === 'msg'){ ev.push({t:'msg', v:op[1]}); }
  }
  B.p = orig; if (party) use(B, orig);
}
/* one enemy's turn; B.p is its chosen target */
function enemyAct(B, e, r, ev, bonus){
  const p = B.p, h = p.hid; const orig = p;
  e.guard = false; if (e.exposed) e.exposed--; if (!bonus) e.turns = (e.turns||0) + 1;
  if (!e.rot && e.types && e.types.length > 1 && !bonus) e.tcur = r() < 0.5 ? 0 : 1;   // dual-typed mobs attack with either of their types
  if (e.rot && !bonus && e.hp > 0){ const cyc = D.TYPES.slice(0, 18).filter(t => t !== e.types[0]); const nt = pick(cyc, r); e.types = [nt]; ev.push({t:'msg', v:`Multitype! ${e.name} shifts to ${D.TYPE_INFO[nt][0]} type.`}); }   // Primal Arceus: a new type every round
  if (e.key==='caliban' || e.key==='wyrm'){ const hh = Math.round(e.max*0.03); if (e.hp < e.max){ e.hp = Math.min(e.max, e.hp + hh); } }
  const nMin = B.es.filter(x=>x.minion && x.hp>0).length, cap = B.party ? 1 + B.heroes.length : 2;
  if (e.key==='watcher' && e.turns % 3 === 0 && e.turns % 4 !== 3 && nMin < cap){ const m = makeEnemy('enforcer', e.max*0.12, e.atk*0.35); m.minion = true; m.lv = e.lv; m.name = 'Telescreen Guard'; B.es.push(m); ev.push({t:'summon', id:m.id, by:e.id}); ev.push({t:'msg', v:'The Watcher summons a Telescreen Guard! It takes 70% less damage while guards stand.'}); return; }
  if (e.summoner && e.turns % 3 === 0 && e.turns % 4 !== 3 && nMin < cap){ const W = WORLDS[B.world||0]; const m = makeEnemy(W.enemies[(e.turns/3)%W.enemies.length|0], e.max*0.14, e.atk*0.4); m.minion = true; m.lv = e.lv; m.name = 'Summoned ' + m.name; B.es.push(m); ev.push({t:'summon', id:m.id, by:e.id}); ev.push({t:'msg', v:`${e.name} calls a minion to fight!`}); return; }
  if (e.boss && !e.enraged && e.hp < e.max*0.5){ e.enraged = true; e.atk = (e.atk*1.3); ev.push({t:'fx', k:'enrage', a:e.id}); ev.push({t:'msg', v:`${e.name} is enraged!`});
    if (e.final && !e.phase2 && !e.noP2){ e.phase2 = true; const hh = Math.round(e.max*0.15); e.hp = Math.min(e.max, e.hp + hh); ev.push({t:'bspecial', id:e.id, n:'Second form'}); ev.push({t:'eheal', id:e.id, v:hh}); ev.push({t:'msg', v:`${e.name} rises in a terrible second form!`}); bossSummon(B, e, ev, 2); return; } }
  if (e.status.stun){ e.status.stun = 0; e.pend = null; e.charging = false; ev.push({t:'msg', v:`${e.name} is stunned and loses its turn.`}); return; }
  if (e.pend && !bonus){ const mp = e.pend; e.pend = null; e.charging = false; return runScript(B, e, mp, r, ev); }
  if (e.key==='prospero' && e.turns % 4 === 0){ const hh = Math.round(e.max*0.1); e.hp = Math.min(e.max, e.hp + hh); ev.push({t:'emove', id:e.id, n:'Book Magic'}); ev.push({t:'eheal', id:e.id, v:hh}); ev.push({t:'msg', v:'Prospero draws on his books and heals.'}); return; }
  if (e.key==='shadow' && e.turns % 4 === 0 && !e.charging){ e.charging = true; ev.push({t:'msg', v:'Falls the Shadow… it gathers darkness. GUARD, then strike while it is exposed!'}); return; }
  if (e.charging){ e.charging = false; e.mcat = D.moveCat({anim:'smash'}, e); ev.push({t:'attack', id:e.id, h, ch:true, anim:'smash'}); hurt(B, e, e.atk*2.3, r, ev, 'charged', 85); if (e.key==='shadow'){ e.exposed = 2; ev.push({t:'msg', v:'The Shadow is EXPOSED: +60% damage this turn!'}); } return; }
  const mv = pickFoeMove(B, e, r, bonus); e.mcat = D.moveCat(mv, e); if (mv.cd && !bonus) e.cd[mv.id] = e.turns + mv.cd; if (mv.once){ e.used = e.used || {}; e.used[mv.id] = 1; }
  if (mv.k === 'script'){ if (mv.pending && !bonus){ e.pend = mv; e.charging = true; ev.push({t:'emove', id:e.id, n:mv.n, sig:true, self:'charge'}); ev.push({t:'bspecial', id:e.id, n:mv.n + ' (charging)'}); ev.push({t:'msg', v:`${e.name} gathers power for ${mv.n}! GUARD, or be ready to take it!`}); return; } return runScript(B, e, mv, r, ev); }
  const targets = () => heroTargets(B); const each = fn => { for (const x of targets()){ if (B.party) use(B, x); fn(x); if (B.party) keep(B); } if (B.party) use(B, orig); };
  const hitWith = (x, mult, acc, anim, ch) => { ev.push({t:'attack', id:e.id, h:x.hid, anim, ch}); return hurt(B, e, e.atk*mult, r, ev, mv.n, acc); };
  const inflict = (x, st) => { if (st && r() < st[1]/100) heroStatus(B, x, st[0], st[2], ev); };
  if (mv.id !== 'strike') ev.push({t:'emove', id:e.id, n:mv.n, sig:!!mv.sig, self:{guard:'shield', heal:'heal', buff:'roar', dodge:'dodge', summon:'summon', charge:'charge'}[mv.k] || null});
  if (mv.k === 'hit'){ const d = hitWith(p, mv.m, mv.acc, mv.anim); if (d > 0){ inflict(p, mv.st); if (mv.drain){ const hh = Math.round(d*mv.drain); e.hp = Math.min(e.max, e.hp + hh); ev.push({t:'eheal', id:e.id, v:hh}); } } }
  else if (mv.k === 'multi'){ for (let i=0;i<mv.hits && p.hp > 0;i++) hitWith(p, mv.m, mv.acc, mv.anim); }
  else if (mv.k === 'aoe') each(x => { const d = hitWith(x, mv.m, mv.acc, mv.anim); if (d > 0) inflict(x, mv.st); });
  else if (mv.k === 'charge'){ e.charging = true; ev.push({t:'msg', v:`${e.name} winds up a huge attack. Guard!`}); }
  else if (mv.k === 'guard'){ e.guard = true; ev.push({t:'msg', v:`${e.name} raises its shield.`}); }
  else if (mv.k === 'heal'){ const hurtE = alive(B).sort((a,b)=>a.hp/a.max-b.hp/b.max)[0]; const hh = Math.round(hurtE.max*mv.pct); hurtE.hp = Math.min(hurtE.max, hurtE.hp+hh); ev.push({t:'eheal', id:hurtE.id, v:hh}); ev.push({t:'msg', v:`${e.name} heals ${hurtE===e?'itself':hurtE.name}.`}); }
  else if (mv.k === 'buff'){ foeStatus(e, mv.st, mv.turns, ev); ev.push({t:'fx', k:'enrage', a:e.id}); }
  else if (mv.k === 'dodge'){ e.status.dodge = Math.min(0.4, (e.status.dodge || 0) + 0.05); ev.push({t:'msg', v:`${e.name} moves like smoke: ${Math.round(e.status.dodge*100)}% dodge.`}); }
  else if (mv.k === 'summon'){ bossSummon(B, e, ev, (e.boss && !e.mini && B.party && B.heroes.length > 1) ? 2 : 1); }
  else if (mv.k === 'sig'){ ev.push({t:'bspecial', id:e.id, n:mv.n}); const kind = mv.kind, acc = mv.acc;
    if (kind === 'aoe') each(x => hitWith(x, 0.85, acc, mv.anim, true));
    if (kind === 'frostall') each(x => { if (hitWith(x, 0.6, acc, mv.anim, true) > 0 && r() < 0.4) heroStatus(B, x, 'freeze', 1, ev); });
    if (kind === 'burnall') each(x => { if (hitWith(x, 0.5, acc, mv.anim) > 0) heroStatus(B, x, 'burn', 3, ev); });
    if (kind === 'plague') each(x => { if (hitWith(x, 0.35, acc, mv.anim) > 0){ heroStatus(B, x, 'poison', 3, ev); if (r() < 0.5) heroStatus(B, x, 'slow', 2, ev); if (r() < 0.3) heroStatus(B, x, 'blind', 1, ev); } });
    if (kind === 'curse') each(x => { if (r() <= foeHitChance(e, x, acc)){ x.energy = Math.max(0, x.energy - 40); ev.push({t:'msg', v:'Energy drained!', h:x.hid}); if (r() < 0.5) heroStatus(B, x, 'blind', 1, ev); } else ev.push({t:'dodge', id:e.id, h:x.hid, miss:true}); });
    if (kind === 'drain'){ const d = hitWith(p, 1.3, acc, mv.anim, true); const hh = Math.round(d*0.6); if (hh){ e.hp = Math.min(e.max, e.hp + hh); ev.push({t:'eheal', id:e.id, v:hh}); } }
    if (kind === 'grip'){ if (hitWith(p, 1.0, acc, mv.anim, true) > 0) heroStatus(B, p, 'freeze', 1, ev); }
    if (kind === 'execute'){ const tg = targets().sort((a, b) => a.hp/a.max - b.hp/b.max)[0]; if (tg){ if (B.party) use(B, tg); hitWith(tg, 2.4, acc, mv.anim, true); if (B.party){ keep(B); use(B, orig); } } }
    if (kind === 'flurry'){ for (let i=0;i<4 && p.hp>0;i++) hitWith(p, 0.4, acc, mv.anim); }
    if (kind === 'frenzy'){ e.atk = (e.atk*1.2); foeStatus(e, 'empower', 2, ev); hitWith(p, 0.8, acc, mv.anim); }
    if (kind === 'regrow'){ const hh = Math.round(e.max*0.12); e.hp = Math.min(e.max, e.hp + hh); e.atk = (e.atk*1.08); ev.push({t:'eheal', id:e.id, v:hh}); ev.push({t:'msg', v:'Two heads grow back where one fell!'}); } }
  if (e.key==='wyrm' && mv.k === 'hit' && r() < 0.2) heroStatus(B, p, 'freeze', 1, ev);
}
/* end-of-round upkeep for B.p: statuses, regen, buffs, death and revival. Returns true if the hero falls. */
function heroTick(B, belt, ev){
  const p = B.p, h = p.hid;
  const calm = p.boons.includes('calm') ? 0.5 : 1;
  if (p.hp > 0 && p.st.burn > 0){ const d = Math.max(1, Math.round(p.max*0.04*calm)); p.hp = Math.max(0, p.hp - d); ev.push({t:'pdot', v:d, h, s:'burn'}); }
  if (p.hp > 0 && p.st.poison > 0){ const d = Math.max(1, Math.round(p.max*0.05*calm)); p.hp = Math.max(0, p.hp - d); ev.push({t:'pdot', v:d, h, s:'poison'}); }
  const bl = ab(p, 'bleed'); if (p.hp > 1 && bl){ const d = Math.min(p.hp - 1, Math.max(1, Math.round(p.max*bl/100))); p.hp -= d; ev.push({t:'pdot', v:d, h, s:'bleed'}); }
  if (p.st.enlight) p.energy = Math.min(100, p.energy + 15);
  if (p.boons.includes('energyb')) p.energy = Math.min(100, p.energy + 5);
  if (p.hp > 0 && p.boons.includes('regenb') && p.hp < p.max){ const hh = Math.max(1, Math.round(p.max*0.03)); p.hp = Math.min(p.max, p.hp + hh); ev.push({t:'pheal', v:hh, h}); }
  if (p.boons.includes('momentum')) p.spe = Math.round(Math.min(p.spe0*1.25, p.spe + p.spe0*0.05));
  const en = ab(p, 'energize') - ab(p, 'tired'); if (en) p.energy = Math.max(0, Math.min(100, p.energy + en));
  const rg = abilOf(p.a,'regen'); if (p.hp > 0 && rg){ const hh = Math.round(p.max*rg/100); p.hp = Math.min(p.max, p.hp + hh); ev.push({t:'pheal', v:hh, h}); }
  const md = standing(B).reduce((a, x) => a + ab(x, 'mend') + (x.boons.includes('medicb') ? 2 : 0), 0); if (p.hp > 0 && md){ const hh = Math.max(1, Math.round(p.max*md/100)); if (p.hp < p.max){ p.hp = Math.min(p.max, p.hp + hh); ev.push({t:'pheal', v:hh, h}); } }
  for (const k of ['str','iron']) if (p.buff[k] > 0) p.buff[k]--;
  if (p.hp <= 0){
    const ph = abilOf(p.a,'phoenix');
    if (ph && !p.revived){ p.revived = true; p.hp = Math.round(p.max*ph/100); ev.push({t:'fx', k:'phoenix', h}); ev.push({t:'msg', v:'Phoenix fire revives you!', h}); ev.push({t:'pheal', v:p.hp, h}); }
    else if (p.will){ p.will = false; p.hp = 1; ev.push({t:'msg', v:'Force of Will: you refuse to fall!', h}); }
    else if (p.stand){ p.stand = false; p.hp = 1; ev.push({t:'msg', v:'Last Stand: you survive on a single heartbeat!', h}); ev.push({t:'fx', k:'standing', h}); }
    else if (belt.phoenix > 0){ belt.phoenix--; p.hp = Math.round(p.max*0.5); ev.push({t:'fx', k:'phoenix', h}); ev.push({t:'msg', v:'The Phoenix Feather bursts into flame. You rise!', h}); ev.push({t:'pheal', v:p.hp, h}); }
    else return true;
  }
  return false;
}
function enemiesAct(B, r, belt){
  const ev = [];
  for (const e of alive(B).sort((a, b) => (a.status.slow ? 1 : 0) - (b.status.slow ? 1 : 0))){ if (B.p.hp <= 0) break; enemyAct(B, e, r, ev); }
  const fell = heroTick(B, belt, ev);
  for (const e of B.es) if (e.hp <= 0 && !e.dead){ e.dead = true; ev.push({t:'kill', id:e.id}); }
  if (fell){ B.over = 'lose'; ev.push({t:'lose'}); }
  if (!alive(B).length && !B.over){ B.over = 'win'; ev.push({t:'win'}); }
  return ev;
}
/* a full party round (v8, Pokémon order): every hero and every foe acts in Speed order. Guard, Focus and items go first (priority),
   First Strike heroes next, then everyone by Speed; Slow halves your Speed. Burn and poison tick at the end of the round. */
function speedOf(x, isHero){ const sp = isHero ? (x.spe || x.speed || 50) : foeSt(x).spe; const slow = isHero ? x.st.slow : x.status.slow; return sp * (slow ? 0.5 : 1); }
function partyRound(B, actions, r){
  if (B.over) return []; const ev = [{t:'round', n:B.turn}];
  for (const h of B.heroes) h.guard = false;
  const pri = h => { const a = actions[h.hid] || {}; return a.act === 'guard' || a.act === 'focus' || a.act === 'item' ? 2 : h.first ? 1 : 0; };
  const order = up(B).map(h => ({h, k:pri(h)*1e6 + speedOf(h, true) + r()*0.5})).concat(alive(B).map(e => ({e, k:speedOf(e, false) + r()*0.5}))).sort((a, b) => b.k - a.k);
  for (const o of order){ if (B.over) break; if (!alive(B).length) break; if (!up(B).length) break;
    if (o.h){ const h = o.h; if (h.down || h.hp <= 0) continue; const a = actions[h.hid] || {act:'move', item:0}; use(B, h); ev.push(...heroAction(B, a.act || 'move', a.tgt, r, h.belt, a.item != null ? a.item : 0)); keep(B); continue; }
    const e = o.e; if (e.hp <= 0 || e.dead) continue; const tg = up(B); if (!tg.length) break; const guards = tg.filter(h => h.guard); const pickH = guards.length && r() < 0.3 ? pick(guards, r) : tg[wpick(tg.map(h => 1 + Math.max(0, ab(h, 'taunt'))/100), r)]; use(B, pickH); enemyAct(B, e, r, ev); keep(B);
    for (let k = 0; k < (e.extraActs || 0) && e.hp > 0; k++){ const tg2 = up(B); if (!tg2.length) break; use(B, tg2[wpick(tg2.map(h => 1 + Math.max(0, ab(h, 'taunt'))/100), r)]); enemyAct(B, e, r, ev, true); keep(B); }
    for (const x of B.es) if (x.hp <= 0 && !x.dead){ x.dead = true; ev.push({t:'kill', id:x.id}); } }
  enemyTicks(B, ev);
  if (!alive(B).length){ B.over = 'win'; ev.push({t:'win'}); B.turn++; return ev; }   // bump the round even on the winning blow: clients only play a round whose number is new
  for (const h of B.heroes){ if (h.down) continue; use(B, h); const fell = heroTick(B, h.belt, ev); keep(B); if (fell){ h.down = true; h.hp = 0; ev.push({t:'down', h:h.hid}); ev.push({t:'msg', v:'A hero falls!', h:h.hid});
      if (h.boons.includes('lastbreath')){ ev.push({t:'msg', v:'Last Breath! A final blow strikes every foe.', h:h.hid}); use(B, h); for (const e of alive(B)) dealTo(B, e, 100, r, ev, {noChain:true}); keep(B); } } }
  for (const e of B.es) if (e.hp <= 0 && !e.dead){ e.dead = true; ev.push({t:'kill', id:e.id}); }
  if (!up(B).length){ B.over = 'lose'; ev.push({t:'lose'}); }
  else if (!alive(B).length){ B.over = 'win'; ev.push({t:'win'}); }
  B.turn++; return ev;
}
/* a sensible automatic choice (timed-out players, simulations): heavy hit on one foe, area on many, special when ready */
function autoAct(B, h, r){ const ms = heroMoves(h.w, h.a); const al = alive(B); if (!al.length) return {act:'move', item:0};
  const tgt = al.slice().sort((a, b) => a.hp - b.hp)[0]; const ready = m => m && h.energy >= m.cost && (!m.cd || (h.mcd[m.slot] || 0) <= B.turn);
  if (h.hp < h.max*0.35 && (h.belt.hp2 > 0 || h.belt.hp > 0)) return {act:'item', item: h.belt.hp2 > 0 ? 'hp2' : 'hp', tgt:tgt.id};
  if (al.some(e => e.charging)) return {act:'guard'};
  if (ready(ms[3]) && h.energy >= 60) return {act:'move', item:3, tgt:tgt.id};
  if (al.length >= 2 && ready(ms[1])) return {act:'move', item:1, tgt:tgt.id};
  if (ready(ms[2]) && h.energy >= ms[2].cost + 10) return {act:'move', item:2, tgt:tgt.id};
  return {act:'move', item:0, tgt:tgt.id}; }

// ---------- quests
const TIERS = [null,
  {n:'Easy', pts:1, kinds:['read','order1']},
  {n:'Normal', pts:2, kinds:['blank25','blank33','order2','place1','unscramble','matchQA']},
  {n:'Hard', pts:3, kinds:['blank50','quotes','quoteHint','order3','place2','firstLast','tsRecall','closer','next']},
  {n:'Insane', pts:15, kinds:['spot','sentStarts']},          // about 5× the XP of a Hard quest
  {n:'God', pts:25, kinds:['blankPage']}];                    // write the whole paragraph from memory: rare, likelier before a boss. Every quest is marked automatically.
const MAXTRIES = {next:1, spot:2, photo:2, blankPage:2, handwrite:2, sentStarts:2};
function tierWeights(L){ const x = (L-1)/(Math.max(2, LMAX)-1);
  return [0, Math.max(0.1, 1 - 1.5*x), Math.max(0.35, 1 - Math.abs(x-0.35)*1.6), Math.min(1.2, 0.12 + 1.3*x), 0.05 + 0.1*x, 0.008]; }
const words = s => s.split(/\s+/).filter(Boolean);
const norm = w => w.toLowerCase().replace(/[‘’`]/g,"'").replace(/[“”]/g,'"').replace(/[^a-z0-9']/g,'').replace(/^'+|'+$/g,'');
function quotesOf(u){ const out=[]; u.s.forEach((s,i)=>{ const re=/[“"]([^”"]+)[”"]/g; let m; while((m=re.exec(s))){ if (words(m[1]).length>=2) out.push({i,q:m[1]}); } }); return out; }
function mkQuest(ti, kind, unit, r, bonus){ return {tier:ti, pts:TIERS[ti].pts, kind, unit, seed:Math.floor(r()*1e9), tries:0, maxTries: MAXTRIES[kind] || 3, done:false, passed:false, bonus:!!bonus}; }
function pairsOf(u){ const out = [];
  u.s.forEach((s, si) => { const re = /[“"]([^”"]+)[”"]/g; const ms = []; let m; while ((m = re.exec(s))) ms.push({i:m.index, e:m.index+m[0].length, t:m[0], n:words(m[1]).length});
    ms.forEach((q, k) => { if (q.n < 2) return; const lim = k+1 < ms.length ? ms[k+1].i : s.length; const seg = s.slice(q.e, lim); const lead = seg.match(/^[\s,;:)\]]*(?:and |which |that |as |while )?/)[0];
      let body = seg.slice(lead.length).replace(/\s*\[LTQ\]\s*/g,' ').replace(/[\s.;:,]+$/,''); let w = words(body); if (w.length < 5) return;
      if (w.length > 22){ const cut = body.slice(0, body.split(/\s+/).slice(0,22).join(' ').length); const c2 = cut.lastIndexOf(','); body = c2 > 25 ? cut.slice(0, c2) : cut; }
      const st = q.e + lead.length; out.push({si, q:{text:q.t, start:q.i, end:q.e}, a:{text:body, start:st, end:st+body.length}}); }); });
  return out; }
function rollQuests(L, units, r, last, bonus){
  const out = []; const n = 3 + (bonus?3:0); const usedK = new Set(last||[]);
  for (let i=0;i<n;i++){
    const ti = wpick(tierWeights(L), r);
    const kinds = TIERS[ti].kinds; const kw = kinds.map(k => (usedK.has(k) ? 0.2 : 1) * (out.some(o=>o.kind===k) ? 0.15 : 1));
    let kind = kinds[wpick(kw, r)];
    let u = pick(units, r); for (let g=0; g<4 && out.some(o=>o.unit===u.c); g++) u = pick(units, r);
    if (['quoteHint','quotes','place1','place2'].includes(kind) && quotesOf(u).length < 1){ const qs = units.filter(x=>quotesOf(x).length); if (qs.length) u = pick(qs, r); else kind = 'blank25'; }
    if (kind==='matchQA' && pairsOf(u).length < 2){ const qs = units.filter(x=>pairsOf(x).length >= 2); if (qs.length) u = pick(qs, r); else kind = 'place1'; }
    if (kind==='handwrite' && u.s.length < 3){ const qs = units.filter(x=>x.s.length >= 4); if (qs.length) u = pick(qs, r); }
    out.push(mkQuest(ti, kind, u.c, r, bonus && i>=3));
  }
  // the camp before a boss: 20% chance one quest is a God-tier write-the-paragraph
  if ((isBossL(L) || miniLv().includes(L)) && !out.some(q => q.tier === 5) && r() < 0.2){ const u = units.slice().sort((a, b) => b.s.length - a.s.length)[0]; out[out.length-1] = mkQuest(5, 'blankPage', u.c, r); }
  return out;
}
function lcs(a, b){ const A=a.map(norm).filter(Boolean), B=b.map(norm).filter(Boolean); const n=A.length, m=B.length;
  let prev = new Array(m+1).fill(0);
  for (let i=1;i<=n;i++){ const cur = new Array(m+1).fill(0); for (let j=1;j<=m;j++) cur[j] = A[i-1]===B[j-1] ? prev[j-1]+1 : Math.max(prev[j], cur[j-1]); prev = cur; }
  return {match: prev[m], n, m}; }
function accuracy(typed, target){ const x = lcs(words(typed), words(target)); return x.m ? x.match / Math.max(x.m, x.n) : 0; }
function initials(s){ return words(s).map(w=>{ const m=w.match(/^([^A-Za-z0-9]*)([A-Za-z0-9]?)(.*?)([^A-Za-z0-9]*)$/); return m[1]+m[2]+m[4]; }).join(' '); }
const STOP = new Set('the and that this with from into their which while within when where through about between because these those there them they then than have has had was were will would could should upon only also such its his her him she he our your you are not but for of to in on by as at an a is be it or so yet whose who how what therefore thereby'.split(' '));
const content = s => words(s).map(norm).filter(w => w.length >= 4 && !STOP.has(w));
// Summary: one dot point per sentence, each a genuine condensation (not a copy)
function markSummary(lines, sentences){
  const pts = lines.map(l => l.replace(/^[\s•\-*\d.)]+/, '').trim()).filter(Boolean);
  const res = sentences.map((s, i) => {
    const l = pts[i] || ''; const lw = words(l), sw = words(s);
    if (!l) return {ok:false, why:'missing'};
    if (lw.length > Math.max(14, sw.length*0.5)) return {ok:false, why:'too long (keep it under half the sentence)'};
    if (lw.length < 3) return {ok:false, why:'too short'};
    // copied run of 5+ words?
    const L = lw.map(norm).join(' '), Sx = sw.map(norm);
    for (let k=0;k+5<=Sx.length;k++){ if (L.includes(Sx.slice(k,k+5).join(' '))) return {ok:false, why:'copied 5+ words in a row'}; }
    const cs = new Set(content(s).map(w=>w.slice(0,5))); const hit = content(l).filter(w=>cs.has(w.slice(0,5))).length;
    if (hit < 1) return {ok:false, why:'does not match this sentence’s idea'};
    return {ok:true};
  });
  return {res, score: res.filter(x=>x.ok).length / sentences.length, count: pts.length};
}
// chunks for "place" quests: quotations, and (harder) the analysis clause after each quotation
function placeChunks(u, withAnalysis){
  const out = [];
  u.s.forEach((s, si) => {
    const re = /[“"]([^”"]+)[”"]/g; let m;
    while ((m = re.exec(s))){ if (words(m[1]).length < 2) continue;
      out.push({si, text:m[0], kind:'quote', start:m.index, end:m.index+m[0].length});
      if (withAnalysis){ const rest = s.slice(m.index + m[0].length); const mm = rest.match(/^[,]?\s*((?:where|as|which|revealing|exposing|showing|suggesting|transforming|making|uses?|reduces|embodies|elevates|establish(?:es)?)[^,.;:]{8,120})/);
        if (mm){ const st = m.index + m[0].length + rest.indexOf(mm[1]); out.push({si, text:mm[1], kind:'analysis', start:st, end:st+mm[1].length}); } } }
  });
  return out;
}
function essayText(units){ return units.map(u=>u.s.join(' ')).join(' '); }
return {FK, refAt, expRar, foeSt, gearBS, heroBase, statItem, pkDamage, speedOf, makeArmour0: makeArmour, K, makeTop, tome, makeBoss, makeHealer, kitMoves, makeSupport, DIFFS, setDiff: d => { DIFF = DIFFS[d] ? d : 'hard'; }, get DIFF(){ return DIFF; }, itemTypes: D.itemTypes, get LMAX(){ return LMAX; }, setLMAX: n => { LMAX = n; }, miniLv, makeSpecial, SKILLCOST, opening, rng, pick, wpick, makeWeapon, makeArmour, makeTrinket, starter, essayRelic, derive, eff, canEquip, missing, power, abilOf, rollItem, rollChest, rollConsumable,
        rollPaths, starOdds, xpShares, isBossL, BELTCAP: 5, makeGroup, budget, makeEnemyPub: makeEnemy, XPK, enemyLv, avgPts, gapMod, questXP, killXP, setWeb, setNQ, get NQ(){ return NQ; }, get WEB(){ return WEB; }, refP, legendWeapon, legendArmour, applyLevel, plOf, setPL: x => { PL = Math.max(1, x); }, get PL(){ return PL; }, dropLevel, CURVE, STARp: STAR, scaleForParty, BOSSMOVES, newParty, partyRound: (B, a, r) => { const ev = partyRound(B, a, r); noteDeaths(B); tickBuffs(B); return ev; }, MOVES, MOVECOST, MOVECD, movesOf, heroMoves, autoAct, enemyMoves, EM, heroStatus, foeStatus, T4COST, T4CD, BADST: BAD, GOODST: GOOD, heroHitChance, foeHitChance, heroOf, mkQuest, pairsOf, MAXTRIES, newBattle, playerAct: function(B){ const ev = playerAct.apply(null, arguments); noteDeaths(B); tickBuffs(B); return ev; }, alive, TIERS, tierWeights, rollQuests, quotesOf, accuracy, initials, markSummary, placeChunks, essayText,
        words, norm, setEXP: e => { EXP = e; }, getUID: () => UID, setUID: n => { UID = n; }};
})(DATA);
