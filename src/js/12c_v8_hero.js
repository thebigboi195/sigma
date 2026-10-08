/* ===== Essay Quest v8 — the hero: a smooth Roblox-style rig with elbows and knees, a character customiser look,
   and the armour builder that turns every design in DATA.ARMOURS into layered 3D armour.
   Rig contract (the animations rely on it): faces +Z; userData.parts = {body, armL, armR, legL, legR, head, wpn, wpnL, hold};
   arms pivot at the shoulders (±1.5, 3.9), each arm's hand group at (0, -2.05, 0); legs pivot at the hips (±0.5, 2); head at y 4.65. ===== */
const HERO8 = (() => {
const {mat, rbox, sweep, blob, sph, cyl, cone, tor, grp, rot, horn, wing, featherWing, eyeGlow, sprite, shade, mix} = KIT;
/* ---------- the character customiser's options ---------- */
const LOOK = {
  skin:[0xffd9b8, 0xf2c39b, 0xe0a87a, 0xc68a5e, 0x9a6440, 0x6e4428, 0x4a2c1a, 0xffd27f],
  hair:[0x1a1414, 0x3a2418, 0x6b3d22, 0xa86a32, 0xd8b060, 0xe8e0d0, 0xc03030, 0x3a6ad0, 0x50c080, 0xb050d0],
  eye:['#1b1622', '#3a6ad0', '#2a8a4a', '#8a5a2a', '#c03030', '#b050d0', '#e8a020'],
  hairStyle:['short', 'spiky', 'long', 'ponytail', 'bun', 'mohawk', 'afro', 'braids', 'swept', 'bald'],
  face:['smile', 'determined', 'grin', 'calm', 'fierce', 'wink'],
  build:['normal', 'broad', 'slim']};
const DEFAULT_LOOK = {skin:0, hair:2, eye:0, hairStyle:'short', face:'smile', build:'normal', capeCol:null, showHelm:true};
const lookOf = o => Object.assign({}, DEFAULT_LOOK, o || {});
const colOf = (list, v) => v == null ? list[0] : typeof v === 'number' ? (v >= 0 && v < list.length && Number.isInteger(v) ? list[v] : v) : v;
/* ---------- face textures ---------- */
const FACES = {};
function faceTex(style, eye){ const key = style + eye; if (FACES[key]) return FACES[key]; const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  g.fillStyle = eye; g.strokeStyle = '#2a1a14'; g.lineWidth = 6; g.lineCap = 'round';
  const eyeAt = (x, wink) => { if (wink){ g.beginPath(); g.moveTo(x - 9, 52); g.quadraticCurveTo(x, 44, x + 9, 52); g.stroke(); return; } g.beginPath(); g.ellipse(x, 50, 8, 11, 0, 0, Math.PI*2); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(x + 3, 46, 3, 0, Math.PI*2); g.fill(); g.fillStyle = eye; };
  eyeAt(44, false); eyeAt(84, style === 'wink');
  if (style === 'fierce' || style === 'determined'){ g.beginPath(); g.moveTo(32, 34); g.lineTo(54, 40); g.moveTo(96, 34); g.lineTo(74, 40); g.stroke(); }
  g.beginPath(); if (style === 'grin'){ g.moveTo(42, 80); g.quadraticCurveTo(64, 104, 86, 80); g.closePath(); g.fillStyle = '#fff'; g.fill(); g.stroke(); }
  else if (style === 'calm' || style === 'determined'){ g.moveTo(50, 86); g.lineTo(78, 86); g.stroke(); }
  else if (style === 'fierce'){ g.moveTo(48, 90); g.quadraticCurveTo(64, 80, 80, 90); g.stroke(); }
  else { g.moveTo(46, 80); g.quadraticCurveTo(64, 96, 82, 80); g.stroke(); }
  return (FACES[key] = new THREE.CanvasTexture(c)); }
/* ---------- hair ---------- */
function hair(head, style, col){ const m = mat(col, 'fur'); const u = head.userData;
  const cap = () => head.add(blob(0.7, 1.0, 0.62, 1.0, m, 0, 0.42, -0.03));
  if (style === 'bald') return;
  if (style === 'short'){ cap(); head.add(rbox(1.34, 0.5, 0.36, 0.15, m, 0, 0.22, -0.52)); }
  if (style === 'spiky'){ cap(); for (let i = 0; i < 9; i++){ const a = (i/9)*Math.PI*2; const s = rot(cone(0.16, 0.6, m, Math.cos(a)*0.38, 0.72, Math.sin(a)*0.38 - 0.05, 6), Math.sin(a)*0.7, 0, -Math.cos(a)*0.7); head.add(s); } }
  if (style === 'long'){ cap(); head.add(rbox(1.38, 1.5, 0.4, 0.18, m, 0, -0.15, -0.55)); for (const sx of [-1, 1]) head.add(rbox(0.25, 1.1, 0.7, 0.12, m, sx*0.66, 0.0, -0.15)); }
  if (style === 'ponytail'){ cap(); const p = sweep([[0, 0.5, -0.6], [0, 0.2, -0.95], [0, -0.5, -0.95], [0, -0.9, -0.8]], [0.18, 0.05], m, {radial:8}); head.add(p); u.ponytail = p; }
  if (style === 'bun'){ cap(); head.add(sph(0.3, m, 0, 0.8, -0.3, 12)); }
  if (style === 'mohawk'){ for (let i = 0; i < 6; i++) head.add(rot(cone(0.12, 0.55 - Math.abs(i - 2.5)*0.05, m, 0, 0.82 - i*0.04, 0.45 - i*0.22, 6), -0.4 + i*0.1, 0, 0)); }
  if (style === 'afro'){ head.add(blob(0.95, 1.05, 0.9, 1.0, m, 0, 0.42, -0.1, 0.06, 3)); }
  if (style === 'braids'){ cap(); for (const sx of [-1, 1]) head.add(sweep([[sx*0.5, 0.2, -0.3], [sx*0.6, -0.4, -0.25], [sx*0.55, -1.0, -0.1]], [0.12, 0.07], m, {radial:6})); }
  if (style === 'swept'){ cap(); const f = rbox(1.0, 0.4, 0.5, 0.16, m, 0.15, 0.58, 0.35); f.rotation.z = -0.25; head.add(f); } }
/* ---------- the body rig ---------- */
function rig(look){ const L = lookOf(look); const skinC = colOf(LOOK.skin, L.skin); const skin = mat(skinC, 'skin'); const bw = L.build === 'broad' ? 1.08 : L.build === 'slim' ? 0.93 : 1;
  const g = grp(); const body = grp(); g.add(body); const under = mat(0x2c2a3a, 'cloth'), shoe = mat(0x2a1e18, 'leather');
  const legL = grp(-0.5*bw, 2, 0), legR = grp(0.5*bw, 2, 0); for (const lg of [legL, legR]){ lg.add(rbox(0.88, 1.05, 0.88, 0.22, under, 0, -0.52, 0)); const knee = grp(0, -1.0, 0); lg.add(knee); knee.add(rbox(0.84, 0.95, 0.84, 0.2, under, 0, -0.42, 0)); knee.add(rbox(0.9, 0.32, 1.02, 0.12, shoe, 0, -0.86, 0.06)); lg.userData.knee = knee; }
  legL.rotation.x = 0.12; legR.rotation.x = -0.12; body.add(legL, legR);
  const chest = rbox(2.0*bw, 1.18, 1.05, 0.3, under, 0, 3.42, 0), belly = rbox(1.8*bw, 0.95, 0.92, 0.26, under, 0, 2.45, 0); body.add(chest, belly);
  body.add(cyl(0.34, 0.4, 0.4, skin, 0, 4.05, 0));
  const armL = grp(-1.5*bw, 3.9, 0), armR = grp(1.5*bw, 3.9, 0);
  for (const arm of [armL, armR]){ arm.add(rbox(0.82, 1.08, 0.82, 0.24, under, 0, -0.5, 0)); const elbow = grp(0, -1.02, 0); arm.add(elbow); elbow.add(rbox(0.78, 0.9, 0.78, 0.22, skin, 0, -0.42, 0)); arm.userData.elbow = elbow;
    const hand = grp(0, -2.05, 0); hand.add(rbox(0.78, 0.5, 0.8, 0.2, skin)); arm.add(hand); arm.userData.hand = hand; }
  body.add(armL, armR);
  const head = grp(0, 4.65, 0); body.add(head); head.add(rbox(1.3, 1.24, 1.22, 0.36, skin));
  const face = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 1.15), new THREE.MeshBasicMaterial({map:faceTex(L.face, colOf(LOOK.eye, L.eye)), transparent:true, depthWrite:false})); face.position.set(0, -0.02, 0.615); head.add(face); head.userData.face = face;
  g.userData.parts = {body, armR, armL, legL, legR, head, chest, belly}; g.userData.look = L; g.userData.skin = skin; g.userData.bw = bw;
  return g; }

/* ---------- armour ---------- */
const BRONZE = 0xc88a3a;
function paletteOf(a, d){ const lk = d.look;
  if (d.tier === 'base'){ const T = DATA.BASE_TIER[Math.min(2, a.rar || 0)]; let metal = T.metal; if (lk.metal && DATA.BASE_METAL[lk.metal]) metal = DATA.BASE_METAL[lk.metal][Math.min(2, a.rar || 0)]; return {metal, trim:T.trim, cloth:T.cloth, accent:T.accent, glow:T.glow}; }
  const p = lk.pal || [0x888890, 0xd8b048, 0x3a3a48, 0xffffff]; return {metal:lk.metal === 'gold' ? 0xd8a040 : p[0], trim:p[1], cloth:p[2], accent:p[3], glow:lk.glow != null ? lk.glow : 0}; }
function armour(g, a, L){ const d = (a && a.design && DATA.ARMOUR_BY[a.design]) || null; if (!d) return; const lk = d.look, P = g.userData.parts, U = g.userData; const pal = paletteOf(a, d); const tier = d.tier;
  const plate = a.role === 'plate'; const MET = mat(pal.metal, plate || lk.metal ? 'metal' : 'leather'), TRIM = mat(pal.trim, 'gold'), CL = mat(pal.cloth, 'cloth'), LEA = mat(shade(pal.cloth, 1.25), 'leather');
  const GL = pal.glow ? mat(pal.glow, 'glow') : null, ACC = mat(pal.accent, GL ? 'glow' : 'metal');
  const shell = plate ? MET : a.role === 'leather' ? LEA : CL; const bw = U.bw || 1; const fx = new Set(lk.fx || []); const big = tier === 'myth' || tier === 'outer';
  const line = (parent, w, h, x, y, z, rz) => { if (!GL) return; const l = rbox(w, h, 0.05, 0.02, GL, x, y, z); l.rotation.z = rz || 0; parent.add(l); };
  const B = P.body, H = P.head;
  /* chest */
  const ch = lk.ch || 'cloth';
  if (ch === 'plate' || ch === 'core' || ch === 'chrome'){ B.add(rbox(2.12*bw, 1.3, 1.18, 0.32, ch === 'chrome' ? mat(pal.metal, 'metal', {roughness:0.08}) : MET, 0, 3.45, 0.02)); B.add(rbox(1.9*bw, 0.42, 1.06, 0.18, MET, 0, 2.62, 0.02)); B.add(rbox(1.84*bw, 0.38, 1.02, 0.16, MET, 0, 2.22, 0.02));
    B.add(rbox(0.16, 1.1, 0.08, 0.04, TRIM, 0, 3.45, 0.6)); for (const sx of [-1, 1]) B.add(rot(rbox(0.9, 0.12, 0.08, 0.04, TRIM, sx*0.48, 3.95, 0.58), 0, 0, -sx*0.15));
    if (ch === 'core'){ B.add(sph(0.26, GL || ACC, 0, 3.5, 0.62, 16)); for (let i = 0; i < 4; i++){ line(B, 0.5, 0.06, -0.55, 3.25 - i*0.16, 0.6, 0.35); line(B, 0.5, 0.06, 0.55, 3.25 - i*0.16, 0.6, -0.35); } } }
  else if (ch === 'muscle'){ B.add(rbox(2.1*bw, 1.32, 1.16, 0.4, MET, 0, 3.42, 0.02)); for (const sx of [-1, 1]) B.add(blob(0.42, 1.1, 0.75, 0.35, MET, sx*0.45, 3.6, 0.5)); for (let i = 0; i < 3; i++) for (const sx of [-1, 1]) B.add(blob(0.17, 1.2, 0.8, 0.5, MET, sx*0.22, 3.08 - i*0.26, 0.5)); B.add(rbox(1.9*bw, 0.6, 1.0, 0.22, MET, 0, 2.45, 0)); }
  else if (ch === 'ribs'){ B.add(rbox(2.1*bw, 1.32, 1.16, 0.32, MET, 0, 3.42, 0.02)); for (let i = 0; i < 5; i++){ const y = 3.85 - i*0.2; for (const sx of [-1, 1]){ const r = sweep([[0, y, 0.62], [sx*0.45, y - 0.05, 0.6], [sx*0.95, y - 0.18, 0.35]], [0.07, 0.04], i % 2 ? TRIM : MET, {radial:6}); B.add(r); } } B.add(rbox(1.9*bw, 0.9, 1.0, 0.2, MET, 0, 2.45, 0)); line(B, 0.08, 1.1, 0, 3.4, 0.64); }
  else if (ch === 'lamellar' || ch === 'scale'){ for (let r = 0; r < 6; r++) B.add(rbox(2.08*bw - (r > 3 ? 0.15 : 0), 0.3, 1.12 - (r > 3 ? 0.08 : 0), 0.1, r % 2 ? MET : (ch === 'lamellar' ? TRIM : MET), 0, 3.9 - r*0.27, 0.02));
    if (ch === 'lamellar') for (let r = 0; r < 6; r++) for (let i = 0; i < 6; i++) B.add(rbox(0.05, 0.22, 0.04, 0.02, mat(shade(pal.trim, 0.6), 'cloth'), -0.85 + i*0.34, 3.9 - r*0.27, 0.58)); }
  else if (ch === 'chain'){ B.add(rbox(2.08*bw, 1.3, 1.12, 0.3, mat(0x9aa2ac, 'metal', {roughness:0.55}), 0, 3.42, 0.01)); B.add(rbox(1.85*bw, 0.95, 0.98, 0.25, mat(0x9aa2ac, 'metal', {roughness:0.55}), 0, 2.45, 0)); }
  else if (ch === 'leather'){ B.add(rbox(2.06*bw, 1.26, 1.1, 0.3, LEA, 0, 3.42, 0.01)); B.add(rbox(1.84*bw, 0.95, 0.96, 0.26, LEA, 0, 2.45, 0)); const strap = rbox(0.18, 1.9, 0.06, 0.04, mat(0x4a2a14, 'leather'), 0, 3.15, 0.6); strap.rotation.z = 0.62; B.add(strap); B.add(rbox(1.9*bw, 0.2, 1.0, 0.06, mat(0x3a2412, 'leather'), 0, 2.15, 0)); B.add(rbox(0.3, 0.26, 0.08, 0.04, TRIM, 0, 2.15, 0.52)); }
  else if (ch === 'gi'){ B.add(rbox(2.06*bw, 1.26, 1.1, 0.3, CL, 0, 3.42, 0.01)); B.add(rbox(1.84*bw, 0.95, 0.96, 0.26, CL, 0, 2.45, 0)); for (const sx of [-1, 1]){ const lap = rbox(0.2, 1.4, 0.06, 0.04, TRIM, sx*0.25, 3.4, 0.58); lap.rotation.z = sx*0.45; B.add(lap); } B.add(rbox(1.92*bw, 0.24, 1.0, 0.08, mat(pal.accent === pal.trim ? 0x1a1a1a : pal.trim, 'cloth'), 0, 2.4, 0)); }
  else { B.add(rbox(2.06*bw, 1.26, 1.1, 0.3, CL, 0, 3.42, 0.01)); B.add(rbox(1.84*bw, 0.95, 0.96, 0.26, CL, 0, 2.45, 0)); B.add(rbox(0.22, 2.0, 0.06, 0.05, TRIM, 0, 3.0, 0.52)); B.add(rbox(1.9*bw, 0.2, 1.0, 0.06, TRIM, 0, 2.15, 0)); }
  /* emblem */
  const em = lk.em; if (em){ const E = grp(0, 3.5, 0.66); B.add(E); const EM = GL || TRIM;
    if (em === 'cross'){ E.add(rbox(0.14, 0.62, 0.05, 0.02, mat(0xc02020, 'cloth'))); E.add(rbox(0.46, 0.14, 0.05, 0.02, mat(0xc02020, 'cloth'), 0, 0.1, 0)); }
    else if (em === 'sun' || em === 'firebird'){ E.add(cyl(0.2, 0.2, 0.05, EM, 0, 0, 0, 18).rotateX(Math.PI/2)); for (let i = 0; i < 10; i++){ const r = rot(cone(0.06, 0.24, EM, Math.cos(i*0.628)*0.32, Math.sin(i*0.628)*0.32, 0, 4), 0, 0, i*0.628 - Math.PI/2); E.add(r); } }
    else if (em === 'eye' || em === 'amulet'){ E.add(tor(0.2, 0.05, TRIM, 0, 0, 0)); E.add(sph(0.12, mat(lk.eye || 0x7fff60, 'eye'), 0, 0, 0.03, 12)); }
    else if (em === 'star'){ for (let i = 0; i < 5; i++) E.add(rot(cone(0.08, 0.36, EM, Math.cos(i*1.257 + 1.57)*0.12, Math.sin(i*1.257 + 1.57)*0.12, 0, 4), 0, 0, i*1.257)); }
    else if (em === 'bat'){ for (const sx of [-1, 1]){ const w = sweep([[0, 0, 0], [sx*0.25, 0.12, 0], [sx*0.45, 0.05, 0], [sx*0.38, -0.08, 0]], [0.08, 0.02], mat(0x0a0a0e, 'dark'), {radial:5}); E.add(w); } E.add(sph(0.08, mat(0x0a0a0e, 'dark'), 0, 0, 0)); }
    else if (em === 'skull'){ E.add(blob(0.18, 1, 1.1, 0.5, mat(0xe8e0d0, 'bone'))); for (const sx of [-1, 1]) E.add(sph(0.05, mat(0x000000, 'eye'), sx*0.07, 0.02, 0.08, 8)); }
    else if (em === 'omega'){ E.add(tor(0.18, 0.05, EM, 0, 0.04, 0, Math.PI*1.6).rotateZ(-Math.PI*0.3)); }
    else if (em === 'mon'){ E.add(tor(0.22, 0.04, TRIM, 0, 0, 0)); for (let i = 0; i < 3; i++) E.add(rot(rbox(0.06, 0.3, 0.04, 0.02, TRIM, Math.cos(i*2.09)*0.08, Math.sin(i*2.09)*0.08, 0), 0, 0, i*2.09)); }
    else if (em === 'trident'){ E.add(rbox(0.06, 0.6, 0.04, 0.02, EM)); for (const sx of [-1, 0, 1]) E.add(cone(0.05, 0.18, EM, sx*0.14, 0.32, 0, 4)); E.add(rbox(0.32, 0.05, 0.04, 0.02, EM, 0, 0.22, 0)); }
    else if (em === 'bolt'){ E.add(sweep([[0.1, 0.32, 0], [-0.08, 0.04, 0], [0.08, 0.02, 0], [-0.1, -0.32, 0]], 0.05, EM, {radial:4, segs:12})); }
    else if (em === 'moon'){ E.add(tor(0.2, 0.06, EM, 0, 0, 0, Math.PI*1.3).rotateZ(0.9)); }
    else if (em === 'dragon'){ E.add(sweep([[-0.2, -0.2, 0], [0.1, -0.05, 0], [-0.05, 0.12, 0], [0.18, 0.25, 0]], [0.07, 0.02], mat(0xc01818, 'cloth'), {radial:6})); E.add(cone(0.06, 0.18, mat(0xc01818, 'cloth'), 0.2, 0.3, 0, 4)); }
    else if (em === 'ankh'){ E.add(tor(0.1, 0.035, EM, 0, 0.16, 0)); E.add(rbox(0.06, 0.34, 0.04, 0.02, EM, 0, -0.08, 0)); E.add(rbox(0.3, 0.06, 0.04, 0.02, EM, 0, 0.04, 0)); }
    else if (em === 'wolf' || em === 'lion'){ E.add(blob(0.2, 1, 1.05, 0.5, EM)); for (const sx of [-1, 1]) E.add(cone(0.06, 0.16, EM, sx*0.13, 0.2, 0, 4)); }
    else if (em === 'hope'){ const s = rot(rbox(0.6, 0.48, 0.05, 0.1, mat(0xffcf4a, 'gold'), 0, 0, 0), 0, 0, Math.PI/4); s.scale.y = 0.75; E.add(s); E.add(sweep([[0.12, 0.08, 0.03], [-0.1, 0.08, 0.03], [0.1, -0.06, 0.03], [-0.12, -0.08, 0.03]], 0.035, mat(0xc01818, 'cloth'), {radial:4})); }
    else if (em === 'pearl'){ E.add(sph(0.16, mat(0xfff4f8, 'metal', {roughness:0.1}), 0, 0, 0, 16)); }
    else if (em === 'w'){ E.add(rbox(0.5, 0.4, 0.05, 0.1, mat(0x2a4aa0, 'metal'))); E.add(sweep([[-0.18, 0.12, 0.03], [-0.08, -0.12, 0.03], [0, 0.04, 0.03], [0.08, -0.12, 0.03], [0.18, 0.12, 0.03]], 0.03, mat(0x9fe8ff, 'glow'), {radial:4, segs:16})); } }
  /* skirt */
  const sk = lk.sk;
  if (sk === 'tassets') for (const sx of [-1, 0, 1]){ const t = rbox(0.6, 0.62, 0.12, 0.08, MET, sx*0.62*bw, 1.78, 0.48); t.rotation.x = -0.12; B.add(t); if (GL) line(B, 0.4, 0.05, sx*0.62*bw, 1.6, 0.56); }
  if (sk === 'pteruges') for (let i = 0; i < 8; i++){ const a = -1.2 + i*0.34; const s = rbox(0.24, 0.72, 0.08, 0.04, i % 2 ? TRIM : LEA, Math.sin(a)*0.95*bw, 1.75, Math.cos(a)*0.55); s.rotation.y = a; B.add(s); }
  if (sk === 'kusazuri') for (let i = 0; i < 4; i++){ const a = i*Math.PI/2; const s = grp(Math.sin(a)*0.75, 1.9, Math.cos(a)*0.55); s.rotation.y = a; for (let r = 0; r < 3; r++) s.add(rbox(0.85, 0.24, 0.1, 0.05, r % 2 ? TRIM : MET, 0, -r*0.22, 0.06 + r*0.02)); B.add(s); }
  if (sk === 'robe' || sk === 'hakama'){ const r = cyl(0.98*bw, 1.32*bw, 2.0, sk === 'hakama' ? mat(shade(pal.cloth, 0.9), 'cloth') : CL, 0, 1.05, 0, 20); r.scale.z = 0.72; B.add(r); B.add(tor(1.25*bw, 0.05, TRIM, 0, 0.1, 0).rotateX(Math.PI/2)); }
  if (sk === 'tabard'){ B.add(rbox(1.0, 1.7, 0.06, 0.04, CL, 0, 2.2, 0.56)); B.add(rbox(1.0, 1.7, 0.06, 0.04, CL, 0, 2.2, -0.52)); B.add(rbox(1.0, 0.1, 0.08, 0.04, TRIM, 0, 1.38, 0.57)); }
  if (sk === 'coat'){ for (const sx of [-1, 1]){ const t = rbox(0.95, 1.5, 0.08, 0.05, a.role === 'leather' ? LEA : CL, sx*0.5, 1.4, -0.46); t.rotation.x = 0.12; B.add(t); (U.tails = U.tails || []).push(t); } }
  if (sk === 'fur' || sk === 'tiger'){ const f = cyl(1.0*bw, 1.18*bw, 0.65, mat(sk === 'tiger' ? 0xe0a030 : shade(pal.cloth, 1.4), 'fur'), 0, 1.75, 0, 14); f.scale.z = 0.75; B.add(f); if (sk === 'tiger') for (let i = 0; i < 6; i++) B.add(rot(rbox(0.08, 0.5, 0.04, 0.02, mat(0x1a1a1a, 'cloth'), Math.sin(i)*0.9, 1.75, Math.cos(i)*0.62), 0, i, 0.3)); }
  if (sk === 'tunic'){ const r = cyl(0.98*bw, 1.15*bw, 1.0, CL, 0, 1.6, 0, 18); r.scale.z = 0.72; B.add(r); }
  /* shoulders */
  const sh = lk.sh || 'none';
  for (const [arm, sx] of [[P.armL, -1], [P.armR, 1]]){ const S = grp(0, 0.05, 0); arm.add(S);
    if (sh === 'round'){ S.add(blob(0.62, 1.0, 0.6, 1.0, MET, sx*0.12, 0.1, 0)); S.add(tor(0.55, 0.05, TRIM, sx*0.12, 0.08, 0).rotateX(Math.PI/2)); }
    if (sh === 'layer' || sh === 'sode'){ for (let i = 0; i < 3; i++){ const p = rbox(1.0 + (sh === 'sode' ? 0.2 : 0), 0.3, 1.05, 0.1, i % 2 ? TRIM : MET, sx*(0.15 + i*0.06), 0.12 - i*0.28, 0); p.rotation.z = sx*(0.3 + i*0.05); S.add(p); } }
    if (sh === 'spike' || sh === 'skull'){ S.add(blob(0.6, 1.0, 0.62, 1.0, MET, sx*0.12, 0.1, 0)); for (let i = 0; i < 3; i++){ const h = horn(0.7 - i*0.12, 0.12, 0.5, MET); h.position.set(sx*(0.2 + i*0.15), 0.4, -0.25 + i*0.25); h.rotation.z = -sx*(0.55 + i*0.2); S.add(h); } if (sh === 'skull') S.add(blob(0.3, 1, 1.1, 1, mat(0xe8e0d0, 'bone'), sx*0.2, 0.15, 0.4)); }
    if (sh === 'fur'){ S.add(blob(0.68, 1.1, 0.6, 1.05, mat(shade(pal.cloth, 1.5), 'fur'), sx*0.1, 0.12, 0, 0.12, 2)); }
    if (sh === 'wing'){ S.add(blob(0.58, 1.0, 0.6, 1.0, MET, sx*0.12, 0.1, 0)); const w = featherWing(1.2, pal.metal, pal.trim, {metal:true, rows:2}); w.scale.set(sx, 1, 1); w.position.set(sx*0.3, 0.4, -0.2); w.rotation.z = sx*0.6; S.add(w); }
    if (sh === 'blade'){ S.add(blob(0.56, 1.0, 0.6, 1.0, MET, sx*0.12, 0.1, 0)); for (let i = 0; i < 2; i++){ const b = rbox(0.12, 1.0 - i*0.25, 0.5, 0.05, TRIM, sx*(0.5 + i*0.18), 0.55, -0.1); b.rotation.z = -sx*(0.7 + i*0.25); S.add(b); } }
    if (sh === 'orb'){ S.add(blob(0.5, 1.0, 0.6, 1.0, MET, sx*0.12, 0.1, 0)); S.add(sph(0.2, GL || ACC, sx*0.25, 0.6, 0, 12)); }
    if (sh === 'shell'){ for (let i = 0; i < 4; i++) S.add(rot(blob(0.26, 1, 0.4, 1.3, i % 2 ? TRIM : MET, sx*(0.05 + i*0.12), 0.15, -0.3 + i*0.2), 0, 0, sx*0.4)); }
    if (sh === 'dragon'){ S.add(blob(0.62, 1.0, 0.6, 1.0, MET, sx*0.12, 0.1, 0)); const hd = blob(0.3, 1.5, 0.8, 0.9, TRIM, sx*0.45, 0.3, 0.35); S.add(hd); S.add(horn(0.5, 0.08, 0.6, TRIM).translateX(sx*0.4).translateY(0.5)); }
    if (sh === 'leaf' || sh === 'feather'){ for (let i = 0; i < 4; i++){ const l = rbox(0.3, 0.8, 0.05, 0.12, i % 2 ? (sh === 'leaf' ? mat(0x3a8a2a, 'cloth') : mat(0x16141c, 'fur')) : (sh === 'leaf' ? mat(0x7fd04a, 'cloth') : mat(0x2a2a36, 'fur')), sx*(0.25 + i*0.08), 0.2 - i*0.12, -0.3 + i*0.2); l.rotation.z = sx*(1.1 + i*0.1); S.add(l); } }
    if (sh === 'fin'){ S.add(blob(0.5, 1.0, 0.6, 1.0, MET, sx*0.12, 0.1, 0)); const f = sweep([[0, 0, 0], [sx*0.4, 0.5, -0.2], [sx*0.8, 0.9, -0.5]], [0.15, 0.01], ACC, {radial:6, ex:0.25}); f.position.set(sx*0.2, 0.3, 0); S.add(f); }
    if (sh === 'scale'){ for (let i = 0; i < 5; i++) S.add(rot(blob(0.22, 1, 0.35, 1.2, i % 2 ? TRIM : MET, sx*(0.05 + i*0.1), 0.25 - i*0.1, -0.2 + (i%3)*0.2), 0, 0, sx*0.5)); }
    if (sh === 'collar' || sh === 'cloud'){ S.add(blob(0.55, 1.0, 0.45, 1.0, sh === 'cloud' ? mat(0xf4f4f8, 'cloth') : TRIM, sx*0.1, 0.15, 0, sh === 'cloud' ? 0.15 : 0, 4)); } }
  if (sh === 'collar') B.add(tor(0.8, 0.12, TRIM, 0, 4.0, 0).rotateX(Math.PI/2));
  /* arms + legs */
  const ar = lk.ar || 'cloth';
  for (const arm of [P.armL, P.armR]){ const E = arm.userData.elbow;
    if (ar === 'cloth') arm.add(rbox(0.86, 1.1, 0.86, 0.25, CL, 0, -0.5, 0));
    else arm.add(rbox(0.88, 1.1, 0.88, 0.26, plate ? MET : LEA, 0, -0.5, 0));
    if (ar === 'bracer'){ E.add(rbox(0.86, 0.6, 0.86, 0.2, LEA, 0, -0.55, 0)); E.add(rbox(0.88, 0.1, 0.88, 0.04, TRIM, 0, -0.3, 0)); }
    if (ar === 'gauntlet' || ar === 'gemgauntlet' || ar === 'claw'){ E.add(rbox(0.86, 0.9, 0.86, 0.22, MET, 0, -0.42, 0)); E.add(rbox(0.92, 0.14, 0.92, 0.05, TRIM, 0, -0.08, 0)); const hand = arm.userData.hand; hand.add(rbox(0.84, 0.56, 0.86, 0.2, MET));
      if (ar === 'claw') for (let i = 0; i < 3; i++){ const c = horn(0.45, 0.06, -0.8, TRIM); c.position.set(-0.25 + i*0.25, -0.2, 0.3); c.rotation.x = Math.PI; hand.add(c); }
      if (ar === 'gemgauntlet'){ hand.add(rbox(0.9, 0.6, 0.92, 0.2, mat(0xd8a838, 'gold'))); [0x9a30ff, 0x3060ff, 0xff3030, 0xffa020, 0x30d060, 0xffe040].forEach((c, i) => hand.add(sph(0.08, mat(c, 'glow'), -0.3 + i*0.12, 0.05, 0.46, 8))); } }
    if (GL && ar !== 'cloth') line(E, 0.05, 0.6, 0, -0.45, 0.45); }
  for (const lg of [P.legL, P.legR]){ const K = lg.userData.knee; const lgT = lk.lg || 'cloth';
    lg.add(rbox(0.92, 1.08, 0.92, 0.25, lgT === 'cloth' || lgT === 'sandal' ? CL : plate ? MET : LEA, 0, -0.52, 0));
    if (lgT === 'greaves' || lgT === 'plate'){ K.add(rbox(0.9, 0.86, 0.92, 0.22, MET, 0, -0.42, 0.02)); K.add(blob(0.24, 1, 0.8, 0.7, TRIM, 0, 0, 0.4)); if (lgT === 'plate') K.add(rbox(0.96, 0.34, 1.08, 0.12, MET, 0, -0.86, 0.08)); }
    if (lgT === 'boots') K.add(rbox(0.9, 0.62, 0.96, 0.2, mat(shade(pal.cloth, 0.6), 'leather'), 0, -0.6, 0.04));
    if (lgT === 'sandal'){ for (let i = 0; i < 3; i++) K.add(rbox(0.9, 0.06, 0.9, 0.03, mat(0x8a5a2a, 'leather'), 0, -0.2 - i*0.22, 0)); } }
  /* cape */
  const cp = lk.cape || ['none']; const ck = cp[0], capeC = L.capeCol != null ? L.capeCol : (cp[1] != null ? cp[1] : pal.cloth), capeC2 = cp[2];
  if (ck !== 'none'){ const C = grp(0, 4.0, -0.58); B.add(C); U.cape = C;
    if (ck === 'scarf'){ C.position.set(0, 4.05, 0.1); C.add(tor(0.62, 0.15, mat(capeC, 'cloth'), 0, 0, 0).rotateX(Math.PI/2)); const tl = sweep([[0.3, 0, -0.6], [0.6, -0.3, -1.1], [0.9, -0.2, -1.6]], [0.16, 0.08], mat(capeC, 'cloth'), {ex:0.3}); C.add(tl); U.scarfTail = tl; }
    else if (ck === 'wings'){ U.cape = null; const wl = featherWing(3.2, capeC, capeC2 || pal.trim, {rows:3}), wr = featherWing(3.2, capeC, capeC2 || pal.trim, {rows:3}); wl.scale.x = -1; wl.position.set(-0.4, 0.2, 0); wr.position.set(0.4, 0.2, 0); wl.rotation.y = 0.3; wr.rotation.y = -0.3; C.add(wl, wr); U.wings = [wl, wr]; if (capeC2) { const s = sprite(capeC2, 6); s.position.set(0, -0.5, -0.4); C.add(s); } }
    else { const len = ck === 'short' ? 1.8 : ck === 'cloak' ? 3.8 : 3.4; const M0 = ck === 'energy' ? mat(capeC, 'glass') : ck === 'fur' ? mat(capeC, 'fur', {side:1}) : mat(capeC, 'cloth', {side:1});
      const n = 5; for (let i = 0; i < n; i++){ const wv = 2.05 - i*0.04 + (ck === 'cloak' ? 0.3 : 0); const seg = rbox(wv, len/n + 0.06, 0.07, 0.03, M0, 0, -len/n*(i + 0.5), -i*0.03); if (ck === 'tattered' && i === n - 1){ seg.scale.x = 0.9; } C.add(seg); }
      if (ck === 'tattered') for (let i = 0; i < 6; i++) C.add(rot(cone(0.16, 0.6, M0, -0.85 + i*0.34, -len - 0.2, -0.15, 4), Math.PI, 0, (i%2 ? 0.2 : -0.2)));
      if (capeC2 && ck !== 'fur') C.add(rbox(2.0, 0.12, 0.09, 0.04, mat(capeC2, ck === 'energy' ? 'glow' : 'gold'), 0, -len + 0.05, -0.15));
      if (ck === 'cloak'){ for (const sx of [-1, 1]){ const col = rbox(0.4, 1.2, 0.3, 0.12, M0, sx*1.05, 0.35, 0.35); col.rotation.z = -sx*0.3; C.add(col); } } C.rotation.x = 0.1; } }
  /* helmet */
  helm(H, lk, {MET, TRIM, CL, LEA, GL, ACC, pal, tier, L, g, d});
  /* extras */
  extras(g, fx, lk, {MET, TRIM, CL, LEA, GL, ACC, pal, tier, big});
  /* the rarity glow: Epic and up shine, Mythical and Outerversal radiate */
  if (a.rar >= 3){ const col = pal.glow || pal.accent; const au = sprite(col, a.rar >= 6 ? 10 : a.rar >= 5 ? 8 : a.rar >= 4 ? 6.5 : 5); au.material.opacity = a.rar >= 5 ? 0.5 : 0.3; au.position.y = 2.8; g.add(au); U.aura = au;
    if (a.rar >= 4){ U.orbs = []; for (let i = 0; i < (a.rar >= 6 ? 7 : a.rar >= 5 ? 5 : 3); i++){ const o = sprite(col, a.rar >= 5 ? 0.7 : 0.5); g.add(o); U.orbs.push(o); } } } }
/* ---------- helmets ---------- */
function helm(H, lk, K){ const {MET, TRIM, CL, LEA, GL, ACC, pal, L, g} = K; const h = lk.h || 'none'; const U = g.userData; if (L.showHelm === false && !['halo', 'circlet', 'crown', 'laurel', 'band'].includes(h)) return finishHair(H, lk, L, true);
  const eyeC = lk.eye || 0xff3030; const visorEyes = (y, z, w) => { for (const sx of [-1, 1]) H.add(eyeGlow(eyeC, 0.07, sx*(w || 0.2), y, z)); };
  const shellH = (m, y0, sy) => H.add(blob(0.8, 1.0, sy || 0.92, 1.0, m, 0, y0 || 0.1, -0.02));
  const hideFace = () => { if (H.userData.face) H.userData.face.visible = false; };
  let hairOk = false;
  switch (h){
    case 'none': hairOk = true; break;
    case 'hood': case 'cowl': case 'mummyhood': case 'sealhood': { const m = h === 'mummyhood' ? mat(0xf0f0f4, 'cloth') : h === 'sealhood' ? mat(0x5a6a7a, 'fur') : CL; H.add(blob(0.86, 1.0, 1.0, 1.05, m, 0, 0.18, -0.15)); H.add(rot(cone(0.6, 0.9, m, 0, 0.4, -0.7, 12), -1.2, 0, 0));
      if (h === 'cowl' || h === 'mummyhood'){ hideFace(); H.add(rbox(1.0, 0.9, 0.2, 0.2, mat(0x08080c, 'dark'), 0, -0.05, 0.6)); visorEyes(0.05, 0.72, 0.18); if (h === 'mummyhood') for (let i = 0; i < 5; i++) H.add(rot(rbox(1.5, 0.08, 1.5, 0.04, mat(0xd8d8e0, 'cloth'), 0, -0.4 + i*0.25, -0.05), 0, 0, (i%2 ? 0.08 : -0.08))); } break; }
    case 'cap': H.add(blob(0.72, 1.0, 0.55, 1.0, LEA, 0, 0.45, 0)); H.add(rbox(1.0, 0.08, 0.5, 0.03, LEA, 0, 0.3, 0.6)); break;
    case 'kettle': shellH(MET, 0.25, 0.75); H.add(cyl(1.1, 1.1, 0.08, MET, 0, 0.25, 0, 24)); break;
    case 'barbute': case 'beast': { shellH(MET, 0.06, 1.0); hideFace(); H.add(rbox(0.16, 0.9, 0.12, 0.05, mat(0x050505, 'dark'), 0, -0.05, 0.8)); H.add(rbox(0.8, 0.12, 0.12, 0.04, mat(0x050505, 'dark'), 0, 0.15, 0.8));
      if (h === 'beast'){ H.add(rot(blob(0.4, 1.4, 0.7, 1.0, MET, 0, -0.25, 0.72), 0.3, 0, 0)); for (let i = 0; i < 6; i++) H.add(rot(cone(0.05, 0.22, mat(0xe8e0d0, 'bone'), -0.3 + i*0.12, -0.42, 0.95, 4), Math.PI, 0, 0)); visorEyes(0.15, 0.82, 0.22); for (const sx of [-1, 1]){ const ear = horn(0.55, 0.15, 0.3, MET); ear.position.set(sx*0.45, 0.65, 0); ear.rotation.z = -sx*0.3; H.add(ear); } }
      else visorEyes(0.15, 0.82, 0.22); break; }
    case 'greathelm': case 'visor': case 'ironmask': case 'granite': { const m = h === 'granite' ? mat(pal.metal, 'scale', {roughness:0.85}) : MET; H.add(rbox(1.45, 1.42, 1.4, 0.32, m, 0, 0.1, 0)); hideFace();
      if (h === 'ironmask'){ H.add(rbox(1.1, 1.2, 0.12, 0.25, mat(0x9aa0aa, 'metal'), 0, 0, 0.7)); for (const sx of [-1, 1]) H.add(rbox(0.3, 0.07, 0.05, 0.02, mat(0x000000, 'eye'), sx*0.24, 0.12, 0.77)); H.add(rbox(0.5, 0.06, 0.05, 0.02, mat(0x000000, 'eye'), 0, -0.3, 0.77)); H.add(rot(cone(0.95, 1.2, mat(pal.trim, 'cloth'), 0, 0.35, -0.25, 16), -0.25, 0, 0)); visorEyes(0.12, 0.8, 0.24); }
      else { H.add(rbox(1.2, 0.12, 0.1, 0.04, mat(0x050505, 'dark'), 0, 0.18, 0.71)); visorEyes(0.18, 0.74, 0.25); if (h === 'visor') for (let i = 0; i < 4; i++) H.add(rbox(1.0, 0.05, 0.1, 0.02, TRIM, 0, -0.08 - i*0.13, 0.72)); else H.add(rbox(0.12, 0.9, 0.06, 0.03, TRIM, 0, -0.1, 0.72)); } break; }
    case 'corinthian': { shellH(mat(pal.metal, 'metal'), 0.12, 1.02); hideFace(); H.add(rbox(0.3, 1.0, 0.16, 0.06, mat(pal.metal, 'metal'), 0, -0.2, 0.74)); for (const sx of [-1, 1]) H.add(rbox(0.36, 0.95, 0.4, 0.12, mat(pal.metal, 'metal'), sx*0.42, -0.25, 0.55)); visorEyes(0.12, 0.8, 0.22); break; }
    case 'jingasa': H.add(rot(cone(1.3, 0.55, mat(pal.metal, 'leather'), 0, 0.85, 0, 24), 0, 0, 0)); hairOk = true; break;
    case 'kabuto': case 'oni': { shellH(mat(pal.metal, 'metal'), 0.22, 0.85); for (let i = 0; i < 3; i++){ const s = tor(1.0 - i*0.08, 0.08, i % 2 ? TRIM : MET, 0, -0.05 - i*0.18, -0.15, Math.PI*1.2); s.rotation.set(Math.PI/2 + 0.3, 0, Math.PI*0.9); H.add(s); }
      if (h === 'oni' || (lk.fx || []).includes('menpo')){ hideFace(); H.add(rbox(1.05, 0.8, 0.2, 0.25, mat(h === 'oni' ? pal.metal : 0x8a1010, 'scale'), 0, -0.2, 0.62)); for (let i = 0; i < 6; i++) H.add(rot(cone(0.05, 0.18, mat(0xf4f0e0, 'bone'), -0.3 + i*0.12, -0.45, 0.72, 4), Math.PI, 0, 0)); visorEyes(0.1, 0.72, 0.22); } break; }
    case 'winged': { shellH(MET, 0.18, 0.9); for (const sx of [-1, 1]){ const w = featherWing(1.0, pal.metal, pal.trim, {metal:true, rows:2}); w.scale.set(sx*0.7, 0.7, 0.7); w.position.set(sx*0.7, 0.45, -0.1); w.rotation.z = sx*0.9; H.add(w); } hairOk = false; break; }
    case 'crown': case 'circlet': case 'laurel': case 'band': case 'halo': { hairOk = true; if (h === 'crown'){ H.add(cyl(0.72, 0.72, 0.28, TRIM, 0, 0.72, 0, 20)); for (let i = 0; i < 8; i++){ const a = i*Math.PI/4; H.add(cone(0.1, 0.32, TRIM, Math.cos(a)*0.68, 1.0, Math.sin(a)*0.68, 4)); } H.add(sph(0.08, GL || mat(0xc01818, 'glow'), 0, 0.75, 0.73, 8)); }
      if (h === 'circlet' || h === 'band'){ H.add(tor(0.7, 0.05, h === 'band' ? mat(pal.accent, 'cloth') : TRIM, 0, 0.42, 0).rotateX(Math.PI/2 - 0.1)); if (h === 'circlet') H.add(sph(0.09, GL || ACC, 0, 0.5, 0.7, 8)); }
      if (h === 'laurel'){ for (let i = 0; i < 12; i++){ const a = Math.PI*0.15 + i*0.22; const lf = rbox(0.2, 0.08, 0.1, 0.04, mat(0xd8b048, 'gold'), Math.cos(a)*0.72, 0.5, -Math.sin(a)*0.72 + 0.05); lf.rotation.y = a; H.add(lf); } }
      if (h === 'halo'){ const hl = tor(0.6, 0.05, GL || TRIM, 0, 1.05, 0); hl.rotation.x = Math.PI/2; H.add(hl); U.halo = hl; } break; }
    case 'veil': H.add(blob(0.85, 1.0, 1.0, 1.05, CL, 0, 0.18, -0.12)); H.add(rbox(1.0, 0.5, 0.06, 0.06, mat(pal.cloth, 'glass'), 0, -0.25, 0.64)); break;
    case 'wrap': H.add(blob(0.75, 1.0, 0.7, 1.0, CL, 0, 0.42, 0)); for (let i = 0; i < 3; i++) H.add(tor(0.66, 0.08, CL, 0, 0.35 + i*0.13, 0).rotateX(Math.PI/2)); break;
    case 'wolfhood': case 'wolfhelm': case 'wolfmaw': case 'lionhead': case 'jackal': case 'foxmask': { const isL = h === 'lionhead'; const fur = h === 'wolfhelm' ? MET : mat(isL ? 0xc89040 : shade(pal.cloth, 1.5), 'fur'); H.add(blob(0.85, 1.0, 0.95, 1.05, fur, 0, 0.3, -0.1, h === 'wolfhelm' ? 0 : 0.08, 2));
      if (h === 'jackal'){ hideFace(); H.add(rot(blob(0.4, 0.8, 0.7, 1.6, mat(0x16141a, 'metal'), 0, 0, 0.75), 0.2, 0, 0)); for (const sx of [-1, 1]) H.add(rot(cone(0.18, 0.95, mat(0x16141a, 'metal'), sx*0.35, 1.05, -0.05, 4), 0, 0, -sx*0.12)); H.add(rbox(1.4, 0.12, 1.3, 0.04, TRIM, 0, -0.35, 0)); visorEyes(0.18, 0.88, 0.2); }
      else if (h === 'foxmask'){ hairOk = true; const mk = blob(0.5, 1.0, 0.9, 0.5, mat(0xf8f4ec, 'skin'), 0, 0, 0.62); H.add(mk); H.add(rot(cone(0.22, 0.55, mat(0xf8f4ec, 'skin'), 0, -0.1, 1.0, 8), Math.PI/2, 0, 0)); for (const sx of [-1, 1]){ H.add(rot(cone(0.22, 0.5, mat(0xf8f4ec, 'skin'), sx*0.42, 0.7, 0.2, 4), 0, 0, -sx*0.3)); H.add(rbox(0.25, 0.04, 0.04, 0.02, mat(0xc02020, 'cloth'), sx*0.2, 0.15, 0.85)); } hideFace(); }
      else { const snout = blob(0.38, 0.85, 0.65, 1.3, fur, 0, 0.55, 0.62); H.add(snout); for (const sx of [-1, 1]) H.add(rot(cone(0.2, 0.5, fur, sx*0.45, 1.05, 0.05, 4), 0, 0, -sx*0.2)); for (let i = 0; i < 5; i++) H.add(rot(cone(0.04, 0.16, mat(0xf4f0e0, 'bone'), -0.24 + i*0.12, 0.32, 1.02, 4), Math.PI, 0, 0)); visorEyes(0.7, 0.9, 0.22);
        if (h === 'wolfmaw' || h === 'wolfhelm'){ hideFace(); H.add(rbox(1.05, 0.8, 0.2, 0.2, mat(0x0a0a0e, 'dark'), 0, -0.05, 0.62)); visorEyes(0.05, 0.74, 0.2); } if (isL){ for (let i = 0; i < 14; i++){ const a = i/14*Math.PI*2; H.add(rot(cone(0.16, 0.6, mat(0xa86a20, 'fur'), Math.cos(a)*0.85, 0.3 + Math.sin(a)*0.75, -0.2, 5), 0, 0, a - Math.PI/2)); } } } break; }
    case 'tricorn': H.add(blob(0.7, 1.0, 0.55, 1.0, mat(0x1a1414, 'fur'), 0, 0.42, 0)); for (let i = 0; i < 3; i++){ const a = i*2.09; const b = rbox(1.1, 0.35, 0.12, 0.06, mat(0x2a1a14, 'leather'), Math.sin(a)*0.55, 0.85, Math.cos(a)*0.55); b.rotation.y = a; H.add(b); } if (lk.plume) H.add(rot(sweep([[0, 0, 0], [0.4, 0.4, -0.2], [0.8, 0.5, -0.6]], [0.12, 0.02], mat(lk.plume, 'fur'), {ex:0.4}), 0, 0, 0).translateX(0.3).translateY(1.0)); hairOk = false; break;
    case 'eboshi': hairOk = true; H.add(rot(cone(0.5, 1.2, mat(0x1a1a1a, 'cloth'), 0, 1.1, -0.2, 12), -0.35, 0, 0)); break;
    case 'holly': hairOk = true; for (let i = 0; i < 10; i++){ const a = i/10*Math.PI*2; H.add(rot(rbox(0.25, 0.1, 0.12, 0.05, mat(0x2a7a2a, 'cloth'), Math.cos(a)*0.7, 0.55, Math.sin(a)*0.7), 0, -a, 0.3)); if (i % 3 === 0) H.add(sph(0.06, mat(0xd02020, 'glow'), Math.cos(a)*0.72, 0.62, Math.sin(a)*0.72, 6)); } break;
    case 'ravenhelm': case 'falcon': case 'cobra': case 'nemes': { const c = h === 'falcon' ? mat(pal.metal, 'gold') : h === 'cobra' ? mat(pal.metal, 'scale') : h === 'nemes' ? mat(0xf0e8d0, 'cloth') : mat(0x16141c, 'fur'); H.add(blob(0.84, 1.0, 0.98, 1.05, c, 0, 0.22, -0.08));
      if (h === 'nemes'){ hairOk = false; for (let i = 0; i < 7; i++) H.add(rbox(1.5, 0.08, 1.3, 0.03, i % 2 ? mat(0x1a6aa0, 'cloth') : TRIM, 0, 0.6 - i*0.15, -0.05)); for (const sx of [-1, 1]) H.add(rbox(0.35, 1.2, 0.5, 0.1, mat(0xf0e8d0, 'cloth'), sx*0.6, -0.5, 0.15)); H.add(cone(0.08, 0.35, TRIM, 0, 0.85, 0.6, 6)); }
      else if (h === 'cobra'){ hideFace(); const hood = blob(1.0, 1.1, 1.2, 0.35, c, 0, 0.6, -0.4); H.add(hood); H.add(rbox(1.0, 0.7, 0.2, 0.2, mat(0x0a0812, 'dark'), 0, 0, 0.62)); visorEyes(0.1, 0.74, 0.2); }
      else { hideFace(); H.add(rot(cone(0.28, 0.8, h === 'falcon' ? TRIM : mat(0x2a2a30, 'bone'), 0, 0.05, 0.95, 8), Math.PI/2 + 0.4, 0, 0)); H.add(rbox(1.0, 0.6, 0.2, 0.2, mat(0x08080c, 'dark'), 0, 0.1, 0.6)); visorEyes(0.18, 0.72, 0.22); if (h === 'ravenhelm') for (let i = 0; i < 6; i++) H.add(rot(rbox(0.12, 0.7, 0.05, 0.05, mat(0x16141c, 'fur'), -0.3 + i*0.12, 0.9, -0.3), -0.6, 0, (i - 2.5)*0.12)); } break; }
    case 'widehat': hairOk = true; H.add(cyl(1.3, 1.3, 0.08, mat(0x2a2a3a, 'leather'), 0, 0.55, 0, 24)); H.add(cyl(0.55, 0.72, 0.65, mat(0x2a2a3a, 'leather'), 0, 0.88, 0, 18)); break;
    case 'crest': shellH(MET, 0.18, 0.95); if (lk.plume) for (let i = 0; i < 8; i++) H.add(rbox(0.12, 0.45 - Math.abs(i - 3.5)*0.04, 0.2, 0.05, mat(lk.plume, 'fur'), 0, 0.95, 0.55 - i*0.18)); visorEyes(0.15, 0.78, 0.22); hideFace(); H.add(rbox(1.0, 0.7, 0.2, 0.2, mat(0x08080c, 'dark'), 0, 0.0, 0.62)); break;
    case 'maw': case 'symbiote': case 'tentacleface': { hideFace(); const m = h === 'symbiote' ? mat(pal.metal, 'scale', {roughness:0.3}) : MET; H.add(blob(0.86, 1.0, 1.05, 1.05, m, 0, 0.15, -0.02, 0.05, 5));
      if (h === 'tentacleface'){ for (let i = 0; i < 8; i++){ const x = -0.35 + (i % 4)*0.24; const t = sweep([[x, -0.1, 0.7], [x*1.1, -0.6, 0.8], [x*0.9, -1.1, 0.65], [x*1.2, -1.5, 0.5]], [0.08, 0.02], mat(shade(pal.metal, 1.15), 'scale'), {radial:6}); H.add(t); (U.tendrils = U.tendrils || []).push(t); } visorEyes(0.25, 0.78, 0.25); }
      else { const mouth = blob(0.55, 1.0, 0.8, 0.5, mat(0x0a0005, 'dark'), 0, -0.05, 0.6); H.add(mouth); for (let i = 0; i < 10; i++){ const a = i/10*Math.PI*2; const tooth = rot(cone(0.05, 0.22, mat(0xf8f4f0, 'bone'), Math.cos(a)*0.45, -0.05 + Math.sin(a)*0.35, 0.85, 4), 0, 0, a + Math.PI/2); H.add(tooth); }
        if (h === 'symbiote'){ for (let i = 0; i < 9; i++) H.add(eyeGlow(0xffffff, 0.05 + (i%3)*0.015, -0.6 + (i*0.37)%1.2, 0.35 + ((i*0.23)%0.5), 0.45 + (i%2)*0.2)); for (const sx of [-1, 1]){ const hn = horn(1.6, 0.13, 0.9, mat(0x2a0a2a, 'scale')); hn.position.set(sx*0.45, 0.7, -0.1); hn.rotation.z = -sx*0.35; H.add(hn); } } else visorEyes(0.45, 0.75, 0.3); } break; }
    case 'hadeshelm': case 'flameskull': { hideFace(); const sk = blob(0.68, 1.0, 1.08, 1.0, mat(0xe8e0d0, 'bone'), 0, 0.12, 0); if (h === 'hadeshelm'){ H.add(rbox(1.45, 1.4, 1.4, 0.3, MET, 0, 0.15, -0.05)); H.add(rbox(1.0, 0.95, 0.2, 0.25, mat(0xd8d0c0, 'bone'), 0, -0.05, 0.65)); for (let i = 0; i < 5; i++) H.add(cone(0.08, 0.6 + (i === 2 ? 0.3 : 0), TRIM, -0.5 + i*0.25, 1.05, -0.05, 5)); }
      else { H.add(sk); for (let i = 0; i < 12; i++){ const f = sprite(i % 2 ? 0xff6020 : 0xffb030, 0.9); f.position.set(Math.sin(i)*0.4, 0.6 + (i % 4)*0.15, Math.cos(i*1.7)*0.4); f.userData.ph = i/12; f.userData.base = [f.position.x, f.position.y, f.position.z]; (U.fireGroups = U.fireGroups || []); (H.userData.fl = H.userData.fl || []).push(f); H.add(f); } U.fireGroups.push({userData:{flames:H.userData.fl}}); }
      for (const sx of [-1, 1]) H.add(eyeGlow(eyeC, 0.11, sx*0.24, 0.12, 0.66)); break; }
    case 'batcrown': { hideFace(); H.add(blob(0.84, 1.0, 1.0, 1.05, mat(0x0e0e12, 'dark'), 0, 0.15, -0.02)); for (const sx of [-1, 1]) H.add(rot(cone(0.16, 0.7, mat(0x0e0e12, 'dark'), sx*0.42, 0.95, 0, 4), 0, 0, -sx*0.15)); for (let i = 0; i < 7; i++) H.add(rot(cone(0.06, 0.45, mat(0x6a6a74, 'metal'), -0.6 + i*0.2, 0.9 - Math.abs(i - 3)*0.06, 0.25, 4), -0.2, 0, (i - 3)*0.15));
      const grin = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.4), new THREE.MeshBasicMaterial({map:grinTex(), transparent:true})); grin.position.set(0, -0.32, 0.67); H.add(grin); H.add(rbox(1.2, 0.5, 0.1, 0.1, mat(0xe8e0d8, 'skin'), 0, -0.32, 0.6)); visorEyes(0.15, 0.7, 0.22); break; }
    case 'titan': { hideFace(); H.add(rbox(1.5, 1.45, 1.4, 0.35, mat(0xd8a838, 'gold'), 0, 0.12, 0)); H.add(rbox(1.0, 0.8, 0.12, 0.2, mat(0x8a6aa8, 'skin'), 0, -0.08, 0.66)); for (let i = 0; i < 3; i++) H.add(rbox(0.6, 0.06, 0.05, 0.02, mat(0x5a3a7a, 'skin'), 0, -0.35 + i*0.08, 0.73)); visorEyes(0.1, 0.74, 0.22); H.add(rot(rbox(0.25, 0.9, 0.2, 0.08, mat(0xd8a838, 'gold'), 0, 0.85, -0.2), -0.3, 0, 0)); break; }
    case 'devourer': { hideFace(); H.add(rbox(1.5, 1.5, 1.45, 0.35, mat(pal.metal, 'metal'), 0, 0.15, 0)); for (const sx of [-1, 1]){ const pr = rbox(0.25, 1.6, 0.4, 0.1, mat(pal.metal, 'metal'), sx*0.85, 1.0, -0.1); pr.rotation.z = -sx*0.25; H.add(pr); } H.add(rbox(1.0, 0.7, 0.12, 0.2, mat(0x6a4a9a, 'skin'), 0, -0.1, 0.7)); visorEyes(0.05, 0.78, 0.24); H.add(rbox(1.2, 0.2, 0.15, 0.06, TRIM, 0, 0.55, 0.68)); break; }
    case 'spikecrown': { hideFace(); H.add(rbox(1.45, 1.45, 1.4, 0.3, MET, 0, 0.12, 0)); for (let i = 0; i < 9; i++){ const a = -1.1 + i*0.275; H.add(rot(cone(0.09, 0.9 + (i === 4 ? 0.5 : 0), MET, Math.sin(a)*0.65, 1.0, Math.cos(a)*0.3 - 0.1, 5), 0, 0, -a*0.5)); } H.add(rbox(1.1, 0.12, 0.08, 0.04, mat(0xff8020, 'glow'), 0, 0.15, 0.72)); break; }
    case 'mask': { hairOk = true; H.add(rbox(1.15, 0.55, 0.14, 0.14, mat(0x0a0a10, 'dark'), 0, -0.25, 0.6)); H.add(blob(0.82, 1.0, 0.95, 1.05, CL, 0, 0.22, -0.12)); visorEyes(0.15, 0.68, 0.2); break; }
    default: hairOk = true; }
  if (lk.horn){ const [type, c] = lk.horn; const m = mat(c, type === 'crescent' ? 'gold' : 'bone');
    for (const sx of [-1, 1]){ let hn; if (type === 'bull' || type === 'long'){ hn = horn(type === 'long' ? 1.6 : 1.1, 0.16, 1.4, m); hn.position.set(sx*0.62, 0.45, 0); hn.rotation.z = -sx*1.2; hn.scale.x = sx; }
      else if (type === 'ram'){ hn = sweep([[0, 0, 0], [sx*0.35, 0.25, -0.25], [sx*0.55, -0.1, -0.35], [sx*0.45, -0.35, 0.05]], [0.16, 0.06], m, {radial:8}); hn.position.set(sx*0.5, 0.5, 0); }
      else if (type === 'oni' || type === 'spire'){ hn = horn(type === 'spire' ? 1.2 : 0.75, 0.12, type === 'spire' ? 0.3 : 0.6, m); hn.position.set(sx*0.36, 0.75, 0.15); hn.rotation.z = -sx*(type === 'spire' ? 0.25 : 0.35); }
      else if (type === 'crescent'){ hn = sweep([[0, 0, 0], [sx*0.35, 0.35, 0], [sx*0.3, 0.85, 0], [sx*0.05, 1.1, 0]], [0.12, 0.03], m, {radial:6}); hn.position.set(sx*0.3, 0.75, 0.2); }
      else { hn = horn(1.0, 0.13, 1.0, m); hn.position.set(sx*0.55, 0.6, 0); hn.rotation.z = -sx*0.7; } H.add(hn); } }
  if (lk.plume && ['barbute', 'corinthian', 'greathelm', 'visor'].includes(h)){ const pl = grp(0, 0.85, -0.1); H.add(pl); for (let i = 0; i < 9; i++) pl.add(rbox(0.14, 0.5 - Math.abs(i - 4)*0.04, 0.2, 0.06, mat(lk.plume, 'fur'), 0, 0.15, 0.7 - i*0.18)); }
  finishHair(H, lk, L, hairOk); }
function finishHair(H, lk, L, ok){ if (lk.hair != null){ hair(H, 'swept', lk.hair); return; } if (ok) hair(H, L.hairStyle, colOf(LOOK.hair, L.hair)); }
let GRIN = null; function grinTex(){ if (GRIN) return GRIN; const c = document.createElement('canvas'); c.width = 128; c.height = 64; const g = c.getContext('2d'); g.fillStyle = '#7a0a0a'; g.beginPath(); g.moveTo(4, 20); g.quadraticCurveTo(64, 70, 124, 20); g.quadraticCurveTo(64, 50, 4, 20); g.fill(); g.fillStyle = '#fff'; for (let i = 0; i < 12; i++){ g.fillRect(12 + i*9, 24 + Math.sin(i/11*Math.PI)*10, 6, 8); } return (GRIN = new THREE.CanvasTexture(c)); }
/* ---------- extras (fx) ---------- */
function extras(g, fx, lk, K){ const {MET, TRIM, CL, GL, ACC, pal, big} = K; const U = g.userData, B = U.parts.body, H = U.parts.head; const col = pal.glow || pal.accent;
  const floaters = (name, n, mk) => { const list = []; for (let i = 0; i < n; i++){ const o = mk(i); o.userData.ph = i/n; g.add(o); list.push(o); } U[name] = list; };
  if (fx.has('spikes')) for (let i = 0; i < 5; i++){ const s = horn(0.5, 0.08, 0.4, MET); s.position.set(-0.6 + i*0.3, 3.9, -0.5); s.rotation.x = -0.6; B.add(s); }
  if (fx.has('runes') || fx.has('mandala')){ const r = tor(fx.has('mandala') ? 2.2 : 1.9, 0.03, mat(col, 'glow'), 0, 3.2, -1.2); if (fx.has('mandala')){ r.position.set(0, 3.2, 1.6); } U.sunRing = r; g.add(r); if (fx.has('mandala')){ const r2 = tor(1.7, 0.02, mat(col, 'glow'), 0, 3.2, 1.6); g.add(r2); U.swordHalo = r2; } }
  if (fx.has('sparks') || fx.has('stars') || fx.has('foxfire') || fx.has('pearls') || fx.has('soulfire') || fx.has('embers')) floaters('starSp', 10, i => { const s = sprite(fx.has('embers') ? 0xff8030 : fx.has('soulfire') ? 0x40ffb0 : fx.has('foxfire') ? 0x60c0ff : fx.has('pearls') ? 0xfff0ff : col, 0.45); return s; });
  if (fx.has('smoke')) floaters('smoke', 8, () => { const s = sprite('rgba(40,30,60,0.8)', 1.6); s.material.blending = THREE.NormalBlending; return s; });
  if (fx.has('bubbles')) floaters('starSp', 8, () => sprite(0x9fe8ff, 0.35));
  if (fx.has('ravens')) U.ravens = [0, 1].map(i => { const r = grp(); r.add(KIT.blob(0.25, 1.4, 0.8, 0.8, mat(0x101014, 'fur'))); const w = grp(); w.add(KIT.rbox(1.0, 0.06, 0.35, 0.03, mat(0x101014, 'fur'))); r.add(w); g.add(r); return r; });
  if (fx.has('tails9')){ U.tails9 = []; for (let i = 0; i < 9; i++){ const t = grp(0, 2.2, -0.5); const s = KIT.sweep([[0, 0, 0], [0, 0.5, -0.8], [0, 1.4, -1.4], [0, 2.1, -1.5]], [0.22, 0.06], mat(i % 2 ? 0xfff4e0 : 0xffd8a0, 'fur'), {radial:8}); t.add(s); t.add(sph(0.12, mat(0xffffff, 'fur'), 0, 2.1, -1.5, 8)); B.add(t); U.tails9.push(t); } }
  if (fx.has('drums')){ const r = grp(0, 4.2, -1.0); for (let i = 0; i < 8; i++){ const a = i*Math.PI/4; const d = KIT.cyl(0.32, 0.32, 0.3, mat(0xc02020, 'leather'), Math.cos(a)*2.0, Math.sin(a)*2.0, 0, 14); d.rotation.x = Math.PI/2; r.add(d); r.add(KIT.cyl(0.3, 0.3, 0.32, mat(0xf4e8c8, 'skin'), Math.cos(a)*2.0, Math.sin(a)*2.0, 0, 14).rotateX(Math.PI/2)); } r.add(tor(2.0, 0.06, TRIM, 0, 0, 0)); g.add(r); U.drums = r; }
  if (fx.has('sundisc')){ const d = tor(0.9, 0.12, mat(0xffa020, 'glow'), 0, 1.4, -0.3); H.add(d); H.add(sprite(0xffa020, 3.5).translateY(1.4)); }
  if (fx.has('spirit')){ const sp = grp(0, 0, -1.6); const m = mat(0x6a8aff, 'glass'); sp.add(KIT.blob(1.6, 1.2, 1.5, 0.8, m, 0, 5.5, 0)); for (let i = 0; i < 5; i++) sp.add(KIT.sweep([[-1.4, 6.5 - i*0.7, 0.3], [0, 6.2 - i*0.7, 0.9], [1.4, 6.5 - i*0.7, 0.3]], 0.12, m, {radial:6})); for (const sx of [-1, 1]) sp.add(KIT.eyeGlow(0x9fe8ff, 0.18, sx*0.5, 6.4, 1.0)); g.add(sp); }
  if (fx.has('aura') || big){ const au = sprite(col, 9); au.material.opacity = 0.45; au.position.y = 2.6; g.add(au); U.aura2 = au; }
  if (fx.has('chains')) for (let i = 0; i < 2; i++){ const c = KIT.sweep([[-1.0, 3.9 - i*1.2, 0.5], [0, 3.3 - i*1.2, 0.65], [1.0, 2.6 - i*1.2, 0.5]], 0.07, mat(0x8a8a90, 'metal'), {radial:6}); B.add(c); }
  if (fx.has('gems6')) {}
  if (fx.has('tentacles')){ U.tendrils = U.tendrils || []; for (let i = 0; i < 4; i++){ const c = KIT.chain(5, 2.2, t => 0.14*(1 - t*0.8), mat(pal.metal, 'scale')); c.root.position.set(-0.6 + i*0.4, 2.6, -0.5); c.root.rotation.x = 2.4; c.root.rotation.z = -0.6 + i*0.4; B.add(c.root); c.joints.forEach((j, k) => U.tendrils.push(j)); } }
  if (fx.has('eyes')) for (let i = 0; i < 10; i++) B.add(KIT.eyeGlow(0xffffff, 0.06, -0.9 + (i*0.41)%1.8, 2.5 + ((i*0.37)%1.4), 0.6));
  if (fx.has('teeth')) for (let i = 0; i < 8; i++) B.add(rot(cone(0.06, 0.3, mat(0xf4f0e8, 'bone'), -0.7 + i*0.2, 2.0, 0.55, 4), Math.PI, 0, 0));
  if (fx.has('hair')){ const m = mat(0x101012, 'fur'); for (let i = 0; i < 9; i++){ const s = KIT.sweep([[(i - 4)*0.12, 5.2, -0.4], [(i - 4)*0.22, 5.4, -1.4], [(i - 4)*0.3 + 0.4, 5.0, -2.6 - (i%3)*0.3]], [0.12, 0.02], m, {radial:5}); B.add(s); } }
  if (fx.has('flames') || fx.has('blood')){ U.fireGroups = U.fireGroups || []; const fl = []; for (let i = 0; i < 12; i++){ const s = sprite(fx.has('blood') ? 0xff2020 : i % 2 ? 0xff6020 : 0xffb030, 0.8); s.userData.ph = i/12; s.userData.base = [Math.sin(i*1.3)*0.9, 1.2 + (i%4)*0.6, Math.cos(i*1.7)*0.5]; g.add(s); fl.push(s); } U.fireGroups.push({userData:{flames:fl}}); }
  if (fx.has('moon')){ const m = tor(0.8, 0.12, mat(0xe8f0ff, 'glow'), 0, 6.3, -0.4, Math.PI*1.3); m.rotation.z = 0.9; g.add(m); }
  if (fx.has('board')){ const b = KIT.blob(1.2, 1.6, 0.08, 0.6, mat(0xe8eef6, 'metal', {roughness:0.05}), 0, 0.15, 0); g.add(b); }
  if (fx.has('omega')) for (let i = 0; i < 3; i++) B.add(KIT.rbox(1.8, 0.08, 0.05, 0.02, mat(0xff3010, 'glow'), 0, 3.0 - i*0.25, 0.6));
  if (fx.has('eye')){ const e = KIT.eyeGlow(0xff8020, 0.35, 0, 7.2, -0.6); g.add(e); }
  if (fx.has('icicles')) for (let i = 0; i < 6; i++) B.add(rot(cone(0.06, 0.35, mat(0xbfefff, 'glass'), -0.8 + i*0.32, 3.95, 0.5, 5), Math.PI, 0, 0));
  if (fx.has('vines') || fx.has('leaves')) for (let i = 0; i < 3; i++) B.add(KIT.sweep([[-1, 2 + i*0.7, 0.55], [0, 2.4 + i*0.7, 0.62], [1, 2.1 + i*0.7, 0.55]], 0.05, mat(0x3a8a2a, 'cloth'), {radial:5}));
  if (fx.has('coils')) B.add(KIT.sweep(Array.from({length:12}, (_, i) => [Math.cos(i*0.9)*1.1, 1.0 + i*0.28, Math.sin(i*0.9)*0.7]), 0.12, mat(pal.metal, 'scale'), {radial:8, segs:60}));
  if (fx.has('cracks') || fx.has('scratches')) for (let i = 0; i < 4; i++) B.add(rot(KIT.rbox(0.04, 0.5, 0.03, 0.01, fx.has('cracks') ? mat(0xff6020, 'glow') : mat(0x9a9aa0, 'metal'), -0.6 + i*0.4, 3.3 + (i%2)*0.3, 0.62), 0, 0, 0.5 - i*0.3));
  if (fx.has('grin')) {}
  if (fx.has('clouds')) floaters('smoke', 6, () => { const s = sprite('rgba(240,244,255,0.9)', 1.8); s.material.blending = THREE.NormalBlending; return s; });
  if (fx.has('wind')) floaters('starSp', 8, () => sprite(0xcffff0, 0.4));
  if (fx.has('orbs')) floaters('starSp', 6, () => sprite(col, 0.6));
  if (fx.has('books')) {}
  if (fx.has('shimenawa')) B.add(tor(1.0, 0.07, mat(0xd8c890, 'cloth'), 0, 2.3, 0).rotateX(Math.PI/2));
  if (fx.has('drip')) floaters('starSp', 6, () => sprite(0x7fff60, 0.35));
  if (fx.has('feathers')) floaters('starSp', 6, () => sprite(0xfff4c0, 0.4)); }
/* ---------- the whole hero ---------- */
function build(P, opts){ opts = opts || {}; const L = lookOf(opts.look || opts); const w = (P.eq && P.eq.weapon) || {arch:'blade', rar:0}, a = (P.eq && P.eq.armour) || null;
  const g = rig(L); const parts = g.userData.parts;
  try { armour(g, a, L); } catch (e){ console.warn('armour build failed', a && a.design, e); }
  if (!a || !a.design) hair(parts.head, L.hairStyle, colOf(LOOK.hair, L.hair));
  // the weapon in hand (the weapon models were drawn for the old five tiers)
  const wv = Object.assign({}, w, {rar: (DATA.OLDR || [])[w.rar || 0] != null ? DATA.OLDR[w.rar || 0] : (w.rar || 0)});
  const H = GEAR3D.holdOf(wv); let wpn = GEAR3D.weapon(wv), wpnL = null; const armL = parts.armL, armR = parts.armR;
  if (H.hand === 'both'){ wpn.position.set(0, 0, 0); armR.userData.hand.add(wpn); wpnL = GEAR3D.weapon(wv); armL.userData.hand.add(wpnL); armR.userData.hand.children[0].visible = false; armL.userData.hand.children[0].visible = false; }
  else { const hd = (H.hand === 'L' ? armL : armR).userData.hand; wpn.rotation.set(...H.wr); wpn.scale.setScalar(H.style === 'bow' ? 1.25 : H.style === 'gun' ? 1.5 : 1.3); hd.add(wpn); }
  armR.rotation.x = H.R[0]; armR.rotation.z = H.R[1]; armL.rotation.x = H.L[0]; armL.rotation.z = H.L[1];
  armR.userData.elbow.rotation.x = -0.25; armL.userData.elbow.rotation.x = -0.25;
  Object.assign(parts, {wpn, wpnL, hold:H}); g.userData.weaponItem = w; g.userData.v8 = true;
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.scale.setScalar(0.52); return g; }
/* idle: a gentle breath and arm swing on top of GEAR3D.animate */
function animate(g, t, dt){ const u = g.userData; if (!u.v8) return; const p = u.parts; if (u.aura2) u.aura2.material.opacity = 0.35 + Math.sin(t*2)*0.15;
  if (p.chest && !u.busy) p.chest.scale.y = 1 + Math.sin(t*2.2)*0.012; if (u.tendrils) u.tendrils.forEach((j, i) => { j.rotation.z = Math.sin(t*2 + i*0.6)*0.25; }); if (p.head && p.head.userData.ponytail) p.head.userData.ponytail.rotation.x = Math.sin(t*2.5)*0.08; }
return {build, animate, LOOK, DEFAULT_LOOK, lookOf, colOf, faceTex};
})();
// the v8 hero replaces the v5 one everywhere it is built (battles, camp, previews, gallery)
(() => { const old = GEAR3D.buildHero, oldAnim = GEAR3D.animate; GEAR3D.buildHero0 = old;
  GEAR3D.buildHero = (P, opts) => { try { return HERO8.build(P, opts); } catch (e){ console.warn('v8 hero failed, using v5', e); return old(P, opts); } };
  GEAR3D.animate = (g, t, dt) => { oldAnim(g, t, dt); HERO8.animate(g, t, dt); }; })();
