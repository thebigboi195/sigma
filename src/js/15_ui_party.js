
/* ===== Essay Quest v3 UI ===== */
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const C = CORE, Dd = DATA, WD = Dd.WORLDS;
const WEB_ED = typeof window !== 'undefined' && !!window.EQ_WEB; if (WEB_ED) C.setWeb(true);   // web edition: one 50-level run, online only
/* ---------- essays: built-in or the player's own (pasted, split into paragraphs + sentences) ---------- */
const ESSAYS_KEY = 'eq5_essays';
function myEssays(){ try { return JSON.parse(localStorage.getItem(ESSAYS_KEY)||'{}') || {}; } catch(e){ return {}; } }
function customUnits(){ const E = myEssays(); return Object.values(E).flatMap(x => (x && x.units) || []); }
function activeUnits(){ if (S && S.essaySrc === 'mine'){ const cu = customUnits(); const mods = new Set(cu.map(u => u.e)); return UNITS.filter(u => !mods.has(u.e)).concat(cu); } return UNITS; }
const webUnits = () => { const E = myEssays(); return S && S.essaySrc === 'mine' && E.web && E.web.units && E.web.units.length ? E.web.units : UNITS.filter(u => u.e === WD[0].essay); };
const unitsOf = w => WEB_ED ? webUnits() : activeUnits().filter(u => u.e === WD[w].essay);
const unitBy = c => activeUnits().find(x => x.c === c) || UNITS.find(x => x.c === c) || customUnits().find(x => x.c === c);
function splitSentences(p){ const toks = p.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean); const out = []; let cur = '';
  const ABBR = /^(?:Mr|Mrs|Ms|Dr|St|Jr|Sr|vs|etc|e\.g|i\.e|cf|pp?|ch|vol|no|Fig|al|ed|eds|Ed)\.$/i;
  for (let i=0;i<toks.length;i++){ const w = toks[i]; cur += (cur ? ' ' : '') + w; const bare = w.replace(/["”’')\]]+$/, '');
    const end = /[.!?]$/.test(bare) && !/(\.\.\.|…)$/.test(bare); const initials = /^(?:[A-Z]\.){1,3}$/.test(bare); const next = toks[i+1];
    if (end && !ABBR.test(bare) && !initials && (!next || /^["“‘(\[]?[A-Z0-9]/.test(next))){ out.push(cur); cur = ''; } }
  if (cur) out.push(cur); return out; }
function parseEssay(text, key){ const L = {common:'C', moda:'A', modb:'B', modc:'M', web:'W'}[key]; let paras = text.replace(/\r/g, '').split(/\n\s*\n/).map(x => x.trim()).filter(Boolean);
  if (paras.length === 1 && /\n/.test(paras[0])) paras = paras[0].split(/\n/).map(x => x.trim()).filter(Boolean);
  const n = paras.length; return paras.map((para, i) => ({c:`U${L}-${i+1}`, e:key, n: key==='modc' ? `Part ${i+1}` : n >= 3 ? (i===0 ? 'Introduction' : i===n-1 ? 'Conclusion' : `Body ${i}`) : `Paragraph ${i+1}`, s: splitSentences(para), mine:true})).filter(u => u.s.length); }
const STATS = {STR:'Strength: +2.5% damage each', AGI:'Agility: +0.4% dodge (max 10% at 25 AGI), +0.2% crit and faster initiative each', FOR:'Fortitude: +5 max HP each', WPN:'Weapon: unlocks better weapons; +1% damage per point above the requirement'};
const QN = {sentStarts:'First letter of every sentence → write it all', read:'Read it through', order1:'Logical progression (sentences)', order2:'Logical progression (half-sentences)', order3:'Logical progression (thirds)', summary:'Dot-point summary',
  next:'Flashcard: what comes next?', unscramble:'Unscramble the sentence (phrases)', spot:'Spot the 4 changed words', tsRecall:'Recall the topic sentence', closer:'Recall the linking sentence', missing:'Fill the missing sentence',
  blank25:'Fill the gaps (a quarter, word bank)', blank33:'Fill the gaps (a third of the words)', blank50:'Fill the gaps (half the words)', blank85:'Fill the gaps (almost every word)', quoteHint:'Quote recall (first word given)', quotes:'Quote recall',
  place1:'Place the quotations', place2:'Place quotations + analysis', placeEssay:'Place quotations across the whole essay', letters1:'First letters, one sentence at a time', letters:'First letters → whole paragraph word for word',
  chain:'Chain recall (each sentence cues the next)', ltq:'LTQ for an HSC-style question', photo:'Handwritten paragraph (photo)', recall:'Write it from the topic sentence', blankPage:'God trial: write the whole paragraph from memory', firstLast:'Whole paragraph: first + last letters given', firstOnly:'Whole paragraph: first letters given', matchQA:'Match the analysis to its quotation', handwrite:'Handwriting reps (photo)'};
const hintOf = t => C.words(t).map((w,i) => i % 3 === 0 ? w : w.replace(/[A-Za-z0-9’']/g, '_')).join(' ');
const halfOf = t => { const w = C.words(t); return w.slice(0, Math.ceil(w.length/2)).join(' ') + ' …'; };
const firstHint = w => w ? w[0] + '_'.repeat(Math.max(1, w.length-1)) : '';
const TIERC = ['', '#9fe0a0', '#7fc0ff', '#c79bff', '#ff9a6b', '#ffe27a'];
/* the belt holds at most BELTCAP of each consumable; extras melt into Ink */
const BELTCAP = C.BELTCAP; function addBelt(k, n=1){ const have = S.belt[k]||0, room = Math.max(0, BELTCAP - have), put = Math.min(room, n); S.belt[k] = have + put; if (n > put){ S.ink = (S.ink||0) + 10*(n-put); } return put; }
let S = null, BAT = null, SEL = null, campTab = 'gear', busy = false, sceneKey = '';
const clone = o => JSON.parse(JSON.stringify(o));
const fresh = () => { const s0 = C.starter(); return {v:3, world:0, level:1, hlv:1, xp:0, phase:'title', st:{STR:0,AGI:0,FOR:0,WPN:0}, pts:0, hp:null, ink:20,
  bag:[s0.weapon, s0.armour], eq:{weapon:s0.weapon.uid, armour:s0.armour.uid, trinkets:[null,null]}, belt:{hp:2}, souls:0, paths:null, path:null, quests:null, lastKinds:[],
  snap:null, cp:null, checkpointOn:false, cleared:[false,false,false,false], essay:null, deaths:0, mastery:{}, inspired:0, newLoot:[], chest:null, uid:C.getUID(), wins:0, rested:false,
  meta:{wisdom:0, owned:[], equipped:[]}, half:false}; };
const BUILD = 4;
let SLOT = null; const SKEY = n => 'eq4_slot_' + n;
let SET = {muted:false, music:0.55, sfx:0.8, motion:true}; try { SET = Object.assign(SET, JSON.parse(localStorage.getItem('eq4_settings')||'{}')); } catch(e){}
function saveSet(){ try { localStorage.setItem('eq4_settings', JSON.stringify(SET)); } catch(e){} SND.setVol(SET.music, SET.sfx, SET.muted); }
function readSlot(n){ try { const s = JSON.parse(localStorage.getItem(SKEY(n))||'null'); return s && s.v===3 ? s : null; } catch(e){ return null; } }
function loadSlot(n, len){ SLOT = n; const s = readSlot(n); if (s){ S = s; C.setUID(Math.max(S.uid||5000, C.getUID())); } else { S = fresh(); S.build = BUILD; S.created = Date.now(); S.len = len || 30; }
  C.setLMAX(S.len || 30); migrateHero(); migrateItems(); syncPL(); if (S.phase === 'quest' && (!S.quests || !S.quests[S.qi] || S.quests[S.qi].done)) S.phase = S.quests ? 'quests' : 'camp'; S.stats = S.stats || {units:{}, time:0, quests:0, perfects:0, quotePerf:0, kills:{}, found:{}, bosses:[], ach:[], title:''}; daily(); }
const dayStr = d => d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
function daily(){ const today = dayStr(new Date()); const D = S.daily = S.daily || {last:null, streak:0}; if (D.last === today) return;
  const yest = dayStr(new Date(Date.now() - 864e5)); D.streak = D.last === yest ? D.streak + 1 : 1; D.last = today;
  const ink = 20 + 5*Math.min(D.streak, 10), wis = 3*Math.min(D.streak, 10); S.ink += ink; S.meta.wisdom += wis; S.belt.hp = (S.belt.hp||0) + 1; let extra = '';
  if (D.streak % 7 === 0){ const it = C.rollItem(Math.random, S.world, 4); S.bag.push(it); if (S.stats) noteFind(it); S.newLoot.push(it.uid); extra = ` and a ${Dd.RAR[it.rar].n} ${it.name}`; }
  S.dailyMsg = `Day ${D.streak} streak! Daily chest: +${ink} Ink, +${wis} Wisdom, a Health Potion${extra}.`; }
function loadLegacy(){ try { const s = null; if (s && s.v===3){ S = s; C.setUID(S.uid || 5000);
  if (S.build !== BUILD){ // save from an older version: re-roll quests with the new rules, drop old-rule buffs and items
    S.build = BUILD; S.inspired = 0; S.inspDone = false; S.souls = 0;
    if (S.quests){ S.quests = null; if (['quests','quest'].includes(S.phase)) { S.phase = 'camp'; S.resume = 'camp'; } }
    if (!S.cleared[0] && S.belt.phoenix){ S.belt.hp2 = (S.belt.hp2||0) + S.belt.phoenix; delete S.belt.phoenix; }
    S.updated = true; save(); }
  return; } } catch(e){} S = fresh(); S.build = BUILD; }
function save(){ if (S && S.party){ try { localStorage.setItem('eq5_party', JSON.stringify({code: PARTY.code, S})); if (S.meta) localStorage.setItem('eq5_partymeta', JSON.stringify({wisdom: S.meta.wisdom, owned: S.meta.owned, equipped: S.meta.equipped})); } catch(e){} return; } if (SLOT == null || !S) return; S.uid = C.getUID(); S.played = Date.now(); try { localStorage.setItem(SKEY(SLOT), JSON.stringify(S)); } catch(e){} }
const item = uid => uid==null ? null : S.bag.find(i => i.uid === uid) || null;
const P = () => ({lv:S.hlv||1, st:S.st, boons:S.meta.equipped, eq:{weapon:item(S.eq.weapon), armour:item(S.eq.armour), trinkets:S.eq.trinkets.map(item)}});
const maxHP = () => C.derive(P()).max;
const curHP = () => { const m = maxHP(); if (S.hp == null || S.hp > m) S.hp = m; return S.hp; };
/* hero level + gear growth: every level the hero gains, equipped gear gains too (if you meet its new requirement) */
const heroPL = () => S.hlv || 1;
const foeLv = () => C.enemyLv(S.world, S.level);
/* study XP → hero levels: each level is +3 stat points, a 20% heal, and your equipped gear grows one level */
function gainXP(xp){ S.xp = (S.xp||0) + xp; let ups = 0; while (S.xp >= C.XPK.perLevel){ S.xp -= C.XPK.perLevel; S.hlv = (S.hlv||1) + 1; S.pts += C.XPK.sp; ups++; growGear(1); S.hp = Math.min(maxHP(), curHP() + Math.round(maxHP()*0.2)); } if (ups){ syncPL(); setTimeout(() => toast(`⬆ Level up! Hero Lv ${S.hlv} (+${C.XPK.sp*ups} stat points)`), 500); SND.sfx('level'); } return ups; }
function syncPL(){ if (S && S.bag) C.setPL(heroPL()); }
function growGear(steps){ if (!(steps > 0)) return; const grown = [], held = [];
  for (const uid of [S.eq.weapon, S.eq.armour, ...S.eq.trinkets]){ const it = item(uid); if (!it || it.kind === 'consumable') continue; let ok = 0;
    for (let i=0;i<steps;i++){ C.applyLevel(it, (it.lvl||1) + 1); ok++; } if (!C.canEquip(P(), it)){ it.grand = true; held.push(it.name); }
    if (ok) grown.push(`${it.name} → Lv ${it.lvl}`); }
  S.growMsg = (grown.length ? 'Your gear grew with you: ' + grown.join(' · ') + '.' : '') + (held.length ? ' (' + held.join(', ') + ' now needs more stats to re-equip, but stays on you until you take it off.)' : ''); }
const GONE_KINDS = ['summary','handwrite','photo','recall','ltq','firstOnly','letters','letters1','blank85','placeEssay','missing','chain'];
function migrateHero(){ if (!S) return; if (S.hlv == null){ S.hlv = Math.max(1, C.plOf(S.world||0, S.level||1)); S.xp = 0; }
  if (S.quests && S.quests.some(q => q.tier > 3 || GONE_KINDS.includes(q.kind))) { S.quests = S.quests.filter(q => q.tier <= 3 && !GONE_KINDS.includes(q.kind)); if (!S.quests.length) S.quests = null; } }
function migrateItems(){ for (const it of (S.bag||[])) if (it && it.kind !== 'consumable' && it.lvl == null) C.applyLevel(it, (it.world||0)*30 + 1); }
const stars = n => n > 5 ? '★'.repeat(n) : '★'.repeat(n) + '☆'.repeat(5-n);
const dungeonName = (w, pth) => pth.kind === 'god' && pth.key ? 'Temple of ' + Dd.ENEMIES[pth.key][0].split(',')[0] : pth.kind === 'promised' ? (Dd.PROMISED_DUOS[pth.key] || Dd.PROMISED_DUOS[0]).name : pth.kind === 'outer' ? 'The ' + Dd.ENEMIES[pth.key][0].replace(/^The /, '').split(',')[0] : pth.final ? 'The Final Examination' : WD[w].dungeons[pth.theme];
const slotsUsed = () => S.meta.equipped.reduce((a,id) => a + (Dd.BOONS.find(b=>b[0]===id)||[0,0,0])[2], 0);

/* ---------- AI marking ---------- */
let SAMPLE;
async function sampler(){ if (SAMPLE !== undefined) return SAMPLE; try { SAMPLE = (window.claude && await window.claude.use('sample')) || null; } catch(e){ SAMPLE = null; } return SAMPLE; }

/* ---------- stage ---------- */
function syncScene(){
  const ph = S.phase; let key = ph, opts = {world:S.world, theme:S.path ? S.path.theme : 0, P:P()};
  if (['camp','quests','quest','dead','event'].includes(ph)) key = 'camp:' + S.world + ':' + opts.theme;
  if (ph==='battle' && BAT) { key = 'battle:' + BAT.id; opts.enemies = BAT.B.es; }
  if (ph==='chest') { key = 'chest:' + S.level; opts.rar = Math.max(0, ...(S.chest||[]).map(i => i.rar || 0)); }
  if (['map','carry','done'].includes(ph)) key = 'map:' + S.world + ':' + (S.paths ? S.paths[0].theme : 0);
  if (ph==='title') { key = 'title'; opts.world = 0; opts.demo = {id:777, key:'goblin', name:'', art:'goblin', color:'#7cae3e', trait:'swift'}; }
  if (key !== sceneKey){ sceneKey = key; const kind = key.split(':')[0]; ART3D.setScene(kind==='camp' ? 'camp' : kind, opts); if (kind==='chest') setTimeout(() => { ART3D.openChest(); SND.sfx('chest'); }, 500); }
  const mus = ph==='title' ? 'title' : ph==='map' || ph==='carry' || ph==='done' ? 'map' : ph==='quest' ? 'quest' : ph==='battle' ? (BAT && BAT.B.es.some(e=>e.boss||e.mini) ? 'boss' : 'battle') : ['camp','quests','event'].includes(ph) ? 'camp' : null;
  if (mus) SND.music(mus);
}
function float(t, who, col, big){ const p = ART3D.screenPos(who); if (!p) return; const d = document.createElement('div'); d.className = 'float' + (big ? ' big' : ''); d.textContent = t; d.style.color = col;
  d.style.left = (p.x + (Math.random()*6-3)) + '%'; d.style.top = (p.y + 2) + '%'; $('fx').appendChild(d); setTimeout(() => d.remove(), 1100); }
const tyIcon = t => { const i = Dd.TYPE_INFO[t] || Dd.TYPE_INFO.normal; return `<i class="tyi" style="--tc:${i[2]}" title="${i[0]}">${i[1]}</i>`; };
const tyRow = a => `<div class="tyrow">${(a || []).map(tyIcon).join('')}</div>`;
const eTypes = e => e.types && e.types.length ? e.types : Dd.enemyTypes(e.key, e.name, e.art);
function dock(L){ const m = L.length || 1; try { $('ov').style.setProperty('--pw', Math.max(13, Math.min(17, 150/Math.max(5, m))) + '%'); } catch(e){} return unclash(L); }
function unclash(list){ list.sort((a,b) => a.y - b.y); for (let i=0;i<list.length;i++) for (let j=0;j<i;j++){ const a = list[i], b = list[j]; if (Math.abs(a.x - b.x) < 15 && Math.abs(a.y - b.y) < 12) a.y = b.y + 12; } return list; }
function plates(){
  const ov = $('ov'); if (S.phase !== 'battle' || !BAT){ if (ov.innerHTML) ov.innerHTML = ''; return; } const B = BAT.B;
  const hp = (v,m,col) => `<div class="hpbar"><i style="width:${Math.max(0,v/m*100)}%;background:${col}"></i></div><div class="hpt">${v} / ${m}</div>`;
  const L = []; const pp = ART3D.screenPos('p') || {x:22, y:30};
  L.push({r:'h',x:pp.x, y:Math.max(10, pp.y), h:(x,y) => `<div class="plate me" style="left:${x}%;top:${y}%"><b>You <small>Lv ${S.hlv||1}</small></b>${tyRow(Dd.itemTypes(P().eq.armour))}${hp(dPHP(B), B.p.max, '#4cd46b')}<div class="enbar"><i style="width:${B.p.energy}%"></i></div><div class="hpt">⚡ ${B.p.energy}/100 energy</div><div class="chips">${B.focus?'<span>Focused</span>':''}${B.p.buff.str?'<span>Strength</span>':''}${B.p.buff.iron?'<span>Iron-skin</span>':''}${B.p.buff.smoke?'<span>Smoke</span>':''}${heroChips(B.p.st)}${BAT.insp?`<span>Inspired +${BAT.insp*10}%</span>`:''}</div></div>`});
  B.es.forEach(e => { if (dHP(e) <= 0 && e.hp <= 0) return; const sp = ART3D.screenPos(e.id); if (!sp) return;
    L.push({r:'e',x:Math.min(88, Math.max(12, sp.x)), y:Math.max(10, sp.y), h:(x,y) => `<button class="plate en ${SEL===e.id?'sel':''} ${e.boss?'boss':''}" data-id="${e.id}" style="left:${x}%;top:${y}%"><b>${esc(e.name)} <small>Lv ${e.lv||''}</small></b>${tyRow(eTypes(e))}${hp(dHP(e), e.max, e.boss?'#ff4d6d':'#ff9a3c')}
      <div class="chips"><span>${esc((Dd.TRAITS[e.trait]||'').split(':')[0])}</span>${e.charging?'<span class="b">CHARGING</span>':''}${e.exposed?'<span class="g">EXPOSED</span>':''}${e.guard?'<span>Guarding</span>':''}${foeChips(e.status)}${e.enraged?'<span class="b">Enraged</span>':''}</div></button>`}); });
  const h = dock(L).map(o => o.h(Math.round(o.x*10)/10, Math.round(o.y*10)/10)).join('');
  if (ov.dataset.h !== h){ ov.innerHTML = h; ov.dataset.h = h; ov.querySelectorAll('.en').forEach(b => b.onclick = () => { SEL = +b.dataset.id; SND.sfx('click'); plates(); }); }
}
setInterval(() => APP === 'party' ? PARTY.plates() : plates(), 120);

/* ---------- HUD ---------- */
function hud(){
  if (APP !== 'game' && !(APP === 'party' && S && S.party && PARTY.G && PARTY.G.ph !== 'lobby')){ $('hud').innerHTML = APP === 'party' && PARTY.on ? `<span class="pill w">Party ${esc(PARTY.code)}</span>${PARTY.adminOK ? '<button class="ghost mute" id="adm">🛠</button>' : ''}<button class="ghost mute" id="home">⌂ Leave</button>` : ''; if ($('home')) $('home').onclick = goHome; if ($('adm')) $('adm').onclick = () => PARTY.admin(); return; }
  if (S.phase==='title' && APP !== 'party'){ $('hud').innerHTML = `<button class="ghost mute" id="home">⌂ Home</button><button class="ghost mute" id="mute">${SND.muted?'Sound off':'Sound on'}</button>`; $('mute').onclick = muteBtn; $('home').onclick = goHome; return; }
  const d = C.derive(P()); const h = curHP();
  $('hud').innerHTML = `${APP==='party'?`<span class="pill hot">Party ${esc(PARTY.code)}</span>`:''}<span class="pill w">${esc(WD[S.world].name)} · ${APP==='party'?'Round':'Lv'} ${S.level}/${C.LMAX}</span><span class="pill hero xpp"><i style="width:${Math.min(100, S.xp||0)}%"></i><b>Hero Lv ${heroPL()} · ${Math.round(S.xp||0)}/100 XP</b></span><span class="pill hpp"><i style="width:${h/d.max*100}%"></i><b>♥ ${h}/${d.max}</b></span>
   <span class="pill">STR ${d.s.STR}</span><span class="pill">AGI ${d.s.AGI}</span><span class="pill">FOR ${d.s.FOR}</span><span class="pill">WPN ${d.s.WPN}</span>
   <span class="pill ink">✒ ${S.ink} Ink</span><span class="pill wis">✦ ${S.meta.wisdom} Wisdom</span>
   ${S.inspired?`<span class="pill insp">Inspired ×${S.inspired}</span>`:''}${S.pts?`<span class="pill hot">${S.pts} point${S.pts>1?'s':''} to spend</span>`:''}${APP==='party' && PARTY.adminOK ? '<button class="ghost mute" id="adm">🛠</button>' : ''}<button class="ghost mute" id="home">${APP==='party'?'⌂ Leave':'⌂ Home'}</button><button class="ghost mute" id="mute">${SND.muted?'Sound off':'Sound on'}</button>`;
  $('mute').onclick = muteBtn; $('home').onclick = goHome; if ($('adm')) $('adm').onclick = () => PARTY.admin();
}
function muteBtn(){ SET.muted = !SET.muted; saveSet(); hud(); }

/* ---------- item cards ---------- */
/* ---------- moves and status chips (shared by solo and party battles) ---------- */
const ARCHN = {tome:'mana tome (support)', grimoire:'frost grimoire (support)', psalter:'warding psalter (support)', lyre:'war lyre (support)', fist:'fist weapon', blade:'blade', pole:'polearm', ranged:'ranged', heavy:'heavy weapon', scythe:'scythe', katana:'katana', staff:'staff', thrown:'thrown'};
const MTYPE = ['', 'Basic', 'Multi', 'Heavy', 'Special'];
function moveInfo(m){ return `${m.cost ? m.cost + ' energy' : '+' + (m.gain||15) + ' energy'} · ${m.acc}% acc${m.cd ? ' · every ' + m.cd + ' rds' : ''}`; }
function moveListHTML(w){ const ms = C.heroMoves(w); if (!ms.length) return ''; const my = (w.rar||0) >= 4;
  return `<div class="movelist">${ms.map(m => `<div class="t${m.type}"><b>${m.type}. ${esc(m.n)}</b> <small>(${MTYPE[m.type]}${m.type===1 && m.rider ? ', Mythical' : m.type===4 && m.sig ? (my ? ', Mythical' : ', Legendary') : ''} · ${moveInfo(m)})</small> ${esc(m.d)}</div>`).join('')}</div>`; }
/* what colour does an attack feel like? (frost lance = blue, firebomb = orange, ...) */
function elementOf(m, w){ w = w || {}; const byWords = str => { for (const [re, e] of Dd.EL_WORDS) if (re.test(str || '')) return e; return null; }; let el = byWords(m && m.n);
  if (!el && m && m.rider) el = {burn:'fire', stun:'thunder', poison:'poison', blind:'holy', slow:'ice', steal:'blood', chain:'thunder', energy:'arcane'}[m.rider] || null;
  if (!el && (w.myth || w.special)) el = Dd.FX_ELEMENT[w.fx] || null; if (!el) el = byWords(w.name); if (!el && w.rar >= 5 && w.myth) el = Dd.FX_ELEMENT[w.fx] || (w.rar === 6 ? 'cosmic' : 'meme');
  if (w.world === 3 && !w.myth && (!el || el === 'earth')) el = 'ice'; if (!el) el = (!w.myth && Dd.WORLD_ELEMENT[w.world || 0]) || 'phys'; return el; }
function targetTypesNow(){ try { if (APP === 'party') return window.__ptt ? window.__ptt() : null; const L = BAT ? BAT.B.es : []; const e = L.find(x => x.id === SEL && x.hp > 0) || L.find(x => x.hp > 0); return e ? eTypes(e) : null; } catch(err){ return null; } }
function effOf(ty, defs){ if (!defs) return 1; return Dd.typeMul(ty, defs); }
function moveBtns(ms, energy, mcd, turn, lock, myth, wpn){ const tt = targetTypesNow(); const arm = (typeof P === 'function' && S && S.eq) ? null : null; return ms.map(m => { const ty = m.ty || 'normal', TI = Dd.TYPE_INFO[ty] || Dd.TYPE_INFO.normal; const mult = effOf(ty, tt); const ec = mult >= 1.9 ? 'se' : mult <= 0.26 ? 'imm' : mult <= 0.6 ? 'nve' : '';
  const cdLeft = m.cd && (mcd[m.slot] || 0) > turn ? (mcd[m.slot] - turn) : 0; const short = energy < (m.cost||0); const ok = !lock && !short && !cdLeft;
  const why = cdLeft ? `Ready in ${cdLeft} round${cdLeft>1?'s':''}` : short ? `Needs ${m.cost} energy (you have ${energy})` : '';
  const effTxt = ec === 'se' ? `Super effective ×${mult}` : ec === 'imm' ? `Barely affects it ×${mult}` : ec === 'nve' ? `Not very effective ×${mult}` : '';
  return `<button class="mvb t${m.type}${myth && (m.type===4 || (m.type===1 && m.rider)) ? ' myth' : ''} ${ec}" data-el="${ty}" style="--ec:${TI[2]}" data-slot="${m.slot}" ${ok ? '' : 'disabled'}><span class="ty">${m.type}. ${MTYPE[m.type]}${myth && (m.type===4 || (m.type===1 && m.rider)) ? ' · Mythical' : ''}</span><span class="el"><i class="tyi" style="--tc:${TI[2]}">${TI[1]}</i> ${TI[0]}-type</span><b>${esc(m.n)}</b>
    <span class="st"><i>⚔ ${esc(m.dmg||'')}</i><i>🎯 ${m.acc}%</i><i>⚡ ${m.cost ? m.cost : '+' + (m.gain||15)}</i>${m.cd ? `<i>⟳ ${m.cd} rds</i>` : ''}</span>${effTxt ? `<span class="efx ${ec}">${effTxt}</span>` : ''}<small class="ef">${esc(m.d)}</small>${why ? `<em class="why">${why}</em>` : ''}</button>`; }).join(''); }
const STN = {burn:'Burn', poison:'Poison', freeze:'Frozen', blind:'Blind', slow:'Slow', weak:'Weak', vuln:'Exposed', recharge:'Recharge', empower:'Empowered', swift:'Swift', enlight:'Enlightened', god:'GODHOOD'};
function heroChips(st){ return Object.keys(st||{}).filter(k => STN[k] && st[k] > 0).map(k => `<span class="s-${k}" title="${esc(Dd.STATUS_TEXT[k]||'')}">${STN[k]}${st[k] > 1 && k !== 'freeze' && k !== 'recharge' ? ' ' + st[k] : ''}</span>`).join(''); }
function foeChips(s){ s = s || {}; let h = ''; for (const k of ['burn','poison','blind','slow','weak','vuln','empower']) if (s[k] > 0) h += `<span class="s-${k}" title="${esc(Dd.STATUS_TEXT[k]||'')}">${STN[k]}</span>`; if (s.stun) h += '<span class="s-freeze">Stunned</span>'; if (s.dodge > 0) h += `<span class="s-dodge">Dodge ${Math.round(s.dodge*100)}%</span>`; return h; }
function abilLines(it){ const L = []; (it.abil||[]).forEach(([a,v]) => L.push(Dd.ABIL_TEXT[a].replace('{v}', v))); if (it.down) L.push(Dd.ABIL_TEXT[it.down[0]].replace('{v}', it.down[1]));
  if (it.kind==='trinket') L.push(it.eff==='BOSSBANE' ? `Each hit on a boss deals at least ${it.v}% of its max HP` : Dd.TRINKET_TEXT[it.eff].replace('{v}', it.v)); return L; }
function sellVal(it){ return 5 + (it.rar||0)*8 + Math.floor((it.lvl||1)/5); }
function card(it, actions='', compare=null){
  if (!it) return `<div class="card empty">Empty slot</div>`;
  if (it.kind==='consumable'){ const c = Dd.CONSUMABLES[it.key]; return `<div class="card" style="--rc:#7fe0a0"><div class="rar">Consumable</div><div class="nm">${esc(c.n)}</div><div class="sm">${esc(c.d)}</div></div>`; }
  if (it.kind==='tome') return `<div class="card r3" style="--rc:#c9a2ff"><div class="rar">Wisdom</div><div class="nm">${esc(it.name)}</div><div class="sm">+${it.wis} Wisdom (kept forever, spend it on Boons)</div></div>`;
  if (it.kind==='soul') return `<div class="card r3" style="--rc:#ff8a3c"><div class="rar">Boss Soul</div><div class="nm">${esc(it.name)}</div><div class="sm">Spend at the Forge in camp to craft Legendary gear.</div></div>`;
  const r = Dd.RAR[it.rar]; const main = it.kind==='weapon' ? `${it.dmg} damage · ${ARCHN[it.arch] || it.arch}` : it.kind==='armour' ? `+${it.hp} HP · ${it.role==='plate'?'heavy plate':it.role==='leather'?'coat / leathers':it.role==='vestment'?'healer vestments (support)':'robe / suit'}` : '';
  const req = Object.entries(it.req||{}).map(([k,v]) => `${k} ${v}`).join(' · '); const miss = C.missing(P(), it);
  let delta = ''; if (compare){ const d = it.kind==='weapon' ? it.dmg - compare.dmg : it.kind==='armour' ? it.hp - compare.hp : null; if (d !== null) delta = `<span class="${d>=0?'up':'dn'}">${d>=0?'▲':'▼'} ${Math.abs(d)} vs equipped</span>`; }
  const from = (it.world !== S.world && it.ti !== -1) ? `<span class="from">· ${esc(WD[it.world].name)}</span>` : '';
  return `<div class="card r${it.rar}${it.special?' special':''}${it.myth?' myth':''}" style="--rc:${r.c}"><div class="rar">${it.lvl ? `<span class="lvl">Lv ${it.lvl}</span> ` : ''}${r.n} ${it.kind}${it.myth ? ' · ' + esc(it.origin) + ' legend' : it.type?' · '+esc(it.type):''} ${from}</div><div class="nm">${esc(it.name)}</div>${it.kind==='weapon'||it.kind==='armour' ? tyRow(Dd.itemTypes(it)) : ''}${main?`<div class="sm">${main}</div>`:''}${it.kind==='weapon' ? moveListHTML(it) : ''}
    ${abilLines(it).map(l=>`<div class="ab ${l.startsWith('DOWNSIDE')?'down':''}">${esc(l)}</div>`).join('')}${it.lore?`<div class="lore">${esc(it.lore)}</div>`:''}${req?`<div class="req ${miss.length?'no':''}">Needs ${req}${miss.length?' (missing '+miss.join(', ')+')':''}</div>`:''}${delta}${actions}</div>`;
}

/* ---------- flow ---------- */
function go(ph){ S.phase = ph; save(); draw(); }
let APP = 'home';
function goHome(){ if (APP === 'party' && PARTY.on){ const b = $('home'); if (b && !b.dataset.sure){ b.dataset.sure = 1; b.textContent = 'Leave the party? Tap again'; return; } PARTY.leave().then(() => { S = fresh(); APP = 'home'; draw(); }); return; } save(); BAT = null; APP = 'home'; draw(); }
function draw(){ if (WEB_ED && APP !== 'party' && APP !== 'settings') APP = 'party'; hud(); const p = $('panel'); if (APP === 'home') return homeScreen(p); if (APP === 'settings') return settingsScreen(p); if (APP === 'essays') return essaysScreen(p); if (APP === 'party') return PARTY.draw(); syncPL(); const ph = S.phase; syncScene();
  ({title:titleScreen, map:mapScreen, camp:campScreen, quests:questsScreen, quest:()=>runQuest(S.qi), battle:battleScreen, chest:chestScreen, dead:deadScreen, carry:carryScreen, done:doneScreen, event:eventScreen}[ph] || titleScreen)(p); }
document.addEventListener('pointerdown', () => SND.ensure(), {once:false});
function titleScreen(p){
  const started = !!S.snap;
  const dm = S.dailyMsg ? `<p class="ok">${esc(S.dailyMsg)}</p>` : ''; S.dailyMsg = null;
  p.innerHTML = dm + `<div class="title"><h1>Essay Quest</h1><p>Study at camp to grow stronger. Choose your path. Survive the boss. Your Wisdom and Boons are permanent; everything else is on the line.</p></div>
   <div class="worlds">${WD.map((w,i)=>{ const cur = started && S.world===i && !S.cleared[i]; const open = cur || (!started && i===0) || (started && S.cleared[S.world] && i===S.world+1);
     return `<button class="world w${i}" ${open?'':'disabled'} data-w="${i}"><b>${i+1} · ${esc(w.name)}</b><span>${esc(w.sub)}</span><em>${S.cleared[i]?'Cleared ✓':cur?`Continue · level ${S.level}`:open?'Enter':'Locked'}</em></button>`; }).join('')}</div>
   <div class="row"><button class="ghost" id="how">How to play</button><button class="ghost" id="reset">New game</button></div><div id="howto"></div>`;
  p.querySelectorAll('.world').forEach(b => b.onclick = () => { SND.sfx('click'); const w = +b.dataset.w; if (started && S.world===w && !S.cleared[w]) go(S.resume || 'map'); else enterWorld(w); });
  $('reset').onclick = () => { const b = $('reset'); if (b.dataset.sure){ const meta = S.meta; S = fresh(); if (b.dataset.keep) S.meta = meta; save(); draw(); } else { b.dataset.sure = 1; b.textContent = 'Tap again: this wipes your save'; } };
  $('how').onclick = () => $('howto').innerHTML = HOWTO();
  const __old = () => `<div class="box">
    <p><b>Each level:</b> choose one of three paths (more ★ = harder fight, richer chest; ★★★★★ can drop Mythical gear; <b>?</b> paths are events) → camp: rest (heals 30%), equip gear, spend points, shop, forge, boons → three study quests → the encounter.</p>
    <p><b>Quests</b> run Easy → Normal → Hard → Insane → God, and every one is marked automatically. Insane quests are worth about five Hard ones; a rare God trial (write the whole paragraph) is worth even more and turns up most often before bosses. Pass mark 85%, three tries. Each pass also heals you 10% and earns Ink (to spend) and Wisdom (permanent). A perfect score makes you <b>Inspired</b>: +10% damage next fight.</p>
    <p><b>Your HP carries between fights.</b> In battle: tap an enemy to target it. Attack opens your weapon’s 4 moves: the free Basic move builds energy, Multi, Heavy and Special moves spend it, and attacks can miss or inflict burn, poison, freeze, blind and slow; Focus gives +45 energy and a stronger next hit; Guard blocks charged attacks. Faster enemies strike first: Agility helps.</p>
    <p><b>Bosses have tricks.</b> The Watcher hides behind guards, Prospero heals, the Shadow leaves an opening after its big attack, the Wyrm freezes you. Mini-boss at level 10, boss at 20. At the level-20 camp you can write your whole essay for a boss-slaying relic.</p>
    <p><b>Dying</b> restarts the world with the stats and gear you entered with (or from level 10 if you turn on the checkpoint in Settings). Wisdom and Boons are kept forever.</p></div>`;
}
function enterWorld(w){ Object.assign(S, {world:w, level:1, quests:null, paths:null, path:null, essay:null, inspired:0, resume:'map', cp:null, hp:null, rested:false});
  S.snap = clone({st:S.st, pts:S.pts, bag:S.bag, eq:S.eq, belt:S.belt, ink:S.ink, souls:S.souls, hlv:S.hlv, xp:S.xp}); go('map'); }
function mapScreen(p){
  if (!S.paths){ S.paths = C.rollPaths(Math.random, S.level, S.world); S.rested = false; if (C.miniLv().includes(S.level) && (!S.cp || S.cp.level < S.level)) S.cp = clone({st:S.st, pts:S.pts, bag:S.bag, eq:S.eq, belt:S.belt, ink:S.ink, souls:S.souls, level:S.level, hlv:S.hlv, xp:S.xp}); save(); }
  const desc = pth => pth.kind==='god' ? `<b>${esc(Dd.ENEMIES[pth.key][0])}</b>: a myth god (${esc(Dd.GOD_TEXT[pth.key]||'')}). Brutal. Win for a guaranteed Mythical weapon or armour` : pth.kind==='boss' ? `World boss: ${esc(pth.key ? Dd.ENEMIES[pth.key][0] : WD[S.world].boss)}` : pth.kind==='mini' ? `Mini-boss: ${esc(pth.key ? Dd.ENEMIES[pth.key][0] : '')}. Always an Epic, 25% a Legendary, 1.5% a Mythical` : pth.kind==='event' ? `<b>${esc(Dd.EVENTS[pth.ev].n)}</b>: no fight, a choice` :
    ['', 'Lucky path: 3 bonus quests (more points), weak foes, a chest', 'A fair fight', 'Tougher foes, better chest', 'Elite enemy, rich chest', 'Deadly. Win for a guaranteed Legendary (maybe Mythical)'][pth.stars];
  const dm = S.dailyMsg ? `<p class="ok">${esc(S.dailyMsg)}</p>` : ''; S.dailyMsg = null;
  p.innerHTML = dm + `<h2>Level ${S.level}: choose your path</h2><p class="muted">Enemies here are <b>Lv ${foeLv()}</b>. You are <b>Hero Lv ${heroPL()}</b>${heroPL() >= foeLv()+2 ? ' (ahead: good odds)' : heroPL() < foeLv() ? ' (behind: study more!)' : ' (even)'}.</p><div class="paths">${S.paths.map((pth,i)=>`<button class="path s${pth.stars} ${pth.kind}" data-i="${i}"><span class="st">${pth.kind==='event'?'? Event':stars(pth.stars)}</span><b>${esc(dungeonName(S.world, pth))}</b><small>${desc(pth)}</small></button>`).join('')}</div>
    <div class="row"><button class="ghost" id="worlds">World select</button></div>`;
  p.querySelectorAll('.path').forEach(b => b.onclick = () => { SND.sfx('click'); S.path = S.paths[+b.dataset.i]; S.quests = null; campTab = 'gear'; S.resume = 'camp'; go('camp'); });
  $('worlds').onclick = () => go('title');
}
function statsHTML(){ const d = C.derive(P()); return `<div class="statgrid">${Object.keys(STATS).map(k=>`<div class="stat"><div><b>${k} ${S.st[k]}${d.s[k]!==S.st[k]?` <span class="up">(+${d.s[k]-S.st[k]})</span>`:''}</b><small>${STATS[k]}</small></div><button class="plus" data-k="${k}" ${S.pts?'':'disabled'} aria-label="add a point to ${k}">+1</button></div>`).join('')}</div>
  <p class="muted">Max HP ${d.max} · dodge ${Math.round(d.dodge*100)}% · crit ${Math.round(d.crit*100)}% · damage ×${d.mult.toFixed(2)} · speed ${d.speed.toFixed(1)}</p>`; }
function wireStats(root){ root.querySelectorAll('.plus').forEach(b => b.onclick = () => { if (!S.pts) return; const before = maxHP(); S.st[b.dataset.k]++; S.pts--; if (b.dataset.k==='FOR') S.hp = curHP() + (maxHP() - before); SND.sfx('level'); save(); draw(); }); }
const NQMODE = () => APP === 'party' && PARTY.on && PARTY.G && !!PARTY.G.nq;
function campScreen(p){
  if (!S.rested){ S.rested = true; const m = maxHP(); const before = curHP(); S.hp = Math.min(m, before + Math.round(m * (S.meta.equipped.includes('rested') ? 0.5 : 0.3))); S.restMsg = S.hp - before; save(); }
  const pl = P(); const eqIds = [S.eq.weapon, S.eq.armour, ...S.eq.trinkets];
  const bag = S.bag.filter(it => !eqIds.includes(it.uid)).sort((a,b) => (S.newLoot.includes(b.uid) - S.newLoot.includes(a.uid)) || b.rar - a.rar || C.power(b) - C.power(a));
  const tabs = [['gear','Gear'],['stats',`Stats${S.pts?' ('+S.pts+')':''}`],['belt','Items'],['shop','Potion Seller'],['tavern','Tavern · Boons'],['codex','Codex'],['journal','Journal'],['settings','Settings']].filter(t => !(S.party && ['journal','settings'].includes(t[0]))).concat(S.level===C.LMAX ? [['essay','Essay forge ★']] : []);
  let body = '';
  if (campTab==='gear'){
    const lvb = it => it ? `<div class="row tight"><button class="ghost lvup" data-u="${it.uid}" ${S.meta.wisdom>=1 && (it.lvl||1) < heroPL()+5 ?'':'disabled'}>▲ Lv ${it.lvl||1}→${(it.lvl||1)+1} · 1 ✦</button></div>` : '';
    body = `${S.growMsg ? `<p class="ok">${esc(S.growMsg)}</p>` : ''}<p class="muted small">Gear has its own level. Equipped gear levels up with you each level (if you meet its new requirement), and you can spend 1 Wisdom to raise any item 1 level (up to Hero Lv + 5). Drops arrive at or just above your Hero level (Lv ${heroPL()}). Hero levels come from ${NQMODE() ? 'battle' : 'study'} XP.</p><h3>Equipped</h3><div class="cards">${card(pl.eq.weapon, lvb(pl.eq.weapon))}${card(pl.eq.armour, lvb(pl.eq.armour))}${card(pl.eq.trinkets[0], pl.eq.trinkets[0]?'<div class="row tight"><button class="ghost un" data-s="0">Unequip</button></div>':'')}${card(pl.eq.trinkets[1], pl.eq.trinkets[1]?'<div class="row tight"><button class="ghost un" data-s="1">Unequip</button></div>':'')}</div>
     <h3>Bag (${bag.length})</h3><div class="cards">${bag.map(it => { const ok = C.canEquip(pl, it); const cmp = it.kind==='weapon' ? pl.eq.weapon : it.kind==='armour' ? pl.eq.armour : null;
       return card(it, `<div class="row tight">${ok?`<button class="eq" data-u="${it.uid}">Equip</button>`:''}<button class="ghost sell" data-u="${it.uid}">Sell +${sellVal(it)}</button>${S.party && PARTY.on && PARTY.others().length ? `<button class="ghost gift" data-u="${it.uid}">🎁 Gift</button>` : ''}<button class="ghost lvup" data-u="${it.uid}" ${S.meta.wisdom>=1 && (it.lvl||1) < heroPL()+5 ?'':'disabled'}>▲ Lv ${it.lvl||1}→${(it.lvl||1)+1} · 1 ✦</button>${S.newLoot.includes(it.uid)?'<span class="new">NEW</span>':''}</div>`, cmp); }).join('') || '<p class="muted">Win fights to fill your bag.</p>'}</div>`;
  } else if (campTab==='stats') body = statsHTML();
  else if (campTab==='belt'){ const ks = Object.keys(S.belt).filter(k=>S.belt[k]>0); body = ks.length ? `<div class="cards">${ks.map(k=>`<div class="card" style="--rc:#7fe0a0"><div class="rar">×${S.belt[k]}</div><div class="nm">${esc(Dd.CONSUMABLES[k].n)}</div><div class="sm">${esc(Dd.CONSUMABLES[k].d)}</div>${k.startsWith('hp')||k==='cleanse'?`<div class="row tight"><button class="drink" data-k="${k}">Drink now</button></div>`:''}</div>`).join('')}</div>` : '<p class="muted">No items. Chests and the Potion Seller have them.</p>'; }
  else if (campTab==='shop'){ const half = S.half; body = `<p class="muted">You have ✒ ${S.ink} Ink. Ink comes from quests and fights.${S.cleared[0]?'':' Phoenix Feathers unlock after you beat the Greenlands boss.'}${half?' <b>Half price today!</b>':''}</p><div class="cards">${Object.entries(Dd.SHOP).filter(([k]) => k !== 'phoenix' || S.cleared[0]).map(([k,c])=>{ const cost = half ? Math.ceil(c/2) : c; return `<div class="card" style="--rc:#7fe0a0"><div class="nm">${esc(Dd.CONSUMABLES[k].n)}</div><div class="sm">${esc(Dd.CONSUMABLES[k].d)}</div><div class="row tight"><button class="buy" data-k="${k}" data-c="${cost}" ${S.ink>=cost?'':'disabled'}>Buy · ${cost} Ink</button><span class="muted">have ${S.belt[k]||0}</span></div></div>`; }).join('')}</div>`; }
  else if (campTab==='forge'){ body = `<p>Boss Souls come from mini-bosses and bosses. <b>1 Soul + 60 Ink</b> forges a Legendary of your choice from this world.</p><p class="muted">Souls: ${S.souls} · Ink: ${S.ink}</p><div class="cards">${WD[S.world].types.map((t,i)=>`<div class="card r3" style="--rc:#ffb52e"><div class="rar">Legendary ${esc(t[0])}</div><div class="nm">${esc(t[2][3])}</div><div class="row tight"><button class="forge" data-k="w${i}" ${S.souls>=1&&S.ink>=60?'':'disabled'}>Forge</button></div></div>`).join('')}${[0,1,2].map(i=>`<div class="card r3" style="--rc:#ffb52e"><div class="rar">Legendary ${Dd.ARM_ROLE[i]}</div><div class="nm">${esc(WD[S.world].armour[3][i])}</div><div class="row tight"><button class="forge" data-k="a${i}" ${S.souls>=1&&S.ink>=60?'':'disabled'}>Forge</button></div></div>`).join('')}</div>`; }
  else if (campTab==='tavern'){ const used = slotsUsed(); body = `<p>Boons are <b>permanent</b>: buy them with Wisdom (earned by passing quests, never lost). Equip up to <b>5 slots</b>. Slots used: ${used}/5 · ✦ ${S.meta.wisdom} Wisdom</p><div class="cards">${Dd.BOONS.map(([id,n,sl,cost,txt])=>{ const own = S.meta.owned.includes(id), on = S.meta.equipped.includes(id);
      return `<div class="card ${on?'r3':''}" style="--rc:${on?'#ffb52e':'#7fc0ff'}"><div class="rar">${sl} slot${sl>1?'s':''}${own?' · owned':''}</div><div class="nm">${esc(n)}</div><div class="sm">${esc(txt)}</div><div class="row tight">${!own?`<button class="boonbuy" data-id="${id}" ${S.meta.wisdom>=cost?'':'disabled'}>Unlock · ${cost} Wisdom</button>`: on ? `<button class="ghost boonoff" data-id="${id}">Unequip</button>` : `<button class="boonon" data-id="${id}" ${used+sl<=5?'':'disabled'}>Equip</button>`}</div></div>`; }).join('')}</div>`; }
  else if (campTab==='codex'){ body = `<p class="muted">How well you know each paragraph. Weak ones come up more often.</p><div class="codex">${unitsOf(S.world).map(u => { const m = S.mastery[u.c] || {pass:0, fail:0}; const lvl = Math.max(0, Math.min(5, m.pass - m.fail));
      return `<div class="cx"><b>${esc(u.c)}</b><span>${esc(u.n)}</span><em>${'●'.repeat(lvl)}${'○'.repeat(5-lvl)}</em><small>${m.pass} passed · ${m.fail} failed</small></div>`; }).join('')}</div>`; }
  else if (campTab==='journal') body = journalHTML();
  else if (campTab==='settings'){ body = `<div class="stat"><div><b>Checkpoints (mini-boss levels ${C.miniLv().join(' and ')})</b><small>If you die after reaching a checkpoint, restart there instead of level 1. Makes the world easier.</small></div><button id="cpt" class="${S.checkpointOn?'':'ghost'}">${S.checkpointOn?'On':'Off'}</button></div>
     <div class="stat"><div><b>Music and sound</b><small>Procedural soundtrack: calm at camp, driving in battle, heavy for bosses.</small></div><button id="snd" class="${SET.muted?'ghost':''}">${SET.muted?'Off':'On'}</button></div>`; }
  else if (campTab==='essay') body = essayForge();
  p.innerHTML = `<h2>Camp · level ${S.level}${S.level===C.LMAX?' · the boss awaits':C.miniLv().includes(S.level)?' · mini-boss next':''}</h2>${S.restMsg?`<p class="ok">You rest by the fire: +${S.restMsg} HP.</p>`:''}
   ${S.updated?'<p class="ok">Game updated! Your quests were re-rolled with the new rules (your stats, gear and Wisdom are safe).</p>':''}
   <div class="tabs">${tabs.map(([k,n])=>`<button class="tab ${campTab===k?'on':''}" data-t="${k}">${n}</button>`).join('')}</div><div>${body}</div>
   <div class="row"><button id="go" ${NQMODE() && PARTY.ready ? 'disabled' : ''}>${NQMODE() ? (PARTY.ready ? 'Ready ✓ · waiting for the party…' : 'Ready for battle ⚔') : S.quests ? 'Back to your quests' : 'Ready · begin the study quests'}</button>${NQMODE() ? '<span class="muted small">Battle-only run: no study quests.</span>' : ''}</div>`;
  S.restMsg = 0; S.updated = false;
  p.querySelectorAll('.tab').forEach(b => b.onclick = () => { campTab = b.dataset.t; SND.sfx('click'); draw(); });
  p.querySelectorAll('.eq').forEach(b => b.onclick = () => { const it = item(+b.dataset.u); if (!C.canEquip(P(), it)) return; const before = maxHP(); for (const old of [item(S.eq.weapon), item(S.eq.armour)]) if (old && old.kind === it.kind && old !== it) old.grand = false;
    if (it.kind==='trinket'){ const i = S.eq.trinkets[0]==null ? 0 : S.eq.trinkets[1]==null ? 1 : 0; S.eq.trinkets[i] = it.uid; } else S.eq[it.kind] = it.uid;
    S.newLoot = S.newLoot.filter(x=>x!==it.uid); fixReqs(); S.hp = Math.max(1, Math.min(maxHP(), curHP() + (maxHP()-before))); ART3D.updateHero(P()); if (it.rar >= 3 && it.kind !== 'trinket'){ ART3D.equipFx(it.rar); SND.sfx(it.rar===4 ? 'boss' : 'perfect'); toast(`${Dd.RAR[it.rar].n} equipped: ${it.name}`); } else SND.sfx('level'); save(); draw(); });
  p.querySelectorAll('.gift').forEach(b => b.onclick = () => PARTY.giftMenu(+b.dataset.u));
  p.querySelectorAll('.un').forEach(b => b.onclick = () => { S.eq.trinkets[+b.dataset.s] = null; fixReqs(); save(); draw(); });
  p.querySelectorAll('.sell').forEach(b => b.onclick = () => { const it = item(+b.dataset.u); if (it.rar >= 2 && !b.dataset.sure){ b.dataset.sure = 1; b.classList.remove('ghost'); b.classList.add('danger'); b.textContent = `Sell this ${Dd.RAR[it.rar].n}? Tap again`; return; } S.bag = S.bag.filter(x => x.uid !== it.uid); S.ink += sellVal(it); SND.sfx('coin'); save(); draw(); });
  p.querySelectorAll('.lvup').forEach(b => b.onclick = () => { const it = item(+b.dataset.u); if (!it || S.meta.wisdom < 1) return; if ((it.lvl||1) >= heroPL() + 5){ toast(`Max Hero Lv + 5 (Lv ${heroPL() + 5}). Level up to raise it further.`); return; } const keep = JSON.stringify(it); C.applyLevel(it, (it.lvl||1) + 1); const equipped = [S.eq.weapon, S.eq.armour, ...S.eq.trinkets].includes(it.uid);
    if (equipped && !C.canEquip(P(), it)) it.grand = true; S.meta.wisdom -= 1; if (equipped && it.kind==='armour') S.hp = Math.min(maxHP(), curHP() + 0); if (equipped) ART3D.updateHero(P()); SND.sfx('level'); save(); draw(); });
  p.querySelectorAll('.drink').forEach(b => b.onclick = () => { const k = b.dataset.k; if (!(S.belt[k]>0)) return; S.belt[k]--; S.hp = Math.min(maxHP(), curHP() + Math.round(maxHP()*({hp:0.35,hp2:0.65,cleanse:0.13}[k])*(S.meta.equipped.includes('potion') ? 1.2 : 1))); SND.sfx('heal'); save(); draw(); });
  p.querySelectorAll('.buy').forEach(b => b.onclick = () => { const c = +b.dataset.c; if (S.ink < c) return; if ((S.belt[b.dataset.k]||0) >= BELTCAP){ toast(`Your belt holds ${BELTCAP} of each.`); return; } S.ink -= c; S.belt[b.dataset.k] = (S.belt[b.dataset.k]||0) + 1; SND.sfx('coin'); save(); draw(); });
  p.querySelectorAll('.forge').forEach(b => b.onclick = () => { if (S.souls < 1 || S.ink < 60) return; S.souls--; S.ink -= 60; const k = b.dataset.k; const it = k[0]==='w' ? C.makeWeapon(S.world, +k.slice(1), 3) : C.makeArmour(S.world, 3, +k.slice(1)); S.bag.push(it); S.newLoot.push(it.uid); SND.sfx('chest'); campTab = 'gear'; save(); draw(); });
  p.querySelectorAll('.boonbuy').forEach(b => b.onclick = () => { const bn = Dd.BOONS.find(x=>x[0]===b.dataset.id); if (S.meta.wisdom < bn[3]) return; S.meta.wisdom -= bn[3]; S.meta.owned.push(bn[0]); SND.sfx('perfect'); save(); draw(); });
  p.querySelectorAll('.boonon').forEach(b => b.onclick = () => { const bn = Dd.BOONS.find(x=>x[0]===b.dataset.id); if (slotsUsed() + bn[2] > 5) return; const before = maxHP(); S.meta.equipped.push(bn[0]); S.hp = Math.min(maxHP(), curHP() + Math.max(0, maxHP()-before)); save(); draw(); });
  p.querySelectorAll('.boonoff').forEach(b => b.onclick = () => { S.meta.equipped = S.meta.equipped.filter(x => x !== b.dataset.id); save(); draw(); });
  if ($('cpt')) $('cpt').onclick = () => { S.checkpointOn = !S.checkpointOn; save(); draw(); };
  if ($('snd')) $('snd').onclick = () => { SET.muted = !SET.muted; saveSet(); draw(); };
  wireStats(p); if (campTab==='essay') wireEssay();
  p.querySelectorAll('.ach.on').forEach(b => b.onclick = () => { S.stats.title = b.dataset.t; save(); draw(); });
  $('go').onclick = () => { if (NQMODE()){ S.newLoot = []; SND.sfx('click'); PARTY.readyUp(); return; } if (!S.quests) rollQuests(); S.newLoot = []; S.resume = 'quests'; SND.sfx('click'); go('quests'); };
}
const ACH = [
  ['first','First Steps','Pass your first quest', s => s.stats.quests >= 1],
  ['ten','Diligent','Pass 10 quests', s => s.stats.quests >= 10],
  ['fifty','Scholar of the Camp','Pass 50 quests', s => s.stats.quests >= 50],
  ['hundred','Living Essay','Pass 100 quests', s => s.stats.quests >= 100],
  ['perf5','Flawless','Get 5 perfect scores', s => s.stats.perfects >= 5],
  ['perf25','Word Perfect','Get 25 perfect scores', s => s.stats.perfects >= 25],
  ['quote10','Quote Master','10 perfect quote quests', s => s.stats.quotePerf >= 10],
  ['hour','One Hour In','Study for an hour in total', s => s.stats.time >= 3600],
  ['five','Five Hours Deep','Study for five hours', s => s.stats.time >= 18000],
  ['streak3','On Fire','3-day streak', s => (s.daily||{}).streak >= 3],
  ['streak7','Unstoppable','7-day streak', s => (s.daily||{}).streak >= 7],
  ['boss1','Telescreen Breaker','Defeat a Greenlands world boss', s => WD[0].bossKeys.some(b => s.stats.bosses.includes(b))],
  ['boss2','Breaker of Staffs','Defeat a Storm Coast world boss', s => WD[1].bossKeys.some(b => s.stats.bosses.includes(b))],
  ['boss3','Light in the Shadow','Defeat a Hollow Wastes world boss', s => WD[2].bossKeys.some(b => s.stats.bosses.includes(b))],
  ['boss4','Truly Named','Defeat an Icelands world boss', s => WD[3].bossKeys.some(b => s.stats.bosses.includes(b))],
  ['hunter','Monster Hunter','Defeat 100 enemies', s => Object.values(s.stats.kills).reduce((a,b)=>a+b,0) >= 100],
  ['legend','Legendary','Find a Legendary item', s => Object.values(s.stats.found).some(r => r >= 3)],
  ['myth','Myth Made Real','Find a Mythical item', s => Object.values(s.stats.found).some(r => r >= 4)],
  ['codex','Master of the Codex','Fill one paragraph’s Codex to ●●●●●', s => Object.values(s.mastery).some(m => m.pass - m.fail >= 5)]];
function noteFind(it){ if (!it || !S || !S.stats) return; if (it.name && it.kind !== 'consumable') S.stats.found[it.name] = Math.max(S.stats.found[it.name]||0, it.rar||0); if (it.myth){ S.stats.myth = S.stats.myth || {}; S.stats.myth[it.myth] = Math.max(S.stats.myth[it.myth]||0, (it.world||0)+1); } }
function legendBanner(loot){ const L = (loot||[]).filter(i => i.myth || i.special).sort((a,b)=>b.rar-a.rar)[0]; if (!L) return ''; return `<div class="legend-banner r${L.rar}"><span>${L.rar===6?'OUTERVERSAL RELIC':L.rar===5?'PROMISED RELIC':L.rar===4?'MYTHICAL RELIC':'LEGENDARY RELIC'}</span><b>${esc(L.name)}</b><em>${esc(L.lore||'')}</em></div>`; }
function checkAch(){ if (!S || !S.stats) return; for (const [id, n, d, f] of ACH){ if (!S.stats.ach.includes(id) && f(S)){ S.stats.ach.push(id); S.meta.wisdom += 10; toast(`🏆 Achievement: ${n} (+10 Wisdom) · title unlocked`); if (!S.stats.title) S.stats.title = n; } } save(); }
function toast(t){ const d = document.createElement('div'); d.className = 'toast'; d.textContent = t; document.body.appendChild(d); SND.sfx('perfect'); setTimeout(() => d.remove(), 3500); }
function journalHTML(){ const st = S.stats; const units = unitsOf(S.world); const allKeys = WD.flatMap(w => [...w.enemies, ...(Array.isArray(w.mini)?w.mini:[w.mini]), ...(w.bossKeys || [w.bossKey])]);
  const avg = a => a && a.length ? Math.round(a.slice(-5).reduce((x,y)=>x+y,0)/Math.min(5,a.length)) : null;
  return `<h3>Study stats</h3><p class="muted">${Math.round(st.time/60)} min studied · ${st.quests} quests passed · ${st.perfects} perfect</p>
   <div class="codex">${units.map(u => { const a = st.units[u.c]; const v = avg(a); return `<div class="cx"><b>${esc(u.c)}</b><span>${esc(u.n)}</span><em>${v==null?'—':v+'%'}</em><small>${a ? 'Last scores: ' + a.slice(-8).join(' · ') : 'Not attempted yet'}</small><div class="spark">${(a||[]).slice(-16).map(x=>`<i style="height:${Math.max(6,x)}%;background:${x>=85?'#4fd36f':x>=60?'#ffcf3a':'#ff6b7f'}"></i>`).join('')}</div></div>`; }).join('')}</div>
   <h3>Achievements (${st.ach.length}/${ACH.length})</h3><div class="achs">${ACH.map(([id,n,d]) => `<button class="ach ${st.ach.includes(id)?'on':''}" data-t="${esc(n)}" ${st.ach.includes(id)?'':'disabled'}><b>${esc(n)}</b><small>${esc(d)}</small>${st.title===n?'<span class="new">TITLE</span>':''}</button>`).join('')}</div><p class="muted">Tap an unlocked achievement to wear it as your title.</p>
   <h3>Bestiary (${Object.keys(st.kills).length}/${allKeys.length})</h3><div class="best">${allKeys.map(k => { const [n, art, col, tr] = Dd.ENEMIES[k]; const seen = st.kills[k]; return `<div class="beast ${seen?'':'unseen'}" style="--ec:${col}"><i></i><b>${seen ? esc(n) : '???'}</b><small>${seen ? `${esc((Dd.TRAITS[tr]||'').split(':')[0])} · defeated ${seen}×` : 'Not met yet'}</small></div>`; }).join('')}</div>
   <h3>Hall of Legends (${Object.keys(st.myth||{}).length}/${Dd.LEGENDS.length})</h3><p class="muted small">Every Legendary and Mythical relic, from Greek, Norse, Irish, Arthurian, Hindu and Chinese myth. Each one drops in four tiers (I to IV), one per world. ★5 paths, mini-bosses and bosses are where they hide.</p><div class="best">${Dd.LEGENDS.map(l => { const got = (st.myth||{})[l[0]]; return `<div class="beast ${got?'':'unseen'}" style="--ec:${l[4]===4?'#ff4d6d':'#ffb52e'}"><i></i><b>${got ? esc(l[1]) : '???'}</b><small>${esc(l[5])} · ${l[4]===4?'Mythical':'Legendary'} ${l[2]}${got ? ' · best tier ' + ['I','II','III','IV'][got-1] : ''}</small></div>`; }).join('')}</div>
   <h3>Collection (${Object.keys(st.found).length} items found)</h3><div class="coll">${Object.entries(st.found).sort((a,b)=>b[1]-a[1]).map(([n,r]) => `<span class="chip" style="border-color:${Dd.RAR[r].c};color:${Dd.RAR[r].c}">${esc(n)}</span>`).join('') || '<span class="muted">Open chests to fill your collection.</span>'}</div>`; }
function fixReqs(){ const pl = P(); if (!C.canEquip(pl, pl.eq.weapon) && !pl.eq.weapon.grand){ const alt = S.bag.filter(i=>i.kind==='weapon' && C.canEquip(pl,i)).sort((a,b)=>C.power(b)-C.power(a))[0]; if (alt) S.eq.weapon = alt.uid; }
  if (!C.canEquip(pl, pl.eq.armour) && !pl.eq.armour.grand){ const alt = S.bag.filter(i=>i.kind==='armour' && C.canEquip(pl,i)).sort((a,b)=>C.power(b)-C.power(a))[0]; if (alt) S.eq.armour = alt.uid; } }
function rollQuests(){ const units = unitsOf(S.world); const weighted = []; units.forEach(u => { const m = S.mastery[u.c] || {pass:0,fail:0}; const wgt = 1 + 2*Math.max(0, m.fail - m.pass) + (m.pass===0 ? 1 : 0); for (let i=0;i<wgt;i++) weighted.push(u); });
  S.inspDone = false; S.quests = C.rollQuests(S.level, weighted, Math.random, S.lastKinds, S.path && S.path.stars===1 && S.path.kind==='normal');
  if (S.review && S.review.length){ const rv = S.review.shift(); if (units.some(x => x.c === rv.unit) && !GONE_KINDS.includes(rv.kind)){ const q = C.mkQuest(3, rv.kind, rv.unit, Math.random); q.review = true; S.quests[S.quests.length-1] = q; } } S.lastKinds = S.quests.map(q => q.kind); save(); }
function essayForge(){
  if (S.essay) return `<p>Your essay scored <b>${Math.round(S.essay.score*100)}%</b>. ${S.essay.relic ? 'The relic is in your bag: equip it in an item slot.' : 'Under 50%: no relic this run.'}</p>`;
  return `<p><b>Write the whole ${S.world===3?'story and reflection':'essay'} from memory.</b> Marked word for word. Your relic makes every hit on the boss take a fixed share of its HP:</p>
   <ul class="muted"><li>95%+ Mythical relic: 20% per hit (5 hits)</li><li>85%+ Legendary: 12.5% per hit</li><li>70%+ Epic: 8% per hit</li><li>50%+ Rare: 5% per hit</li></ul><p class="muted">One attempt per run. Write [LTQ] where your essay has a slot.</p>
   <textarea id="essay" rows="12" spellcheck="false" placeholder="Start writing…"></textarea><div class="row"><button id="mark">Submit for marking</button><span class="muted" id="wc">0 words</span></div>`; }
function wireEssay(){ const ta = $('essay'); if (!ta) return; ta.oninput = () => $('wc').textContent = C.words(ta.value).length + ' words';
  $('mark').onclick = () => { const score = C.accuracy(ta.value, C.essayText(unitsOf(S.world))); const rel = C.essayRelic(S.world, score); S.essay = {score, relic: !!rel}; S.meta.wisdom += Math.round(score*30);
    if (rel){ S.bag.push(rel); S.newLoot.push(rel.uid); SND.sfx('perfect'); } else SND.sfx('fail'); save(); draw(); }; }

/* ---------- quests ---------- */
function questsScreen(p){ if (!S.quests || !S.quests.length) rollQuests();
  const all = S.quests.every(q => q.done);
  p.innerHTML = `<h2>Study quests · level ${S.level}</h2><p class="muted">Pass mark 85%. Up to three tries each (flashcards get one), or skip. Every pass heals 10% and earns Ink and Wisdom. Pass <b>all</b> of them to become Inspired; get them all perfect for double.</p>
   <div class="cards">${S.quests.map((q,i)=>{ const u = unitBy(q.unit); return `<div class="card quest" style="--rc:${TIERC[q.tier]}"><div class="rar">${C.TIERS[q.tier].n}${q.bonus?' · bonus':''} · ~${Math.round(C.questXP(q.pts, S.level, (S.hlv||1) - foeLv()))} XP</div><div class="nm">${QN[q.kind]}${q.review?' <span class="new">REVIEW</span>':''}</div><div class="sm">${esc(u.c)} · ${esc(u.n)}</div>
     <div class="row tight">${q.done ? (q.passed ? `<span class="ok">Passed ✓ ${q.best>=0.999?'Perfect!':''}</span>` : `<span class="bad">${q.skipped?'Skipped':'Failed'} · 0 points</span>`) : `<button class="start" data-i="${i}">${q.tries?`Try again (${q.maxTries-q.tries} left)`:'Start'}</button>`}</div></div>`; }).join('')}</div>
   ${S.pts?`<h3>Spend your points</h3>${statsHTML()}`:''}
   <div class="row"><button id="fight" ${all?'':'disabled'}>${all ? (APP==='party' ? 'Ready ✓' : S.path.kind==='event' ? 'Continue to the event' : S.path.kind==='boss' ? 'Face the boss!' : S.path.kind==='god' ? 'Face the god!' : 'To battle!') : 'Finish the quests to continue'}</button><button class="ghost" id="camp">Back to camp</button></div>`;
  p.querySelectorAll('.start').forEach(b => b.onclick = () => { S.qi = +b.dataset.i; SND.sfx('click'); go('quest'); });
  wireStats(p); $('fight').onclick = () => APP==='party' ? PARTY.readyUp() : S.path.kind==='event' ? go('event') : startBattle(); $('camp').onclick = () => go('camp');
}
function tok(u){ const t = []; u.s.forEach((s,k)=>{ t.push({n:k+1}); C.words(s).forEach(w=>t.push({w})); }); return t; }
function shuffle(a, r){ a = a.slice(); for (let i=a.length-1;i>0;i--){ const j = Math.floor(r()*(i+1)); [a[i],a[j]] = [a[j],a[i]]; } return a; }
function runQuest(i){
  const q = S.quests[i], u = unitBy(q.unit), r = C.rng(q.seed), p = $('panel'); const all = unitsOf(S.world); q.t0 = q.t0 || Date.now();
  const head = `<div class="qhead"><span class="tier" style="background:${TIERC[q.tier]}">${C.TIERS[q.tier].n}</span><h2>${QN[q.kind]}</h2></div><p class="muted">${esc(u.c)} · ${esc(u.n)} · try ${q.tries+1} of ${q.maxTries}</p>`;
  const para = u.s.map((s,k)=>`<sup>${k+1}</sup>${esc(s)}`).join(' ');
  const back = '<button class="ghost" id="leave">Back to quests</button><button class="ghost" id="skipq">Skip (0 points)</button>' + (q.tier >= 3 && !['read','summary','next','spot','matchQA','handwrite','photo'].includes(q.kind) ? `<button class="ghost" id="peek" ${S.ink>=15?'':'disabled'}>Peek · 15 Ink (half of each sentence, 5 s; halves points)</button>` : '') + '<div id="peekbox"></div>';
  const finish = (score, label, reveal='') => { if (!$('res')) p.insertAdjacentHTML('beforeend', '<div id="res"></div>');
    if (q.done) return; q.tries++; const pass = score >= 0.85; const m = S.mastery[u.c] = S.mastery[u.c] || {pass:0, fail:0};
    const st = S.stats; (st.units[u.c] = st.units[u.c] || []).push(Math.round(score*100)); if (st.units[u.c].length > 30) st.units[u.c].shift(); st.time += Math.min(900, Math.round((Date.now() - (q.t0||Date.now()))/1000)); q.t0 = Date.now();
    if (pass){ st.quests++; if (score >= 0.999){ st.perfects++; if (K.startsWith('quote')) st.quotePerf++; } } setTimeout(checkAch, 400);
    if (pass){ q.done = true; q.passed = true; q.best = score; m.pass++; const quill = P().eq.trinkets.filter(Boolean).reduce((a,t)=>a+(t.eff==='QUILL'?t.v:0),0) + (S.meta.equipped.includes('scholar') && q.tier >= 3 ? 1 : 0);
      const gap = (S.hlv||1) - foeLv(); const gm = C.gapMod(gap); let gain = Math.round(C.questXP(q.pts + quill, S.level, gap)); if (q.peeked) gain = Math.max(1, Math.floor(gain/2)); q.why = [`${C.TIERS[q.tier].n} quest`].concat(quill ? [`+${quill} Quill/Scholar`] : [], (S.len||30) === 15 ? ['×2 short game'] : [], Math.abs(gm - 1) > 0.02 ? [gap > 0 ? `×${gm.toFixed(2)}: you’re ${gap} level${gap>1?'s':''} above the enemies` : `×${gm.toFixed(2)} catch-up: you’re ${-gap} below`] : []).join(', '); if (q.shrine) S.pts += 5; q.gain = gain; q.ups = gainXP(gain); S.ink += q.pts*5 + (S.meta.equipped.includes('scribe') ? 10 : 0); S.meta.wisdom += q.pts*2; S.hp = Math.min(maxHP(), curHP() + Math.round(maxHP()*(score>=0.999 ? 0.15 : 0.1)));
      SND.sfx(score >= 0.999 ? 'perfect' : 'pass'); }
    else { m.fail++; if (q.tries >= q.maxTries){ q.done = true; q.passed = false; } SND.sfx('fail'); }
    let inspMsg = '';
    if (!q.shrine && S.quests.every(x => x.done) && !S.inspDone){ S.inspDone = true;
      if (S.quests.every(x => x.passed)){ const perfect = S.quests.every(x => x.best >= 0.999); S.inspired = perfect ? 2 : 1; inspMsg = perfect ? ' · ALL PERFECT: Inspired ×2 (+20% damage next fight)!' : ' · All quests passed: Inspired (+10% damage next fight)!';
        if (S.meta.equipped.includes('sage')){ S.hp = maxHP(); inspMsg += ' Sage heals you to full.'; } SND.sfx('level'); } }
    save(); hud();
    $('res').innerHTML = `<div class="result ${pass?'pass':'fail'}"><b>${pass ? (score>=0.999?'Perfect!':'Passed') : 'Not yet'}${inspMsg} · ${label || Math.round(score*100)+'%'}</b>
      <span>${pass ? `+${q.gain} XP (${q.why || ''})${q.peeked?' · halved: you peeked':''}${q.ups ? ` · <b>LEVEL UP → Hero Lv ${S.hlv}, +${q.ups*C.XPK.sp} stat points</b>` : ` · ${Math.round(S.xp)}/100 XP to Lv ${(S.hlv||1)+1}`}${q.shrine ? ', +5 stat points (shrine)' : ''}, +${q.pts*5} Ink, +${q.pts} Wisdom, healed` : q.done ? 'Out of tries: 0 points this time. This paragraph will come back soon.' : `Pass mark is 85%. ${q.maxTries-q.tries} ${q.maxTries-q.tries===1?'try':'tries'} left; it stays the same.`}</span>${reveal}
      <div class="row">${pass || q.done ? '<button id="ok">Continue</button>' : '<button id="retry">Retry</button><button class="ghost" id="ok">Later</button>'}</div></div>`;
    $('ok').onclick = () => { if (q.shrine){ S.quests = S.quests.filter(x => x !== q); S.eventDone = pass ? 'The shrine glows: your study earned +5 bonus points.' : 'The pages fall still. Perhaps next time.'; save(); go('event'); } else go('quests'); }; if ($('retry')) $('retry').onclick = () => runQuest(i);
    $('res').scrollIntoView({behavior:'smooth', block:'nearest'});
  };
  const wire = () => { if ($('leave')) $('leave').onclick = () => go(q.shrine ? 'event' : 'quests');
    if ($('peek')) $('peek').onclick = () => { if (S.ink < 15) return; S.ink -= 15; q.peeked = true; save(); hud(); const pb = $('peekbox'); pb.innerHTML = `<div class="text peekt">${u.s.map((x,k)=>`<sup>${k+1}</sup>${esc(halfOf(x))}`).join(' ')}</div><p class="muted">Half of each sentence. Hiding in <span id="pt">5</span>s…</p>`; let t = 5; const tm = setInterval(() => { t--; const el = $('pt'); if (!el){ clearInterval(tm); return; } el.textContent = t; if (t <= 0){ clearInterval(tm); pb.innerHTML = '<p class="muted">Peeked: this quest gives half points.</p>'; } }, 1000); $('peek').disabled = true; };
    if ($('skipq')) $('skipq').onclick = () => { q.done = true; q.passed = false; q.skipped = true; if (q.shrine){ S.quests = S.quests.filter(x => x !== q); S.eventDone = 'You leave the shrine.'; save(); go('event'); return; }
      if (S.quests.every(x => x.done)) S.inspDone = true; save(); go('quests'); }; };
  const typedBox = (target, hint, rows=8, prefix='') => { window.__TARGET = target;
    p.innerHTML = head + hint + `<textarea id="ta" rows="${rows}" spellcheck="false" autocapitalize="off"></textarea><div class="row"><button id="chk">Submit</button>${back}</div><div id="res"></div>`;
    $('chk').onclick = () => { const typed = prefix + $('ta').value; const sc = C.accuracy(typed, target); finish(sc, null, sc < 0.85 ? `<div class="hint"><b>Hint</b> (every third word shown):<p>${esc(hintOf(target))}</p></div>` : ''); }; wire(); };
  const K = q.kind;
  if (K==='read'){
    const need = Math.min(45, Math.round(C.words(u.s.join(' ')).length * 0.22));
    p.innerHTML = head + `<p class="muted">Read it slowly. Say each quotation in your head twice.</p><div class="text">${para}</div><div class="row"><button id="done" disabled>Reading done (${need}s)</button>${back}</div><div id="res"></div>`;
    let left = need; const tm = setInterval(() => { left--; const b = $('done'); if (!b){ clearInterval(tm); return; } if (left <= 0){ clearInterval(tm); b.disabled = false; b.textContent = 'Reading done'; } else b.textContent = `Reading done (${left}s)`; }, 1000);
    $('done').onclick = () => finish(1, 'Read'); wire(); return; }
  if (K.startsWith('order')){
    const cut = K==='order1' ? 1 : K==='order2' ? 2 : 3; let parts = [];
    u.s.forEach(s => { const w = C.words(s); const n = Math.ceil(w.length/cut); for (let k=0;k<w.length;k+=n) parts.push(w.slice(k, k+n).join(' ')); });
    if (parts.length < 3){ parts = []; u.s.forEach(s => { const w = C.words(s); const n = Math.ceil(w.length/3); for (let k=0;k<w.length;k+=n) parts.push(w.slice(k,k+n).join(' ')); }); }
    return orderGame(parts, head + `<p class="muted">Tap the pieces in the order they appear in your paragraph. ${parts.length} pieces.</p>`, finish, r, back, wire); }
  if (K==='unscramble'){ const s = u.s[Math.floor(r()*u.s.length)]; const w = C.words(s); const n = Math.max(3, Math.ceil(w.length/6)); const parts = []; for (let k=0;k<w.length;k+=n) parts.push(w.slice(k,k+n).join(' ')); return orderGame(parts, head + `<p class="muted">Rebuild sentence ${u.s.indexOf(s)+1} phrase by phrase.</p>`, finish, r, back, wire); }
  if (K==='next'){
    const k = Math.floor(r()*(u.s.length-1)); const cue = u.s[k], ans = u.s[k+1]; const pool = all.flatMap(x => x.s).filter(s => s !== ans && s !== cue); const opts = shuffle([ans, ...shuffle(pool, r).slice(0,3)], r);
    p.innerHTML = head + `<p class="muted">Which sentence comes straight after this one?</p><div class="text"><sup>${k+1}</sup>${esc(cue)}</div><div class="pool">${opts.map((o,j)=>`<button class="piece mc" data-j="${j}">${esc(o)}</button>`).join('')}</div><div class="row">${back}</div><div id="res"></div>`;
    window.__MC = opts.indexOf(ans);
    p.querySelectorAll('.mc').forEach(b => b.onclick = () => { const ok = opts[+b.dataset.j] === ans; b.classList.add(ok ? 'done' : 'no'); p.querySelectorAll('.mc').forEach(x => x.disabled = true); if (!ok){ S.review = (S.review||[]).filter(x => x.unit !== u.c).concat([{kind:'next', unit:u.c}]); } finish(ok ? 1 : 0, ok ? 'Correct' : 'Wrong sentence', ok ? '' : `<div class="hint"><b>Hint:</b> it starts “${esc(C.words(ans).slice(0,3).join(' '))} …”. This card comes back at a later camp.</div>`); }); wire(); return; }
  if (K==='spot'){
    const tk = tok(u); const idx = shuffle(tk.map((t,k)=> t.w && /^[A-Za-z]{4,}[,.;:]?$/.test(t.w) && !/[“”"]/.test(t.w) ? k : -1).filter(k=>k>=0), r).slice(0, 4);
    const swaps = ['perhaps','quietly','merely','always','another','entirely','clearly','barely','simply','often']; const changed = new Set(idx);
    const hs = new Set(q.spotHint||[]); const html = tk.map((t,k) => t.n ? `<sup>${t.n}</sup>` : `<button class="wd${hs.has(k)?' hintw':''}" data-k="${k}">${esc(changed.has(k) ? t.w.replace(/^[A-Za-z]+/, swaps[k % swaps.length]) : t.w)}</button>`).join(' ');
    window.__SPOT = [...changed];
    p.innerHTML = head + `<p class="muted">Four words have been swapped for wrong ones. Tap all four, then check.</p><div class="text">${html}</div><div class="row"><button id="chk">Check</button>${back}</div><div id="res"></div>`;
    const picked = new Set(); p.querySelectorAll('.wd').forEach(b => b.onclick = () => { const k = +b.dataset.k; if (picked.has(k)) picked.delete(k); else picked.add(k); b.classList.toggle('held'); });
    $('chk').onclick = () => { let ok = 0; changed.forEach(k => { if (picked.has(k)) ok++; }); const wrong = [...picked].filter(k => !changed.has(k)).length; const sc = Math.max(0, (ok - wrong) / changed.size);
      const unfound = [...changed].filter(k => !picked.has(k)); const hintK = new Set(sc < 0.85 ? unfound.slice(0, 2) : []); q.spotHint = [...hintK];
      p.querySelectorAll('.wd').forEach(b => { const k = +b.dataset.k; b.disabled = true; if (changed.has(k) && picked.has(k)) b.classList.add('good'); else if (picked.has(k)) b.classList.add('badw'); if (hintK.has(k)) b.classList.add('hintw'); });
      finish(sc, `${ok}/4 found${wrong ? `, ${wrong} wrong` : ''}`, sc < 0.85 ? `<div class="hint"><b>Hint:</b> ${hintK.size} of the swapped words you missed ${hintK.size===1?'is':'are'} outlined in gold. The rest stay hidden.</div>` : ''); }; wire(); return; }
  if (K==='tsRecall' || K==='closer'){ const k = K==='tsRecall' ? 0 : u.s.length-1; const ctx = K==='tsRecall' ? `<div class="text muted">${u.s.slice(1,3).map(esc).join(' ')} …</div>` : `<div class="text muted">… ${u.s.slice(-3,-1).map(esc).join(' ')}</div>`;
    return typedBox(u.s[k], `<p class="muted">Type the ${K==='tsRecall'?'topic (first)':'linking (last)'} sentence of <b>${esc(u.n)}</b> word for word.</p>${ctx}`, 3); }
  if (K==='missing'){ const k = 1 + Math.floor(r()*Math.max(1, u.s.length-2)); const shown = u.s.map((s,j) => j===k ? `<b class="ltqmark">[ sentence ${j+1} is missing ]</b>` : `<sup>${j+1}</sup>${esc(s)}`).join(' ');
    return typedBox(u.s[k], `<p class="muted">Type the missing sentence word for word.</p><div class="text">${shown}</div>`, 3); }
  if (K==='summary'){
    p.innerHTML = head + `<p class="muted">Write <b>one short dot point per sentence</b> (${u.s.length} lines). Keep each under half the length of its sentence and in your own words: copying 5+ words in a row fails that line.</p><div class="text">${para}</div>
      <textarea id="ta" rows="${u.s.length+1}" spellcheck="false" placeholder="${u.s.map((_,k)=>'• point '+(k+1)).join('\n')}"></textarea><div class="row"><button id="chk">Check</button>${back}</div><div id="res"></div>`;
    $('chk').onclick = () => { const m = C.markSummary($('ta').value.split('\n'), u.s); finish(m.score, `${m.res.filter(x=>x.ok).length}/${u.s.length} dot points`, `<ol class="fb">${m.res.map(x=>`<li class="${x.ok?'ok':'bad'}">${x.ok?'Good':esc(x.why)}</li>`).join('')}</ol>`); }; wire(); return; }
  if (['blank25','blank33','blank50','blank85'].includes(K)){
    const frac = {blank25:0.25, blank33:0.33, blank50:0.5, blank85:0.85}[K]; const tk = tok(u);
    const idx = shuffle(tk.map((t,k)=> t.w && /[A-Za-z0-9]/.test(t.w) && !/LTQ/.test(t.w) ? k : -1).filter(k=>k>=0), r);
    const pick = new Set(idx.slice(0, Math.max(1, Math.round(idx.length*frac)))); const ans = [];
    const html = tk.map((t,k)=>{ if (t.n) return `<sup>${t.n}</sup>`; if (!pick.has(k)) return esc(t.w); const m = t.w.match(/^([^A-Za-z0-9]*)(.*?)([^A-Za-z0-9]*)$/); const id = ans.length; ans.push(m[2]);
      return esc(m[1]) + `<input class="bl" id="b${id}" ${(q.hints||[]).includes(id)?`placeholder="${esc(firstHint(m[2]))}"`:''} size="${Math.max(3, m[2].length)}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="gap ${id+1}">` + esc(m[3]); }).join(' ');
    window.__ANS = ans;
    p.innerHTML = head + `<p class="muted">${ans.length} gaps. Enter jumps to the next.</p><div class="text">${html}</div>${K==='blank25'?`<p class="muted small">Word bank: tap a word to cross it off. Words cross off by themselves when you use them.</p><div class="bank" id="bank">${ans.slice().sort((a,b)=>a.localeCompare(b)).map(w=>`<span class="chip bk" role="button" tabindex="0" data-w="${esc(C.norm(w))}">${esc(w)}</span>`).join('')}</div>`:''}<div class="row"><button id="chk">Submit</button>${back}</div><div id="res"></div>`;
    const ins = [...p.querySelectorAll('input.bl')]; ins.forEach((x,k) => x.onkeydown = e => { if (e.key==='Enter'){ e.preventDefault(); (ins[k+1] || $('chk')).focus(); } }); if (ins[0]) ins[0].focus();
    const chips = [...p.querySelectorAll('.chip.bk')]; if (chips.length){ const manual = new Set();
      const sync = () => { const used = {}; ins.forEach(x => { const w = C.norm(x.value); if (w) used[w] = (used[w] || 0) + 1; }); chips.forEach((c, i) => { const w = c.dataset.w; const auto = used[w] > 0 ? (used[w]--, true) : false; c.classList.toggle('x', auto || manual.has(i)); }); };
      chips.forEach((c, i) => { const tog = () => { if (manual.has(i)) manual.delete(i); else manual.add(i); sync(); }; c.onclick = tog; c.onkeydown = e => { if (e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); tog(); } }; });
      ins.forEach(x => x.addEventListener('input', sync)); }
    $('chk').onclick = () => { let ok = 0; ins.forEach((x,k) => { const g = C.norm(x.value) === C.norm(ans[k]); if (g) ok++; x.classList.toggle('good', g); x.classList.toggle('badin', !g); });
      const sc = ok/ans.length; q.hints = []; ins.forEach((x,k) => { if (!x.classList.contains('good')){ x.placeholder = firstHint(ans[k]); q.hints.push(k); } }); finish(sc, `${ok}/${ans.length} gaps`, sc < 0.85 ? `<div class="hint"><b>Hint:</b> wrong gaps now show their first letter. Retry to fill them.</div>` : ''); }; wire(); return; }
  if (K==='quotes' || K==='quoteHint'){
    const qs = C.quotesOf(u); window.__QS = qs; let html = u.s.map((s,k)=>`<sup>${k+1}</sup>` + esc(s)).join(' ');
    qs.forEach((x,k) => { const hint = K==='quoteHint' ? esc(C.words(x.q)[0]) + ' ' : ''; html = html.replace(esc(x.q), `${hint}<input class="bl q" id="q${k}" size="${Math.min(44, x.q.length)}" autocomplete="off" spellcheck="false" aria-label="quotation ${k+1}">`); });
    p.innerHTML = head + `<p class="muted">Type every missing quotation exactly.</p><div class="text">${html}</div><div class="row"><button id="chk">Submit</button>${back}</div><div id="res"></div>`;
    $('chk').onclick = () => { let tot = 0, n = 0; const wrong = []; qs.forEach((x,k) => { const el = $('q'+k); if (!el) return; n++; const typed = (K==='quoteHint' ? C.words(x.q)[0] + ' ' : '') + el.value; const s = C.accuracy(typed, x.q); tot += s; el.classList.toggle('good', s>=0.999); el.classList.toggle('badin', s<0.999); if (s<0.999) wrong.push(x.q); });
      finish(n ? tot/n : 1, null, wrong.length ? `<div class="hint"><b>Hints:</b> ${wrong.map(w=>`“${esc(hintOf(w))}”`).join(' · ')}</div>` : ''); }; wire(); return; }
  if (K.startsWith('place')){
    const units = K==='placeEssay' ? all : [u]; const slots = []; let html = '';
    units.forEach(uu => { const ch = C.placeChunks(uu, K==='place2'); html += `<p class="ptitle">${esc(uu.n)}</p><p>`;
      uu.s.forEach((s, si) => { const mine = ch.filter(c => c.si===si).sort((a,b)=>a.start-b.start); let pos = 0, out = '';
        for (const c of mine){ out += esc(s.slice(pos, c.start)); const id = slots.length; slots.push(c.text); out += `<button class="slot" data-s="${id}">${id+1}</button>`; pos = c.end; }
        out += esc(s.slice(pos)); html += out + ' '; }); html += '</p>'; });
    if (!slots.length){ q.kind = q.tier >= 3 ? 'blank50' : 'blank33'; save(); return runQuest(i); }   // no quotations in this paragraph: swap to a gap-fill of the same tier
    const chips = shuffle(slots.map((t,k)=>({t,k})), r); const placed = {}; let held = null;
    p.innerHTML = head + `<p class="muted">Tap a card, then tap the numbered slot where it belongs. ${slots.length} slots.</p><div class="pool chips2">${chips.map(c=>`<button class="piece chipb" data-k="${c.k}">${esc(c.t)}</button>`).join('')}</div><div class="text placetext">${html}</div><div class="row"><button id="chk">Submit</button>${back}</div><div id="res"></div>`;
    const draw2 = () => { p.querySelectorAll('.slot').forEach(sl => { const s = +sl.dataset.s; sl.textContent = placed[s] != null ? slots[placed[s]] : (s+1); sl.classList.toggle('filled', placed[s] != null); });
      const used = new Set(Object.values(placed)); p.querySelectorAll('.chipb').forEach(b => { b.classList.toggle('held', +b.dataset.k === held); b.disabled = used.has(+b.dataset.k); }); };
    p.querySelectorAll('.chipb').forEach(b => b.onclick = () => { held = +b.dataset.k; draw2(); });
    p.querySelectorAll('.slot').forEach(sl => sl.onclick = () => { const s = +sl.dataset.s; if (held != null){ for (const k in placed) if (placed[k] === held) delete placed[k]; placed[s] = held; held = null; } else if (placed[s] != null) delete placed[s]; draw2(); });
    window.__PLACE = () => { slots.forEach((t,k) => placed[k] = k); draw2(); };
    $('chk').onclick = () => { let ok = 0; slots.forEach((t,k) => { const g = placed[k] != null && slots[placed[k]] === t; if (g) ok++; const el = p.querySelector(`.slot[data-s="${k}"]`); el.classList.toggle('good', g); el.classList.toggle('badin', !g); });
      finish(ok/slots.length, `${ok}/${slots.length} placed`); }; wire(); return; }
  if (K==='firstLast' || K==='firstOnly'){
    const tk = tok(u); const ans = [];
    const html = tk.map(t => { if (t.n) return `<sup>${t.n}</sup>`; const m = t.w.match(/^([^A-Za-z0-9]*)([A-Za-z0-9’']*?)([^A-Za-z0-9]*)$/); if (!m || !m[2] || /LTQ/.test(t.w)) return esc(t.w);
      const core = m[2]; if (core.length <= (K==='firstLast' ? 2 : 1)) return esc(t.w); const id = ans.length; ans.push(core);
      const ph = K==='firstLast' ? core[0] + '·'.repeat(core.length-2) + core[core.length-1] : core[0] + '·'.repeat(core.length-1);
      return esc(m[1]) + `<input class="bl fl2" id="b${id}" placeholder="${esc(ph)}" size="${Math.max(3, core.length)}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="word ${id+1}">` + esc(m[3]); }).join(' ');
    window.__ANS = ans;
    p.innerHTML = head + `<p class="muted">Every word is a gap: the ${K==='firstLast'?'first and last letters are':'first letter is'} shown, plus all the punctuation. Type each whole word. Enter jumps to the next.</p><div class="text">${html}</div><div class="row"><button id="chk">Submit</button>${back}</div><div id="res"></div>`;
    const ins = [...p.querySelectorAll('input.bl')]; ins.forEach((x,k) => x.onkeydown = e => { if (e.key==='Enter' || (e.key===' ' && x.value.trim())){ e.preventDefault(); (ins[k+1] || $('chk')).focus(); } }); if (ins[0]) ins[0].focus();
    $('chk').onclick = () => { let ok = 0; ins.forEach((x,k) => { const g = C.norm(x.value) === C.norm(ans[k]); if (g) ok++; x.classList.toggle('good', g); x.classList.toggle('badin', !g); });
      const sc = ok/ans.length; finish(sc, `${ok}/${ans.length} words`, sc < 0.85 ? `<div class="hint"><b>Hint:</b> wrong words are marked red. Retry and fix them.</div>` : ''); }; wire(); return; }
  if (K==='letters'){ const target = u.s.join(' '); return typedBox(target, `<p class="muted">Type the whole paragraph word for word from the first letters and punctuation.</p><div class="fl">${esc(C.initials(target))}</div>`, 10); }
  if (K==='recall'){ const target = u.s.join(' '); return typedBox(target, `<p class="muted">Write the rest of the paragraph from memory.</p><div class="text"><sup>1</sup>${esc(u.s[0])} <em class="muted">… keep going.</em></div>`, 10, u.s[0] + ' '); }
  if (K==='sentStarts'){ // Insane: only the first letter of every sentence is given
    window.__TARGETS = u.s; p.innerHTML = head + `<p class="muted">Write <b>${esc(u.n)}</b> sentence by sentence. Only the first letter of each sentence is given. Two tries.</p>` + u.s.map((s, k) => `<label class="lab"><span class="fl">${k+1}. ${esc((C.words(s)[0]||'?').replace(/^[^A-Za-z0-9]*/, '')[0] || '?')}…</span><textarea class="ss" id="ss${k}" rows="2" spellcheck="false" autocapitalize="off"></textarea></label>`).join('') + `<div class="row"><button id="chk">Submit</button>${back}</div><div id="res"></div>`;
    $('chk').onclick = () => { let tot = 0; u.s.forEach((s, k) => { const a = C.accuracy($('ss' + k).value, s); tot += a; $('ss' + k).classList.toggle('good', a >= 0.85); $('ss' + k).classList.toggle('badin', a < 0.85); }); const sc = tot/u.s.length; finish(sc, null, sc < 0.85 ? `<div class="hint"><b>Hint</b>: red boxes need work. Every third word: <p>${esc(hintOf(u.s.join(' ')))}</p></div>` : ''); }; wire(); return; }
  if (K==='blankPage'){ const target = u.s.join(' '); return typedBox(target, `<p class="muted">No cues at all. Write <b>${esc(u.n)}</b> word for word. Two tries.</p>`, 12); }
  if (K==='letters1' || K==='chain'){
    let k = 0, total = 0; window.__TARGETS = u.s;
    const step = () => { const s = u.s[k];
      const cue = K==='letters1' ? `<div class="fl">${esc(C.initials(s))}</div>` : `<div class="text">${k ? `<sup>${k}</sup>${esc(u.s[k-1])}` : `<em class="muted">Start of ${esc(u.n)}</em>`}<br><b>Next:</b> ${esc(C.words(s)[0])} …</div>`;
      p.innerHTML = head + `<p class="muted">Sentence ${k+1} of ${u.s.length}. ${K==='letters1' ? 'Type it from the first letters.' : 'The previous sentence is your cue; type the next one.'}</p>${cue}<textarea id="ta" rows="3" spellcheck="false" autocapitalize="off"></textarea><div class="row"><button id="chk">Next</button>${back}</div><div id="res"></div>`;
      $('ta').focus(); $('ta').onkeydown = e => { if (e.key==='Enter' && !e.shiftKey){ e.preventDefault(); $('chk').click(); } };
      $('chk').onclick = () => { total += C.accuracy($('ta').value, s); k++; if (k < u.s.length) step(); else finish(total/u.s.length); }; wire(); };
    return step(); }
  if (K==='photo'){
    p.innerHTML = head + `<p class="muted">Handwrite <b>${esc(u.n)}</b> from memory, take a clear photo and upload it. Claude reads it and it’s marked word for word.</p><div class="text"><sup>1</sup>${esc(C.words(u.s[0]).slice(0,6).join(' '))} …</div>
      <div class="row"><label class="file">Choose photo<input type="file" id="ph" accept="image/*" capture="environment"></label><button id="chk" disabled>Mark it</button>${back}</div><div id="status" class="muted"></div><div id="res"></div>`;
    wire();
    sampler().then(async smp => { const lim = smp && await smp.limits().catch(()=>null);
      if (!smp || !lim || !lim.images){ q.kind = 'recall'; save(); runQuest(i); return; }
      $('ph').onchange = () => { $('chk').disabled = !$('ph').files.length; };
      $('chk').onclick = async () => { $('chk').disabled = true; $('status').textContent = 'Claude is reading your handwriting…';
        try { const res = await smp.json(`The image is a student's handwritten attempt to reproduce an essay paragraph from memory. Transcribe exactly what is written, word for word, keeping their errors. Return JSON {"transcript": string}. Do not correct anything.`, {images: $('ph').files[0], modelTier:'quick'});
          const tr = (res && res.transcript) || ''; $('status').textContent = ''; finish(C.accuracy(tr, u.s.join(' ')), null, `<details><summary>What Claude read</summary><p class="muted">${esc(tr)}</p></details>`); }
        catch(e){ $('status').textContent = e && e.code==='rate_limited' ? 'Too many requests: wait a minute and try again.' : 'Could not mark the photo (' + esc(e && (e.code||e.message) || 'error') + '). Try again.'; $('chk').disabled = false; } }; });
    return; }
  if (K==='matchQA'){
    const pr = C.pairsOf(u); if (pr.length < 2) return finish(1, 'No pairs here');
    let html = ''; const slots = pr.map(x => x.a.text);
    u.s.forEach((s, si) => { const mine = pr.map((x,k)=>({x,k})).filter(o => o.x.si===si); let pos = 0, out = '';
      for (const {x,k} of mine){ out += esc(s.slice(pos, x.q.start)) + `<b class="qt">${esc(x.q.text)}</b>` + esc(s.slice(x.q.end, x.a.start)) + `<button class="slot" data-s="${k}">${k+1}</button>`; pos = x.a.end; }
      html += `<sup>${si+1}</sup>` + out + esc(s.slice(pos)) + ' '; });
    const chips = shuffle(slots.map((t,k)=>({t,k})), r); const placed = {}; let held = null;
    p.innerHTML = head + `<p class="muted">The quotations are in place, but their analysis is missing. Tap an analysis card, then the numbered slot after the quotation it explains. ${slots.length} slots.</p><div class="pool chips2">${chips.map(c=>`<button class="piece chipb" data-k="${c.k}">${esc(c.t)}</button>`).join('')}</div><div class="text placetext">${html}</div><div class="row"><button id="chk">Submit</button>${back}</div><div id="res"></div>`;
    const draw2 = () => { p.querySelectorAll('.slot').forEach(sl => { const k = +sl.dataset.s; sl.textContent = placed[k] != null ? slots[placed[k]] : (k+1); sl.classList.toggle('filled', placed[k] != null); });
      const used = new Set(Object.values(placed)); p.querySelectorAll('.chipb').forEach(b => { b.classList.toggle('held', +b.dataset.k === held); b.disabled = used.has(+b.dataset.k); }); };
    p.querySelectorAll('.chipb').forEach(b => b.onclick = () => { held = +b.dataset.k; draw2(); });
    p.querySelectorAll('.slot').forEach(sl => sl.onclick = () => { const k = +sl.dataset.s; if (held != null){ for (const x in placed) if (placed[x] === held) delete placed[x]; placed[k] = held; held = null; } else if (placed[k] != null) delete placed[k]; draw2(); });
    window.__PLACE = () => { slots.forEach((t,k) => placed[k] = k); draw2(); };
    $('chk').onclick = () => { let ok = 0; slots.forEach((t,k) => { const g = placed[k] === k; if (g) ok++; const el = p.querySelector(`.slot[data-s="${k}"]`); el.classList.toggle('good', g); el.classList.toggle('badin', !g); });
      finish(ok/slots.length, `${ok}/${slots.length} matched`); }; wire(); return; }
  if (K==='handwrite'){
    const n = Math.max(1, Math.round(u.s.length/3)); const st = r() < 0.5 ? 0 : u.s.length - n; const chunk = u.s.slice(st, st+n); const target = chunk.join(' '); window.__TARGET = target;
    const intro = head + `<p><b>Write this passage out by hand 5 times</b> (7 if you can), word for word, on paper. It's ${st===0?'the opening':'the closing'} ${n} sentence${n>1?'s':''} of <b>${esc(u.n)}</b>.</p><div class="text">${chunk.map((x,k)=>`<sup>${st+k+1}</sup>${esc(x)}`).join(' ')}</div>`;
    p.innerHTML = intro + `<p class="muted">When you're done, take one clear photo of the page. Claude counts your copies and checks each one: you need <b>5 copies at 85%+</b>.</p><div class="row"><label class="file">Choose photo<input type="file" id="ph" accept="image/*" capture="environment"></label><button id="chk" disabled>Check my copies</button>${back}</div><div id="status" class="muted"></div><div id="res"></div>`;
    wire();
    sampler().then(async smp => { const lim = smp && await smp.limits().catch(()=>null);
      if (!smp || !lim || !lim.images){ // fallback: type two copies from memory
        p.innerHTML = intro + `<p class="muted">Photo checking isn't available here, so type it instead: read it, press <b>Hide</b>, then type it twice from memory.</p><div class="row"><button id="hide">Hide the passage</button>${back}</div><div id="typ" hidden><textarea id="t1" rows="4" spellcheck="false" placeholder="Copy 1"></textarea><textarea id="t2" rows="4" spellcheck="false" placeholder="Copy 2"></textarea><div class="row"><button id="chk">Check</button></div></div><div id="res"></div>`;
        wire(); $('hide').onclick = () => { p.querySelector('.text').innerHTML = '<em class="muted">Hidden. Write it from memory.</em>'; $('typ').hidden = false; $('hide').disabled = true; };
        $('chk').onclick = () => { const a = [C.accuracy($('t1').value, target), C.accuracy($('t2').value, target)]; finish((a[0]+a[1])/2, `copies: ${a.map(x=>Math.round(x*100)+'%').join(' · ')}`); }; return; }
      $('ph').onchange = () => { $('chk').disabled = !$('ph').files.length; };
      $('chk').onclick = async () => { $('chk').disabled = true; $('status').textContent = 'Claude is counting your copies…';
        try { const res = await smp.json(`The image shows a student's handwritten practice page: they copied the same short passage several times. Transcribe EACH separate copy exactly as written (keep their mistakes, do not correct). Return JSON {"copies": [string, ...]} with one string per copy, in order. If the page is unreadable return {"copies": []}.`, {images: $('ph').files[0], modelTier:'quick'});
          const cps = (res && Array.isArray(res.copies) ? res.copies : []).map(String); const acc = cps.map(c => C.accuracy(c, target)); const good = acc.filter(a => a >= 0.85).length; $('status').textContent = '';
          finish(Math.min(1, good/5), `${good}/5 accurate copies`, `<p class="muted">Claude found ${cps.length} cop${cps.length===1?'y':'ies'}: ${acc.map(a=>Math.round(a*100)+'%').join(' · ') || 'none readable'}.</p>`); }
        catch(e){ $('status').textContent = e && e.code==='rate_limited' ? 'Too many requests: wait a minute and try again.' : 'Could not check the photo (' + esc(e && (e.code||e.message) || 'error') + '). Try again.'; $('chk').disabled = false; } }; });
    return; }
  if (K==='ltq'){
    const bank = Dd.LTQ[WD[S.world].essay]; const qu = bank[Math.floor(r()*bank.length)]; const intro = all[0]; const nSlots = Math.max(1, (intro.s.join(' ').match(/\[LTQ\]|\(LTQ\)/g) || []).length);
    p.innerHTML = head + `<p><b>Question (HSC-style):</b> ${esc(qu)}</p><p class="muted">Your introduction is below. Write what goes in each [LTQ] slot so the essay answers <i>this</i> question, then rewrite your first sentence for it.</p>
      <div class="text">${esc(intro.s.join(' ')).replace(/\[LTQ\]|\(LTQ\)/g, () => '<b class="ltqmark">[LTQ]</b>')}</div>
      ${[...Array(nSlots)].map((_,k)=>`<label class="lab">[LTQ] slot ${k+1}<input class="wide" id="l${k}" autocomplete="off"></label>`).join('')}<label class="lab">New first sentence<textarea id="l_first" rows="2"></textarea></label>
      <div class="row"><button id="chk">Mark it</button>${back}</div><div id="status" class="muted"></div><div id="res"></div>`;
    $('chk').onclick = async () => {
      const slots = [...Array(nSlots)].map((_,k)=>$('l'+k).value.trim()); const first = $('l_first').value.trim();
      if (slots.some(s=>!s) || !first){ $('status').textContent = 'Fill every slot and the first sentence.'; return; }
      $('chk').disabled = true; $('status').textContent = 'Marking…'; const smp = await sampler();
      if (smp){ try {
        const out = await smp.json(`You are an experienced NSW HSC English Advanced marker. A student adapts a memorised essay to a new question by filling link-to-question [LTQ] slots and rewriting the opening sentence.
QUESTION: ${qu}
ORIGINAL INTRODUCTION (with slots): ${intro.s.join(' ')}
STUDENT SLOT ANSWERS: ${slots.map((s,k)=>`(${k+1}) ${s}`).join(' | ')}
STUDENT NEW FIRST SENTENCE: ${first}
Mark out of 10: directly addresses the question's key terms and verb; conceptual rather than plot-based; fits grammatically into the sentence around each slot; sophisticated, precise expression; a clear, consistent thesis. Be strict: 9-10 = Band 6, 7-8 = Band 5, 5-6 = Band 4. Return JSON {"score": number 0-10, "feedback": "2-3 sentences", "better": "one improved version of slot 1"}.`, {modelTier:'quick'});
        $('status').textContent = ''; finish(Math.max(0, Math.min(10, +out.score||0))/10, `${out.score}/10`, `<p>${esc(out.feedback||'')}</p>${out.better?`<p class="muted"><b>Stronger slot 1:</b> ${esc(out.better)}</p>`:''}`); return; }
        catch(e){ $('status').textContent = 'Claude marking unavailable; using the quick check.'; } }
      const keys = C.words(qu).map(C.norm).filter(w => w.length >= 6); const hit = slots.concat([first]).map(s => keys.some(k => C.words(s).map(C.norm).some(x => x.slice(0,5) === k.slice(0,5))) && C.words(s).length >= 3);
      $('chk').disabled = false; finish(hit.filter(Boolean).length/hit.length, 'Quick check (no AI): each slot uses the question’s key words', `<p class="muted">Key words: ${esc(keys.join(', '))}</p>`); };
    wire(); return; }
}
function orderGame(parts, intro, finish, r, back, wire){
  const p = $('panel'); const pool = shuffle(parts.map((t,k)=>({t,k})), r); let next = 0, miss = 0;
  p.innerHTML = intro + `<div class="built" id="built"></div><div class="pool">${pool.map(x=>`<button class="piece" data-k="${x.k}">${esc(x.t)}</button>`).join('')}</div><div class="row">${back}</div><div id="res"></div>`;
  p.querySelectorAll('.piece').forEach(b => b.onclick = () => { if (next >= parts.length) return; const k = +b.dataset.k;
    if (parts[k] === parts[next]){ b.disabled = true; b.classList.add('done'); $('built').textContent += parts[next] + ' '; next++; SND.sfx('click'); if (next === parts.length) finish(Math.max(0, (parts.length - miss) / parts.length)); }
    else { miss++; b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); } }); wire();
}

/* ---------- events ---------- */
function eventScreen(p){
  const evk = S.path.ev, E = Dd.EVENTS[evk];
  if (S.eventDone){ p.innerHTML = `<h2>${esc(E.n)}</h2><p>${esc(S.eventDone)}</p><div class="row"><button id="on">Onward</button></div>`; $('on').onclick = () => { S.eventDone = null; nextLevel(); }; return; }
  p.innerHTML = `<h2>${esc(E.n)}</h2><p>${esc(E.d)}</p><div class="paths">${E.opts.map(([a,b],i)=>`<button class="path" data-i="${i}"><b>${esc(a)}</b><small>${esc(b)}</small></button>`).join('')}</div>`;
  p.querySelectorAll('.path').forEach(b => b.onclick = () => { const i = +b.dataset.i; const m = maxHP(); SND.sfx('click'); let msg = '';
    if (evk==='river'){ if (i===0){ S.hp = Math.min(m, curHP() + Math.round(m*0.6)); msg = 'The water is ice-cold and wonderful. You feel restored.'; SND.sfx('heal'); } else { addBelt("hp", 2); msg = 'Two flasks of river water: Health Potions.'; } }
    if (evk==='campsite'){ if (i===0){ const it = [C.rollItem(Math.random, S.world, 3), C.rollItem(Math.random, S.world, 2)]; S.bag.push(...it); it.forEach(noteFind); S.newLoot.push(...it.map(x=>x.uid)); msg = `You find ${it.map(x=>x.name).join(' and ')}.`; SND.sfx('chest'); } else { S.hp = Math.min(m, curHP() + Math.round(m*0.35)); S.ink += 15; msg = 'You rest and find a few coins of Ink.'; } }
    if (evk==='altar'){ if (i===0){ S.hp = Math.max(1, Math.round(curHP()*0.75)); S.pts += 4; msg = 'The altar drinks. Power floods you: +4 stat points.'; SND.sfx('level'); } else msg = 'You leave the altar alone.'; }
    if (evk==='aura'){ if (i===0){ S.path = {stars:4, kind:'normal', theme:S.path.theme, aura:true}; save(); return startBattle(); } msg = 'You slip past unseen.'; }
    if (evk==='shrine'){ if (i===0){ const units = unitsOf(S.world); const qq = C.rollQuests(18, units, Math.random, [], false).find(x => x.tier === 3) || {tier:3, pts:3, kind:'blank50', unit:units[1].c, seed:7, tries:0, maxTries:3, done:false, passed:false};
        qq.shrine = true; S.quests.push(qq); S.qi = S.quests.length - 1; save(); return go('quest'); } S.meta.wisdom += 20; msg = '+20 Wisdom.'; }
    if (evk==='merchant'){ if (i===0){ S.half = true; campTab = 'shop'; S.eventDone = null; save(); nextLevel(true); return; } S.ink += 25; msg = '+25 Ink.'; SND.sfx('coin'); }
    S.eventDone = msg; save(); draw(); });
}
function nextLevel(toShop){ S.quests = null; S.path = null; S.paths = null; S.chest = null;
  if (S.level===C.LMAX){ S.cleared[S.world] = true; S.carry = []; S.resume = null; go(S.world===3 ? 'done' : 'carry'); return; }
  S.level++; syncPL(); S.resume = 'map'; if (!toShop) S.half = false; go(toShop ? 'map' : 'map'); }

/* ---------- battle ---------- */
function startBattle(){ FIGHT = false;
  const g = C.makeGroup(S.world, S.level, S.path, Math.random); if (S.path.kind==='mini') g[0].mini = true; const insp = S.inspired; S.inspired = 0;
  let hp0 = curHP(); if (S.meta.equipped.includes('second') && hp0 < maxHP()*0.5) hp0 = Math.min(maxHP(), hp0 + Math.round(maxHP()*0.2)); const B = C.newBattle(P(), g, S.belt, {hp:hp0, world:S.world}); if (insp) B.p.mult *= 1 + 0.1*insp;
  BAT = {B, id:Date.now(), log:[`${g.map(e=>e.name).join(', ')} ${g.length>1?'appear':'appears'}!`], insp}; SEL = g[0].id; S.resume = 'quests'; S.phase = 'battle'; save(); draw();
  if (g.some(e => e.boss || e.mini)) SND.sfx('boss');
  const d0 = {p: B.p.hp, hs: {p: B.p.hp}, hmax: {p: B.p.max}, es: Object.fromEntries(B.es.map(e => [e.id, e.hp]))}; const op = C.opening(B, Math.random); if (op.length){ BAT.disp = d0; } if (op.length) setTimeout(async () => { busy = true; await playEvents(op); if (BAT) BAT.disp = null; busy = false; S.hp = B.p.hp; save(); if (B.over==='lose'){ S.deaths++; SND.sfx('lose'); BAT = null; go('dead'); } }, 2000);
}
let FIGHT = false;
function battleScreen(p){
  if (!BAT){ go('quests'); return; } const B = BAT.B;
  const items = Object.keys(S.belt).filter(k => S.belt[k] > 0 && k !== 'phoenix');
  const ms = C.heroMoves(B.p.w, B.p.a); const mcd = B.p.mcd || {}; const myth = (B.p.w.rar||0) >= 4;
  p.innerHTML = `${FIGHT ? `<div class="mvhead"><b>Choose a move</b><button id="a-back" class="ghost">◀ Back</button></div><div id="mvgrid" class="mvgrid">${moveBtns(ms, B.p.energy, mcd, B.turn, false, myth, B.p.w)}</div>`
     : `<div class="acts"><button id="a-fight" class="fight">⚔ Attack <small>choose a move</small></button><button id="a-focus" class="ghost">Focus <small>+45 energy</small></button><button id="a-guard" class="ghost">Guard</button><button id="a-items" class="ghost" ${items.length?'':'disabled'}>Items (${items.reduce((a,k)=>a+S.belt[k],0)})</button></div>`}
   <div id="itemrow" class="itemrow" hidden>${items.map(k=>`<button class="ghost it" data-k="${k}">${esc(Dd.CONSUMABLES[k].n)} ×${S.belt[k]}</button>`).join('')}</div>
   <div class="foes">${B.es.filter(e=>dHP(e)>0).map(e=>`<button class="foe ${SEL===e.id?'sel':''}" data-id="${e.id}"><span><b>${esc(e.name)}</b> ${eTypes(e).map(tyIcon).join('')} <small>Lv ${e.lv||''} · ${esc((Dd.TRAITS[e.trait]||'').split(':')[0])}${e.charging?' · CHARGING':''}${e.exposed?' · EXPOSED':''}${e.guard?' · guarding':''}${e.enraged?' · ENRAGED':''}</small></span><div class="hpbar"><i style="width:${Math.max(0,dHP(e)/e.max*100)}%;background:${e.boss?'#ff4d6d':'#ff9a3c'}"></i></div><small>${dHP(e)} / ${e.max} HP${SEL===e.id?' · TARGET':''}</small><div class="chips">${foeChips(e.status)}</div><small class="muted">Moves: ${C.enemyMoves(e).map(m => esc(m.n)).join(' · ')}</small></button>`).join('')}
     <div class="foe me"><span><b>You</b></span><div class="hpbar"><i style="width:${Math.max(0,dPHP(B)/B.p.max*100)}%;background:#4cd46b"></i></div><small>${dPHP(B)} / ${B.p.max} HP</small><div class="enbar big"><i style="width:${B.p.energy}%"></i></div><small>⚡ Energy ${B.p.energy}/100</small><div class="chips">${heroChips(B.p.st)}${B.frozen && !B.p.st.freeze ? '<span class="s-freeze">Frozen</span>' : ''}</div></div></div>
   <div class="log">${BAT.log.slice(-5).map(l=>`<div>${esc(l)}</div>`).join('')}</div><p class="muted small">Tap an enemy to target it. Basic moves are free and build energy; Multi, Heavy and Special moves spend it. Guard when something is CHARGING.</p>`;
  if (FIGHT){ $('a-back').onclick = () => { FIGHT = false; SND.sfx('click'); battleScreen(p); }; p.querySelectorAll('.mvb').forEach(b => b.onclick = () => { FIGHT = false; act('move', +b.dataset.slot); }); }
  else { $('a-fight').onclick = () => { FIGHT = true; SND.sfx('click'); battleScreen(p); }; $('a-focus').onclick = () => act('focus'); $('a-guard').onclick = () => act('guard');
    $('a-items').onclick = () => { $('itemrow').hidden = !$('itemrow').hidden; }; }
  p.querySelectorAll('.it').forEach(b => b.onclick = () => act('item', b.dataset.k));
  p.querySelectorAll('.foe[data-id]').forEach(b => b.onclick = () => { SEL = +b.dataset.id; SND.sfx('click'); battleScreen(p); plates(); });
}
const wait = ms => new Promise(r => setTimeout(r, ms));
/* plays an event list from the battle engine. ctx: {es, heroName(hid), mine(hid), log(text)} */
const dHP = e => (BAT && BAT.disp && BAT.disp.es[e.id] != null) ? BAT.disp.es[e.id] : e.hp;
const dPHP = B => (BAT && BAT.disp) ? BAT.disp.p : B.p.hp;
function dispTrack(disp, e, findMax){ if (!disp) return; const cap = (v, m) => Math.max(0, Math.min(m == null ? 1e9 : m, v));
  if (e.t==='edmg' || e.t==='edot'){ if (disp.es[e.id] != null) disp.es[e.id] = cap(disp.es[e.id] - e.v); }
  else if (e.t==='eheal'){ if (disp.es[e.id] != null) disp.es[e.id] = cap(disp.es[e.id] + e.v, findMax(e.id)); }
  else if (e.t==='pdmg' || e.t==='pdot'){ const k = e.h || 'p'; if (disp.hs[k] != null) disp.hs[k] = cap(disp.hs[k] - e.v); }
  else if (e.t==='pheal'){ const k = e.h || 'p'; if (disp.hs[k] != null) disp.hs[k] = cap(disp.hs[k] + e.v, disp.hmax && disp.hmax[k]); } }
async function playEvents(ev, ctx){
  ctx = ctx || {es: () => BAT.B.es, heroName: () => 'You', mine: () => true, log: t => BAT.log.push(t), redraw: () => battleScreen($('panel')), track: e => { if (BAT && BAT.disp){ dispTrack(BAT.disp, e, id => (BAT.B.es.find(x => x.id === id)||{}).max); BAT.disp.p = BAT.disp.hs.p; } }};
  let enemyTurn = false; const who = h => h || 'p'; const en = id => ctx.es().find(x => x.id === id);
  for (const e of ev){
    const H = who(e.h), nm = ctx.heroName(H), me = ctx.mine(H);
    if (e.t==='act'){ const d = ART3D.heroAct(H, e.a, e.tg || [], {fx:e.fx, area:e.area}); if (['attack','skill','heavy','special'].includes(e.a)) await wait(Math.min(d, e.a==='special' || e.a==='heavy' ? 650 : 480)); else await wait(120); }
    else if (e.t==='edmg'){ ART3D.hitEnemy(e.id, e.crit, H); SND.sfx(e.crit ? 'crit' : 'hit'); float((e.crit?'CRIT ':'')+e.v, e.id, e.crit?'#ffe14d':'#ffffff', e.crit); if (e.x === 2) float('Super effective!', e.id, '#ff9a3c'); else if (e.x === 0.5) float('Not very effective…', e.id, '#9fb0d0'); await wait(40); }
    else if (e.t==='miss'){ float('MISS', e.id, '#c9d6ff'); ctx.log(`${nm==='You'?'Your':nm+'’s'} attack misses!`); }
    else if (e.t==='edot') float(e.v, e.id, e.s==='burn'?'#ff8a3c':'#d6a2ff');
    else if (e.t==='pheal'){ float('+'+e.v, H, '#5fe08a'); ART3D.healFx(H); }
    else if (e.t==='eheal'){ float('+'+e.v, e.id, '#5fe08a'); ART3D.healFx(e.id); }
    else if (e.t==='guard'){ float('GUARD', H, '#9fd6ff'); ctx.log(`${nm} raise${nm==='You'?'':'s'} a guard.`); }
    else if (e.t==='focus'){ float('FOCUS', H, '#ffe14d'); ctx.log(`${nm} focus${nm==='You'?'':'es'}: energy up, next hit +25%.`); }
    else if (e.t==='skill'){ ctx.log(`${nm} use${nm==='You'?'':'s'} ${e.v}!`); if (!e.basic) SND.sfx('skill'); if (e.sig){ float(e.v.toUpperCase(), H, '#ffcf3a', true); ART3D.fx('sig', null, null, H); await wait(250); } }
    else if (e.t==='item'){ ctx.log(`${nm} use${nm==='You'?'':'s'} ${e.v}.`); SND.sfx('heal'); }
    else if (e.t==='status'){ float(e.s.toUpperCase(), e.id, '#ffd27a'); ART3D.fx({burning:'burn', poisoned:'poison', blinded:'blind', slowed:'slow', empowered:'enrage', frozen:'frozen'}[e.s] || 'stun', e.id); if (e.s==='weakened') ctx.log('Its strength is sapped: −30% damage.'); if (e.s==='exposed') ctx.log('Exposed: it takes +30% damage.'); }
    else if (e.t==='fx'){ ART3D.fx(e.k, e.a, e.b, H); if (e.k==='phoenix'){ SND.sfx('perfect'); await wait(500); } if (e.k==='enrage') SND.sfx('boss'); }
    else if (e.t==='bspecial'){ const x = en(e.id); ctx.log(`${x ? x.name : 'The boss'} uses ${e.n}!`); float(e.n.toUpperCase(), e.id, '#ff6a8a', true); ART3D.fx('enrage', e.id); SND.sfx('boss'); await wait(450); }
    else if (e.t==='summon'){ ART3D.setEnemies(ctx.es()); SND.sfx('skill'); await wait(350); }
    else if (e.t==='kill'){ const x = en(e.id); ART3D.killEnemy(e.id); if (x) ctx.log(`${x.name} is defeated!`); }
    else if (e.t==='emove'){ if (!enemyTurn){ enemyTurn = true; await wait(250); } const x = en(e.id); ctx.log(`${x ? x.name : 'It'} uses ${e.n}!`); if (!e.sig) float(e.n, e.id, '#ffb0c0'); if (e.self){ const d = ART3D.foeMove(e.id, e.self, e.an); await wait(Math.min(520, d)); } }
    else if (e.t==='hstatus'){ float(STN[e.s] ? STN[e.s].toUpperCase() : e.s, H, ['empower','swift','enlight','god'].includes(e.s) ? '#ffe14d' : '#c9a2ff', e.s==='god'); ART3D.fx('hst_' + e.s, null, null, H); ctx.log(`${nm} ${nm==='You'?'are':'is'} ${(Dd.STATUS_TEXT[e.s]||e.s).split(':')[0].toLowerCase()}.`); }
    else if (e.t==='revive'){ ART3D.reviveHero(H); }
    else if (e.t==='attack'){ if (!enemyTurn){ enemyTurn = true; await wait(300); } const d = ART3D.enemyAttack(e.id, H, {charged: e.ch, anim: e.anim}); await wait(Math.min(420, d*0.65)); }
    else if (e.t==='msg'){ ctx.log(e.v); if (!enemyTurn){ enemyTurn = true; await wait(200); } }
    else if (e.t==='dodge'){ float(e.miss ? 'MISS' : 'DODGE', H, '#9fd6ff'); SND.sfx('dodge'); ART3D.fx('dodge', null, null, H); const x = en(e.id); ctx.log(e.miss ? `${x ? x.name : 'It'} misses ${nm==='You'?'you':nm}!` : `${nm} dodge${nm==='You'?'':'s'}!`); }
    else if (e.t==='pdmg'){ ART3D.hitHero(e.label==='charged', H); SND.sfx('hurt'); float('-'+e.v, H, '#ff6b6b', e.label==='charged'); if (e.x === 2) float('Super effective!', H, '#ff9a3c'); else if (e.x === 0.5) float('Resisted', H, '#9fd6ff'); const x = en(e.id); ctx.log(`${x ? x.name : 'It'} hits ${nm==='You'?'you':nm} for ${e.v}${e.label==='charged'?' (charged!)':''}.`); }
    else if (e.t==='pdot'){ float('-'+e.v, H, e.s==='poison' ? '#c77dff' : '#ff8a3c'); ctx.log(`${e.s==='poison' ? 'Poison' : e.s==='burn' ? 'Burn' : 'It'} deals ${e.v} to ${nm==='You'?'you':nm}.`); }
    else if (e.t==='skipped'){ float('SKIPPED', H, '#c9d6ff'); ctx.log(`${nm} ${nm==='You'?'were':'was'} skipped (away).`); }
    else if (e.t==='down'){ ctx.log(`${nm} ${nm==='You'?'are':'is'} down!`); SND.sfx('lose'); ART3D.downHero(H); await wait(450); }
    if (ctx.track) ctx.track(e); ctx.redraw(); await wait(70);
  }
}
async function act(a, itemKey){
  if (busy || !BAT || BAT.B.over) return; busy = true; const B = BAT.B;
  if (!B.es.find(e => e.id === SEL && e.hp > 0)){ const al = C.alive(B); SEL = al.length ? al[0].id : null; }
  BAT.disp = {p: B.p.hp, hs: {p: B.p.hp}, hmax: {p: B.p.max}, es: Object.fromEntries(B.es.map(e => [e.id, e.hp]))};
  B.p.belt = S.belt; const ev = C.playerAct(B, a, SEL, Math.random, S.belt, itemKey);
  for (const e of B.es) if (BAT.disp.es[e.id] == null) BAT.disp.es[e.id] = e.max; // summons appear at full
  await playEvents(ev); BAT.disp = null;
  busy = false; if (!BAT || BAT.B !== B) return; S.hp = B.p.hp; save(); hud();
  if (B.over==='win'){ await wait(900); try { ART3D.victory(); } catch(e){} await wait(1300); if (!BAT || BAT.B !== B || !S.path) return; S.wins++; { const kx = Math.round(C.killXP(S.path.stars, S.path.kind, heroPL() - foeLv()) * Math.min(1, (C.xpShares(B).p || 0) + 1e-9)); S.lastKillXP = kx; if (kx > 0){ setTimeout(() => toast(`+${kx} XP for the fight`), 200); gainXP(kx); } } B.es.forEach(e => { S.stats.kills[e.key] = (S.stats.kills[e.key]||0) + 1; if (e.boss && !e.minion && !S.stats.bosses.includes(e.key)) S.stats.bosses.push(e.key); }); SND.sfx('win'); const extra = S.meta.equipped.includes('hunter') ? 1 : 0;
    S.chest = C.rollChest(Math.random, S.world, S.path.stars, S.path.kind, extra + (S.path.aura ? 1 : 0), S.meta.equipped.includes('lucky')); if (!S.cleared[0]) S.chest.forEach(it => { if (it.kind==='consumable' && it.key==='phoenix') it.key = 'hp2'; }); S.ink += 5 + S.path.stars*3 + (S.path.kind==='boss' ? 40 : S.path.kind==='mini' ? 20 : 0);
    for (const it of S.chest){ noteFind(it); if (it.kind==='consumable') addBelt(it.key); else if (it.kind==='soul') S.souls++; else { S.bag.push(it); S.newLoot.push(it.uid); } }
    BAT = null; setTimeout(checkAch, 300); go('chest'); }
  else if (B.over==='lose'){ await wait(700); S.deaths++; SND.sfx('lose'); BAT = null; go('dead'); }
  else battleScreen($('panel'));
}
function chestScreen(p){
  const loot = S.chest || [];
  const lb = legendBanner(loot); if (lb){ setTimeout(() => { ART3D.equipFx(Math.max(...loot.map(i => i.rar||0))); SND.sfx('perfect'); }, 1100); }
  p.innerHTML = lb + `<h2>Victory! The chest holds ${loot.length} item${loot.length>1?'s':''}</h2><div class="cards">${loot.map(it => card(it)).join('')}</div>
   <div class="row"><button id="next">${S.level===C.LMAX ? 'World cleared!' : 'Onward'}</button></div>`;
  $('next').onclick = () => { SND.sfx('click'); nextLevel(); };
}
function deadScreen(p){
  const useCp = S.checkpointOn && S.cp && S.level >= (S.cp.level||10);
  p.innerHTML = `<h2>You fell on level ${S.level}</h2><p>${useCp ? `Your checkpoint holds: back to level ${S.cp.level||10} with the stats and gear you had there.` : `Back to level 1 of ${esc(WD[S.world].name)} with the stats and gear you entered with.`} Wisdom and Boons are kept, and your Codex remembers which paragraphs tripped you up.</p><div class="row"><button id="again">Try again</button></div>`;
  $('again').onclick = () => { const sn = clone(useCp ? S.cp : S.snap); if (sn.hlv != null){ S.hlv = sn.hlv; S.xp = sn.xp || 0; } Object.assign(S, {st:sn.st, pts:sn.pts, bag:sn.bag, eq:sn.eq, belt:sn.belt, ink:sn.ink, souls:sn.souls||0, level: useCp ? (S.cp.level||10) : 1, quests:null, paths:null, path:null, essay:null, inspired:0, newLoot:[], resume:'map', hp:null, rested:false});
    if (!useCp) S.cp = null; SND.sfx('click'); go('map'); };
}
function carryScreen(p){
  const all = S.bag.filter(it => it.ti !== -1 || it.kind==='trinket').sort((a,b)=>b.rar-a.rar || C.power(b)-C.power(a));
  p.innerHTML = `<h2>${esc(WD[S.world].name)} cleared!</h2><p>Choose <b>2 items</b> to bring to ${esc(WD[S.world+1].name)}. Your stats come with you.</p>
   <div class="cards">${all.map(it => card(it, `<div class="row tight"><button class="pc ${S.carry.includes(it.uid)?'on':''}" data-u="${it.uid}">${S.carry.includes(it.uid)?'Chosen ✓':'Bring'}</button></div>`)).join('')}</div>
   <div class="row"><button id="travel" ${S.carry.length?'':'disabled'}>Travel with ${S.carry.length}/2</button></div>`;
  p.querySelectorAll('.pc').forEach(b => b.onclick = () => { const u = +b.dataset.u; if (S.carry.includes(u)) S.carry = S.carry.filter(x=>x!==u); else if (S.carry.length < 2) S.carry.push(u); save(); draw(); });
  $('travel').onclick = () => { const keep = S.carry.map(item); const s0 = C.starter(); S.bag = [s0.weapon, s0.armour, ...keep];
    const pl = {st:S.st, boons:S.meta.equipped, eq:{trinkets:[]}}; const wpn = keep.find(i=>i.kind==='weapon' && C.canEquip(pl,i)), arm = keep.find(i=>i.kind==='armour' && C.canEquip(pl,i)), trs = keep.filter(i=>i.kind==='trinket');
    S.eq = {weapon:(wpn||s0.weapon).uid, armour:(arm||s0.armour).uid, trinkets:[trs[0]?trs[0].uid:null, trs[1]?trs[1].uid:null]}; S.belt = {hp:2}; S.carry = []; enterWorld(S.world+1); syncPL(); save(); };
}
function doneScreen(p){ p.innerHTML = `<h2>All four worlds conquered!</h2><p>${S.wins} fights won · ${S.deaths} falls · ✦ ${S.meta.wisdom} Wisdom. Every essay, beaten.</p><div class="row"><button id="t">World select</button></div>`; $('t').onclick = () => go('title'); }

/* ---------- boot ---------- */
const HOWTO = () => `<div class="box">
  <p><b>Each level:</b> choose one of three paths (more ★ = harder fight, richer chest; ★★★★★ guarantees a Legendary; <b>?</b> paths are events) → camp: rest, equip gear, spend stat points, shop, boons → study quests → the fight. Each world has ${C.LMAX} levels, mini-bosses at 10 and 20 and the world boss at ${C.LMAX}.</p>
  <p><b>Study is your power.</b> Quests give XP: Easy 1, Normal 2, Hard 3, Insane 15 and God 25 points’ worth. Without them, enemies soon outgrow you. Pass every quest at a camp to become Inspired (+10% damage, +20% if all perfect). Passes also heal you and earn Ink (to spend) and Wisdom (permanent, for Boons).</p>
  <p><b>Battle:</b> tap an enemy to target it. Attack opens 4 moves: Basic (free, builds ⚡ energy), Multi, Heavy and Special (spend energy; each shows its damage, accuracy and effect); Focus gives a burst of energy and a stronger next hit; Guard blocks CHARGING attacks. HP carries between fights.</p>
  <p><b>Dying</b> restarts the world with the stats and gear you entered with (or from a checkpoint if you turn them on). Wisdom and Boons are kept. You have 3 save slots.</p>
  <p><b>Hints, not answers:</b> a wrong answer shows a hint (every third word, first letters, or two of the swapped words), never the full text. Flashcards get one try; a missed card comes back at a later camp. Peek (Hard and up) shows half of each sentence for 5 seconds for 15 Ink, and halves that quest's points.</p>
  <p><b>Multiplayer:</b> one run (20 or 30 rounds) with up to 5 friends. Everyone studies their own essays (paste them under ✎ My essays), then you fight together. Paths, events and every attack are chosen with a 15-second timer, and each extra player adds an extra enemy.</p></div>`;
function homeScreen(p){
  sceneKey = ''; ART3D.setScene('title', {world: 0, P:{st:{STR:0,AGI:0,FOR:0,WPN:0}, eq:{weapon:C.makeWeapon(0,1,3), armour:C.makeArmour(0,3,0), trinkets:[]}}, demo:{id:778, key:'watcher', name:'', art:'eye', color:'#e9e4da', trait:'boss', boss:true}}); SND.music('title');
  const slots = [1,2,3].map(n => ({n, s: readSlot(n)}));
  p.innerHTML = `<div class="title"><h1>Essay Quest</h1><p>Turn your HSC essays into power. Study at camp, choose your path, survive the bosses.</p></div>
   <div class="slots">${slots.map(({n, s}) => s ? `<div class="slot-card"><div class="rar">Save ${n}</div><b>${esc(WD[s.world].name)} · level ${s.level}/${s.len||30}</b>${s.stats&&s.stats.title?`<span class="ttl">“${esc(s.stats.title)}”</span>`:''}<small>${s.daily?`🔥 ${s.daily.streak}-day streak · `:''}${s.cleared.filter(Boolean).length} world${s.cleared.filter(Boolean).length===1?'':'s'} cleared · ⚜ ${Object.keys((s.stats&&s.stats.myth)||{}).length}/${Dd.LEGENDS.length} legends · ✦ ${s.meta.wisdom} Wisdom · ${s.deaths} falls · ${s.played ? new Date(s.played).toLocaleDateString('en-AU') : ''}</small><div class="row tight"><button class="cont" data-n="${n}">Continue</button><button class="ghost del" data-n="${n}">Delete</button></div></div>`
       : `<div class="slot-card empty"><div class="rar">Save ${n}</div><b>Empty</b><small>Start a fresh adventure.</small><div class="row tight"><button class="newg" data-n="${n}">New game</button></div></div>`).join('')}</div>
   <div class="row"><button id="mp">👥 Multiplayer</button><button class="ghost" id="essays">✎ My essays</button><button class="ghost" id="settings">⚙ Settings</button><button class="ghost" id="how">How to play</button></div><div id="howto"></div>`;
  $('mp').onclick = () => { SND.ensure(); SND.sfx('click'); APP = 'party'; draw(); }; $('essays').onclick = () => { window.__essBack = 'home'; APP = 'essays'; draw(); };
  p.querySelectorAll('.cont').forEach(b => b.onclick = () => { SND.ensure(); SND.sfx('click'); loadSlot(+b.dataset.n); APP = 'game'; save(); draw(); });
  p.querySelectorAll('.newg').forEach(b => b.onclick = () => { SND.ensure(); SND.sfx('click'); const n = +b.dataset.n;
    p.innerHTML = `<h2>New game · save ${n}</h2><p>How long should each world be?</p><div class="paths"><button class="path" id="len15"><span class="st">Exam prep</span><b>Short · 15 levels per world</b><small>Same difficulty curve, double stat points per quest. About 4–5 hours for all four worlds.</small></button><button class="path" id="len30"><span class="st">Full campaign</span><b>Full · 30 levels per world</b><small>The complete adventure: more fights, more loot, more study. About 15–20 hours.</small></button></div><div class="row"><button class="ghost" id="bk">Back</button></div>`;
    const hasMine = Object.keys(myEssays()).length > 0; let src = hasMine ? 'mine' : 'builtin';
    p.insertAdjacentHTML('beforeend', `<div class="box"><p><b>Which essays will you study?</b></p><div class="row tight"><button class="esrc ${src==='builtin'?'':'ghost'}" data-e="builtin">Built-in essays</button><button class="esrc ${src==='mine'?'':'ghost'}" data-e="mine" ${hasMine?'':'disabled'}>My essays</button><button class="ghost" id="pe">✎ Paste my essays</button></div><p class="muted small">${hasMine ? 'Modules you haven’t pasted fall back to the built-in essays.' : 'Paste your own essays to study them instead.'}</p></div>`);
    p.querySelectorAll('.esrc').forEach(b => b.onclick = () => { src = b.dataset.e; p.querySelectorAll('.esrc').forEach(x => x.classList.toggle('ghost', x.dataset.e !== src)); });
    $('pe').onclick = () => { window.__essBack = 'home'; APP = 'essays'; draw(); };
    const startG = len => { loadSlot(n, len); S.essaySrc = src; APP = 'game'; save(); draw(); };
    $('len15').onclick = () => startG(15); $('len30').onclick = () => startG(30); $('bk').onclick = () => draw(); });
  p.querySelectorAll('.del').forEach(b => b.onclick = () => { if (b.dataset.sure){ try { localStorage.removeItem(SKEY(+b.dataset.n)); } catch(e){} draw(); } else { b.dataset.sure = 1; b.textContent = 'Tap again to delete'; } });
  $('settings').onclick = () => { APP = 'settings'; draw(); };
  $('how').onclick = () => $('howto').innerHTML = HOWTO();
}
function essaysScreen(p){ const E = myEssays(); const MODS = [['common','Common Module'],['moda','Module A'],['modb','Module B'],['modc','Module C (creative + reflection)']];
  if (APP === 'essays') { try { ART3D.setScene('camp', {world:0, theme:0, P:{eq:{weapon:C.makeWeapon(0,1,2), armour:C.makeArmour(0,2,2)}}}); sceneKey = ''; } catch(e){} }
  p.innerHTML = `<h2>My essays</h2><p>Paste each essay with a <b>blank line between paragraphs</b>. The game splits it into paragraphs and sentences and builds every quest from it. Quotations in “quote marks” power the quote quests. Saved on this device.</p>
   ${MODS.map(([k, n]) => { const u = E[k] && E[k].units || []; return `<div class="box"><b>${n}</b><textarea id="es-${k}" rows="6" spellcheck="false" placeholder="Paste your ${n} essay here…">${esc(E[k] ? E[k].text : '')}</textarea><small class="muted" id="pv-${k}">${u.length ? `${u.length} paragraphs: ${u.map(x => `${esc(x.n)} (${x.s.length})`).join(' · ')}` : 'Not saved yet.'}</small></div>`; }).join('')}
   <div class="row"><button id="es-save">Save essays</button><button class="ghost" id="es-back">Back</button></div><p class="muted small" id="es-msg"></p>`;
  MODS.forEach(([k]) => { const ta = $('es-' + k); ta.oninput = () => { const u = parseEssay(ta.value, k); $('pv-' + k).textContent = u.length ? `${u.length} paragraphs: ${u.map(x => `${x.n} (${x.s.length} sentences)`).join(' · ')}` : 'Empty.'; }; });
  $('es-save').onclick = () => { const out = {}; MODS.forEach(([k]) => { const t = $('es-' + k).value.trim(); if (t){ const u = parseEssay(t, k); if (u.length) out[k] = {text:t, units:u}; } }); try { localStorage.setItem(ESSAYS_KEY, JSON.stringify(out)); $('es-msg').textContent = `Saved ${Object.keys(out).length} essay${Object.keys(out).length===1?'':'s'}.`; SND.sfx('level'); } catch(e){ $('es-msg').textContent = 'Could not save (storage blocked?).'; } };
  $('es-back').onclick = () => { APP = window.__essBack === 'party' ? 'party' : 'home'; draw(); }; }
function settingsScreen(p){
  p.innerHTML = `<h2>Settings</h2>
   <div class="stat"><div><b>Sound</b><small>Music and sound effects.</small></div><button id="s-m" class="${SET.muted?'ghost':''}">${SET.muted?'Off':'On'}</button></div>
   <div class="stat"><div><b>Music volume</b><small>${Math.round(SET.music*100)}%</small></div><input type="range" id="s-mv" min="0" max="1" step="0.05" value="${SET.music}" aria-label="music volume"></div>
   <div class="stat"><div><b>Effects volume</b><small>${Math.round(SET.sfx*100)}%</small></div><input type="range" id="s-sv" min="0" max="1" step="0.05" value="${SET.sfx}" aria-label="effects volume"></div>
   <div class="stat"><div><b>Screen shake</b><small>Turn off if motion bothers you.</small></div><button id="s-sh" class="${SET.motion?'':'ghost'}">${SET.motion?'On':'Off'}</button></div>
   <div class="stat"><div><b>Delete all saves</b><small>Wipes all three save slots and your Wisdom. Settings are kept.</small></div><button class="ghost" id="s-del">Delete all</button></div>
   <div class="row"><button id="s-back">Back</button></div>`;
  $('s-m').onclick = () => { SET.muted = !SET.muted; saveSet(); draw(); };
  $('s-mv').oninput = e => { SET.music = +e.target.value; saveSet(); }; $('s-sv').oninput = e => { SET.sfx = +e.target.value; saveSet(); SND.sfx('click'); };
  $('s-mv').onchange = $('s-sv').onchange = () => draw();
  $('s-sh').onclick = () => { SET.motion = !SET.motion; saveSet(); ART3D.setMotion(SET.motion); draw(); };
  $('s-del').onclick = () => { const b = $('s-del'); if (b.dataset.sure){ [1,2,3].forEach(n => { try { localStorage.removeItem(SKEY(n)); } catch(e){} }); APP = 'home'; draw(); } else { b.dataset.sure = 1; b.textContent = 'Tap again'; } };
  $('s-back').onclick = () => { APP = 'home'; draw(); };
}
/* ===== Essay Quest v5 — Party mode: friends in one run, every decision voted with a 15-second timer =====
   Transport: the artifact `room` capability. Three named rooms per party code:
     P  (eqp-CODE): every player's presence — name, votes, actions, ready flags, their hero snapshot
     S  (eqs-CODE): the host's presence — the run state (phase, level, paths, deadlines)
     E  (eqe-CODE): the host's presence — the battle (round, enemies, heroes, last round's events)
   Presence only (no event topics), so friends who can only view the artifact can still play.
   The host's page runs the authoritative simulation; everyone studies their OWN essays at camp. */
const PARTY = (() => {
const VOTE_MS = 15000, ACT_MS = 15000, ANIM_MS = 2600, CHEST_MS = 25000, MAXP = (typeof window !== 'undefined' && window.EQ_WEB) ? 6 : 5;
let lobbyRoom = null, R = {P:null, S:null, E:null}, code = null, isHost = false, myPeer = null, nick = '', local = false;
let G = null, GT = 0, BE = null, BET = 0; // latest host state + local receive time; latest battle packet
let peersP = [], unsub = [], hostTick = null, H = null; // H = host-only state
let CB = null, playedR = 0, playing = false, myAct = null, selT = null, view = 'home', lastErr = ''; let myNN = '';
const PKEY = 'eq5_party';
const now = () => Date.now();
const rcode = () => { const A = 'abcdefghjkmnpqrstuvwxyz23456789'; let s = ''; for (let i=0;i<5;i++) s += A[Math.floor(Math.random()*A.length)]; return s; };
try { nick = localStorage.getItem('eq5_nick') || ''; } catch(e){}

/* ---------- transport: the room capability, or a BroadcastChannel stand-in for same-device testing ---------- */
function fakeLobby(){ const me = 'L' + Math.random().toString(36).slice(2, 10); const bc = new BroadcastChannel('eq5-party');
  const rooms = {};
  bc.onmessage = ev => { const m = ev.data; const rm = rooms[m.room]; if (!rm || m.peer === me) return;
    if (m.type === 'pres'){ const old = rm.map[m.peer]; rm.map[m.peer] = {peer:m.peer, by:null, isMe:false, sameTab:false, kind:'viewer', guest:false, presence:m.presence, updatedAt: (old && JSON.stringify(old.presence) === JSON.stringify(m.presence)) ? old.updatedAt : now(), seen:now()}; rm.fire(); }
    if (m.type === 'hello'){ rm.send(); } if (m.type === 'bye'){ delete rm.map[m.peer]; rm.fire(); } };
  setInterval(() => { for (const k in rooms){ const rm = rooms[k]; rm.send(); let ch = false; for (const p in rm.map){ if (p !== me && now() - rm.map[p].seen > 9000){ delete rm.map[p]; ch = true; } } if (ch) rm.fire(); } }, 2500);
  addEventListener('beforeunload', () => { for (const k in rooms) bc.postMessage({type:'bye', room:k, peer:me}); });
  return {fake:true, me, join: async name => { if (rooms[name]) return rooms[name].api; const rm = {map:{}, subs:[], pres:{}};
      rm.map[me] = {peer:me, by:null, isMe:true, sameTab:true, kind:'viewer', guest:false, presence:{}, updatedAt:now(), seen:now()};
      rm.send = () => bc.postMessage({type:'pres', room:name, peer:me, presence:rm.pres});
      rm.fire = () => { const list = Object.values(rm.map).map(p => Object.freeze(Object.assign({}, p))); rm.subs.forEach(f => f({peers:list, joined:[], left:[], updated:[]})); };
      rm.api = {name, presence: async patch => { for (const k in patch){ if (patch[k] === null) delete rm.pres[k]; else rm.pres[k] = patch[k]; } const j = JSON.stringify(rm.pres); if (j.length > 4096) throw {code:'invalid_argument', message:'presence over 4 KiB: ' + j.length};
          rm.map[me] = Object.assign({}, rm.map[me], {presence: JSON.parse(j), updatedAt: now()}); rm.send(); rm.fire(); },
        peers: () => Object.values(rm.map), onPeers: fn => { rm.subs.push(fn); setTimeout(() => rm.fire(), 0); return () => { rm.subs = rm.subs.filter(x => x !== fn); }; },
        connected: () => true, leave: async () => { bc.postMessage({type:'bye', room:name, peer:me}); delete rooms[name]; }};
      rooms[name] = rm; bc.postMessage({type:'hello', room:name, peer:me}); return rm.api; }}; }
/* ---------- web edition transport. Two routes run side by side and the first one that reaches the host wins:
   1. a relay through public MQTT brokers over secure WebSockets (port 443 first), which gets through most school and
      home Wi-Fi because it looks like ordinary https traffic;
   2. a direct browser-to-browser link (WebRTC via PeerJS), which works on most mobile data.
   Star topology: the host's browser relays every player's presence to everyone, so this behaves exactly like the room
   capability above. If the host leaves, the run ends. ---------- */
const WEBV = typeof window !== 'undefined' && !!window.EQ_WEB;
const RELAYS = (typeof window !== 'undefined' && window.EQ_RELAYS) || ['wss://mqtt.eclipseprojects.io:443/mqtt', 'wss://broker.emqx.io:8084/mqtt', 'wss://broker.hivemq.com:8884/mqtt', 'wss://test.mosquitto.org:8081/mqtt'];
function peerLobby(){ const NS = 'essayquest-hsc-v1-', T = 'essayquest-hsc/v2/'; const popts = (typeof window !== 'undefined' && window.EQ_PEER_OPTS) || {};
  const rid = () => Math.random().toString(36).slice(2, 10);
  let peer = null, mq = [], up = null, conns = {}, links = {}, rooms = {}, amHost = false, ready = null, gone = false, lastHeard = 0, beat = null, hello = null, code0 = '';
  const L = {p2p:true, me:null, st:{in:0, out:0, why:''}}; if (typeof window !== 'undefined') window.__EQNET = L;
  const sendTo = (c, msg) => { try { if (c){ c.send(msg); L.st.out++; } } catch(e){ L.st.err = String(e); } };
  const bye = () => { if (amHost){ for (const id in conns) sendTo(conns[id], {t:'hostbye'}); for (const c of mq){ try { c.publish(T + code0 + '/bye', 'hostbye'); } catch(e){} } } else sendTo(up, {t:'bye'}); };
  if (typeof addEventListener !== 'undefined') addEventListener('pagehide', bye);
  const rm = name => rooms[name] || (rooms[name] = {map:{}, subs:[], pres:{}, api:null});
  const entry = (pid, presence, at) => ({peer:pid, by:null, isMe: pid === L.me, sameTab: pid === L.me, kind:'viewer', guest:false, presence, updatedAt: at || now()});
  function fire(name){ const r = rooms[name]; if (!r) return; const list = Object.values(r.map).map(p => Object.freeze(Object.assign({}, p))); r.subs.slice().forEach(f => { try { f({peers:list, joined:[], left:[], updated:[]}); } catch(e){ console.error(e); } }); }
  function snapOf(name){ const r = rooms[name], out = {}; for (const k in r.map) out[k] = {p: r.map[k].presence, u: r.map[k].updatedAt}; return out; }
  function broadcast(name){ const msg = {t:'room', room:name, map:snapOf(name)}; for (const id in conns) sendTo(conns[id], msg); }
  function setPres(name, pid, presence){ const r = rm(name); const old = r.map[pid]; if (old && JSON.stringify(old.presence) === JSON.stringify(presence)) return false; r.map[pid] = entry(pid, JSON.parse(JSON.stringify(presence))); return true; }
  function dropPeer(pid){ for (const name in rooms){ if (rooms[name].map[pid]){ delete rooms[name].map[pid]; if (amHost) broadcast(name); fire(name); } } }
  function hostLost(){ if (gone) return; gone = true; clearInterval(beat); clearInterval(hello); const rs = Object.keys(rooms); for (const name of rs){ const r = rooms[name]; if (!r) continue; for (const pid in r.map) if (pid !== L.me) delete r.map[pid]; } for (const name of rs) if (rooms[name]) fire(name); if (L.onLost) setTimeout(L.onLost, 0); }
  function closeAll(){ clearInterval(beat); clearInterval(hello); for (const c of mq){ try { c.end(true); } catch(e){} } mq = []; try { peer && peer.destroy(); } catch(e){} peer = null; }
  /* host: one message from a client, arriving by either route */
  const banned = {}; L.kick = id => { const c = conns[id]; if (c) sendTo(c, {t:'kicked'}); banned[id] = 1; delete conns[id]; dropPeer(id); };
  function hostHandle(id, m, link){ if (!id || !m || typeof m !== 'object') return; if (banned[id]){ sendTo(link, {t:'kicked'}); return; } L.st.in++; (L.st.from = L.st.from || {})[id] = (L.st.from[id] || 0) + 1; const full = () => !conns[id] && Object.keys(conns).length >= MAXP - 1;
    if (m.t === 'hello'){ sendTo(link, full() ? {t:'full'} : {t:'welcome'}); return; }   // a client probing routes: just answer on that route
    if (m.t === 'bye'){ if (conns[id] && conns[id] === link){ delete conns[id]; dropPeer(id); } return; }
    let c = conns[id], fresh = false; if (!c){ if (full()){ sendTo(link, {t:'full'}); return; } c = conns[id] = link; fresh = true; } else if (c !== link) conns[id] = c = link;   // 'bind' (and every later message) fixes the route
    c.seen = now();
    if (m.t === 'bind' || fresh){ for (const name in rooms) sendTo(c, {t:'room', room:name, map:snapOf(name)}); if (m.t === 'bind') return; }
    if (m.t === 'pres' && typeof m.room === 'string' && rooms[m.room] && JSON.stringify(m.presence || {}).length < 24000){ if (setPres(m.room, id, m.presence || {})){ broadcast(m.room); fire(m.room); } } }
  /* client: one message from the host */
  function clientHandle(m, via){ if (!m || typeof m !== 'object' || gone) return; if (up && up.via !== via) return; lastHeard = now(); L.st.in++;
    if (m.t === 'hostbye'){ hostLost(); return; }
    if (m.t === 'kicked'){ goneWhy = 'The host removed you from the game. You can rejoin with the same code.'; hostLost(); return; }
    if (m.t === 'full'){ goneWhy = 'That game is full (' + MAXP + ' players).'; if (L._bad) L._bad(new Error(goneWhy)); hostLost(); return; }
    if (m.t === 'room'){ const r = rm(m.room); const mine = r.map[L.me]; r.map = {}; for (const pid in m.map){ if (pid === L.me) continue; r.map[pid] = entry(pid, m.map[pid].p, m.map[pid].u); } if (mine) r.map[L.me] = mine; fire(m.room); } }
  function relay(url, extra){ if (typeof mqtt === 'undefined') return null; try { const c = mqtt.connect(url, Object.assign({clientId: 'eq' + rid() + rid(), clean:true, keepalive:30, reconnectPeriod:3000, connectTimeout:9000, protocolVersion:4}, extra || {})); c.on('error', () => {}); mq.push(c); return c; } catch(e){ return null; } }
  L.prepare = (code, host) => { if (ready) return ready; amHost = host; gone = false; code0 = code; L.me = (host ? 'h' : 'c') + rid();
    ready = new Promise((res, rej) => {
      if (typeof mqtt === 'undefined' && typeof Peer === 'undefined'){ rej(new Error('The connection library did not load. Refresh the page.')); return; }
      let settled = false; const ok = () => { if (!settled){ settled = true; clearTimeout(to); res(); } }, bad = e => { if (!settled){ settled = true; clearTimeout(to); closeAll(); ready = null; rej(e); } }; L._bad = bad;
      const to = setTimeout(() => bad(new Error(host ? 'Could not reach any connection server. Check the internet connection and try again.' : 'Could not reach that game. Check the code, and that the host still has the game open. On school Wi-Fi the network may be blocking it: try again, or use mobile data.')), host ? 15000 : 20000);
      if (amHost){
        for (const url of RELAYS){ const cl = relay(url, {will: {topic: T + code + '/bye', payload: 'hostbye', qos:0, retain:false}}); if (!cl) continue;
          cl.on('connect', () => { cl.subscribe(T + code + '/h', {qos:0}); ok(); });
          cl.on('message', (topic, payload) => { let d; try { d = JSON.parse(payload.toString()); } catch(e){ return; } if (!d || typeof d.f !== 'string' || d.f === L.me) return;
            const key = url + '|' + d.f; const link = links[key] || (links[key] = {via:url, send: m => cl.publish(T + code + '/c/' + d.f, JSON.stringify(m))}); hostHandle(d.f, d.m, link); }); }
        if (typeof Peer !== 'undefined'){ try { peer = new Peer(NS + code, popts); peer.on('error', () => {}); peer.on('disconnected', () => { if (peer && !peer.destroyed) try { peer.reconnect(); } catch(x){} }); peer.on('open', ok);
          peer.on('connection', c => { const id = String(c.peer).replace(NS + 'c-', ''); const link = {via:'p2p', send: m => { if (c.open) c.send(m); }};
            c.on('open', () => hostHandle(id, {t:'hello'}, link)); c.on('data', m => hostHandle(id, m, link)); c.on('close', () => { if (conns[id] === link){ delete conns[id]; dropPeer(id); } }); c.on('error', () => {}); }); } catch(e){} }
        clearInterval(beat); beat = setInterval(() => { const t = now(); for (const id in conns){ const c = conns[id]; if (t - (c.seen || t) > 60000){ L.st.dropped = (L.st.dropped || []).concat(id); delete conns[id]; dropPeer(id); } else sendTo(c, {t:'ping'}); } }, 2000);
      } else {
        const choose = link => { if (up || gone) return; up = link; lastHeard = now(); clearInterval(hello);
          for (const c of mq) if (c !== link.client){ try { c.end(true); } catch(e){} } mq = link.client ? [link.client] : []; if (link.via !== 'p2p'){ try { peer && peer.destroy(); } catch(e){} peer = null; }
          sendTo(up, {t:'bind'}); clearInterval(beat); beat = setInterval(() => { sendTo(up, {t:'ping'}); if (typeof document !== 'undefined' && document.hidden) lastHeard = now(); else if (now() - lastHeard > 30000){ L.st.why = 'silence ' + (now() - lastHeard); hostLost(); } }, 3000);
          if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => { if (!document.hidden && up && !gone){ lastHeard = now(); sendTo(up, {t:'bind'}); } }); ok(); };
        const tries = [];
        for (const url of RELAYS){ const cl = relay(url, {will: {topic: T + code + '/h', payload: JSON.stringify({f:L.me, m:{t:'bye'}}), qos:0, retain:false}}); if (!cl) continue; const link = {via:url, client:cl, send: m => cl.publish(T + code + '/h', JSON.stringify({f:L.me, m}))};
          cl.on('connect', () => { cl.subscribe([T + code + '/c/' + L.me, T + code + '/bye'], {qos:0}, () => { if (!up) sendTo(link, {t:'hello'}); }); tries.push(link); });
          cl.on('message', (topic, payload) => { if (topic === T + code + '/bye'){ if (up && up.via === url) hostLost(); return; } let d; try { d = JSON.parse(payload.toString()); } catch(e){ return; } if (!up && d && (d.t === 'welcome' || d.t === 'full')){ if (d.t === 'full'){ clientHandle(d, url); return; } choose(link); } clientHandle(d, url); }); }
        hello = setInterval(() => { if (!up) for (const l of tries) sendTo(l, {t:'hello'}); }, 1500);
        if (typeof Peer !== 'undefined'){ try { peer = new Peer(NS + 'c-' + L.me, popts); peer.on('error', () => {});
          peer.on('open', () => { if (up || !peer) return; const hc = peer.connect(NS + code, {reliable:true}); const link = {via:'p2p', send: m => { if (hc.open) hc.send(m); }};
            hc.on('data', d => { if (!up && d && d.t === 'welcome') choose(link); clientHandle(d, 'p2p'); }); hc.on('close', () => { if (up === link) hostLost(); }); hc.on('error', () => {}); }); } catch(e){} }
      } });
    return ready; };
  L.join = async name => { const r = rm(name); if (r.api) return r.api; r.map[L.me] = entry(L.me, {});
    r.api = {name, presence: async patch => { for (const k in patch){ if (patch[k] === null) delete r.pres[k]; else r.pres[k] = patch[k]; } r.map[L.me] = entry(L.me, JSON.parse(JSON.stringify(r.pres)));
        if (amHost) broadcast(name); else sendTo(up, {t:'pres', room:name, presence:r.pres}); fire(name); },
      peers: () => Object.values(r.map), onPeers: fn => { r.subs.push(fn); setTimeout(() => fire(name), 0); return () => { r.subs = r.subs.filter(x => x !== fn); }; },
      connected: () => !gone, leave: async () => { bye(); setTimeout(closeAll, 300); rooms = {}; conns = {}; links = {}; ready = null; up = null; gone = true; lobbyRoom = null; }};
    if (amHost) broadcast(name); return r.api; };
  return L; }
/* host master key: only a SHA-256 hash of it is in the page */
async function keyOk(k){ if (!window.EQ_KEYHASH) return false; if (!(window.crypto && crypto.subtle)) throw new Error('Hosting needs the secure (https) address of the site.');
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(k).trim())); const hex = [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join(''); return hex === window.EQ_KEYHASH; }
let online = null, testMode = !!window.EQ_TESTNET, goneWhy = ''; // null = checking, true/false once known
async function checkOnline(){ if (WEBV){ online = true; return online; } if (online !== null) return online; try { const r = window.claude && typeof window.claude.use === 'function' ? await window.claude.use('room') : null; if (r){ lobbyRoom = r; local = false; online = true; } else online = false; } catch(e){ online = false; } if (APP === 'party' && view === 'home') draw(); return online; }
async function getLobby(){ if (lobbyRoom) return lobbyRoom; if (WEBV && !testMode){ lobbyRoom = peerLobby(); local = false; online = true; return lobbyRoom; } if (testMode && typeof BroadcastChannel !== 'undefined'){ lobbyRoom = fakeLobby(); local = true; return lobbyRoom; }
  await checkOnline(); if (lobbyRoom) return lobbyRoom; return null; }
async function connect(c, host){
  myNN = Math.random().toString(36).slice(2, 8);
  const L = await getLobby(); if (!L) throw new Error('Online play isn’t available in this view: open the game from its claude.ai link while signed in.');
  if (L.prepare){ L.onLost = () => { if (code && !isHost) hostGone(); }; await L.prepare(c, host); }
  code = c; isHost = host; for (const k of ['P','S','E']) R[k] = await L.join(`eq${k.toLowerCase()}-${c}`);
  myPeer = (L.fake || L.p2p) ? L.me : null;
  const onP = ch => { peersP = ch.peers.slice(); if (!myPeer){ const me = peersP.find(p => p.isMe && p.sameTab); if (me) myPeer = me.peer; } if (isHost) hostCheck(); try { processGifts(); } catch(e){ console.error(e); } refresh(); };
  const onS = ch => { const hp = ch.peers.find(p => p.presence && p.presence.g); if (hp && hp.presence.g.seq !== (G && G.seq)){ const prev = G; G = hp.presence.g; GT = hp.updatedAt || now(); onState(prev); } else if (!hp && G && !isHost){ hostGone(); } };
  const onE = ch => { const hp = ch.peers.find(p => p.presence && p.presence.b); if (hp && (!BE || hp.presence.b.k !== BE.k || hp.presence.b.v !== BE.v)){ BE = hp.presence.b; BET = hp.updatedAt || now(); onBattle(); } };
  unsub.push(R.P.onPeers(onP), R.S.onPeers(onS), R.E.onPeers(onE));
  if (!myPeer){ await R.P.presence({n: nick || 'Player'}); for (let i=0;i<20 && !myPeer;i++){ await new Promise(r => setTimeout(r, 100)); const me = R.P.peers().find(p => p.isMe && p.sameTab); if (me) myPeer = me.peer; } }
}
async function leave(){ unsub.forEach(f => { try { f(); } catch(e){} }); unsub = []; clearInterval(hostTick); hostTick = null; for (const k of ['P','S','E']){ try { if (R[k]) await R[k].leave(); } catch(e){} R[k] = null; } G = null; BE = null; H = null; code = null; isHost = false; CB = null; playedR = 0; }
const me = () => peersP.find(p => p.peer === myPeer);
const kickedList = () => ((isHost && H) ? H.kicked : G && G.kicked) || [];
const isKickedP = p => kickedList().some(k => k.id === p.peer && k.nn === (p.presence.nn || ''));
const players = () => peersP.filter(p => p.presence && p.presence.n && p.presence.j === code && !isKickedP(p)).sort((a,b) => (a.presence.t||0) - (b.presence.t||0));
const pres = patch => { if (R.P) R.P.presence(patch).catch(e => { lastErr = e.message || e.code; }); };
const nameOf = id => { const p = peersP.find(x => x.peer === id); return p && p.presence.n ? String(p.presence.n).slice(0, 20) : 'Someone'; };

/* ---------- the player's own run character (lives in S while in party mode) ---------- */
/* Wisdom and Boons are yours for good: party play keeps them on this device between runs */
const MKEY = 'eq5_partymeta';
function loadMeta(){ try { const m = JSON.parse(localStorage.getItem(MKEY) || 'null'); if (m && typeof m.wisdom === 'number') return {wisdom: m.wisdom, owned: Array.isArray(m.owned) ? m.owned : [], equipped: Array.isArray(m.equipped) ? m.equipped : []}; } catch(e){} return null; }
const HKEY = 'eq5_hall';
function loadHall(){ try { const h = JSON.parse(localStorage.getItem(HKEY) || 'null'); if (h && typeof h.clears === 'number') return h; } catch(e){} return {clears:0, last:'', trophies:[]}; }
function hallClear(){ const h = loadHall(); const k = code + ':' + (G ? G.wipes : 0); if (h.last === k) return; h.last = k; h.clears++; const best = (S.chest || []).filter(i => i.kind !== 'consumable' && i.kind !== 'tome').sort((a, b) => b.rar - a.rar)[0]; h.trophies.unshift({d: new Date().toISOString().slice(0, 10), n: nick, len: G ? G.len : 0, item: best ? best.name : ''}); h.trophies = h.trophies.slice(0, 12); try { localStorage.setItem(HKEY, JSON.stringify(h)); } catch(e){} S.hallRank = h.clears; setTimeout(() => toast(`🏆 Hall of Legends: rank ${h.clears}. Every new run starts with +${Math.min(10, 2*h.clears)} stat points!`), 1500); }
function saveMeta(){ try { if (S && S.party && S.meta) localStorage.setItem(MKEY, JSON.stringify({wisdom: S.meta.wisdom, owned: S.meta.owned, equipped: S.meta.equipped})); } catch(e){} }
function saveLocal(){ saveMeta(); try { localStorage.setItem(PKEY, JSON.stringify({code, S, nick})); } catch(e){} }
function lookOf(st){ const it = uid => st.bag.find(i => i.uid === uid) || null; const w = it(st.eq.weapon), a = it(st.eq.armour);
  const sl = x => x ? {type:x.type, arch:x.arch, rar:x.rar, world:x.world, special:x.special, ti:x.ti, role:x.role, kind:x.kind, myth:x.myth, fx:x.fx, types:C.itemTypes(x)} : null; return {lv: st.hlv || 1, eq:{weapon: sl(w), armour: sl(a), trinkets:[]}}; }
function heroSnap(){ const pl = P(); const strip = x => x ? (C.itemTypes(x), Object.assign({}, x, {name: undefined, lore: undefined})) : null;
  return {P:{st:pl.st, boons:pl.boons, eq:{weapon:strip(pl.eq.weapon), armour:strip(pl.eq.armour), trinkets:pl.eq.trinkets.filter(Boolean).map(strip)}}, belt:S.belt, hp: (S.meta.equipped.includes('second') && curHP() < maxHP()*0.5) ? Math.min(maxHP(), curHP() + Math.round(maxHP()*0.2)) : curHP(), insp:S.inspired||0}; }
function newChar(src){ let st = fresh(); if (st.bag) st.bag.forEach(i => C.applyLevel(i, i.lvl || 1)); if (src && src.startsWith('slot')){ const s = readSlot(+src.slice(4)); if (s){ st = fresh(); Object.assign(st, {hlv: s.hlv || C.plOf(s.world, s.level), xp: s.xp || 0, st: clone(s.st), bag: clone(s.bag.filter(i => [s.eq.weapon, s.eq.armour, ...s.eq.trinkets].includes(i.uid))), eq: clone(s.eq), meta:{wisdom:0, owned:[], equipped: clone(s.meta.equipped)}, mastery: clone(s.mastery||{})}); } }
  { const mm = loadMeta(); if (mm){ const eqd = (st.meta.equipped && st.meta.equipped.length) ? st.meta.equipped : mm.equipped; st.meta = {wisdom: mm.wisdom, owned: mm.owned.concat((st.meta.equipped||[]).filter(x => !mm.owned.includes(x))), equipped: eqd}; } }
  { const hh = loadHall(); if (hh.clears){ st.pts = (st.pts || 0) + Math.min(10, 2*hh.clears); st.legacy = hh.clears; } }
  st.party = true; st.essaySrc = Object.keys(myEssays()).length ? 'mine' : 'builtin'; st.stats = {units:{}, time:0, quests:0, perfects:0, quotePerf:0, kills:{}, found:{}, bosses:[], ach:[], title:''}; return st; }

/* rejoining the same game: pick up your hero as it was at the start of the last round you were in */
function rejoinChar(c){ let saved = null; try { saved = JSON.parse(localStorage.getItem(PKEY) || 'null'); } catch(e){} if (!saved || saved.code !== c || !saved.S || !saved.S.party || !saved.S.snap) return null;
  const st = saved.S; // everything you had when you left: gear, gifts, level, potions (the fight you left simply carries on without you)
  Object.assign(st, {quests:null, phase:'camp', chest:null, newLoot:[]}); rejoined = true; return st; }
let rejoined = false;
/* ---------- gifting gear to a party member: the item travels in your presence until they confirm they got it ---------- */
const others = () => players().filter(x => x.peer !== myPeer);
function giftMenu(uid){ const it = S.bag.find(i => i.uid === uid); if (!it) return; const os = others(); if (!os.length){ toast('No one else is here to gift to.'); return; }
  if ([S.eq.weapon, S.eq.armour, ...S.eq.trinkets].includes(uid)){ toast('Take it off before gifting it.'); return; }
  let ov = document.getElementById('giftov'); if (!ov){ ov = document.createElement('div'); ov.id = 'giftov'; ov.className = 'modalov'; document.body.appendChild(ov); } ov.hidden = false;
  ov.innerHTML = `<div class="adbox"><h2 style="margin:0 0 6px">🎁 Gift ${esc(it.name)}</h2><p class="muted small">It leaves your bag now and lands in theirs in a moment.</p><div class="row tight">${os.map(x => `<button class="gto" data-p="${esc(x.peer)}">${esc(String(x.presence.n||'Player').slice(0,20))}</button>`).join('')}<button class="ghost" id="gx">Cancel</button></div></div>`;
  $('gx').onclick = () => { ov.hidden = true; };
  ov.querySelectorAll('.gto').forEach(b => b.onclick = () => { ov.hidden = true; sendGift(it, b.dataset.p); }); }
let pendingGifts = [];
function sendGift(it, to){ if (pendingGifts.length >= 3){ toast('Wait for your other gifts to arrive first.'); return; } S.bag = S.bag.filter(i => i.uid !== it.uid); S.newLoot = (S.newLoot||[]).filter(x => x !== it.uid);
  const strip = Object.assign({}, it); delete strip.lore; pendingGifts.push({k: myPeer + ':' + it.uid + ':' + now(), to, it: strip, t: now()}); pres({gifts: pendingGifts}); saveLocal(); save(); toast(`Sent ${it.name} to ${nameOf(to)}.`); SND.sfx('coin'); if (S.phase === 'camp') draw(); }
function processGifts(){ if (!S || !S.party || !myPeer) return; S.gotGifts = S.gotGifts || []; let changed = false;
  for (const x of others()){ for (const g of (x.presence.gifts || [])){ if (g.to !== myPeer || S.gotGifts.includes(g.k) || !g.it || !g.it.kind) continue;
      const it = Object.assign({}, g.it, {uid: 100000000 + Math.floor(Math.random()*800000000), grand:false}); S.bag.push(it); S.newLoot = (S.newLoot||[]).concat(it.uid); S.gotGifts.push(g.k); changed = true;
      toast(`🎁 ${nameOf(x.peer)} gave you ${it.name}!`); SND.sfx('perfect'); } }
  if (changed){ S.gotGifts = S.gotGifts.slice(-40); pres({got: S.gotGifts.slice(-12)}); saveLocal(); save(); if (S.phase === 'camp' && view === 'camp') draw(); }
  // sender side: drop delivered gifts; refund gifts whose recipient left
  if (pendingGifts.length){ const before = pendingGifts.length; pendingGifts = pendingGifts.filter(g => { const r = players().find(x => x.peer === g.to); if (!r){ if (now() - g.t > 8000){ S.bag.push(g.it); toast(`${g.it.name} came back: they left.`); return false; } return true; } return !(r.presence.got || []).includes(g.k); });
    if (pendingGifts.length !== before){ pres({gifts: pendingGifts.length ? pendingGifts : null}); saveLocal(); } } }
/* ---------- host ---------- */
function hostStart(opts){ H = {seq:0, w:opts.w, len:opts.len, cp:opts.cp, nq:!!opts.nq, lvl:1, ph:'lobby', wipes:0, cpLvl:0}; pushState(); clearInterval(hostTick); hostTick = setInterval(hostCheck, 300); }
function pushState(extra){ if (!isHost || !H) return; H.seq++; const g = {seq:H.seq, ph:H.ph, w:H.w, len:H.len, cp:H.cp, nq:!!H.nq, lvl:H.lvl, wipes:H.wipes, cpLvl:H.cpLvl, host:myPeer, roster:H.roster || [], paths:H.paths || null, path:H.path || null, vk:H.vk || null, dl: H.deadline ? Math.max(0, H.deadline - now()) : 0, res:H.res || null, evc:H.evc, msg:H.msg || '', downs:H.downs || [], revived:H.revived || 0, kicked:(H.kicked || []).slice(-16), sit:Object.keys(H.sit || {}), afk:Object.keys(H.afk || {}).filter(k => H.afk[k] >= 2)};
  Object.assign(g, extra || {}); R.S.presence({g}).catch(e => { lastErr = 'state: ' + (e.message || e.code); }); }
function pushBattle(ev){ if (!H || !H.B) return; const B = H.B; const fl = e => (e.elite?'e':'') + (e.minion?'m':'') + (e.mini?'M':'') + (e.boss?'b':'') + (e.charging?'c':'') + (e.exposed?'x':'') + (e.guard?'g':'') + (e.status.burn?'u':'') + (e.status.stun?'s':'') + (e.enraged?'r':'') + (e.summoner?'S':'');
  const stE = e => { const o = {}; for (const k of ['burn','poison','blind','slow','weak','vuln','empower']) if (e.status[k] > 0) o[k] = e.status[k]; if (e.status.dodge > 0) o.dodge = e.status.dodge; if (e.status.stun) o.stun = 1; if (e.rot) o.tp = Dd.TYPES.indexOf(e.types[0]); return o; };
  const es = B.es.map(e => [e.id, e.key, e.hp, e.max, fl(e), e.lv||0, stE(e)]); const hs = B.heroes.map(h => [h.hid, h.hp, h.max, h.energy, (h.down?'d':'') + (h.frozen?'f':'') + (h.guard?'g':'') + (h.st && h.st.burn?'b':'') + (h.focus?'F':''), h.w.arch, Object.assign({}, h.mcd || {}), Object.assign({}, h.st || {})]);
  let evs = (ev || []).map(x => Object.assign({}, x)); H.bv = (H.bv || 0) + 1; const pack = () => ({k: H.bk + ':' + B.turn, v:H.bv, r:B.turn, over:B.over, es, hs, ev:evs, dl: Math.max(0, H.deadline - now()), lv:H.lvl, path:H.path});
  const CAP = WEBV ? 20000 : 3900; let j = JSON.stringify({b:pack()}); if (j.length > CAP){ evs = evs.filter(x => x.t !== 'msg'); j = JSON.stringify({b:pack()}); } while (j.length > CAP && evs.length){ evs = evs.slice(0, Math.floor(evs.length*0.8)); j = JSON.stringify({b:pack()}); }
  R.E.presence({b:pack()}).catch(e => { lastErr = 'battle: ' + (e.message || e.code); }); }
const SKILLCOSTS = h => C.SKILLCOST[h.w.arch] + 10*C.abilOf(h.w, 'slowskill');
function hostCheck(){ if (!isHost || !H) return; const ps = players(); const ids = ps.map(p => p.peer); const t = now();
  if (H.ph === 'lobby') return;
  H.roster = ps.map(p => [p.peer, String(p.presence.n||'').slice(0,20)]); if (H.downs && H.downs.some(id => !ids.includes(id))) H.downs = H.downs.filter(id => ids.includes(id));
  if (H.ph === 'map'){ const votes = ps.map(p => p.presence.cv).filter(v => v && v.k === H.vk); if (votes.length >= ps.length || t >= H.deadline){ const tally = H.paths.map((_, i) => votes.filter(v => v.i === i).length); const best = Math.max(...tally); const top = tally.map((n, i) => n === best ? i : -1).filter(i => i >= 0); const pick = top[Math.floor(Math.random()*top.length)];
      H.path = H.paths[pick]; H.msg = `${tally[pick]} vote${tally[pick]===1?'':'s'}: ${H.path.kind==='event' ? 'event' : '★'.repeat(H.path.stars)} path chosen`; if (H.path.kind==='event'){ H.ph = 'event'; H.vk = 'e' + H.lvl + ':' + H.seq; H.deadline = t + VOTE_MS; H.evc = null; } else { H.ph = 'camp'; H.deadline = 0; } pushState(); } return; }
  if (H.ph === 'event'){ if (H.evc != null) { if (t >= H.deadline) hostNext(); return; } const votes = ps.map(p => p.presence.cv).filter(v => v && v.k === H.vk); if (votes.length >= ps.length || t >= H.deadline){ const n = Dd.EVENTS[H.path.ev].opts.length; const tally = [...Array(n)].map((_, i) => votes.filter(v => v.i === i).length); const best = Math.max(...tally); const top = tally.map((x, i) => x === best ? i : -1).filter(i => i >= 0); H.evc = top[Math.floor(Math.random()*top.length)];
      if (H.path.ev === 'aura' && H.evc === 0){ H.path = Object.assign({}, H.path, {kind:'normal', stars:4, aura:true}); H.ph = 'camp'; H.evc = null; H.deadline = 0; pushState(); return; }
      if (H.path.ev === 'shrine' && H.evc === 0){ H.ph = 'camp'; H.deadline = 0; pushState(); return; }
      H.deadline = t + 6000; pushState(); } return; }
  if (H.ph === 'camp'){ const sit = H.sit || {}; const need = ps.filter(p => !sit[p.peer]); const ready = need.filter(p => p.presence.rdy === H.lvl + ':' + H.wipes && p.presence.hero); if (need.length && ready.length >= need.length){ if (H.path.kind === 'event') hostNext(); else hostBattle(ready); } return; }
  if (H.ph === 'battle'){ const B = H.B; if (!B) return; if (B.over){ if (t >= H.deadline) hostAfterBattle(); return; }
    if (B.heroes.some(h => !ids.includes(h.hid))){ B.heroes = B.heroes.filter(h => ids.includes(h.hid)); if (!B.heroes.length){ hostAfterBattle(true); return; } if (!B.heroes.includes(B.p)) B.p = B.heroes[0]; pushBattle([]); } // someone left: they vanish from the battle
    const alive = B.heroes.filter(h => !h.down && h.hp > 0);
    const acts = {}; for (const p of ps){ const a = p.presence.act; if (a && a.r === B.turn && a.k === H.bk) acts[p.peer] = a; }
    H.skip = H.skip || {}; H.afk = H.afk || {}; const rk = H.bk + ':' + B.turn; const own = Object.assign({}, acts);
    for (const h of alive){ if (!acts[h.hid]){ if (H.skip[h.hid] === rk) acts[h.hid] = {a:'skip'}; else if ((H.afk[h.hid] || 0) >= 2) acts[h.hid] = {a:'auto'}; } }   // the host can skip a turn; players who missed two rounds in a row stop holding the party up
    if (t >= H.deadline || alive.every(h => acts[h.hid])){
      for (const h of alive){ if (own[h.hid]) H.afk[h.hid] = 0; else if (H.skip[h.hid] !== rk) H.afk[h.hid] = (H.afk[h.hid] || 0) + 1; }
      const acts2 = {}; for (const [k, a] of Object.entries(acts)){ const hh = B.heroes.find(x => x.hid === k); acts2[k] = a.a === 'skip' ? {act:'skip'} : a.a === 'auto' ? (hh ? C.autoAct(B, hh, Math.random) : {act:'move', item:0}) : {act:a.a, tgt:a.t, item:a.i}; }
      const ev = C.partyRound(B, acts2, Math.random);
      H.deadline = t + ACT_MS + Math.min(9000, ANIM_MS + ev.length*140); if (B.over) H.deadline = t + Math.min(9000, ANIM_MS + ev.length*140); pushBattle(ev); } return; }
  if (H.ph === 'chest'){ const done = ps.filter(p => p.presence.cont === H.lvl + ':' + H.wipes); if (done.length >= ps.length || t >= H.deadline) hostNext(); return; }
  if (H.ph === 'wipe'){ if (t >= H.deadline){ H.ph = 'map'; newPaths(); pushState(); } return; }
  if (H.ph === 'terrain'){ const votes = ps.map(p => p.presence.cv).filter(v => v && v.k === H.vk); if (votes.length >= ps.length || t >= H.deadline){ const tally = WD.map((_, i) => votes.filter(v => v.i === i).length); const best = Math.max(...tally); const top = best ? tally.map((n, i) => n === best ? i : -1).filter(i => i >= 0) : [H.w]; const pick = top.includes(H.w) && top.length > 1 && best === 0 ? H.w : top[Math.floor(Math.random()*top.length)];
      const moved = pick !== H.w; H.w = pick; H.msg = moved ? `The party travels to ${WD[pick].name}: new enemies, new loot.` : `The party stays in ${WD[pick].name}.`; H.lvl++; H.ph = 'map'; newPaths(); pushState(); } return; }
}
function newPaths(){ H.sit = {}; H.paths = C.rollPaths(Math.random, H.lvl, H.w); H.path = null; H.vk = 'm' + H.lvl + ':' + H.wipes + ':' + H.seq; H.deadline = now() + VOTE_MS; H.res = null; H.evc = null; if (H.cp && C.miniLv().includes(H.lvl)) H.cpLvl = Math.max(H.cpLvl, H.lvl); }
function hostBegin(){ const ps = players(); if (!ps.length) return; C.setLMAX(H.len); C.setDiff(H.diff || 'hard'); C.setNQ(!!H.nq); H.lvl = 1; H.ph = 'map'; H.cpLvl = 0; newPaths(); pushState(); }
function hostBattle(ready0){ C.setDiff(H.diff || 'hard'); const ready = ready0.filter(p => !(H.downs||[]).includes(p.peer)); if (!ready.length){ H.wipes++; H.lvl = H.cp && H.cpLvl ? H.cpLvl : 1; H.ph = 'wipe'; H.deadline = now() + 7000; H.downs = []; pushState(); return; } const n = ready.length; const g = C.makeGroup(H.w, H.lvl, H.path, Math.random);
  C.scaleForParty(g, n, H.w, H.lvl, H.path, Math.random); // more friends, more foes: +1 enemy per extra player, totals grow ~n-fold
  const list = ready.map(p => ({hid:p.peer, P:p.presence.hero.P, belt:Object.assign({}, p.presence.hero.belt||{}), hp:p.presence.hero.hp, insp:p.presence.hero.insp||0}));
  H.B = C.newParty(list, g, {world:H.w}); H.bk = 'b' + H.lvl + ':' + H.wipes + ':' + H.seq; H.ph = 'battle'; H.res = null;
  const op = C.opening(H.B, Math.random); H.afk = {}; H.skip = {}; const cut = H.B.es.some(e => (e.boss || e.mini) && !e.minion) ? 4500 : 0; H.deadline = now() + ACT_MS + 3500 + cut + op.length*150; pushState({bk:H.bk}); pushBattle([{t:'start'}].concat(op)); }
function hostAfterBattle(empty){ const B = H.B; if (empty){ H.B = null; H.ph = 'chest'; H.res = {}; H.deadline = now() + 3000; pushState(); return; } if (B.over === 'win'){ H.res = {}; const revive = (H.path && H.path.kind === 'mini') || H.lvl % 5 === 0; H.downs = [...new Set((H.downs||[]).concat(B.heroes.filter(h => h.down).map(h => h.hid)))];
    const xs = C.xpShares(B); // group XP: each hero shares every foe that fell while they were still standing
    for (const h of B.heroes) if (!h.down) H.res[h.hid] = {hp: h.hp, belt: h.belt, xs: Math.round((xs[h.hid] || 0)*1000)/1000}; else H.res[h.hid] = {belt: h.belt, down: true, xs: Math.round((xs[h.hid] || 0)*1000)/1000};
    for (const id of H.downs){ H.res[id] = Object.assign(H.res[id] || {}, revive ? {revive: true, down: false} : {down: true}); } if (revive){ H.revived = H.downs.length; H.downs = []; } else H.revived = 0;
    H.ph = 'chest'; H.deadline = now() + CHEST_MS; H.B = null; pushState(); }
  else { H.downs = []; H.wipes++; H.lvl = H.cp && H.cpLvl ? H.cpLvl : 1; H.ph = 'wipe'; H.deadline = now() + 7000; H.B = null; H.res = null; pushState(); } }
function hostNext(){ if (H.lvl >= H.len && H.path && H.path.kind === 'boss'){ H.ph = 'end'; pushState(); return; }
  if (WEBV && H.lvl % 5 === 0 && H.ph !== 'terrain' && H.lvl < H.len){ H.ph = 'terrain'; H.vk = 't' + H.lvl + ':' + H.wipes + ':' + H.seq; H.deadline = now() + VOTE_MS; H.msg = ''; pushState(); return; }
  H.lvl++; H.ph = 'map'; newPaths(); pushState(); }

/* ---------- client: react to host state ---------- */
let appliedWipe = 0, appliedRes = '', appliedEv = '';
function onState(prev){ if (!G) return; if (!isHost && myPeer && (G.kicked || []).some(k => k.id === myPeer && k.nn === myNN)){ kickedOut(); return; } C.setLMAX(G.len); C.setNQ(!!G.nq); if (!S || !S.party) return;
  if (rejoined){ rejoined = false; appliedWipe = G.wipes; appliedRes = G.lvl + ':' + G.wipes; appliedEv = G.lvl + ':' + G.wipes; S.runCode = code; }
  if (G.wipes > appliedWipe && S.snap){ appliedWipe = G.wipes; const useCp = G.cpLvl && S.cp && S.cp.level === G.cpLvl; const sn = clone(useCp ? S.cp : S.snap); if (sn.hlv != null){ S.hlv = sn.hlv; S.xp = sn.xp || 0; } Object.assign(S, {st:sn.st, pts:sn.pts, bag:sn.bag, eq:sn.eq, belt:sn.belt, ink:sn.ink, quests:null, path:null, essay:null, inspired:0, hp:null, down:false}); toast('The party fell. Back to level ' + (useCp ? G.cpLvl : 1) + '.'); }
  if (S.level !== G.lvl || S.world !== G.w){ S.level = G.lvl; S.world = G.w; S.quests = null; S.rested = false; S.inspDone = false; }
  if (G.ph === 'map' && S.snap && (!S.roundSnap || S.roundSnap.lvl !== G.lvl || S.roundSnap.wipes !== G.wipes)) S.roundSnap = clone({lvl:G.lvl, wipes:G.wipes, st:S.st, pts:S.pts, bag:S.bag, eq:S.eq, belt:S.belt, ink:S.ink, hlv:S.hlv, xp:S.xp, hp:S.hp, down:S.down});
  C.setPL(heroPL());
  if (G.ph === 'map' && C.miniLv().includes(G.lvl) && (!S.cp || S.cp.level < G.lvl)) S.cp = clone({st:S.st, pts:S.pts, bag:S.bag, eq:S.eq, belt:S.belt, ink:S.ink, level:G.lvl, hlv:S.hlv, xp:S.xp});
  if (G.ph === 'camp' && (!prev || prev.ph !== 'camp' || prev.lvl !== G.lvl)){ S.path = G.path; S.phase = 'camp'; campTab = 'gear'; myAct = null; }
  if (G.ph === 'chest' && G.res && myPeer && G.res[myPeer] && appliedRes !== G.lvl + ':' + G.wipes){ appliedRes = G.lvl + ':' + G.wipes; const r = G.res[myPeer]; if (r.belt) S.belt = r.belt; if (r.revive){ S.down = false; S.hp = Math.round(maxHP()*0.5); setTimeout(() => toast('You are revived at half HP!'), 600); } else if (r.down){ S.down = true; S.hp = 0; } else if (r.hp != null){ S.hp = r.hp; S.down = false; } if (G.path){ const share = r.xs != null ? r.xs : 0; const kx = Math.round(C.killXP(G.path.stars, G.path.kind, heroPL() - C.enemyLv(G.w, G.lvl)) * share); if (kx > 0){ gainXP(kx); setTimeout(() => toast(r.down ? `+${kx} XP for the foes beaten before you fell` : `+${kx} party XP for the fight`), 300); } }
    const ck = G.path.final ? 'final' : G.path.kind; S.chest = C.rollChest(Math.random, S.world, G.path.stars, ck, (G.path.aura ? 1 : 0) + (S.meta.equipped.includes('hunter') ? 1 : 0), S.meta.equipped.includes('lucky')); S.ink += Math.round((5 + Math.min(7, G.path.stars)*3 + (G.path.kind==='boss' ? 40 : G.path.kind==='mini' ? 20 : G.path.kind==='promised' ? 60 : G.path.kind==='outer' ? 120 : 0) + (G.path.final ? 300 : 0) + (G.nq ? 15 : 0)) * (S.meta.equipped.includes('windfall') ? 1.25 : 1)); if (G.nq && !(G.res && G.res[myPeer] && G.res[myPeer].down)){ S.meta.wisdom += 6; saveMeta(); }
    if (G.path.final && !(G.res && G.res[myPeer] && G.res[myPeer].down)) hallClear();
    for (const it of S.chest){ noteFind(it); if (it.kind==='consumable') addBelt(it.key); else if (it.kind==='tome'){ S.meta.wisdom += it.wis; saveMeta(); } else { S.bag.push(it); S.newLoot.push(it.uid); } } S.wins = (S.wins||0) + 1; SND.sfx('win');
    const best = S.chest.filter(i => i.kind !== 'consumable' && i.kind !== 'tome').sort((a,b) => b.rar - a.rar)[0]; if (best && best.rar >= 2) pres({best:{k: G.lvl + ':' + G.wipes, n: String(best.name).slice(0, 60), r: best.rar}}); }
  if (G.ph === 'event' && G.evc != null && appliedEv !== G.lvl + ':' + G.wipes){ appliedEv = G.lvl + ':' + G.wipes; S.eventMsg = applyEvent(G.path.ev, G.evc); }
  if (G.ph === 'camp' && !G.nq && G.path && G.path.kind === 'event' && G.path.ev === 'shrine' && !S.quests){ S.quests = [Object.assign(C.mkQuest(3, 'blank50', unitsOf(S.world)[1 % unitsOf(S.world).length].c, Math.random), {shrine:false})]; }
  if (G.ph === 'battle' && (!prev || prev.ph !== 'battle')){ CB = null; playedR = 0; moveCd = {}; FIGHTP = false; }
  saveLocal(); refresh(); }
function applyEvent(evk, i){ const m = maxHP(); let msg = '';
  if (evk==='river'){ if (i===0){ S.hp = Math.min(m, curHP() + Math.round(m*0.6)); msg = 'The cold water restores you.'; } else { addBelt('hp', 2); msg = 'You each fill two flasks: +2 Health Potions.'; } }
  if (evk==='campsite'){ if (i===0){ const it = [C.rollItem(Math.random, S.world, 3), C.rollItem(Math.random, S.world, 2)]; S.bag.push(...it); S.newLoot.push(...it.map(x=>x.uid)); msg = `You find ${it.map(x=>x.name).join(' and ')}.`; } else { S.hp = Math.min(m, curHP() + Math.round(m*0.35)); S.ink += 15; msg = 'You rest: +35% HP, +15 Ink.'; } }
  if (evk==='altar'){ if (i===0){ S.hp = Math.max(1, Math.round(curHP()*0.75)); S.pts += 4; msg = 'The altar drinks: +4 stat points each.'; } else msg = 'You leave the altar alone.'; }
  if (evk==='aura') msg = 'You slip past unseen.';
  if (evk==='shrine'){ S.meta.wisdom += 20; msg = '+20 Wisdom.'; }
  if (evk==='merchant'){ if (i===0){ S.half = true; msg = 'Half price at the Potion Seller next camp.'; } else { S.ink += 25; msg = '+25 Ink each.'; } }
  return msg; }

/* ---------- client: battle playback ---------- */
function unpackEnemy(a){ const [id, key, hp, max, f, lvE, st0] = a; const [n, art, color, trait] = Dd.ENEMIES[key]; return {id, key, name: (f.includes('m') && key !== 'enforcer' ? 'Summoned ' : '') + (f.includes('e') ? 'Elite ' : '') + (key==='enforcer' && f.includes('m') ? 'Telescreen Guard' : n), art, color, trait, boss:f.includes('b'), elite:f.includes('e'), mini:f.includes('M'), minion:f.includes('m'), summoner:f.includes('S'), lv: lvE, hp, max, status:Object.assign({burn: f.includes('u') ? 1 : 0, stun: f.includes('s') ? 1 : 0}, st0 || {}), types: (st0 && st0.tp != null) ? [Dd.TYPES[st0.tp]] : Dd.enemyTypes(key, n, art), charging:f.includes('c'), exposed:f.includes('x'), guard:f.includes('g'), enraged:f.includes('r')}; }
function heroLooks(){ const out = []; for (const p of players()){ const look = p.presence.look || {eq:{}}; out.push({id:p.peer, P:look}); } return out; }
async function onBattle(){ if (!BE || !S || !S.party) return; const b = BE;
  const k0 = b.k.slice(0, b.k.lastIndexOf(':')); if (!CB || CB.k0 !== k0){ CB = {k0, es: b.es.map(unpackEnemy), hs: b.hs, log:[]}; playedR = 0; sceneBattle(); }
  if (b.r - 1 > playedR || (b.ev && b.ev.length && b.ev[0].t === 'start' && playedR === 0)){
    const evs = (b.ev || []).filter(x => x.t !== 'start'); playedR = b.r - 1; if (b.ev && b.ev[0] && b.ev[0].t === 'start') playedR = Math.max(playedR, 0);
    playing = true; refresh(); const cb = CB;
    // HP bars move as each hit lands: start from the last shown values and apply events one by one
    CB.disp = {es: Object.fromEntries(CB.es.map(e => [e.id, e.hp])), hs: Object.fromEntries((CB.hs||[]).map(h => [h[0], h[1]])), hmax: Object.fromEntries((CB.hs||[]).map(h => [h[0], h[2]]))};
    for (const a of b.es) if (CB.disp.es[a[0]] == null) CB.disp.es[a[0]] = a[3];
    const ctx = {es: () => CB.es, heroName: h => h === myPeer ? 'You' : nameOf(h), mine: h => h === myPeer, log: t => { CB.log.push(t); if (CB.log.length > 40) CB.log.shift(); }, redraw: () => { if (view === 'battle') battleUI(); },
      track: e => { dispTrack(CB.disp, e, id => (CB.es.find(x => x.id === id)||{}).max); for (const x of CB.es) if (CB.disp.es[x.id] != null) x.hp = CB.disp.es[x.id]; }};
    // re-sync names for summons before playing
    for (const a of b.es) if (!CB.es.find(x => x.id === a[0])) CB.es.push(unpackEnemy(a));
    try { await playEvents(evs.map(e => Object.assign({}, e, {h: e.h})), ctx); } catch(err){ console.warn(err); }
    playing = false; cb.disp = null; if (CB !== cb || !CB) return; }
  if (!CB) return; CB.es = b.es.map(unpackEnemy); CB.hs = b.hs; ART3D.setEnemies(CB.es); ART3D.setHeroes(CB.hs.map(h => ({id:h[0], P: lookFor(h[0]), down:h[4].includes('d'), frozen:h[4].includes('f'), guard:h[4].includes('g')})));
  const mine = CB.hs.find(h => h[0] === myPeer); if (mine) S.hp = mine[1];
  if (!selT || !CB.es.find(e => e.id === selT && e.hp > 0)){ const al = CB.es.filter(e => e.hp > 0); selT = al.length ? al[0].id : null; }
  if (b.over === 'win'){ SND.sfx('win'); setTimeout(() => { try { ART3D.victory(); } catch(e){} }, 900); } if (b.over === 'lose') SND.sfx('lose');
  refresh(); }
function lookFor(id){ const p = peersP.find(x => x.peer === id); return (p && p.presence.look) || {eq:{}}; }
function sceneBattle(){ if (!CB) return; sceneKey = 'pbattle:' + CB.k0; const heroes = CB.hs.map(h => ({id:h[0], P: lookFor(h[0])})); ART3D.setScene('battle', {world:S.world, theme: (G && G.path && G.path.theme) || 0, heroes, enemies: CB.es}); SND.music(CB.es.some(e => e.boss || e.mini) ? 'boss' : 'battle'); if (CB.es.some(e => e.boss || e.mini)) SND.sfx('boss'); }
function sendAct(a, item){ if (!BE || playing || BE.over) return; const mine = BE.hs.find(h => h[0] === myPeer); if (!mine || mine[4].includes('d')) return;
  myAct = {r: BE.r, k: BE.k.slice(0, BE.k.lastIndexOf(':')), a, t: selT, i: item == null ? null : item};
  if (item && a === 'item'){ S.belt[item] = Math.max(0, (S.belt[item]||0) - 1); } pres({act: myAct}); SND.sfx('click'); refresh(); }

/* ---------- rendering ---------- */
const deadline = () => G ? GT + (G.dl || 0) : 0;
const bdeadline = () => BE ? BET + (BE.dl || 0) : 0;
const secs = d => Math.max(0, Math.ceil((d - now())/1000));
function timerBar(d, total){ const left = Math.max(0, d - now()); return `<div class="tbar"><i style="width:${Math.min(100, left/total*100)}%"></i><span>${Math.ceil(left/1000)}s</span></div>`; }
let rafT = null; function refresh(){ if (APP !== 'party') return; clearTimeout(rafT); rafT = setTimeout(() => {
    if (view === 'lobby' && lobbyEss && G && G.ph === 'lobby' && $('wes')) return; // don't wipe an essay being typed
    if (view === 'camp' && G && G.ph === 'camp' && campKey === 'camp:' + G.lvl + ':' + G.wipes + ':' + S.phase + ':' + S.qi && $('pstrip')){ const el = $('pstrip'); const html = stripHTML(); if (el.outerHTML !== html){ el.outerHTML = html; if ($('unready')) $('unready').onclick = () => { pres({rdy:null}); campKey = ''; draw(); }; } hud(); return; }
    draw(); }, 30); }
setInterval(() => { if (APP === 'party' && ['map','event','battle','chest','wipe'].includes(view)){ document.querySelectorAll('.tbar').forEach(el => { const d = +el.dataset.d, tot = +el.dataset.t; const left = Math.max(0, d - now()); const i = el.querySelector('i'), s = el.querySelector('span'); if (i) i.style.width = Math.min(100, left/tot*100) + '%'; if (s) s.textContent = Math.ceil(left/1000) + 's'; }); } }, 250);
const tbar = (d, tot) => `<div class="tbar" data-d="${d}" data-t="${tot}"><i style="width:${Math.min(100, Math.max(0, d - now())/tot*100)}%"></i><span>${Math.ceil(Math.max(0, d - now())/1000)}s</span></div>`;
function rosterHTML(){ const ps = players(); return `<div class="roster">${ps.map(p => { const pr = p.presence; const host = G && G.host === p.peer || (isHost && p.peer === myPeer); return `<span class="who ${p.peer===myPeer?'me':''}"><b>${esc(String(pr.n||'Player').slice(0,20))}</b>${host?' <em>host</em>':''}${p.peer===myPeer?' <em>you</em>':''}</span>`; }).join('')}</div>`; }
function draw(){ const p = $('panel'); hud();
  if (!code){ view = 'home'; return homeUI(p); }
  if (!G || G.ph === 'lobby'){ view = 'lobby'; return lobbyUI(p); }
  if (G.ph === 'map'){ view = 'map'; return mapUI(p); }
  if (G.ph === 'event'){ view = 'event'; return eventUI(p); }
  if (G.ph === 'camp'){ view = 'camp'; return campUI(p); }
  if (G.ph === 'battle'){ view = 'battle'; if (!CB && BE) onBattle(); return battleUI(); }
  if (G.ph === 'chest'){ view = 'chest'; return chestUI(p); }
  if (G.ph === 'wipe'){ view = 'wipe'; return wipeUI(p); }
  if (G.ph === 'terrain'){ view = 'terrain'; return terrainUI(p); }
  if (G.ph === 'end'){ view = 'end'; return endUI(p); }
}
function stage(kind){ const key = 'p:' + kind + ':' + (G ? G.lvl + ':' + G.w : '');
  if (sceneKey === key) return; sceneKey = key; const look = S && S.bag ? lookOf(S) : {eq:{}};
  if (kind === 'camp'){ const party = players().filter(x => x.peer !== myPeer).map(x => ({id:x.peer, P:x.presence.look || {eq:{}}})); ART3D.setScene('camp', {world:S.world, theme: G && G.path ? G.path.theme : 0, P: Object.assign(P(), {}), party}); SND.music('camp'); }
  else if (kind === 'map'){ ART3D.setScene('map', {world: G ? G.w : 0, theme: G && G.paths ? G.paths[0].theme : 0, P: S && S.bag ? P() : look}); SND.music('map'); }
  else { ART3D.setScene('title', {world: G ? G.w : 0, P: S && S.bag ? P() : look, demo:{id:779, key:'goblin', name:'', art:'goblin', color:'#7cae3e', trait:'swift'}}); SND.music('title'); } }
/* ---------- web edition screens ---------- */
function webEssayBox(){ const E = myEssays(); const t = E.web ? E.web.text : ''; const u = E.web && E.web.units || [];
  return `<div class="box"><p><b>Your essay</b> <span class="muted small">(paste it with a blank line between paragraphs; quotations in “quote marks” power the quote quests)</span></p><textarea id="wes" rows="6" spellcheck="false" placeholder="Paste your essay here…">${esc(t)}</textarea><small class="muted" id="wpv">${u.length ? `${u.length} paragraphs: ${u.map(x => `${esc(x.n)} (${x.s.length})`).join(' · ')}` : 'Not saved yet.'}</small></div>`; }
function wireEssayBox(){ const ta = $('wes'); if (!ta) return; ta.oninput = () => { const u = parseEssay(ta.value, 'web'); $('wpv').textContent = u.length ? `${u.length} paragraphs: ${u.map(x => `${x.n} (${x.s.length} sentences)`).join(' · ')}` : 'Empty.'; }; }
function saveWebEssay(required){ const t = ($('wes') ? $('wes').value : '').trim(); const u = t ? parseEssay(t, 'web') : [];
  if (required && (u.length < 1 || u.reduce((a, x) => a + x.s.length, 0) < 3)) return 'Paste your essay first (at least a paragraph of three sentences).';
  try { const E = myEssays(); if (u.length) E.web = {text:t, units:u}; else delete E.web; localStorage.setItem(ESSAYS_KEY, JSON.stringify(E)); } catch(e){ if (required) return 'Could not save your essay (is browser storage blocked?).'; }
  return ''; }
function webHomeUI(p){ stage('home'); const hc = (location.hash.match(/join=([a-z0-9]{5})/i) || [])[1] || '';
  p.innerHTML = `<h2>Essay Quest · Online</h2><p>Your class runs one adventure together (30 or 50 rounds). Everyone studies <b>their own essay</b> at camp, then the party fights side by side. Every path, land and attack is voted on a 15-second timer. Mini-bosses every ten rounds from round 5, bosses every 10th round, and a final boss with a second form at the end.</p>
   <label class="lab">Your name<input class="wide" id="nick" maxlength="20" value="${esc(nick)}" placeholder="What should the party call you?" autocomplete="off"></label>
   ${webEssayBox()}
   <div class="paths"><div class="path" style="cursor:default"><b>Join a game</b><small>Type the 5-character code your host shows on screen.</small><div class="row tight"><input class="wide" id="jc" maxlength="5" value="${esc(hc)}" placeholder="code" autocomplete="off" autocapitalize="off" style="max-width:9em"><button id="jn">Join</button></div></div>
   <div class="path" style="cursor:default"><b>Host a game</b><small>Hosting needs the master key. Paste your own essay above to study it (or leave it empty for the built-in essays). You can change it in the lobby too.</small><div class="row tight"><input class="wide" id="mkey" type="password" placeholder="master key" autocomplete="off" style="max-width:12em"><button id="mk">Host</button></div></div></div>
   ${lastErr ? `<p class="bad">${esc(lastErr)}</p>` : ''}<p class="muted small">Up to ${MAXP} players. If the host leaves, the run ends. Your essay stays on this device only.</p>`;
  wireEssayBox();
  const setNick = () => { nick = $('nick').value.trim().slice(0, 20) || 'Player'; try { localStorage.setItem('eq5_nick', nick); } catch(e){} };
  $('jn').onclick = async () => { setNick(); const c = $('jc').value.trim().toLowerCase(); if (!/^[a-z0-9]{5}$/.test(c)){ lastErr = 'Codes are 5 letters/numbers.'; return draw(); }
    const err = saveWebEssay(true); if (err){ lastErr = err; return draw(); } lastErr = ''; $('jn').textContent = 'Connecting…'; $('jn').disabled = true;
    try { await connect(c, false); const back = rejoinChar(c); S = back || newChar('fresh'); S.essaySrc = 'mine'; if (back) setTimeout(() => toast('Welcome back! You rejoin with everything you had.'), 900); pres({n:nick, nn:myNN, j:code, t:now(), src:'fresh', ess:'mine'}); draw(); } catch(e){ await leave().catch(() => {}); lastErr = e.message || String(e); draw(); } };
  $('mk').onclick = async () => { setNick(); lastErr = ''; let ok = false; try { ok = await keyOk($('mkey').value); } catch(e){ lastErr = e.message; return draw(); } if (!ok){ lastErr = 'That master key is not right.'; return draw(); }
    saveWebEssay(false); $('mk').textContent = 'Connecting…'; $('mk').disabled = true;
    try { await connect(rcode(), true); S = newChar('fresh'); S.essaySrc = myEssays().web ? 'mine' : 'builtin'; hostStart({w:0, len:50, cp:true}); pres({n:nick, nn:myNN, j:code, t:now(), src:'fresh', ess:S.essaySrc}); draw(); } catch(e){ await leave().catch(() => {}); lastErr = e.message || String(e); draw(); } }; }
function webLobbyUI(p){ stage('lobby'); const ps = players(); const hostOpts = isHost && H; const u = unitsOf(0);
  p.innerHTML = `<h2>Lobby</h2><div class="code">Room code <b>${esc(code)}</b> <button class="ghost" id="cp">Copy code</button> <button class="ghost" id="cpl">Copy invite link</button></div>${rosterHTML()}
   ${hostOpts ? `<div class="box"><p><b>Run settings</b> (you're the host)</p><p class="muted small">Starting land (the party can vote to travel after every mini-boss and boss):</p><div class="row tight">${WD.map((w,i) => `<button class="${H.w===i?'':'ghost'} hw" data-w="${i}">${esc(w.name)}</button>`).join('')}</div>
     <div class="row tight"><button class="${H.len===30?'':'ghost'} hlen" data-l="30">30 rounds</button><button class="${H.len===50?'':'ghost'} hlen" data-l="50">50 rounds</button><span class="muted small">${H.len===30 ? 'Mini-bosses at 5, 15, 25 · bosses at 10, 20 and the final boss at 30' : 'Mini-bosses at 5, 15, 25, 35, 45 · bosses every 10th round · final boss at 50'}</span></div>
     <div class="row tight">${Object.entries(C.DIFFS).map(([k, d]) => `<button class="${(H.diff||'hard')===k?'':'ghost'} hdf" data-d="${k}">${d.n}</button>`).join('')}<span class="muted small">Difficulty: mob health ×${C.DIFFS[H.diff||'hard'].hp}, damage ×${C.DIFFS[H.diff||'hard'].atk}. Hard is the intended experience.</span></div>
     <div class="row tight"><button class="${H.cp?'':'ghost'}" id="hcp">Checkpoints ${H.cp?'on':'off'}</button><span class="muted small">On: a wipe sends the party back to the last mini-boss round instead of round 1.</span></div>
     <div class="row tight"><button class="${H.nq?'ghost':''} hnq" data-q="0">📖 Essay Quest</button><button class="${H.nq?'':'ghost'} hnq" data-q="1">⚔ Battle only</button><span class="muted small">${H.nq ? 'No study quests: XP, Ink and Wisdom come only from fights, and foes are a little tougher.' : 'Study quests from your essays before each fight (the main mode).'}</span></div></div>`
     : G ? `<p class="muted">Starting in ${esc(WD[G.w].name)} · ${G.len} rounds · checkpoints ${G.cp?'on':'off'} · ${G.nq ? '⚔ Battle only (no quests)' : '📖 Essay Quest'}</p>` : '<p class="muted">Connecting to the host…</p>'}
   <div class="box"><p><b>Your essay</b>: you'll study ${S.essaySrc === 'mine' ? 'your own essay' : 'the built-in essays'} (${u.length} paragraph${u.length===1?'':'s'}). <button class="ghost" id="essedit">${lobbyEss ? 'Close' : (S.essaySrc === 'mine' ? '✎ Change my essay' : '✎ Paste my essay')}</button></p>
     ${lobbyEss ? webEssayBox() + `<div class="row tight"><button id="esssave">Save and use this essay</button>${isHost ? '<button class="ghost" id="essbuiltin">Use the built-in essays</button>' : ''}</div><p class="muted small" id="essmsg"></p>` : ''}</div>
   <div class="row">${isHost ? `<button id="start" ${ps.length?'':'disabled'}>Start the run (${ps.length} player${ps.length===1?'':'s'})</button>` : '<span class="muted">Waiting for the host to start…</span>'}<button class="ghost" id="lv">Leave</button></div>
   <p class="muted small">Up to ${MAXP} players. Each extra player adds an enemy to every fight. Friends can still join after the run starts: they arrive at the party's level with every stat point unspent.</p>`;
  $('cp').onclick = () => { try { navigator.clipboard.writeText(code); toast('Code copied'); } catch(e){} };
  $('essedit').onclick = () => { lobbyEss = !lobbyEss; draw(); };
  if (lobbyEss){ wireEssayBox(); $('esssave').onclick = () => { const err = saveWebEssay(true); if (err){ $('essmsg').textContent = err; return; } S.essaySrc = 'mine'; S.quests = null; pres({ess:'mine'}); saveLocal(); lobbyEss = false; toast('Essay saved: your quests will use it.'); draw(); };
    if ($('essbuiltin')) $('essbuiltin').onclick = () => { S.essaySrc = 'builtin'; S.quests = null; pres({ess:'builtin'}); saveLocal(); lobbyEss = false; draw(); }; }
  $('cpl').onclick = () => { try { navigator.clipboard.writeText(location.href.split('#')[0] + '#join=' + code); toast('Invite link copied'); } catch(e){} };
  if (hostOpts){ p.querySelectorAll('.hw').forEach(b => b.onclick = () => { H.w = +b.dataset.w; pushState(); draw(); }); $('hcp').onclick = () => { H.cp = !H.cp; pushState(); draw(); }; p.querySelectorAll('.hdf').forEach(b => b.onclick = () => { H.diff = b.dataset.d; C.setDiff(H.diff); pushState(); draw(); });
    p.querySelectorAll('.hlen').forEach(b => b.onclick = () => { H.len = +b.dataset.l; pushState(); draw(); });
    p.querySelectorAll('.hnq').forEach(b => b.onclick = () => { H.nq = b.dataset.q === '1'; pushState(); draw(); });
    $('start').onclick = () => { if (players().length > MAXP){ toast(`Max ${MAXP} players`); return; } hostBegin(); }; }
  $('lv').onclick = async () => { await leave(); draw(); }; }
function homeUI(p){ if (WEBV) return webHomeUI(p); stage('home');
  p.innerHTML = `<h2>Multiplayer</h2><p>Play one run together. Everyone studies <b>their own essays</b> at camp, then you fight side by side. Every path, event and attack is chosen with a 15-second timer.</p>
   <label class="lab">Your name<input class="wide" id="nick" maxlength="20" value="${esc(nick)}" placeholder="What should friends call you?" autocomplete="off"></label>
   <div class="paths"><div class="path" style="cursor:default"><b>Host a party</b><small>You get a room code to share. You pick the world and length.</small><div class="row tight"><button id="mk">Create room</button></div></div>
   <div class="path" style="cursor:default"><b>Join a party</b><small>Type the code your friend gave you.</small><div class="row tight"><input class="wide" id="jc" maxlength="5" placeholder="code" autocomplete="off" autocapitalize="off" style="max-width:9em"><button id="jn">Join</button></div></div></div>
   <div class="box"><p><b>Your essays.</b> ${Object.keys(myEssays()).length ? `Saved: ${Object.keys(myEssays()).map(k => esc({common:'Common Module', moda:'Module A', modb:'Module B', modc:'Module C'}[k])).join(', ')}.` : 'None yet: you will study the built-in essays until you paste your own.'}</p><div class="row tight"><button class="ghost" id="ess">✎ My essays</button></div></div>
   ${online === null ? '<p class="muted">Checking the online connection…</p>' : online ? '<p class="ok">● Online: friends who can open this page can join with your code.</p>' : `<div class="box"><p class="bad">● Online play isn’t available in this view.</p><p class="muted small">Open the game from its claude.ai link in a browser, signed in to Claude. Friends must be signed in and have the page shared with them (Share menu → invite their email). Previews and downloaded copies can’t go online.</p><div class="row tight"><button class="ghost" id="tm">Try same-device test (two tabs)</button></div></div>`}
   ${lastErr ? `<p class="bad">${esc(lastErr)}</p>` : ''}${testMode ? '<p class="muted small">Same-device test mode: open this page in another tab of this browser to play against yourself.</p>' : ''}
   <div class="row"><button class="ghost" id="back">⌂ Home</button></div>`;
  const setNick = () => { nick = $('nick').value.trim().slice(0, 20) || 'Player'; try { localStorage.setItem('eq5_nick', nick); } catch(e){} };
  $('mk').onclick = async () => { setNick(); lastErr = ''; $('mk').textContent = 'Connecting…'; $('mk').disabled = true; try { await connect(rcode(), true); S = newChar('fresh'); hostStart({w:0, len:30, cp:false}); pres({n:nick, nn:myNN, j:code, t:now(), src:'fresh', ess:S.essaySrc}); draw(); } catch(e){ lastErr = e.message || String(e); draw(); } };
  $('jn').onclick = async () => { setNick(); const c = $('jc').value.trim().toLowerCase(); if (!/^[a-z0-9]{5}$/.test(c)){ lastErr = 'Codes are 5 letters/numbers.'; return draw(); } lastErr = ''; $('jn').textContent = 'Connecting…'; $('jn').disabled = true; try { await connect(c, false); S = newChar('fresh'); pres({n:nick, nn:myNN, j:code, t:now(), src:'fresh', ess:S.essaySrc}); draw(); } catch(e){ lastErr = e.message || String(e); draw(); } };
  if ($('tm')) $('tm').onclick = () => { testMode = true; lobbyRoom = null; online = true; draw(); };
  if (online === null) checkOnline();
  $('ess').onclick = () => { APP = 'essays'; window.__essBack = 'party'; window.drawApp(); };
  $('back').onclick = () => { APP = 'home'; window.drawApp(); }; }
function lobbyUI(p){ if (WEBV) return webLobbyUI(p); stage('lobby'); const ps = players(); const hostOpts = isHost && H;
  const slots = [1,2,3].map(n => ({n, s: readSlot(n)})).filter(x => x.s); const mine = me(); const src = mine && mine.presence.src || 'fresh';
  p.innerHTML = `<h2>Party lobby</h2><div class="code">Room code <b>${esc(code)}</b> <button class="ghost" id="cp">Copy</button></div>${rosterHTML()}
   ${hostOpts ? `<div class="box"><p><b>Run settings</b> (you're the host)</p><div class="row tight">${WD.map((w,i) => `<button class="${H.w===i?'':'ghost'} hw" data-w="${i}">${esc(w.name)}</button>`).join('')}</div>
     <div class="row tight"><button class="${H.len===20?'':'ghost'} hl" data-l="20">20 rounds</button><button class="${H.len===30?'':'ghost'} hl" data-l="30">30 rounds</button><button class="${H.cp?'':'ghost'}" id="hcp">Checkpoints ${H.cp?'on':'off'}</button></div></div>`
     : G ? `<p class="muted">Host settings: ${esc(WD[G.w].name)} · ${G.len} rounds · checkpoints ${G.cp?'on':'off'}</p>` : '<p class="muted">Connecting to the host…</p>'}
   <div class="box"><p><b>Your character</b></p><div class="row tight"><button class="${src==='fresh'?'':'ghost'} src" data-s="fresh">Fresh hero</button>${slots.map(x => `<button class="${src==='slot'+x.n?'':'ghost'} src" data-s="slot${x.n}">Bring save ${x.n} (${esc(WD[x.s.world].name)} L${x.s.level})</button>`).join('')}</div>
     <p class="muted small">Bringing a save copies its stats, equipped gear and boons into this run. Your save itself isn't changed.</p>
     <div class="row tight"><button class="${S.essaySrc==='mine'?'':'ghost'} es" data-e="mine" ${Object.keys(myEssays()).length?'':'disabled'}>Study my essays</button><button class="${S.essaySrc!=='mine'?'':'ghost'} es" data-e="builtin">Study the built-in essays</button><button class="ghost" id="ess">✎ Paste my essays</button></div></div>
   <div class="row">${isHost ? `<button id="start" ${ps.length?'':'disabled'}>Start the run (${ps.length} player${ps.length===1?'':'s'})</button>` : '<span class="muted">Waiting for the host to start…</span>'}<button class="ghost" id="lv">Leave</button></div>
   <p class="muted small">Up to ${MAXP} players. Each extra player adds an extra enemy to every fight, and bosses get tougher.</p>`;
  $('cp').onclick = () => { try { navigator.clipboard.writeText(code); toast('Code copied'); } catch(e){} };
  if (hostOpts){ p.querySelectorAll('.hw').forEach(b => b.onclick = () => { H.w = +b.dataset.w; pushState(); draw(); }); p.querySelectorAll('.hl').forEach(b => b.onclick = () => { H.len = +b.dataset.l; pushState(); draw(); }); $('hcp').onclick = () => { H.cp = !H.cp; pushState(); draw(); };
    $('start').onclick = () => { if (players().length > MAXP){ toast(`Max ${MAXP} players`); return; } hostBegin(); }; }
  p.querySelectorAll('.src').forEach(b => b.onclick = () => { const ess = S.essaySrc; S = newChar(b.dataset.s); S.essaySrc = ess; pres({src:b.dataset.s}); draw(); });
  p.querySelectorAll('.es').forEach(b => b.onclick = () => { S.essaySrc = b.dataset.e; pres({ess:S.essaySrc}); draw(); });
  $('ess').onclick = () => { APP = 'essays'; window.__essBack = 'party'; window.drawApp(); };
  $('lv').onclick = async () => { await leave(); draw(); }; }
function ensureRun(){ // first time the run begins on this client
  if (WEBV && (!S.snap || S.runCode !== code) && G.lvl > 1 && (S.hlv||1) <= 1){ const lvs = players().filter(x => x.peer !== myPeer).map(x => x.presence.look && x.presence.look.lv).filter(Boolean); const L0 = Math.max(1, lvs.length ? Math.round(lvs.reduce((a,b)=>a+b,0)/lvs.length) : C.enemyLv(G.w, G.lvl) - 1);
    S.hlv = L0; S.xp = 0; S.pts += C.XPK.sp*(L0-1); S.bag.forEach(i => C.applyLevel(i, L0)); syncPL(); setTimeout(() => toast(`You join at Hero Lv ${L0} with ${S.pts} stat points to spend. Open Gear at camp.`), 800); }
  if (!S.snap || S.runCode !== code){ S.runCode = code; S.world = G.w; S.level = G.lvl; const E0 = C.enemyLv(G.w, 1); if ((S.hlv||1) < E0){ const add = E0 - (S.hlv||1); S.hlv = E0; S.xp = 0; S.pts += C.XPK.sp*add; S.bag.forEach(i => C.applyLevel(i, Math.max(i.lvl||1, E0))); } S.snap = clone({st:S.st, pts:S.pts, bag:S.bag, eq:S.eq, belt:S.belt, ink:S.ink, hlv:S.hlv, xp:S.xp}); appliedWipe = G.wipes; S.hp = null; saveLocal(); }
  const look = lookOf(S); const mine = me(); if (!mine || JSON.stringify(mine.presence.look) !== JSON.stringify(look)) pres({look}); }
function mapUI(p){ ensureRun(); stage('map'); const ps = players(); const votes = ps.map(x => [x.peer, x.presence.cv]).filter(([, v]) => v && v.k === G.vk); const mineV = votes.find(([id]) => id === myPeer);
  const desc = pth => pth.kind==='promised' ? `<b>${(Dd.PROMISED_DUOS[pth.key]||Dd.PROMISED_DUOS[0]).keys.map(k => esc(Dd.ENEMIES[k][0].split(',')[0])).join(' + ')}</b>: TWO bosses that call allies. Win for a guaranteed <b style="color:#ff8ad8">Promised</b> piece and a Mythical one. Far harder than a ★6` : pth.kind==='outer' ? `<b>${esc(Dd.ENEMIES[pth.key][0])}</b>: an overversal horror with colossal HP, multi-hit attacks, every status effect and two healers. Win for an <b style="color:#7df9ff">Outerversal</b> piece, a Promised piece and a Mythical one` : pth.final ? `<b>FINAL BOSS: ${esc(pth.key ? Dd.ENEMIES[pth.key][0] : WD[G.w].boss)}</b>. As strong as a ★10 horror, with healers and a second form. Beat it for a massive reward` : pth.kind==='god' ? `<b>${esc(Dd.ENEMIES[pth.key][0])}</b>: a myth god (${esc(Dd.GOD_TEXT[pth.key]||'')}). Brutal. 30% chance of a Mythical, 30% of a Legendary` : pth.kind==='boss' ? `World boss: ${esc(pth.key ? Dd.ENEMIES[pth.key][0] : WD[G.w].boss)}` : pth.kind==='mini' ? `Mini-boss: ${esc(pth.key ? Dd.ENEMIES[pth.key][0] : '')}. Always an Epic, 25% a Legendary, 1.5% a Mythical` : pth.kind==='event' ? `<b>${esc(Dd.EVENTS[pth.ev].n)}</b>: no fight, a group choice` : ['', G.nq ? 'Lucky path: weak foes, a quick win' : 'Lucky path: 3 bonus quests each, weak foes', 'A fair fight', 'Tougher foes, better chests', 'Elite enemy, rich chests', 'Deadly. Half the time a Legendary drops', ''][pth.stars];
  p.innerHTML = `<h2>Round ${G.lvl}/${G.len}: vote for a path</h2>${G.msg?`<p class="muted">${esc(G.msg)}</p>`:''}${tbar(deadline(), VOTE_MS)}
   <div class="paths">${G.paths.map((pth,i)=>{ const who = votes.filter(([, v]) => v.i === i).map(([id]) => nameOf(id)); return `<button class="path s${pth.stars} ${pth.kind} ${mineV && mineV[1].i===i?'voted':''}" data-i="${i}"><span class="st">${pth.kind==='event'?'? Event':stars(pth.stars)}</span><b>${esc(dungeonName(G.w, pth))}</b><small>${desc(pth)}</small><span class="votes">${who.length ? '🗳 ' + who.map(esc).join(', ') : ''}</span></button>`; }).join('')}</div>
   ${rosterHTML()}<p class="muted small">Majority wins; ties are random. No vote counts as no vote.</p>`;
  p.querySelectorAll('.path').forEach(b => b.onclick = () => { pres({cv:{k:G.vk, i:+b.dataset.i}}); SND.sfx('click'); }); }
function eventUI(p){ ensureRun(); stage('camp'); const E = Dd.EVENTS[G.path.ev]; const ps = players(); const votes = ps.map(x => [x.peer, x.presence.cv]).filter(([, v]) => v && v.k === G.vk);
  if (G.evc != null){ p.innerHTML = `<h2>${esc(E.n)}</h2><p>The party chose: <b>${esc(E.opts[G.evc][0])}</b>.</p>${S.eventMsg ? `<p class="ok">${esc(S.eventMsg)}</p>` : ''}${tbar(deadline(), 6000)}${rosterHTML()}`; return; }
  p.innerHTML = `<h2>${esc(E.n)}</h2><p>${esc(E.d)}</p>${tbar(deadline(), VOTE_MS)}<div class="paths">${E.opts.map(([a,b],i)=>{ const who = votes.filter(([, v]) => v.i === i).map(([id]) => nameOf(id)); return `<button class="path" data-i="${i}"><b>${esc(a)}</b><small>${esc(b)}</small><span class="votes">${who.length ? '🗳 ' + who.map(esc).join(', ') : ''}</span></button>`; }).join('')}</div>${rosterHTML()}`;
  p.querySelectorAll('.path').forEach(b => b.onclick = () => { pres({cv:{k:G.vk, i:+b.dataset.i}}); SND.sfx('click'); }); }
function terrainUI(p){ ensureRun(); stage('map'); const ps = players(); const votes = ps.map(x => [x.peer, x.presence.cv]).filter(([, v]) => v && v.k === G.vk); const mineV = votes.find(([id]) => id === myPeer);
  p.innerHTML = `<h2>Round ${G.lvl} cleared! Where next?</h2><p class="muted">Every 5 rounds the party can travel. Each land has its own enemies, mini-bosses, bosses and loot. Enemies keep levelling up wherever you go.</p>${tbar(deadline(), VOTE_MS)}
   <div class="paths">${WD.map((w, i) => { const who = votes.filter(([, v]) => v.i === i).map(([id]) => nameOf(id)); return `<button class="path ${mineV && mineV[1].i === i ? 'voted' : ''}" data-i="${i}"><span class="st">${i === G.w ? 'Stay' : 'Travel'}</span><b>${esc(w.name)}</b><small>${esc(Dd.ENEMIES[w.enemies[0]][0])}, ${esc(Dd.ENEMIES[w.enemies[1]][0])} and more</small><span class="votes">${who.length ? '🗳 ' + who.map(esc).join(', ') : ''}</span></button>`; }).join('')}</div>${rosterHTML()}<p class="muted small">Majority wins; ties are random; if nobody votes you stay.</p>`;
  p.querySelectorAll('.path').forEach(b => b.onclick = () => { pres({cv:{k:G.vk, i:+b.dataset.i}}); SND.sfx('click'); }); }
function nextRevive(){ const L = G.lvl; const n5 = Math.ceil(L/5)*5; const mi = C.miniLv().filter(m => m >= L); return Math.min(n5, mi.length ? mi[0] : 999, G.len); }
function readyKey(){ return G.lvl + ':' + G.wipes; }
function stripHTML(){ const ps = players(); const amReady = me() && me().presence.rdy === readyKey();
  return `<div class="pstrip" id="pstrip">${ps.map(x => `<span class="${x.presence.rdy === readyKey() ? 'ok' : 'muted'}">${x.presence.rdy === readyKey() ? '✓' : '…'} ${esc(String(x.presence.n||'').slice(0,20))}</span>`).join(' · ')}${amReady ? ' <button class="ghost" id="unready">Not ready</button>' : ''}</div>`; }
let campKey = '';
function campUI(p){ ensureRun(); stage('camp'); campKey = 'camp:' + G.lvl + ':' + G.wipes + ':' + S.phase + ':' + S.qi;
  const ps = players(); const ready = ps.filter(x => x.presence.rdy === readyKey()); const amReady = me() && me().presence.rdy === readyKey();
  const strip = stripHTML();
  if (!['camp','quests','quest'].includes(S.phase)) S.phase = 'camp';
  if (S.phase === 'camp') campScreen(p); else if (S.phase === 'quests') questsScreen(p); else runQuest(S.qi);
  p.insertAdjacentHTML('afterbegin', strip + (S.down ? `<p class="bad">You are down. You’ll be revived at half HP after round ${nextRevive()} (every 5th round, and after each mini-boss). Keep studying: your stat points still count.</p>` : '') + (G.path && G.path.kind === 'event' ? `<p class="muted">Event round: finish your quests and ready up to move on.</p>` : ''));
  if ($('unready')) $('unready').onclick = () => { pres({rdy:null}); draw(); }; }
function readyUp(){ const look = lookOf(S); pres({rdy: readyKey(), hero: heroSnap(), look}); S.inspired = 0; saveLocal(); SND.sfx('level'); refresh(); }
let moveCd = {}, FIGHTP = false;
function battleUI(){ const p = $('panel'); if (!BE || !CB){ p.innerHTML = '<h2>Battle!</h2><p class="muted">Getting the battlefield…</p>'; return; }
  const mine = BE.hs.find(h => h[0] === myPeer); const down = !mine || mine[4].includes('d'); const acted = myAct && myAct.r === BE.r && myAct.k === BE.k.slice(0, BE.k.lastIndexOf(':'));
  const energy = mine ? mine[3] : 0; const mcd = (mine && typeof mine[6] === 'object' && mine[6]) || {}; const myW = (() => { try { return P().eq.weapon; } catch(e){ return null; } })(); const myA = (() => { try { return P().eq.armour; } catch(e){ return null; } })(); const ms = myW ? C.heroMoves(myW, myA) : [];
  const items = Object.keys(S.belt).filter(k => S.belt[k] > 0 && k !== 'phoenix');
  const waiting = BE.hs.filter(h => !h[4].includes('d')).map(h => h[0]).filter(id => { const pp = peersP.find(x => x.peer === id); const a = pp && pp.presence.act; return !(a && a.r === BE.r && a.k === BE.k.slice(0, BE.k.lastIndexOf(':'))); });
  const lock = playing || acted || down || BE.over;
  p.innerHTML = `${BE.over ? `<h2>${BE.over==='win' ? 'Victory!' : 'The party has fallen…'}</h2>` : `<div class="row" style="justify-content:space-between"><b>Round ${BE.r}</b>${playing ? '<span class="muted">…</span>' : tbar(bdeadline(), ACT_MS)}</div>`}
   ${down && !BE.over ? `<p class="bad">You are down and watching this fight. Revival comes after round ${nextRevive()} (every 5th round and after mini-bosses), at half HP.</p>` : ''}
   ${FIGHTP && !lock ? `<div class="mvhead"><b>Choose a move</b><button id="a-back" class="ghost">◀ Back</button></div><div id="mvgrid" class="mvgrid">${moveBtns(ms, energy, Object.fromEntries(Object.entries(mcd).map(([k, v]) => [k, Math.max(v, moveCd[k] || 0)])), BE.r, lock, myW && myW.rar >= 4, myW)}</div>` : `<div class="acts"><button id="a-fight" class="fight" ${lock?'disabled':''}>⚔ Attack <small>choose a move</small></button><button id="a-focus" class="ghost" ${lock?'disabled':''}>Focus <small>+45 energy</small></button><button id="a-guard" class="ghost" ${lock?'disabled':''}>Guard</button><button id="a-items" class="ghost" ${lock || !items.length ? 'disabled' : ''}>Items (${items.reduce((a,k)=>a+S.belt[k],0)})</button></div>`}
   <div id="itemrow" class="itemrow" hidden>${items.map(k=>`<button class="ghost it" data-k="${k}">${esc(Dd.CONSUMABLES[k].n)} ×${S.belt[k]}</button>`).join('')}</div>
   ${acted && !BE.over && !playing ? `<p class="ok">Locked in. Waiting for ${waiting.map(nameOf).map(esc).join(', ') || 'the round'}…</p>` : ''}
   <div class="foes">${CB.es.filter(e=>e.hp>0).map(e=>`<button class="foe ${selT===e.id?'sel':''}" data-id="${e.id}"><span><b>${esc(e.name)}</b> <small>${esc((Dd.TRAITS[e.trait]||'').split(':')[0])}${e.charging?' · CHARGING':''}${e.exposed?' · EXPOSED':''}${e.guard?' · guarding':''}${e.enraged?' · ENRAGED':''}</small></span><div class="hpbar"><i style="width:${Math.max(0,e.hp/e.max*100)}%;background:${e.boss?'#ff4d6d':'#ff9a3c'}"></i></div><small>${e.hp} / ${e.max} HP${selT===e.id?' · YOUR TARGET':''}</small><div class="chips">${foeChips(e.status)}</div></button>`).join('')}</div>
   <div class="foes">${(CB.hs||BE.hs).map(h0 => { const h = CB.disp && CB.disp.hs[h0[0]] != null ? [h0[0], CB.disp.hs[h0[0]]].concat(h0.slice(2)) : h0; return h; }).map(h => `<div class="foe ${h[0]===myPeer?'me':''}"><span><b>${h[0]===myPeer ? 'You' : esc(nameOf(h[0]))}</b> <small>${h[4].includes('d')?'DOWN':''}${h[4].includes('f')?' · frozen':''}${h[4].includes('g')?' · guarding':''}</small></span><div class="chips">${heroChips(h[7])}</div><div class="hpbar"><i style="width:${Math.max(0,h[1]/h[2]*100)}%;background:#4cd46b"></i></div><small>${h[1]} / ${h[2]} HP · ⚡ ${h[3]}</small><div class="enbar"><i style="width:${h[3]}%"></i></div></div>`).join('')}</div>
   <div class="log">${CB.log.slice(-5).map(l=>`<div>${esc(l)}</div>`).join('')}</div><p class="muted small">Pick your target, then an action. When everyone has chosen (or the timer runs out) the round plays out; no choice means your free Basic move.</p>`;
  if (FIGHTP && !lock){ $('a-back').onclick = () => { FIGHTP = false; battleUI(); }; p.querySelectorAll('.mvb').forEach(b => b.onclick = () => { const m = ms[+b.dataset.slot]; if (m && m.cd) moveCd[m.slot] = BE.r + m.cd; FIGHTP = false; sendAct('move', +b.dataset.slot); }); }
  else if (!lock){ $('a-fight').onclick = () => { FIGHTP = true; battleUI(); }; $('a-focus').onclick = () => sendAct('focus'); $('a-guard').onclick = () => sendAct('guard'); $('a-items').onclick = () => { $('itemrow').hidden = !$('itemrow').hidden; }; p.querySelectorAll('.it').forEach(b => b.onclick = () => sendAct('item', b.dataset.k)); }
  p.querySelectorAll('.foe[data-id]').forEach(b => b.onclick = () => { selT = +b.dataset.id; if (acted && !playing && !BE.over){ myAct.t = selT; pres({act:myAct}); } battleUI(); }); }
function chestUI(p){ stage('chest-' + G.lvl); const ps = players(); const done = ps.filter(x => x.presence.cont === readyKey()); const amDone = me() && me().presence.cont === readyKey();
  if (sceneKey !== 'pchest:' + G.lvl){ sceneKey = 'pchest:' + G.lvl; if ((S.chest||[]).some(i => i.myth || i.special)) setTimeout(() => { ART3D.equipFx(Math.max(...S.chest.map(i => i.rar||0))); SND.sfx('perfect'); }, 1300); ART3D.setScene('chest', {world:S.world, theme: G.path ? G.path.theme : 0, P:P(), rar: Math.max(0, ...(S.chest||[]).map(i => i.rar || 0))}); setTimeout(() => { ART3D.openChest(); SND.sfx('chest'); }, 500); SND.music('map'); }
  const loot = S.chest || []; const others = players().filter(x => x.peer !== myPeer && x.presence.best && x.presence.best.k === readyKey()).map(x => `${esc(String(x.presence.n||'').slice(0,20))} found <b style="color:${Dd.RAR[x.presence.best.r].c}">${esc(x.presence.best.n)}</b>`); p.innerHTML = legendBanner(loot) + (G.revived ? `<p class="ok">${G.revived} fallen hero${G.revived===1?'':'es'} revived at half HP.</p>` : '') + (others.length ? `<p class="muted">Everyone rolls their own chest. ${others.join(' · ')}</p>` : '<p class="muted">Everyone rolls their own chest, so your loot differs from your friends’.</p>') + `<h2>Victory! Your chest holds ${loot.length} item${loot.length===1?'':'s'}</h2><div class="cards">${loot.map(it => card(it)).join('')}</div>${tbar(deadline(), CHEST_MS)}
   <div class="row"><button id="cont" ${amDone?'disabled':''}>${amDone ? 'Waiting for the others…' : G.lvl >= G.len ? 'Finish the run' : 'Onward'}</button><span class="muted">${done.length}/${ps.length} ready</span></div><p class="muted small">Equip new gear at the next camp.</p>`;
  $('cont').onclick = () => { pres({cont: readyKey()}); SND.sfx('click'); draw(); }; }
function wipeUI(p){ stage('camp'); p.innerHTML = `<h2>The party has fallen</h2><p>Everyone returns to ${G.cpLvl ? 'the checkpoint at round ' + G.cpLvl : 'round 1'} with the stats and gear you had there. Study harder. Hit harder.</p>${tbar(deadline(), 7000)}${rosterHTML()}`; }
function endUI(p){ stage('home'); p.innerHTML = `<h2>Run complete!</h2><p>${esc(WD[G.w].boss)} is beaten. Every essay, every quote, every round: together.</p>${rosterHTML()}<div class="row"><button id="lv">Back to multiplayer</button></div>`; $('lv').onclick = async () => { await leave(); draw(); }; }
function kickedOut(){ const c = code; toast('The host removed you from the game.'); leave().then(() => { lastErr = 'The host removed you from the game. You can join again with the same code (' + c + ').'; try { location.hash = '#join=' + c; } catch(e){} draw(); }); }
function hostGone(){ const why = goneWhy || (WEBV ? 'The host left, so the run has ended.' : 'The host left the room.'); goneWhy = ''; toast(why); leave().then(() => { lastErr = why; draw(); }); }
window.__ptt = () => { const e = CB && (CB.es.find(x => x.id === selT && x.hp > 0) || CB.es.find(x => x.hp > 0)); return e ? eTypes(e) : null; };
function plates(){ const ov = $('ov'); if (view !== 'battle' || !CB || !BE){ if (ov.innerHTML && ov.dataset.party) { ov.innerHTML = ''; ov.dataset.h = ''; } return; } ov.dataset.party = 1;
  const hp = (v,m,col) => `<div class="hpbar"><i style="width:${Math.max(0,v/m*100)}%;background:${col}"></i></div>`;
  const L = []; for (const x0 of (CB.hs||BE.hs)){ const x = CB.disp && CB.disp.hs[x0[0]] != null ? [x0[0], CB.disp.hs[x0[0]]].concat(x0.slice(2)) : x0; const sp = ART3D.screenPos(x[0]); if (!sp) continue; L.push({r:'h',x:Math.min(90, Math.max(8, sp.x)), y:Math.max(18, sp.y), h:(X,Y) => `<div class="plate ${x[0]===myPeer?'me':''}" style="left:${X}%;top:${Y}%"><b>${x[0]===myPeer ? 'You' : esc(nameOf(x[0]))}</b>${tyRow(Dd.itemTypes((lookFor(x[0]) || {eq:{}}).eq.armour))}${hp(x[1], x[2], '#4cd46b')}<div class="enbar"><i style="width:${x[3]}%"></i></div><div class="chips">${x[4].includes('d')?'<span class="b">DOWN</span>':''}${heroChips(x[7])}</div></div>`}); }
  for (const e of CB.es){ if (e.hp <= 0) continue; const sp = ART3D.screenPos(e.id); if (!sp) continue; L.push({r:'e',x:Math.min(90, Math.max(10, sp.x)), y:Math.max(18, sp.y), h:(X,Y) => `<button class="plate en ${selT===e.id?'sel':''} ${e.boss?'boss':''}" data-id="${e.id}" style="left:${X}%;top:${Y}%"><b>${esc(e.name)} <small>Lv ${e.lv||''}</small></b>${tyRow(eTypes(e))}${hp(e.hp, e.max, e.boss?'#ff4d6d':'#ff9a3c')}<div class="hpt">${e.hp} / ${e.max}</div><div class="chips">${e.charging?'<span class="b">CHARGING</span>':''}${foeChips(e.status)}</div></button>`}); }
  const h = dock(L).map(o => o.h(Math.round(o.x*10)/10, Math.round(o.y*10)/10)).join('');
  if (ov.dataset.h !== h){ ov.innerHTML = h; ov.dataset.h = h; ov.querySelectorAll('.en').forEach(b => b.onclick = () => { selT = +b.dataset.id; if (myAct && BE && myAct.r === BE.r && !playing){ myAct.t = selT; pres({act:myAct}); } battleUI(); plates(); }); } }
/* ---------- host-only admin console (web edition). Everything in "Your hero" changes only the host's own character on this
   device: nothing is broadcast and nobody else gets a message. The "Run" section moves the shared run, so friends see its effects. ---------- */
let lobbyEss = false;
let adminTab = 'players', adminRar = 5, adminLand = 0, adminEquip = true;
/* ---------- host controls: skip a turn, sit a player out, kick (kicked players can rejoin with the party code) ---------- */
function hostKick(id){ if (!isHost || !H || id === myPeer) return; const p = peersP.find(x => x.peer === id); const nn = (p && p.presence.nn) || ''; H.kicked = (H.kicked || []).filter(k => k.id !== id).concat([{id, nn}]).slice(-24); try { if (lobbyRoom && lobbyRoom.kick) lobbyRoom.kick(id); } catch(e){} if (H.B && H.B.heroes.some(h => h.hid === id)) { /* hostCheck removes them from the fight next tick */ } pushState(); hostCheck(); refresh(); }
function hostSkip(id){ if (!H || !H.B || H.ph !== 'battle' || H.B.over) return false; H.skip = H.skip || {}; H.skip[id] = H.bk + ':' + H.B.turn; hostCheck(); return true; }
function hostSit(id){ if (!H) return; H.sit = H.sit || {}; if (H.sit[id]) delete H.sit[id]; else H.sit[id] = true; pushState(); hostCheck(); refresh(); }
function hostSkipWaiting(){ if (!H) return 0; let n = 0; const ps = players();
  if (H.ph === 'battle' && H.B && !H.B.over){ for (const h of H.B.heroes){ if (h.down || h.hp <= 0) continue; const p = ps.find(x => x.peer === h.hid); const a = p && p.presence.act; if (!(a && a.r === H.B.turn && a.k === H.bk)){ hostSkip(h.hid); n++; } } }
  else if (H.ph === 'camp'){ for (const p of ps){ if (p.presence.rdy !== H.lvl + ':' + H.wipes){ H.sit = H.sit || {}; if (!H.sit[p.peer]){ H.sit[p.peer] = true; n++; } } } pushState(); hostCheck(); }
  return n; }
function adminAllowed(){ return WEBV && isHost && !!code; }
function adminOpen(){ if (!adminAllowed()) return; let ov = document.getElementById('admin'); if (!ov){ ov = document.createElement('div'); ov.id = 'admin'; document.body.appendChild(ov); } ov.hidden = false; adminDraw(); }
function adminClose(){ const ov = document.getElementById('admin'); if (ov) ov.hidden = true; }
function adminGive(it){ if (!it){ adminMsg = 'Could not make that item.'; return adminDraw(); } S.bag.push(it); try { noteFind(it); } catch(e){} let eqd = false;
  if (adminEquip && it.kind !== 'trinket'){ const old = item(S.eq[it.kind]); if (old) old.grand = false; S.eq[it.kind] = it.uid; if (!C.canEquip(P(), it)) it.grand = true; eqd = true; try { ART3D.updateHero(P()); } catch(e){} } else S.newLoot = (S.newLoot || []).concat(it.uid);
  saveLocal(); save(); adminMsg = `${eqd ? 'Equipped' : 'Added'} ${it.name} (${Dd.RAR[it.rar].n}, Lv ${it.lvl || heroPL()})${eqd ? '' : ' to your bag'}.`; adminDraw(); refresh(); }
let adminMsg = ''; setInterval(() => { const ov = document.getElementById('admin'); if (ov && !ov.hidden && adminTab === 'players' && !ov.querySelector('.pkick[data-sure]')) adminDraw(); }, 1200);
function adminDraw(){ const ov = document.getElementById('admin'); if (!ov || ov.hidden) return; const L = heroPL(); const R = Dd.RAR;
  const tabs = [['players','👥 Players'],['hero','Your hero'],['weapon','Weapons'],['armour','Armour'],['trinket','Trinkets'],['run','Run']];
  const rarRow = `<div class="row tight">${R.map((r, i) => `<button class="${adminRar===i?'':'ghost'} arar" data-r="${i}" style="${adminRar===i?`background:${r.c};color:#111`:''}">${r.n}</button>`).join('')}</div>`;
  const landRow = `<div class="row tight">${WD.map((w, i) => `<button class="${adminLand===i?'':'ghost'} aland" data-w="${i}">${esc(w.name)}</button>`).join('')}</div>`;
  let body = '';
  if (adminTab === 'players'){ const ps = players(); const inB = H && H.ph === 'battle' && H.B && !H.B.over; const sit = (H && H.sit) || {}; const afk = (H && H.afk) || {};
    const stat = x => { const id = x.peer; if (!H) return ''; if (sit[id]) return '💤 sitting this round out'; if (H.ph === 'battle' && H.B){ const hh = H.B.heroes.find(q => q.hid === id); if (!hh) return 'not in this fight'; if (hh.down || hh.hp <= 0) return '💀 down'; const a = x.presence.act; const ok = a && a.r === H.B.turn && a.k === H.bk; return (afk[id] >= 2 ? '💤 AFK · ' : '') + (ok ? '✅ chose a move' : '⏳ choosing…') + ` · ${hh.hp}/${hh.max} HP`; }
      if (H.ph === 'camp') return x.presence.rdy === H.lvl + ':' + H.wipes ? '✅ ready' : '⏳ studying…'; if (H.ph === 'map' || H.ph === 'event' || H.ph === 'terrain'){ const v = x.presence.cv; return v && v.k === H.vk ? '🗳 voted' : '⏳ not voted'; } if (H.ph === 'chest') return x.presence.cont === H.lvl + ':' + H.wipes ? '✅ ready' : '⏳ looking at loot'; return ''; };
    body = `<p class="muted small">Phase: <b>${esc(H ? H.ph : '-')}</b> · Round ${H ? H.lvl : '-'}. Skipping a turn makes that player pass this round only (they keep playing next round). A kicked player is removed right away but <b>can rejoin with the party code</b> (they keep their hero).</p>
      <div class="row tight"><button class="ghost" id="pskipall">⏭ Skip everyone who is still deciding</button></div>
      <div class="adlist plist">${ps.map(x => { const id = x.peer; const you = id === myPeer; return `<div class="prow"><div><b>${esc(String(x.presence.n || 'Player').slice(0, 20))}</b>${you ? ' <em>(you)</em>' : ''}<small>${esc(stat(x))}</small></div><div class="row tight">${inB && H.B.heroes.some(h => h.hid === id && !h.down && h.hp > 0) ? `<button class="ghost pskip" data-id="${esc(id)}">⏭ Skip turn</button>` : ''}${!you ? `<button class="ghost psit" data-id="${esc(id)}">${sit[id] ? '↩ Bring back' : '💤 Sit out'}</button><button class="danger pkick" data-id="${esc(id)}">🚪 Kick</button>` : ''}</div></div>`; }).join('') || '<p class="muted">Nobody here yet.</p>'}</div>`; }
  if (adminTab === 'hero') body = `<p class="muted small">Hero Lv ${L} · ${Math.round(S.xp||0)}/100 XP · ${S.pts} stat points · ✦ ${S.meta.wisdom} Wisdom · ✒ ${S.ink} Ink</p>
    <div class="row tight"><button class="ghost ah" data-a="xp10">+10 XP</button><button class="ghost ah" data-a="xp100">+100 XP</button><button class="ghost ah" data-a="xp500">+500 XP</button><button class="ghost ah" data-a="lv1">+1 level</button><button class="ghost ah" data-a="lv5">+5 levels</button><button class="ghost ah" data-a="lv10">+10 levels</button></div>
    <div class="row tight"><button class="ghost ah" data-a="pts">+10 stat points</button><button class="ghost ah" data-a="wis">+200 Wisdom</button><button class="ghost ah" data-a="ink">+200 Ink</button><button class="ghost ah" data-a="heal">Full heal</button><button class="ghost ah" data-a="pots">Fill potion belt</button><button class="ghost ah" data-a="boons">Own every boon</button></div>`;
  if (adminTab === 'weapon' || adminTab === 'armour'){ const kind = adminTab; let list = [];
    if (adminRar >= 3) list = Dd.LEGENDS.filter(x => x[2] === kind && x[4] === adminRar).map(x => ({id:'L:' + x[0], n:x[1], s: (kind === 'weapon' ? x[3] : x[3]) + ' · ' + x[5]}));
    else if (kind === 'weapon') list = WD[adminLand].types.map((t, i) => ({id:'W:' + i, n:t[2][adminRar] || t[0], s:t[0]}));
    else list = ['plate','leather','robe'].map((role, i) => ({id:'A:' + i, n:WD[adminLand].armour[adminRar][i], s:role}));
    if (kind === 'weapon' && adminRar === 4) list = list.concat(Object.keys(Dd.SPECIAL).map(k => ({id:'S:' + k, n:Dd.SPECIAL[k].name || k, s:'special'})));
    body = rarRow + (adminRar < 3 ? landRow : '') + `<label class="small"><input type="checkbox" id="aeq" ${adminEquip ? 'checked' : ''}> Equip it straight away (ignores stat requirements)</label><p class="muted small">${list.length} to choose from. Items arrive at your Hero Lv (${L}).</p><div class="adlist">${list.map(x => `<button class="ghost agive" data-id="${esc(x.id)}"><b style="color:${R[adminRar].c}">${esc(x.n)}</b><small>${esc(x.s)}</small></button>`).join('')}</div>`; }
  if (adminTab === 'trinket') body = rarRow + `<div class="adlist">${Dd.TRINKETS.map((t, i) => `<button class="ghost agive" data-id="T:${i}"><b style="color:${R[adminRar].c}">${esc(t[0])}</b><small>${esc(t[1])}</small></button>`).join('')}</div>`;
  if (adminTab === 'run'){ const g = H || {}; body = `<p class="bad small">These change the shared run, so everyone will see the result (but not that it was you).</p>
    <p class="muted small">Difficulty (mob health and damage; applies to the next fights):</p><div class="row tight">${Object.entries(C.DIFFS).map(([k, d]) => `<button class="${(g.diff||'hard')===k?'':'ghost'} adiff" data-d="${k}">${d.n}</button>`).join('')}</div>
    <p class="muted small">Round ${g.lvl || '-'} of ${g.len || 50} · ${esc(WD[g.w || 0].name)} · phase ${esc(g.ph || '-')}</p>
    <div class="row tight"><input id="ajump" type="number" min="1" max="${g.len || 50}" value="${Math.min(50, (g.lvl||1) + 1)}" style="width:5em"><button class="ghost" id="ajumpb">Jump to round</button></div>
    <p class="muted small">Offer this next on the map (only during a map vote):</p><div class="row tight"><button class="ghost aforce" data-f="god">★6 myth god</button><button class="ghost aforce" data-f="p7">★7 duo</button><button class="ghost aforce" data-f="p10">★10 horror</button><button class="ghost aforce" data-f="final">Final boss</button><button class="ghost aforce" data-f="5">★5</button><button class="ghost aforce" data-f="mini">Mini-boss</button><button class="ghost aforce" data-f="boss">Boss</button><button class="ghost aforce" data-f="event">Event</button></div>
    <p class="muted small">Move the party to:</p>${WD.map((w, i) => `<button class="ghost amove" data-w="${i}">${esc(w.name)}</button>`).join(' ')}`; }
  ov.innerHTML = `<div class="adbox"><div class="row" style="justify-content:space-between"><h2 style="margin:0">🛠 Admin</h2><button class="ghost" id="adx">Close</button></div>
    <p class="muted small">Only you can see this. Changes to your hero are private: no one is notified.</p>
    <div class="row tight">${tabs.map(([k, n]) => `<button class="${adminTab===k?'':'ghost'} atab" data-t="${k}">${n}</button>`).join('')}</div>${body}${adminMsg ? `<p class="ok small">${esc(adminMsg)}</p>` : ''}</div>`;
  const q = s => ov.querySelectorAll(s);
  $('adx').onclick = adminClose; q('.atab').forEach(b => b.onclick = () => { adminTab = b.dataset.t; adminMsg = ''; adminDraw(); });
  q('.arar').forEach(b => b.onclick = () => { adminRar = +b.dataset.r; adminDraw(); }); if ($('aeq')) $('aeq').onchange = () => { adminEquip = $('aeq').checked; }; q('.aland').forEach(b => b.onclick = () => { adminLand = +b.dataset.w; adminDraw(); });
  q('.ah').forEach(b => b.onclick = () => { const a = b.dataset.a;
    if (a === 'xp10' || a === 'xp100' || a === 'xp500') gainXP(+a.slice(2));
    if (a.startsWith('lv')) gainXP(100*(+a.slice(2)) - (S.xp||0) % 100);
    if (a === 'pts') S.pts += 10; if (a === 'wis') S.meta.wisdom += 200; if (a === 'ink') S.ink += 200; if (a === 'heal') S.hp = maxHP();
    if (a === 'pots') for (const k of Object.keys(Dd.CONSUMABLES)) S.belt[k] = BELTCAP;
    if (a === 'boons') S.meta.owned = Dd.BOONS.map(x => x[0]);
    adminMsg = 'Done.'; saveLocal(); save(); refresh(); adminDraw(); });
  q('.agive').forEach(b => b.onclick = () => { const [t, v] = b.dataset.id.split(':'); const r = Math.random, w = adminLand;
    if (t === 'L'){ const x = Dd.LEGENDS.find(l => l[0] === v); adminGive(x[2] === 'weapon' ? C.legendWeapon(w, x[3], x[4], r, v, L) : C.legendArmour(w, x[3], x[4], r, v, L)); }
    if (t === 'W') adminGive(C.makeWeapon(w, +v, adminRar, r, L)); if (t === 'A') adminGive(C.makeArmour(w, adminRar, +v, r, L));
    if (t === 'S') adminGive(C.makeSpecial(v, w, L)); if (t === 'T') adminGive(C.makeTrinket(w, +v, adminRar, L)); });
  q('.pskip').forEach(b => b.onclick = () => { hostSkip(b.dataset.id); adminMsg = 'Skipped that turn.'; adminDraw(); });
  q('.psit').forEach(b => b.onclick = () => { hostSit(b.dataset.id); adminDraw(); });
  q('.pkick').forEach(b => b.onclick = () => { if (!b.dataset.sure){ b.dataset.sure = 1; b.textContent = 'Sure? Click again'; return; } hostKick(b.dataset.id); adminMsg = 'Kicked. They can rejoin with the party code.'; adminDraw(); });
  if ($('pskipall')) $('pskipall').onclick = () => { const n = hostSkipWaiting(); adminMsg = n ? `Moved on without ${n} player${n===1?'':'s'}.` : 'Nobody was holding things up.'; adminDraw(); };
  if ($('ajumpb')) $('ajumpb').onclick = () => { if (!H) return; const n = Math.max(1, Math.min(H.len, Math.round(+$('ajump').value || 1))); H.lvl = n; H.ph = 'map'; H.msg = ''; newPaths(); pushState(); adminMsg = `The party is now on round ${n}.`; adminDraw(); };
  q('.adiff').forEach(b => b.onclick = () => { if (!H) return; H.diff = b.dataset.d; C.setDiff(H.diff); adminMsg = 'Difficulty set to ' + C.DIFFS[H.diff].n + '.'; pushState(); adminDraw(); });
  q('.aforce').forEach(b => b.onclick = () => { if (!H || H.ph !== 'map'){ adminMsg = 'Wait for a map vote.'; return adminDraw(); } const W = WD[H.w], f = b.dataset.f;
    const p = f === 'p7' ? {stars:7, kind:'promised', theme:5, key: Math.floor(Math.random()*Dd.PROMISED_DUOS.length)} : f === 'p10' ? {stars:10, kind:'outer', theme:6, key: C.pick(Dd.OUTER_BOSSES, Math.random)} : f === 'final' ? {stars:10, kind:'boss', theme:6, key: C.pick(W.bossKeys, Math.random), final:true} : f === 'god' ? {stars:6, kind:'god', theme:4, key: C.pick(W.gods, Math.random)} : f === '5' ? {stars:5, kind:'normal', theme:4} : f === 'mini' ? {stars:5, kind:'mini', theme:2, idx:0, key: C.pick(W.mini, Math.random)} : f === 'boss' ? {stars:4, kind:'boss', theme:4, key: C.pick(W.bossKeys, Math.random)} : {stars:1, kind:'event', ev: C.pick(['river','campsite','altar','aura','shrine','merchant'], Math.random), theme:0};
    H.paths = [p]; H.vk = 'm' + H.lvl + ':' + H.wipes + ':' + H.seq; H.deadline = now() + VOTE_MS; pushState(); adminMsg = 'The map now offers only that path.'; adminDraw(); });
  q('.amove').forEach(b => b.onclick = () => { if (!H) return; H.w = +b.dataset.w; if (H.ph === 'map') newPaths(); pushState(); adminMsg = `The party is now in ${WD[H.w].name}.`; adminDraw(); }); }
return {get ready(){ try { const m = me(); return !!(m && m.presence.rdy === readyKey()); } catch(e){ return false; } }, giftMenu, others: () => (code && WEBV ? others() : []), admin: adminOpen, get adminOK(){ return adminAllowed(); }, plates, draw, readyUp, leave, get on(){ return !!code; }, get code(){ return code; }, get host(){ return isHost; }, get G(){ return G; }, get BE(){ return BE; }, get peer(){ return myPeer; }, get local(){ return local; }, players, heroLooks, sendAct, _hostCheck: () => hostCheck(), _H: () => H};
})();
