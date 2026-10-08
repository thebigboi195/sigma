
/* ===== Essay Quest v5 — gear + hero models (three.js r128) =====
   Every weapon is built with its grip at the origin and its business end along +Y.
   Rarity layers: Common plain → Rare trim → Epic gems + runes → Legendary gold filigree, glow, sparkles → Mythical obsidian + crimson veins, orbiting shards, embers. */
const GEAR3D = (() => {
const M = (c, o={}) => new THREE.MeshStandardMaterial(Object.assign({color:c, roughness:0.55, metalness:0.05}, o));
const box = (w,h,d,m) => { const g = new THREE.Mesh((typeof KIT !== 'undefined' ? KIT.rboxGeo(w, h, d, Math.min(0.22, Math.min(w, h, d)*0.2), 2) : new THREE.BoxGeometry(w, h, d)), m); g.castShadow = true; return g; };
const cyl = (rt,rb,h,m,s=14) => { const g = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,s), m); g.castShadow = true; return g; };
const sph = (r,m,ws=14,hs=10) => { const g = new THREE.Mesh(new THREE.SphereGeometry(r,ws,hs), m); g.castShadow = true; return g; };
const cone = (r,h,m,s=10) => { const g = new THREE.Mesh(new THREE.ConeGeometry(r,h,s), m); g.castShadow = true; return g; };
const tor = (r,t,m,rs=6,ts=20,arc=Math.PI*2) => { const g = new THREE.Mesh(new THREE.TorusGeometry(r,t,rs,ts,arc), m); g.castShadow = true; return g; };
const oct = (r,m) => { const g = new THREE.Mesh(new THREE.OctahedronGeometry(r), m); g.castShadow = true; return g; };
const at = (o,x,y,z) => { o.position.set(x,y,z); return o; };
const rot = (o,x,y,z) => { o.rotation.set(x,y,z); return o; };
const SPR = {};
function glow(color, size){ const key = color; if (!SPR[key]){ const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const r = g.createRadialGradient(32,32,2,32,32,32); r.addColorStop(0,'rgba(255,255,255,1)'); r.addColorStop(0.3, color); r.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0,0,64,64); SPR[key] = new THREE.CanvasTexture(c); }
  const s = new THREE.Sprite(new THREE.SpriteMaterial({map:SPR[key], blending:THREE.AdditiveBlending, transparent:true, depthWrite:false})); s.scale.set(size,size,size); return s; }
const hex = n => '#' + n.toString(16).padStart(6,'0');
const rgba = (n, a) => `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`;

/* ---------- palettes ---------- */
const RC = [0xc9ced6, 0x4aa3ff, 0xb06cff, 0xffb52e, 0xff4d6d];
const RUNE = [[0,0,0,0xffe27a,0xff2a4a],[0,0,0,0x7af0ff,0xff3a8a],[0,0,0,0xffa040,0xff5a1a],[0,0,0,0xbff4ff,0xc070ff]];
function mats(rar, w, special){
  rar = Math.min(4, rar|0); const W = w||0;
  if (special==='atomic') return {metal:M(0x15101f,{metalness:0.7,roughness:0.25}), edge:M(0xb070ff,{emissive:0x9a40ff,emissiveIntensity:1.4}), accent:M(0x2a1a40,{metalness:0.6}), grip:M(0x120d1a), gem:M(0xd0a0ff,{emissive:0xb060ff,emissiveIntensity:1.6}), rune:0xb060ff};
  const iron = [0xaab2bb, 0xd6dee8, 0x9f86e0, 0xffd76a, 0x2a0d18][rar];
  const edgeC = [0xdfe5ea, 0xf2f7ff, 0xe3d6ff, 0xfff6d8, 0xff3a52][rar];
  const accC = [[0x6b4426,0x2f6fd8,0x6a2fd0,0xfff2c0,0xff2a4a],[0x6b4426,0x1f8ab0,0x2f50c0,0xe8fbff,0xff2a7a],[0x7a4b2a,0xc07a2a,0x8a2fa0,0xfff0c0,0xff5a1a],[0x5a6a7a,0x6fc0e8,0x6a6ae8,0xe8fbff,0xa050ff]][W][rar];
  const rn = RUNE[W][rar];
  return {metal: M(iron, {metalness: rar===4 ? 0.8 : 0.65, roughness: rar>=3 ? 0.22 : 0.35, emissive: rar===4 ? 0x3a0010 : 0, emissiveIntensity: rar===4 ? 0.6 : 0}),
    edge: M(edgeC, {metalness:0.8, roughness:0.15, emissive: rar===4 ? 0xff1030 : rar===3 ? 0x6a5010 : 0, emissiveIntensity: rar>=3 ? 0.7 : 0}),
    accent: M(accC, {metalness: rar>=1 ? 0.5 : 0.1, roughness:0.35, emissive: rar>=3 ? accC : 0, emissiveIntensity: rar===4 ? 0.5 : rar===3 ? 0.15 : 0}),
    grip: M(rar===4 ? 0x1a0a10 : rar===3 ? 0x5a2a10 : 0x4a2c18, {roughness:0.8}), wood: M(0x7a4b2a, {roughness:0.8}),
    gem: M(rar===4 ? 0xff2040 : RC[rar], {emissive: rar===4 ? 0xff1030 : RC[rar], emissiveIntensity: 1.3, metalness:0.2, roughness:0.1}), rune: rn};
}
function runeStrip(g, len, y0, x=0, z=0.07, col, w=0.05){ const m = new THREE.MeshBasicMaterial({color:col}); for (let i=0;i<5;i++){ const r = new THREE.Mesh(new THREE.PlaneGeometry(w, len/7), m); r.position.set(x, y0 + i*len/5.2, z); g.add(r); const r2 = r.clone(); r2.position.z = -z; r2.rotation.y = Math.PI; g.add(r2); } }
/* the rarity layer: sparkles, orbiting shards, embers, light */
function aura(g, rar, k, tipY, special){
  if (rar < 3 && !special) return;
  const col = special==='atomic' ? 0xb060ff : k.rune;
  const gl = glow(rgba(col, rar>=4||special ? 0.7 : 0.55), rar>=5 ? 2.2 : rar===4 ? 1.6 : 1.1); gl.position.y = tipY*0.6; g.add(gl); g.userData.glow = gl;
  const pl = new THREE.PointLight(col, rar>=4 ? 1.6 : 1.0, 4.5); pl.position.y = tipY*0.6; g.add(pl); g.userData.light = pl;
  g.userData.sparkles = []; for (let i=0;i<(rar>=5?10:rar===4?7:5);i++){ const s = glow(rgba(col, 0.95), 0.32); s.userData.ph = Math.random()*6; s.userData.y = Math.random()*tipY; g.add(s); g.userData.sparkles.push(s); }
  if (rar >= 4 || special){ g.userData.shards = []; for (let i=0;i<(rar>=5?5:3);i++){ const sh = oct(0.12, M(col, {emissive:col, emissiveIntensity:1.5})); g.add(sh); g.userData.shards.push(sh); } g.userData.tipY = tipY; }
}
function tipMark(g, y){ const t = new THREE.Object3D(); t.position.y = y; g.add(t); g.userData.tip = t; return t; }

/* ---------- weapons ---------- */
function W_sword(k, rar, o={}){ // o.curve (cutlass), o.great, o.ice, o.slime
  const g = new THREE.Group(); const L = o.great ? 3.3 : 2.4, wd = o.great ? 0.36 : 0.24;
  g.add(at(cyl(0.07, 0.08, 0.6, k.grip), 0, 0, 0)); g.add(at(sph(0.11, k.accent), 0, -0.35, 0));
  // guard: grows more ornate with rarity
  const gw = 0.75 + rar*0.12; g.add(at(box(gw, 0.12, 0.22, k.accent), 0, 0.32, 0));
  if (rar >= 3){ for (const sx of [-1,1]){ const wing = box(0.45, 0.08, 0.16, k.edge); wing.position.set(sx*(gw/2+0.12), 0.42, 0); wing.rotation.z = sx*0.55; g.add(wing); } }
  if (rar >= 2) g.add(at(oct(0.1, k.gem), 0, 0.32, 0.14));
  if (o.curve){ // cutlass: curved sabre from stacked segments
    for (let i=0;i<7;i++){ const seg = box(wd*(1-i*0.06), L/7+0.02, 0.06, k.metal); seg.position.set(Math.sin(i*0.16)*0.35*i/6, 0.4 + (i+0.5)*L/7, 0); seg.rotation.z = -i*0.06; g.add(seg); }
    const hb = tor(0.28, 0.035, k.accent, 6, 14, Math.PI); hb.position.set(0, 0.05, 0); hb.rotation.y = Math.PI/2; g.add(hb);
  } else if (o.ice){ const bl = box(wd, L, 0.07, M(0xbfefff, {transparent:true, opacity:0.85, roughness:0.05, metalness:0.1, emissive:0x60c8ff, emissiveIntensity: rar>=3 ? 0.6 : 0.2})); bl.position.y = 0.4 + L/2; g.add(bl);
    for (let i=0;i<4;i++){ const sp = cone(0.07, 0.35, M(0xe8fbff, {emissive:0x80d8ff, emissiveIntensity:0.5}), 5); sp.position.set((i%2?1:-1)*wd*0.55, 0.9 + i*0.5, 0); sp.rotation.z = (i%2?-1:1)*1.0; g.add(sp); }
  } else {
    const bl = box(wd, L, 0.06, o.slime ? k.metal : k.metal); bl.position.y = 0.4 + L/2; g.add(bl);
    const ed = box(wd+0.06, L*0.98, 0.03, k.edge); ed.position.y = 0.4 + L/2; g.add(ed);
    const tip = cone(wd*0.72, 0.38, k.edge, 4); tip.position.y = 0.4 + L + 0.18; tip.rotation.y = Math.PI/4; tip.scale.z = 0.25; g.add(tip);
    if (rar >= 1) g.add(at(box(0.05, L*0.7, 0.07, k.accent), 0, 0.4 + L*0.42, 0)); // fuller
    if (o.slime){ for (let i=0;i<5;i++){ const d = sph(0.06 + (i%2)*0.03, k.edge); d.position.set(wd*0.5, 0.7 + i*0.45, 0.04); g.add(d); } }
  }
  if (rar >= 3 || o.slime) runeStrip(g, L*0.8, 0.6, 0, 0.045, k.rune || 0xb060ff);
  if (rar === 4 && !o.ice){ for (let i=0;i<3;i++){ const sp = cone(0.08, 0.4, k.edge, 4); sp.position.set(-wd*0.6, 1.0 + i*0.7, 0); sp.rotation.z = 1.2; g.add(sp); } }
  tipMark(g, 0.4 + L); aura(g, rar, k, 0.4 + L, o.slime ? 'atomic' : null); return g;
}
function W_pole(k, rar, o={}){ // spear / harpoon / trident / halberd / lance
  const g = new THREE.Group(); const L = o.lance ? 4.6 : 4.2; const sh = cyl(0.075, 0.085, L, o.lance ? M(0xcfefff,{metalness:0.4}) : k.wood); sh.position.y = L/2 - 1.3; g.add(sh);
  for (const y of [-0.1, 0.4]) g.add(at(cyl(0.1, 0.1, 0.18, k.grip), 0, y, 0));
  const top = L - 1.3;
  if (o.kind==='trident'){ g.add(at(box(0.9, 0.12, 0.12, k.metal), 0, top, 0)); for (const sx of [-1,0,1]){ const p = at(cyl(0.05, 0.05, 0.6, k.metal), sx*0.42, top+0.32, 0); g.add(p); const t = at(cone(0.1, 0.32, k.edge, 4), sx*0.42, top+0.75, 0); g.add(t); } }
  else if (o.kind==='halberd'){ const ax = box(0.9, 0.7, 0.07, k.metal); ax.position.set(0.45, top-0.15, 0); g.add(ax); const ed = box(0.06, 0.78, 0.09, k.edge); ed.position.set(0.92, top-0.15, 0); g.add(ed); g.add(at(cone(0.13, 0.7, k.edge, 4), 0, top+0.45, 0)); const hk = cone(0.08, 0.4, k.metal, 4); hk.position.set(-0.28, top-0.1, 0); hk.rotation.z = 1.4; g.add(hk); }
  else if (o.kind==='harpoon'){ g.add(at(cone(0.16, 0.7, k.edge, 4), 0, top+0.3, 0)); for (const sx of [-1,1]){ const b = cone(0.06, 0.4, k.metal, 4); b.position.set(sx*0.15, top-0.05, 0); b.rotation.z = sx*2.6; g.add(b); } const rope = tor(0.18, 0.03, M(0xcdb58a), 5, 12); rope.position.y = top-0.6; rope.rotation.x = Math.PI/2; g.add(rope); }
  else { const tp = cone(0.2, o.lance ? 1.2 : 0.85, k.edge, o.lance ? 6 : 4); tp.position.y = top + (o.lance ? 0.55 : 0.4); g.add(tp); g.add(at(cyl(0.12, 0.12, 0.16, k.accent), 0, top-0.05, 0));
    if (o.lance){ const vg = cone(0.42, 0.7, M(0xbfefff, {transparent:true, opacity:0.8, emissive:0x60c8ff, emissiveIntensity:0.4}), 10); vg.rotation.x = Math.PI; vg.position.y = top - 0.4; g.add(vg); } }
  if (rar >= 2) g.add(at(oct(0.11, k.gem), 0, top-0.2, 0.1));
  if (rar >= 3){ const rib = box(0.03, 1.0, 0.18, new THREE.MeshBasicMaterial({color:k.rune})); rib.position.set(0, top-0.9, 0.09); g.add(rib); for (const sx of [-1,1]){ const w = box(0.5, 0.06, 0.14, k.edge); w.position.set(sx*0.28, top-0.12, 0); w.rotation.z = sx*0.6; g.add(w); } }
  tipMark(g, top + 0.9); aura(g, rar, k, top + 0.6); return g;
}
function W_bow(k, rar, o={}){ // limbs along ±Y, belly towards +Z, string at -Z
  const g = new THREE.Group(); const H = 1.35, ice = !!o.ice; const limbM = ice ? M(0xcff2ff, {transparent:true, opacity:0.9, emissive:0x60c8ff, emissiveIntensity:0.35, roughness:0.1}) : rar ? k.metal : k.wood;
  const A = Math.PI*0.86, R = H; const arc = tor(R, 0.07 + rar*0.008, limbM, 6, 28, A); arc.rotation.set(0, -Math.PI/2, -A/2); arc.position.z = -R; g.add(arc);
  g.add(at(box(0.2, 0.5, 0.22, k.grip), 0, 0, 0)); // grip in the hand
  const tipT = new THREE.Vector3(0, R*Math.sin(A/2), -R + R*Math.cos(A/2)), tipB = new THREE.Vector3(0, -R*Math.sin(A/2), -R + R*Math.cos(A/2));
  for (const t of [tipT, tipB]){ const c = at(rar>=3 ? oct(0.11, k.gem) : sph(0.06, k.accent), t.x, t.y, t.z); g.add(c); }
  if (rar >= 2){ for (const sy of [-1,1]){ const fl = cone(0.07, 0.45, k.edge, 4); fl.position.set(0, sy*0.75, -0.2); fl.rotation.x = sy*-0.5; g.add(fl); } }
  if (rar >= 3){ for (const sy of [-1,1]){ const wg = box(0.04, 0.6, 0.35, k.accent); wg.position.set(0, sy*1.05, -0.45); wg.rotation.x = sy*0.6; g.add(wg); } }
  // live bowstring (two segments) + nocked arrow
  const sm = new THREE.LineBasicMaterial({color: rar>=3 ? k.rune : 0xf2f2f2}); const geo = new THREE.BufferGeometry().setFromPoints([tipT, new THREE.Vector3(0,0,tipT.z), tipB]); const str = new THREE.Line(geo, sm); g.add(str);
  const arrow = new THREE.Group(); arrow.add(at(rot(cyl(0.025, 0.025, 1.7, k.wood, 5), Math.PI/2, 0, 0), 0, 0, 0.5)); arrow.add(at(rot(cone(0.06, 0.18, k.edge, 4), Math.PI/2, 0, 0), 0, 0, 1.42)); arrow.add(at(box(0.02, 0.12, 0.25, M(rar>=3?k.rune:0xd04040)), 0, 0, -0.25)); arrow.position.z = tipT.z; g.add(arrow);
  g.userData.bow = {str, tipT, tipB, arrow, z0: tipT.z}; tipMark(g, 0); g.userData.tip.position.set(0, 0, 0.5); aura(g, rar, k, 1.2); return g;
}
function W_gun(k, rar){ // flintlock pistol: barrel along +Y from the grip
  const g = new THREE.Group(); g.add(rot(at(box(0.18, 0.55, 0.22, k.wood), 0, -0.12, -0.18), 0.5, 0, 0));
  const br = cyl(0.07, 0.08, 1.15, k.metal); br.position.set(0, 0.55, 0.05); g.add(br); g.add(at(cyl(0.1, 0.1, 0.1, k.accent), 0, 1.1, 0.05));
  g.add(at(box(0.12, 0.25, 0.1, k.accent), 0, 0.05, 0.16)); const ham = box(0.05, 0.18, 0.06, k.edge); ham.position.set(0, 0.0, -0.05); ham.rotation.x = -0.6; g.add(ham);
  if (rar >= 2) g.add(at(oct(0.08, k.gem), 0, 0.3, 0.15)); if (rar >= 3){ g.add(at(tor(0.1, 0.025, k.edge, 5, 12), 0, 0.85, 0.05)); runeStrip(g, 0.9, 0.2, 0, 0.09, k.rune, 0.03); }
  tipMark(g, 1.2); g.userData.tip.position.z = 0.05; aura(g, rar, k, 1.1); g.userData.gun = true; return g;
}
function W_xbow(k, rar){ // crossbow: stock along +Y, limbs across X
  const g = new THREE.Group(); g.add(at(box(0.2, 1.5, 0.22, k.wood), 0, 0.35, 0)); const lim = tor(0.75, 0.05, rar ? k.metal : k.wood, 5, 18, Math.PI*0.8); lim.rotation.z = Math.PI*0.1; lim.position.set(0, 0.85, 0); g.add(lim);
  const sg = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.72, 0.95, 0), new THREE.Vector3(0, 0.55, 0), new THREE.Vector3(0.72, 0.95, 0)]); g.add(new THREE.Line(sg, new THREE.LineBasicMaterial({color:0xeeeeee})));
  g.add(at(cyl(0.025, 0.025, 1.0, k.edge, 5), 0, 0.95, 0.13)); if (rar >= 2) g.add(at(oct(0.1, k.gem), 0, 0.2, 0.14)); if (rar >= 3) runeStrip(g, 1.1, -0.2, 0, 0.115, k.rune, 0.04);
  tipMark(g, 1.5); aura(g, rar, k, 1.2); g.userData.gun = true; return g;
}
function W_heavy(k, rar, o={}){ // club / anchor / flail / maul
  const g = new THREE.Group(); const L = o.kind==='maul' ? 2.8 : 2.2; g.add(at(cyl(0.085, 0.1, L, o.kind==='club' && !rar ? k.wood : k.grip), 0, L/2 - 0.4, 0)); const top = L - 0.4;
  if (o.kind==='anchor'){ g.add(at(tor(0.18, 0.05, k.metal, 6, 14), 0, top+0.15, 0)); g.add(at(box(0.8, 0.12, 0.12, k.metal), 0, top-0.25, 0)); const ar = tor(0.62, 0.11, k.metal, 6, 18, Math.PI); ar.rotation.z = Math.PI; ar.position.y = -0.2; g.add(ar); for (const sx of [-1,1]){ const f = cone(0.14, 0.4, k.edge, 4); f.position.set(sx*0.62, -0.05, 0); g.add(f); } tipMark(g, -0.6); }
  else if (o.kind==='flail'){ for (let i=0;i<4;i++) g.add(at(tor(0.08, 0.025, k.metal, 4, 8), 0, top + 0.15 + i*0.15, 0)); const ball = sph(0.42, k.metal); ball.position.y = top + 0.95; g.add(ball); for (let i=0;i<10;i++){ const sp = cone(0.08, 0.3, k.edge, 4); const a = i*2.4, b = (i%3)*0.9; sp.position.set(Math.cos(a)*0.42, top + 0.95 + Math.sin(b)*0.38, Math.sin(a)*0.42); sp.lookAt(new THREE.Vector3(0, top+0.95, 0)); sp.rotateX(-Math.PI/2); g.add(sp); } g.userData.flail = ball; tipMark(g, top + 0.95); }
  else if (o.kind==='maul'){ const hd = box(1.25, 0.8, 0.8, o.ice ? M(0xd6f4ff, {metalness:0.2, roughness:0.15, emissive:0x60c8ff, emissiveIntensity:0.25}) : k.metal); hd.position.y = top + 0.3; g.add(hd); for (const sx of [-1,1]) g.add(at(box(0.12, 0.9, 0.9, k.accent), sx*0.6, top+0.3, 0)); for (const sx of [-1,1]){ const tk = cone(0.15, 0.7, M(0xfff8e8), 6); tk.position.set(sx*0.95, top+0.35, 0); tk.rotation.z = -sx*1.3; g.add(tk); } tipMark(g, top + 0.3); }
  else { const hd = cyl(0.3, 0.2, 0.9, k.metal, 8); hd.position.y = top + 0.2; g.add(hd); for (let i=0;i<(rar?8:4);i++){ const sp = cone(0.07, 0.28, k.edge, 4); const a = i/8*Math.PI*2; sp.position.set(Math.cos(a)*0.3, top + 0.1 + (i%2)*0.3, Math.sin(a)*0.3); sp.rotation.z = -Math.cos(a)*1.3; sp.rotation.x = Math.sin(a)*1.3; g.add(sp); } tipMark(g, top + 0.4); }
  if (rar >= 2) g.add(at(oct(0.12, k.gem), 0, top-0.35, 0.1)); if (rar >= 3) runeStrip(g, 1.2, top-1.6, 0, 0.1, k.rune, 0.04);
  aura(g, rar, k, top + 0.3); return g;
}
function W_scythe(k, rar){
  const g = new THREE.Group(); g.add(at(cyl(0.07, 0.08, 4.0, k.wood), 0, 1.0, 0)); const top = 3.0; g.add(at(cyl(0.11, 0.11, 0.2, k.accent), 0, top-0.1, 0));
  for (let i=0;i<8;i++){ const seg = box(0.22 - i*0.018, 0.34, 0.05, k.metal); const a = 0.1 + i*0.2; seg.position.set(0.15 + Math.sin(a)*1.25*(i/8+0.2), top + Math.cos(a)*0.5 - i*0.06, 0); seg.rotation.z = -1.4 - i*0.12; g.add(seg); const e = box(0.04, 0.34, 0.07, k.edge); e.position.copy(seg.position); e.position.y -= 0.1; e.rotation.z = seg.rotation.z; g.add(e); }
  if (rar >= 2) g.add(at(oct(0.11, k.gem), 0, top-0.4, 0.1)); if (rar >= 3){ runeStrip(g, 1.4, 0.4, 0, 0.08, k.rune, 0.04); g.add(at(sph(0.16, k.gem), 0, top+0.15, 0)); }
  tipMark(g, top); g.userData.tip.position.x = 1.0; aura(g, rar, k, top); return g;
}
function W_claws(k, rar, o={}){ // gauntlet worn over the hand; claws point down the arm's line (+Y = out of the fist)
  const g = new THREE.Group(); const gm = o.ice ? M(0xcff2ff, {metalness:0.3, roughness:0.1, emissive:0x60c8ff, emissiveIntensity:0.3}) : k.metal;
  g.add(at(box(1.05, 0.75, 1.05, gm), 0, 0.05, 0)); g.add(at(box(1.1, 0.25, 1.1, k.accent), 0, 0.45, 0));
  if (o.claws){ for (let i=0;i<3;i++){ const c = cone(0.07, 0.75, o.ice ? M(0xe8fbff, {emissive:0x80d8ff, emissiveIntensity:0.6}) : k.edge, 4); c.position.set(-0.3 + i*0.3, -0.6, 0.35); c.rotation.x = Math.PI + 0.35; g.add(c); } }
  else if (rar >= 1){ for (let i=0;i<4;i++) g.add(at(sph(0.1, k.edge), -0.36 + i*0.24, -0.3, 0.48)); }
  if (rar >= 2){ for (let i=0;i<3;i++){ const sp = cone(0.09, 0.4, k.edge, 4); sp.position.set(-0.3 + i*0.3, 0.2, -0.5); sp.rotation.x = -1.4; g.add(sp); } }
  if (rar >= 3){ g.add(at(oct(0.14, k.gem), 0, 0.15, 0.55)); const rg = tor(0.62, 0.04, new THREE.MeshBasicMaterial({color:k.rune}), 4, 24); rg.rotation.x = Math.PI/2; rg.position.y = 0.45; g.add(rg); }
  tipMark(g, -0.4); aura(g, rar, k, 0.6); g.userData.gauntlet = true; return g;
}

/* ---------- Legends: hand-built relics from myth ---------- */
const MK = (metal, edge, accent, rune, o={}) => ({metal:M(metal, Object.assign({metalness:0.75, roughness:0.22}, o.m||{})), edge:M(edge, {metalness:0.8, roughness:0.12, emissive:o.ee||0, emissiveIntensity:o.ei||0}), accent:M(accent, {metalness:0.6, roughness:0.3, emissive:o.ae||0, emissiveIntensity:o.ai||0}),
  grip:M(o.grip||0x3a2010, {roughness:0.8}), wood:M(o.wood||0x7a4b2a, {roughness:0.85}), gem:M(rune, {emissive:rune, emissiveIntensity:1.5}), rune, glowM:new THREE.MeshBasicMaterial({color:rune})});
const GOLD = 0xffcf4a, BRONZE = 0xcd8a3a, SILVER = 0xe8eef6, OBS = 0x1a1016;
function bolt(m, s=1){ const b = new THREE.Group(); const pts = [[0,0],[0.25,0.5],[-0.05,0.55],[0.3,1.1],[0.0,1.15],[0.35,1.8]]; for (let i=0;i<pts.length-1;i++){ const [x1,y1] = pts[i], [x2,y2] = pts[i+1]; const L = Math.hypot(x2-x1, y2-y1); const seg = box(0.14*s, L*s+0.05, 0.1*s, m); seg.position.set((x1+x2)/2*s, (y1+y2)/2*s, 0); seg.rotation.z = -Math.atan2(x2-x1, y2-y1); b.add(seg); } return b; }
function flames(g, n, col, y0, spread, size=0.5){ g.userData.flames = (g.userData.flames||[]); for (let i=0;i<n;i++){ const s = glow(rgba(col, 0.9), size); s.userData.ph = Math.random(); s.userData.base = [ (Math.random()-.5)*spread, y0 + Math.random()*spread, (Math.random()-.5)*spread*0.4 ]; g.add(s); g.userData.flames.push(s); } }
function mythWeapon(it){ const key = it.myth, rar = it.rar; const sp0 = legendSpec(key); if (sp0) return paramWeapon(sp0, it); const g = new THREE.Group(); let k, tip = 2;
  const swordBase = (k, L, wd, o={}) => { g.add(at(cyl(0.07, 0.08, 0.6, k.grip), 0, 0, 0)); g.add(at(sph(0.12, k.accent), 0, -0.36, 0)); const bl = box(wd, L, 0.07, k.metal); bl.position.y = 0.4 + L/2; g.add(bl); const ed = box(wd + 0.07, L*0.97, 0.03, k.edge); ed.position.y = 0.4 + L/2; g.add(ed); if (!o.noTip){ const tp = cone(wd*0.72, 0.4, k.edge, 4); tp.position.y = 0.4 + L + 0.19; tp.rotation.y = Math.PI/4; tp.scale.z = 0.25; g.add(tp); } tip = 0.4 + L; };
  const shaft = (k, L, below=1.3, col) => { g.add(at(cyl(0.075, 0.085, L, col || k.wood), 0, L/2 - below, 0)); return L - below; };
  switch (key){
    case 'zeus_gauntlets': case 'heracles_cestus': case 'prometheus_hands': { const z = key==='zeus_gauntlets', h = key==='heracles_cestus';
      k = z ? MK(GOLD, 0xfff8c0, 0x3a6aff, 0x9fd8ff, {ae:0x3060ff, ai:0.6}) : h ? MK(BRONZE, 0xffe0a0, 0x8a5a2a, 0xffc040) : MK(0x3a1a10, 0xff8a30, 0xff5a1a, 0xff7a20, {ae:0xff3a00, ai:0.9});
      const cuff = cyl(0.62, 0.5, 0.7, k.accent, 8); cuff.position.y = 0.55; g.add(cuff); g.add(at(box(1.0, 0.62, 0.95, k.metal), 0, -0.05, 0));
      for (let i=0;i<4;i++){ const kn = box(0.22, 0.24, 0.3, k.edge); kn.position.set(-0.36 + i*0.24, -0.25, 0.45); g.add(kn); } const th = box(0.22, 0.45, 0.25, k.metal); th.position.set(0.55, -0.1, 0.3); th.rotation.z = -0.4; g.add(th);
      if (z){ for (const sx of [-1,1]){ const wg = bolt(k.edge, 0.3); wg.position.set(sx*0.6, 0.5, 0); wg.rotation.z = sx*1.2; g.add(wg); } }
      if (z){ for (let i=0;i<3;i++){ const b = bolt(k.edge, 0.35); b.position.set(-0.35 + i*0.35, -0.3, 0.55); b.rotation.x = Math.PI; g.add(b); } }
      if (h){ const lion = new THREE.Group(); lion.add(box(0.5, 0.45, 0.25, M(GOLD, {metalness:0.7}))); const mane = tor(0.32, 0.09, M(0xc08030), 5, 14); lion.add(mane); for (const sx of [-1,1]) lion.add(at(sph(0.05, EYEM(0x201000)), sx*0.12, 0.05, 0.14)); lion.position.set(0, 0, 0.6); g.add(lion); }
      if (key==='prometheus_hands') flames(g, 8, 0xff6a20, -0.4, 1.0, 0.55);
      tip = -0.4; break; }
    case 'zeus_bolt': { k = MK(0xfff4a0, 0xffffff, 0x9fd8ff, 0xbfe8ff, {m:{emissive:0xffe060, emissiveIntensity:1.2}});
      g.add(at(cyl(0.12, 0.12, 0.6, M(GOLD, {metalness:0.8, roughness:0.2})), 0, 0, 0)); g.add(at(tor(0.16, 0.05, M(GOLD, {metalness:0.8}), 5, 12), 0, 0.3, 0)); g.add(at(tor(0.16, 0.05, M(GOLD, {metalness:0.8}), 5, 12), 0, -0.3, 0)); const b = bolt(k.metal, 0.95); b.position.set(-0.15, 0.32, 0); g.add(b); const b2 = bolt(k.metal, 0.95); b2.position.set(0.15, -0.32, 0); b2.rotation.z = Math.PI; g.add(b2); g.userData.handHeld = true; tip = 1.9; break; }
    case 'harpe': { k = MK(BRONZE, 0xffe8b0, 0x2a6a3a, 0x60ff90); swordBase(k, 1.9, 0.24); const hook = tor(0.42, 0.07, k.edge, 6, 16, Math.PI*1.1); hook.position.set(0.32, 1.9, 0); hook.rotation.z = -0.4; g.add(hook); g.add(at(oct(0.12, k.gem), 0, 0.32, 0.14)); g.add(at(box(0.7, 0.12, 0.2, k.accent), 0, 0.32, 0)); break; }
    case 'excalibur': { k = MK(SILVER, 0xffffff, GOLD, 0xffe680, {ee:0xfff0b0, ei:0.4}); swordBase(k, 2.8, 0.26); for (const sx of [-1,1]){ const wg = box(0.55, 0.1, 0.18, k.accent); wg.position.set(sx*0.45, 0.42, 0); wg.rotation.z = sx*0.35; g.add(wg); } g.add(at(oct(0.14, M(0x3a8aff, {emissive:0x3a8aff, emissiveIntensity:1.4})), 0, 0.34, 0.14)); runeStrip(g, 2.2, 0.6, 0, 0.045, 0xffe680); break; }
    case 'ares_sword': { k = MK(0x8a0a1a, 0xff4040, OBS, 0xff2a2a, {m:{emissive:0x400008, emissiveIntensity:0.8}, ee:0xff2020, ei:0.8}); swordBase(k, 2.6, 0.32); for (let i=0;i<4;i++){ const sp = cone(0.09, 0.45, k.edge, 4); sp.position.set((i%2?1:-1)*0.24, 0.9 + i*0.5, 0); sp.rotation.z = (i%2?-1:1)*1.1; g.add(sp); } g.add(at(box(0.9, 0.16, 0.24, k.accent), 0, 0.33, 0)); flames(g, 7, 0xff3020, 0.8, 2.2, 0.5); break; }
    case 'gram': { k = MK(0x9ab8d8, 0xe8f6ff, GOLD, 0x6fd0ff, {ee:0x60b0ff, ei:0.5}); swordBase(k, 2.7, 0.27); g.add(at(box(0.32, 0.1, 0.09, k.accent), 0, 1.6, 0)); runeStrip(g, 2.2, 0.6, 0, 0.045, 0x6fd0ff); g.add(at(box(0.85, 0.14, 0.22, M(0x2a3a5a, {metalness:0.6})), 0, 0.33, 0)); break; }
    case 'achilles_spear': case 'gae_bolg': case 'gungnir': case 'poseidon_trident': {
      const a = key==='achilles_spear', gb = key==='gae_bolg', gu = key==='gungnir';
      k = a ? MK(BRONZE, 0xffe0a0, 0xc02020, 0xffc040) : gb ? MK(0x5a1a1a, 0xff5050, 0x2a1a10, 0xff3030, {ee:0xa00000, ei:0.5}) : gu ? MK(0x4a5a7a, 0xd8f0ff, GOLD, 0x7ad0ff, {ee:0x50a0ff, ei:0.5}) : MK(0x1fa0a0, 0xd0fff8, GOLD, 0x40e0ff, {m:{emissive:0x0a4040, emissiveIntensity:0.5}});
      const top = shaft(k, 4.4, 1.3, key==='poseidon_trident' ? k.accent : gu ? M(0x2a2a3a) : null);
      if (key==='poseidon_trident'){ g.add(at(box(1.0, 0.14, 0.14, k.accent), 0, top, 0)); for (const sx of [-1,0,1]){ g.add(at(cyl(0.06, 0.06, 0.75, k.metal), sx*0.46, top+0.38, 0)); g.add(at(cone(0.12, 0.42, k.edge, 4), sx*0.46, top+0.95, 0)); for (const sy of [-1,1]) if (sx){ const b = cone(0.05, 0.2, k.edge, 4); b.position.set(sx*0.46 + sy*0.06, top+0.7, 0); b.rotation.z = sy*2.5; g.add(b); } } flames(g, 6, 0x60e0ff, top-0.2, 1.4, 0.45); tip = top + 1.1; }
      else { const tp = cone(0.22, a ? 0.95 : gu ? 1.2 : 0.9, k.edge, 4); tp.position.y = top + 0.45; g.add(tp); g.add(at(cyl(0.12, 0.12, 0.16, k.accent), 0, top-0.05, 0));
        if (a){ const crest = box(0.06, 0.25, 0.9, M(0xc02020)); crest.position.set(0, top-0.25, -0.1); g.add(crest); for (let i=0;i<6;i++){ const h = box(0.04, 0.55, 0.04, M(0xd03030)); h.position.set(0, top-0.6, -0.4 + i*0.12); h.rotation.x = 0.4; g.add(h); } }
        if (gb){ for (let i=0;i<14;i++){ const b = cone(0.07, 0.42, k.edge, 4); const a2 = i*0.9; b.position.set(Math.cos(a2)*0.2, top - 0.2 + (i%5)*0.16, Math.sin(a2)*0.2); b.rotation.set(Math.sin(a2)*2.4, 0, -Math.cos(a2)*2.4); g.add(b); } }
        if (gu){ runeStrip(g, 1.6, top-1.8, 0, 0.09, 0x7ad0ff, 0.04); for (const sx of [-1,1]){ const rv = new THREE.Group(); rv.add(box(0.18, 0.12, 0.35, M(0x111118))); const w1 = box(0.5, 0.03, 0.2, M(0x111118)); rv.add(w1); rv.position.set(sx*0.45, top-0.4, 0); g.add(rv); } }
        tip = top + 0.9; }
      break; }
    case 'artemis_bow': case 'odysseus_bow': case 'apollo_bow': case 'gandiva': {
      k = key==='artemis_bow' ? MK(SILVER, 0xffffff, 0xbfd8ff, 0xd8e8ff, {m:{emissive:0x6080c0, emissiveIntensity:0.4}}) : key==='odysseus_bow' ? MK(BRONZE, 0xffe0a0, 0x7a4b2a, 0xffc060) : key==='apollo_bow' ? MK(GOLD, 0xfff8d0, 0xff9a20, 0xffd040, {m:{emissive:0x804000, emissiveIntensity:0.5}}) : MK(0x5a8aff, 0xe0f0ff, 0xffffff, 0x9fd0ff, {m:{emissive:0x2040a0, emissiveIntensity:0.6}});
      const bw = W_bow(k, rar, {}); g.userData = bw.userData; // reuse the working bow rig
      while (bw.children.length) g.add(bw.children[0]);
      if (key==='artemis_bow'){ const moon = tor(0.32, 0.07, M(0xffffff, {emissive:0xd8e8ff, emissiveIntensity:1.2}), 6, 18, Math.PI*1.3); moon.position.set(0, 0, 0.25); moon.rotation.y = Math.PI/2; g.add(moon); }
      if (key==='apollo_bow'){ const sun = new THREE.Mesh(new THREE.CircleGeometry(0.3, 16), M(0xffe060, {emissive:0xffb020, emissiveIntensity:1.5, side:THREE.DoubleSide})); sun.position.set(0.12, 0, 0.1); sun.rotation.y = Math.PI/2; g.add(sun); for (let i=0;i<10;i++){ const ry = box(0.03, 0.22, 0.05, M(0xffe060, {emissive:0xffb020, emissiveIntensity:1.2})); const a2 = i*0.628; ry.position.set(0.12, Math.cos(a2)*0.45, 0.1 + Math.sin(a2)*0.45); ry.rotation.x = -a2; g.add(ry); } }
      if (key==='gandiva'){ for (let i=0;i<5;i++){ const f = box(0.03, 0.4, 0.14, M([0x2a6aff,0x20c0a0,0xffd040,0x2a6aff,0x20c0a0][i], {emissive:0x103060, emissiveIntensity:0.5})); f.position.set(0, -0.9 - i*0.08, -0.6 - i*0.05); f.rotation.x = 0.5 + i*0.15; g.add(f); } }
      if (key==='odysseus_bow'){ for (let i=0;i<4;i++) g.add(at(rot(tor(0.08, 0.02, k.edge, 4, 10), 0, Math.PI/2, 0), 0, -0.6 + i*0.4, -0.15)); }
      return finishMyth(g, rar, k, 1.2, it); }
    case 'dragon_scroll': { k = MK(0xf0e0b0, 0xff6a20, 0x8a1a10, 0xff6a20, {ae:0x600800, ai:0.6});
      const paper = M(0xf2e2b8, {roughness:0.9, side:THREE.DoubleSide}); for (const sy of [-1,1]){ g.add(at(cyl(0.16, 0.16, 1.6, k.accent, 12), 0, sy*0.75, 0)); for (const sx of [-1,1]) g.add(at(sph(0.12, M(GOLD, {metalness:0.8})), sx*0.0, sy*0.75 + sy*0.85, 0)); }
      const sheet = box(1.3, 1.5, 0.03, paper); sheet.position.set(0, 0, 0.12); g.add(sheet); const dr = new THREE.Group(); for (let i=0;i<7;i++){ const s = box(0.14, 0.14, 0.02, M(0xc0201a, {emissive:0xa01000, emissiveIntensity:0.6})); s.position.set(-0.45 + i*0.15, Math.sin(i*1.1)*0.35, 0.15); dr.add(s); } dr.add(at(box(0.25, 0.2, 0.02, M(0xc0201a, {emissive:0xa01000, emissiveIntensity:0.8})), 0.55, 0.1, 0.15)); g.add(dr);
      g.children.forEach(c => c.rotation.z += 0); flames(g, 6, 0xff6a20, 0.4, 1.2, 0.45); tip = 0.3; g.userData.scroll = true; return finishMyth(g, rar, k, tip, it); }
    case 'heracles_club': case 'hephaestus_hammer': case 'mjolnir': case 'dagda_club': {
      if (key==='heracles_club' || key==='dagda_club'){ const d = key==='dagda_club'; k = d ? MK(0x5a3a1a, 0xd8ffd0, 0x2a8a3a, 0x60ff90, {ae:0x20a040, ai:0.6}) : MK(0x6a4422, 0xffe0a0, GOLD, 0xffc040); const W = M(d ? 0x4a3018 : 0x6a4422, {roughness:0.9, flatShading:true});
        g.add(at(cyl(0.12, 0.42, 2.8, W, 8), 0, 0.9, 0)); for (let i=0;i<6;i++){ const kn = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16, 0), W); kn.position.set(Math.cos(i*1.9)*0.32, 0.9 + i*0.32, Math.sin(i*1.9)*0.32); g.add(kn); }
        if (!d){ g.add(at(tor(0.32, 0.06, k.accent, 5, 14), 0, 0.2, 0)); const pelt = box(0.6, 0.5, 0.06, M(0xd8a040)); pelt.position.set(0.25, 0.55, 0.25); pelt.rotation.z = 0.3; g.add(pelt); }
        else { const dk = cyl(0.42, 0.16, 1.2, M(0x1a1410, {roughness:0.9, flatShading:true}), 8); dk.position.y = -0.95; g.add(dk); for (let i=0;i<4;i++){ const sp = cone(0.08, 0.35, M(0xe8e0d0), 4); sp.position.set(Math.cos(i*1.57)*0.38, -1.3, Math.sin(i*1.57)*0.38); sp.rotation.x = Math.PI; g.add(sp); } for (let i=0;i<5;i++){ const lf = box(0.3, 0.06, 0.18, M(0x40c060, {emissive:0x20a040, emissiveIntensity:0.6})); lf.position.set(Math.cos(i*1.3)*0.4, 1.8 + i*0.22, Math.sin(i*1.3)*0.4); lf.rotation.y = i; g.add(lf); } flames(g, 6, 0x60ff90, 1.2, 1.6, 0.45); }
        tip = 2.4; }
      else if (key==='hephaestus_hammer'){ k = MK(0x4a4a50, 0xffb060, 0xff6a20, 0xff8a30, {ae:0xff4000, ai:0.8}); g.add(at(cyl(0.09, 0.1, 2.3, k.grip), 0, 0.75, 0)); const hd = box(1.2, 0.6, 0.6, k.metal); hd.position.y = 1.95; g.add(hd); g.add(at(box(1.25, 0.12, 0.65, k.accent), 0, 1.95, 0)); const beak = cone(0.25, 0.6, k.metal, 4); beak.position.set(-0.85, 1.95, 0); beak.rotation.z = Math.PI/2; g.add(beak); flames(g, 6, 0xff7a20, 1.6, 1.0, 0.35); tip = 1.95; }
      else { k = MK(0x8a96a8, 0xe8f6ff, 0x5a3a20, 0x9fd8ff, {ee:0x60a0ff, ei:0.4}); g.add(at(cyl(0.1, 0.1, 1.3, M(0x5a3a20)), 0, 0.3, 0)); g.add(at(tor(0.12, 0.04, M(0x5a3a20), 4, 10), 0, -0.45, 0)); const hd = box(1.3, 0.8, 0.8, k.metal); hd.position.y = 1.25; g.add(hd); for (const sx of [-1,1]) g.add(at(box(0.08, 0.84, 0.84, k.edge), sx*0.62, 1.25, 0)); runeStrip(g, 0.5, 1.05, 0, 0.42, 0x9fd8ff, 0.06); for (let i=0;i<3;i++){ const b = bolt(M(0xbfe8ff, {emissive:0x80c0ff, emissiveIntensity:1.5}), 0.3); b.position.set(-0.6 + i*0.6, 1.7, 0.3); g.add(b); } tip = 1.25; }
      return finishMyth(g, rar, k, tip, it); }
    case 'kronos_sickle': case 'morrigan_scythe': case 'thanatos_scythe': case 'hades_reaper': {
      k = key==='kronos_sickle' ? MK(0xe0e8f0, 0xffffff, GOLD, 0xffe080) : key==='morrigan_scythe' ? MK(0x2a2a34, 0xd0d0e0, 0x5a1a2a, 0xc04060) : key==='thanatos_scythe' ? MK(0x14121a, 0xe8f0ff, 0x6a6a7a, 0xd8e8ff, {ee:0x8090c0, ei:0.4}) : MK(0x101a1a, 0x80ffe0, 0x2a4a4a, 0x40ffc0, {ee:0x20c090, ei:0.7});
      if (key==='kronos_sickle'){ g.add(at(cyl(0.08, 0.09, 3.4, M(0xe0d8c8)), 0, 0.9, 0)); const cres = tor(1.0, 0.13, k.metal, 6, 24, Math.PI*1.25); cres.position.set(0.55, 2.7, 0); cres.rotation.z = -0.2; g.add(cres); const ed = tor(1.0, 0.05, M(GOLD, {emissive:0x806000, emissiveIntensity:0.6}), 4, 24, Math.PI*1.25); ed.position.copy(cres.position); ed.rotation.z = -0.2; ed.scale.setScalar(1.12); g.add(ed); }
      else if (key==='morrigan_scythe'){ g.add(at(cyl(0.07, 0.08, 4.0, M(0x1a1a20)), 0, 1.0, 0)); for (let i=0;i<9;i++){ const f = box(0.06, 0.55 - i*0.03, 0.22, M(i%2 ? 0x111118 : 0x2a1a2a)); f.position.set(0.15 + i*0.16, 2.95 - i*0.07, 0); f.rotation.z = -1.1 - i*0.08; g.add(f); } const bl = box(1.6, 0.16, 0.05, k.edge); bl.position.set(0.8, 2.9, 0.06); bl.rotation.z = -0.35; g.add(bl); g.add(at(sph(0.15, M(0xc02040, {emissive:0x800020, emissiveIntensity:0.8})), 0, 3.05, 0)); }
      else if (key==='thanatos_scythe'){ g.add(at(cyl(0.08, 0.09, 4.4, M(0x0e0c12)), 0, 1.1, 0)); for (let i=0;i<10;i++){ const seg = box(0.34 - i*0.026, 0.42, 0.05, k.metal); const a2 = 0.1 + i*0.21; seg.position.set(0.2 + Math.sin(a2)*1.8*(i/10+0.2), 3.2 + Math.cos(a2)*0.7 - i*0.08, 0); seg.rotation.z = -1.4 - i*0.13; g.add(seg); const e = box(0.05, 0.42, 0.07, k.edge); e.position.copy(seg.position); e.position.y -= 0.13; e.rotation.z = seg.rotation.z; g.add(e); }
        const sk = new THREE.Group(); sk.add(box(0.42, 0.4, 0.4, M(0xeeeae0))); for (const sx of [-1,1]) sk.add(at(box(0.1, 0.1, 0.05, M(0x000000)), sx*0.1, 0.05, 0.21)); sk.add(at(box(0.25, 0.1, 0.3, M(0xeeeae0)), 0, -0.24, 0.05)); sk.position.set(0, 3.45, 0); g.add(sk); }
      else { g.add(at(cyl(0.08, 0.09, 4.2, M(0x101a1a)), 0, 1.0, 0)); for (const sx of [-1,1]){ g.add(at(cyl(0.06, 0.06, 0.8, k.metal), sx*0.25, 3.3, 0)); g.add(at(cone(0.1, 0.45, k.edge, 4), sx*0.25, 3.9, 0)); } g.add(at(box(0.7, 0.14, 0.14, k.metal), 0, 2.95, 0)); const hk = tor(0.7, 0.09, k.edge, 5, 18, Math.PI*0.9); hk.position.set(0.5, 2.8, 0); hk.rotation.z = -1.0; g.add(hk); }
      g.userData.tip = null; tipMark(g, 3.0);
      if (key==='kronos_sickle'){ const hg = new THREE.Group(); hg.add(at(cone(0.16, 0.3, M(0xbfe0ff, {transparent:true, opacity:0.6}), 8), 0, 0.15, 0)); const c2 = cone(0.16, 0.3, M(0xbfe0ff, {transparent:true, opacity:0.6}), 8); c2.rotation.x = Math.PI; c2.position.y = -0.15; hg.add(c2); hg.add(at(sph(0.08, M(GOLD, {emissive:0x806000, emissiveIntensity:0.6})), 0, -0.12, 0)); hg.position.set(0, 2.2, 0.15); g.add(hg); }
      if (key==='morrigan_scythe'){ for (let i=0;i<5;i++){ const f = box(0.04, 0.5, 0.14, M(0x111118)); f.position.set(0.1, 2.6 - i*0.15, -0.1); f.rotation.x = 0.6 + i*0.1; g.add(f); } }
      if (key==='thanatos_scythe' || key==='hades_reaper') flames(g, 8, key==='thanatos_scythe' ? 0xd8e8ff : 0x40ffc0, 2.2, 1.6, 0.45);
      return finishMyth(g, rar, k, 3.0, it); }
  }
  if (!k){ return weapon(Object.assign({}, it, {myth:null})); }
  return finishMyth(g, rar, k, tip, it); }

/* ---------- parametric relics (expansion): one spec line in DATA.LEGENDS → a model ---------- */
const legendSpec = key => { const L = (typeof DATA !== 'undefined' ? DATA.LEGENDS : []).find(l => l[0]===key); return L ? L[10] : null; };
function paramWeapon(sp, it){ const g = new THREE.Group(); const rar = it.rar; const k = MK(sp.metal || 0x888888, sp.edge || 0xffffff, sp.accent || 0xffcf4a, sp.rune || 0xffffff, {ee: rar>=4 ? (sp.rune||0) : 0, ei: rar>=4 ? 0.5 : 0}); let tip = 2;
  const B = sp.b; const anims = [];
  if (B==='parts'){ ASM.build(sp.parts, g, anims); tip = sp.tip || 3; g.userData.anims = anims; if (sp.spin) g.userData.spinDisc = true; return finishMyth(g, rar, MK(sp.rune || 0xffffff, 0xffffff, 0xffffff, sp.rune || 0xffffff), tip, it); }
  if (B==='sword'){ const L = sp.L || 2.4, wd = sp.wd || 0.26; g.add(at(cyl(0.07, 0.08, sp.slab ? 0.9 : 0.6, k.grip), 0, sp.slab ? -0.1 : 0, 0)); g.add(at(sph(0.12, k.accent), 0, sp.slab ? -0.6 : -0.36, 0));
    if (sp.guard==='cross'){ g.add(at(box(0.9 + wd, 0.14, 0.24, k.accent), 0, 0.33, 0)); } else if (sp.guard==='wing'){ for (const sx of [-1,1]){ const wg = box(0.6, 0.1, 0.18, k.accent); wg.position.set(sx*0.45, 0.42, 0); wg.rotation.z = sx*0.45; g.add(wg); } } else if (sp.guard==='disc'){ g.add(at(rot(cyl(0.35, 0.35, 0.08, k.accent, 12), Math.PI/2, 0, 0), 0, 0.33, 0)); }
    if (sp.curve){ for (let i=0;i<8;i++){ const a2 = i/7; const seg = box(wd*(1 - a2*0.3), L/8 + 0.03, 0.07, k.metal); seg.position.set(Math.sin(a2*2.2)*0.5*a2 + (a2 > 0.6 ? (a2-0.6)*0.9 : 0), 0.4 + (i+0.5)*L/8 - (a2 > 0.7 ? (a2-0.7)*0.6 : 0), 0); seg.rotation.z = -a2*1.2; g.add(seg); } tip = 0.4 + L*0.85; }
    else { const bl = box(wd, L, sp.slab ? 0.22 : 0.07, k.metal); bl.position.y = 0.4 + L/2; g.add(bl); if (!sp.slab){ const ed = box(wd + 0.07, L*0.97, 0.03, k.edge); ed.position.y = 0.4 + L/2; g.add(ed); }
      if (sp.slab){ g.add(at(box(wd*0.98, 0.35, 0.24, k.edge), 0, 0.4 + L - 0.05, 0)); for (let i=0;i<5;i++) g.add(at(box(0.08, 0.08, 0.24, M(0x1a1a1a)), (i%2 ? 0.18 : -0.15), 0.9 + i*0.6, 0.02)); }
      else if (sp.fork){ for (const sx of [-1,1]){ const tp = cone(wd*0.36, 0.55, k.edge, 4); tp.position.set(sx*wd*0.27, 0.4 + L + 0.25, 0); tp.scale.z = 0.3; g.add(tp); } }
      else { const tp = cone(wd*0.72, 0.42, k.edge, 4); tp.position.y = 0.4 + L + 0.2; tp.rotation.y = Math.PI/4; tp.scale.z = 0.25; g.add(tp); }
      tip = 0.4 + L; }
    if (rar >= 3 && !sp.slab) runeStrip(g, (sp.L||2.4)*0.75, 0.6, 0, 0.045, k.rune); if (sp.flame) flames(g, 7, sp.flame, 0.8, (sp.L||2.4)*0.8, 0.5); }
  else if (B==='katana'){ const L = sp.L || 2.6; const wrap = M(sp.wrap || 0x1a1a1a, {roughness:0.8}); g.add(at(cyl(0.065, 0.07, 0.85, wrap), 0, -0.1, 0)); for (let i=0;i<5;i++) g.add(at(box(0.15, 0.04, 0.15, M(0xf0f0f0)), 0, -0.4 + i*0.15, 0)); g.add(at(rot(cyl(0.28, 0.28, 0.06, M(sp.tsuba || 0x3a3a3a, {metalness:0.7}), 12), 0, 0, 0), 0, 0.34, 0)); g.children[g.children.length-1].rotation.x = 0;
    for (let i=0;i<10;i++){ const a2 = i/9; const seg = box(0.13, L/10 + 0.02, 0.045, k.metal); seg.position.set(-a2*a2*0.28, 0.4 + (i+0.5)*L/10, 0); seg.rotation.z = a2*0.18; g.add(seg); const ed = box(0.03, L/10 + 0.02, 0.05, k.edge); ed.position.set(-a2*a2*0.28 + 0.075, 0.4 + (i+0.5)*L/10, 0); ed.rotation.z = a2*0.18; g.add(ed); }
    const tp = cone(0.07, 0.25, k.edge, 4); tp.position.set(-0.3, 0.4 + L + 0.08, 0); tp.rotation.z = 0.5; g.add(tp); tip = 0.4 + L; if (sp.flame) flames(g, 6, sp.flame, 1.0, L*0.8, 0.45); }
  else if (B==='spear'){ const L = sp.L || 4.2; const shaftM = sp.wood ? M(sp.wood, {roughness:0.7}) : k.wood; g.add(at(cyl(0.075, 0.085, L, shaftM), 0, L/2 - 1.3, 0)); const top = L - 1.3;
    const H = sp.head; if (H==='naginata'){ for (let i=0;i<6;i++){ const a2 = i/5; const seg = box(0.2 - a2*0.08, 0.3, 0.05, k.metal); seg.position.set(a2*a2*0.3, top + 0.15 + i*0.27, 0); seg.rotation.z = -a2*0.5; g.add(seg); } g.add(at(rot(cyl(0.2, 0.2, 0.06, k.accent, 10), 0, 0, 0), 0, top, 0)); }
    else if (H==='trishula'){ g.add(at(box(0.9, 0.12, 0.12, k.metal), 0, top, 0)); for (const sx of [-1,0,1]){ const p = cone(0.13, sx ? 0.9 : 1.2, k.edge, 4); p.position.set(sx*0.4, top + (sx ? 0.5 : 0.65), 0); p.rotation.z = -sx*0.25; g.add(p); } g.add(at(cyl(0.18, 0.18, 0.18, k.accent, 10), 0, top - 0.25, 0)); }
    else if (H==='cap'){ for (const y of [-1.25, top]) g.add(at(cyl(0.13, 0.13, 0.45, k.edge, 12), 0, y, 0)); }
    else if (H==='cobra'){ const tp = cone(0.2, 0.8, k.edge, 4); tp.position.y = top + 0.4; g.add(tp); const hood = new THREE.Mesh(new THREE.CircleGeometry(0.35, 12), M(sp.accent, {side:THREE.DoubleSide})); hood.position.set(0, top - 0.15, 0.06); g.add(hood); g.add(at(sph(0.05, EYEM(0xff2020)), 0.1, top - 0.05, 0.1)); g.add(at(sph(0.05, EYEM(0xff2020)), -0.1, top - 0.05, 0.1)); }
    else if (H==='flame'){ const tp = cone(0.24, 1.0, k.edge, 5); tp.position.y = top + 0.5; g.add(tp); for (let i=0;i<4;i++){ const f = cone(0.07, 0.4, k.metal, 4); f.position.set(Math.cos(i*1.57)*0.2, top + 0.1, Math.sin(i*1.57)*0.2); f.rotation.set(Math.sin(i*1.57)*0.6, 0, -Math.cos(i*1.57)*0.6); g.add(f); } }
    else { const tp = cone(0.22, 0.9, k.edge, 4); tp.position.y = top + 0.45; g.add(tp); g.add(at(cyl(0.12, 0.12, 0.16, k.accent), 0, top - 0.05, 0)); }
    if (rar >= 3) runeStrip(g, 1.4, top - 1.6, 0, 0.09, k.rune, 0.04); if (sp.flame) flames(g, 6, sp.flame, top - 0.2, 1.3, 0.45); tip = top + 0.9; }
  else if (B==='axe'){ g.add(at(cyl(0.085, 0.1, 2.6, k.grip), 0, 0.9, 0)); const top = 1.9; for (const sx of (sp.double ? [-1,1] : [1])){ const bl = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.1, 16, 1, false, 0, Math.PI), k.metal); bl.rotation.set(Math.PI/2, 0, sx > 0 ? -Math.PI/2 : Math.PI/2); bl.position.set(sx*0.25, top, 0); g.add(bl); const ed = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.04, 4, 16, Math.PI), k.edge); ed.rotation.z = sx > 0 ? -Math.PI/2 : Math.PI/2; ed.position.set(sx*0.25, top, 0); g.add(ed); }
    g.add(at(box(0.3, 0.5, 0.3, k.accent), 0, top, 0)); g.add(at(cone(0.12, 0.4, k.edge, 4), 0, top + 0.45, 0)); if (rar >= 3) runeStrip(g, 1.2, 0.2, 0, 0.1, k.rune, 0.04); if (sp.flame) flames(g, 6, sp.flame, top - 0.4, 1.0, 0.45); tip = top; }
  else if (B==='hammer'){ const H = sp.head; g.add(at(cyl(0.085, 0.1, H==='kanabo' ? 1.0 : 2.3, k.grip), 0, H==='kanabo' ? -0.1 : 0.75, 0));
    if (H==='kanabo'){ const cl = cyl(0.36, 0.2, 2.6, k.metal, 8); cl.position.y = 1.7; g.add(cl); for (let i=0;i<20;i++){ const a2 = i*1.1, y = 0.7 + (i%10)*0.25; const st = cone(0.06, 0.18, k.edge, 4); st.position.set(Math.cos(a2)*(0.22 + y*0.04), y + 0.2, Math.sin(a2)*(0.22 + y*0.04)); st.rotation.set(Math.sin(a2)*1.5, 0, -Math.cos(a2)*1.5); g.add(st); } tip = 2.8; }
    else if (H==='was'){ g.add(at(cyl(0.08, 0.08, 0.6, k.grip), 0, -0.6, 0)); for (const sx of [-1,1]) g.add(rot(at(cone(0.06, 0.4, k.metal, 4), sx*0.1, -0.95, 0), Math.PI, 0, -sx*0.3)); const hd = new THREE.Group(); hd.add(box(0.9, 0.35, 0.35, k.metal)); hd.add(at(rot(cone(0.16, 0.6, k.metal, 4), 0, 0, Math.PI/2.5), -0.5, 0.15, 0)); hd.add(at(sph(0.08, EYEM(0xff6a20)), 0.25, 0.1, 0.18)); hd.position.y = 2.0; hd.rotation.z = 0.2; g.add(hd); for (const sx of [-1,1]) g.add(at(box(0.5, 0.5, 0.5, k.accent), sx*0.0, 1.6, 0)); tip = 2.0; }
    else if (H==='mace'){ const hd = sph(0.5, k.metal, 12, 8); hd.position.y = 2.0; g.add(hd); for (let i=0;i<8;i++){ const fl = box(0.12, 0.6, 0.5, k.edge); fl.position.set(Math.cos(i*0.785)*0.42, 2.0, Math.sin(i*0.785)*0.42); fl.rotation.y = -i*0.785; g.add(fl); } g.add(at(oct(0.16, k.gem), 0, 2.6, 0)); tip = 2.0; }
    else { const hd = box(1.4, 0.9, 0.9, M(sp.metal, {flatShading:true, roughness:0.7})); hd.position.y = 2.0; g.add(hd); for (const sx of [-1,1]) g.add(at(box(0.1, 0.95, 0.95, k.accent), sx*0.55, 2.0, 0)); for (let i=0;i<4;i++){ const m2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16, 0), M(0x5a7a3a)); m2.position.set(-0.5 + i*0.33, 2.45, 0.3); g.add(m2); } tip = 2.0; }
    if (rar >= 3) runeStrip(g, 0.9, 0.0, 0, 0.1, k.rune, 0.04); if (sp.flame) flames(g, 6, sp.flame, 1.6, 1.0, 0.45); }
  else if (B==='bow'){ const bw = W_bow(k, rar, {ice: sp.deco==='ice'}); g.userData = bw.userData; while (bw.children.length) g.add(bw.children[0]); if (sp.tall) g.scale.y = 1.25; if (sp.extra){ ASM.build(sp.extra, g, anims); g.userData.anims = anims; }
    if (sp.deco==='sun'){ for (let i=0;i<8;i++){ const ry = box(0.03, 0.2, 0.05, M(0xffe060, {emissive:0xffb020, emissiveIntensity:1.2})); const a2 = i*0.785; ry.position.set(0.12, Math.cos(a2)*0.35, 0.05 + Math.sin(a2)*0.35); ry.rotation.x = -a2; g.add(ry); } }
    return finishMyth(g, rar, k, 1.2, it); }
  else if (B==='gaunt'){ const cuff = cyl(0.62, 0.5, 0.7, k.accent, 8); cuff.position.y = 0.55; g.add(cuff); g.add(at(box(1.0, 0.62, 0.95, k.metal), 0, -0.05, 0)); for (let i=0;i<4;i++) g.add(at(box(0.22, 0.24, 0.3, k.edge), -0.36 + i*0.24, -0.25, 0.45));
    if (sp.claws){ for (let i=0;i<4;i++){ const c2 = cone(0.07, 0.8, k.edge, 4); c2.position.set(-0.36 + i*0.24, -0.75, 0.45); c2.rotation.x = Math.PI + 0.3; g.add(c2); } }
    g.add(at(oct(0.14, k.gem), 0, 0.1, 0.5)); if (sp.flame) flames(g, 6, sp.flame, -0.4, 1.0, 0.5); tip = -0.4; }
  else if (B==='scythe'){ g.add(at(cyl(0.075, 0.085, 4.2, k.grip), 0, 1.0, 0)); const top = 3.0;
    for (let i=0;i<9;i++){ const seg = box(0.3 - i*0.025, 0.4, 0.05, k.metal); const a2 = 0.1 + i*0.2; seg.position.set(0.18 + Math.sin(a2)*1.5*(i/9+0.2), top + Math.cos(a2)*0.55 - i*0.07, 0); seg.rotation.z = -1.4 - i*0.12; g.add(seg); const e = box(0.05, 0.4, 0.07, k.edge); e.position.copy(seg.position); e.position.y -= 0.12; e.rotation.z = seg.rotation.z; g.add(e); }
    if (sp.crook){ const ck = tor(0.3, 0.07, k.accent, 5, 12, Math.PI*1.3); ck.position.set(-0.25, top + 0.2, 0); g.add(ck); }
    if (sp.skull){ const sk = box(0.38, 0.36, 0.36, M(0xe8f4ff)); sk.position.set(0, top + 0.3, 0); g.add(sk); }
    if (rar >= 3) runeStrip(g, 1.4, 0.4, 0, 0.08, k.rune, 0.04); if (sp.flame) flames(g, 7, sp.flame, top - 0.6, 1.5, 0.45); tip = top; }
  else if (B==='staff'){ const T = sp.top; const shM = sp.wood ? M(0x6a4422, {roughness:0.85, flatShading:true}) : k.metal; g.add(at(cyl(0.08, 0.1, 4.0, shM, 8), 0, 0.8, 0)); const top = 2.8;
    if (T==='crook'){ const ck = tor(0.35, 0.08, k.metal, 6, 14, Math.PI*1.2); ck.position.set(-0.35, top + 0.1, 0); ck.rotation.z = -0.3; g.add(ck); for (let i=0;i<6;i++) g.add(at(cyl(0.11, 0.11, 0.1, i%2 ? k.accent : k.metal, 10), 0, top - 2.6 + i*0.5, 0)); }
    else if (T==='ankh'){ const ring = tor(0.35, 0.09, k.metal, 6, 18); ring.position.y = top + 0.75; ring.scale.y = 1.3; g.add(ring); g.add(at(box(1.0, 0.18, 0.18, k.metal), 0, top + 0.2, 0)); g.add(at(oct(0.14, k.gem), 0, top + 0.2, 0.12)); }
    else if (T==='caduceus'){ for (const sx of [-1,1]) for (let i=0;i<6;i++){ const s = sph(0.08, M(sp.accent)); s.position.set(Math.sin(i*1.1)*0.18*sx, top - 1.2 + i*0.25, Math.cos(i*1.1)*0.18); g.add(s); } for (const sx of [-1,1]){ const w = box(0.6, 0.06, 0.3, M(0xffffff)); w.position.set(sx*0.35, top + 0.25, 0); w.rotation.z = sx*0.4; g.add(w); } g.add(at(sph(0.15, k.metal), 0, top + 0.35, 0)); }
    else if (T==='crystal'){ const cr = oct(0.32, M(sp.rune, {emissive:sp.rune, emissiveIntensity:1.3, transparent:true, opacity:0.9})); cr.position.y = top + 0.4; cr.scale.y = 1.6; g.add(cr); for (let i=0;i<3;i++){ const pr = cone(0.06, 0.6, shM, 4); pr.position.set(Math.cos(i*2.1)*0.25, top + 0.1, Math.sin(i*2.1)*0.25); pr.rotation.set(Math.sin(i*2.1)*0.5, 0, -Math.cos(i*2.1)*0.5); g.add(pr); } }
    else if (T==='rune'){ for (let i=0;i<5;i++){ const st = box(0.22, 0.28, 0.06, M(0x6a6a74)); st.position.set(Math.cos(i*1.26)*0.4, top + 0.3, Math.sin(i*1.26)*0.4); g.add(st); g.userData.runes = (g.userData.runes||[]).concat([st]); } g.add(at(oct(0.18, k.gem), 0, top + 0.3, 0)); }
    else if (T==='pine'){ const pc = cone(0.22, 0.55, M(0x8a5a2a, {flatShading:true}), 7); pc.position.y = top + 0.35; pc.rotation.x = Math.PI; g.add(pc); for (let i=0;i<10;i++){ const lf = box(0.2, 0.04, 0.12, M(0x3a8a3a)); lf.position.set(Math.cos(i*1.3)*0.1, top - 1.6 + i*0.17, Math.sin(i*1.3)*0.1); lf.rotation.y = i; g.add(lf); } }
    else if (T==='serpent'){ for (let i=0;i<12;i++){ const s = sph(0.09, M(sp.accent)); s.position.set(Math.sin(i*0.9)*0.15, top - 2.2 + i*0.22, Math.cos(i*0.9)*0.15); g.add(s); } g.add(at(sph(0.13, M(sp.accent)), 0.1, top + 0.45, 0.1)); }
    else if (T==='sun'){ const disc = sph(0.4, M(0xffd040, {emissive:0xffa010, emissiveIntensity:1.3}), 16, 12); disc.position.y = top + 0.5; g.add(disc); const cb = cone(0.1, 0.5, M(sp.accent), 5); cb.position.set(0, top + 0.95, 0.15); g.add(cb); for (const sx of [-1,1]){ const h = tor(0.35, 0.05, k.metal, 4, 12, Math.PI); h.position.set(sx*0.4, top + 0.5, 0); h.rotation.z = sx > 0 ? -Math.PI/2 : Math.PI/2; g.add(h); } }
    else if (T==='moon'){ const mn = tor(0.42, 0.09, M(0xfff0ff, {emissive:0xffb0e0, emissiveIntensity:0.9}), 6, 18, Math.PI*1.4); mn.position.y = top + 0.5; mn.rotation.z = -0.9; g.add(mn); g.add(at(oct(0.16, M(sp.accent, {emissive:sp.accent, emissiveIntensity:1.2})), 0, top + 0.5, 0)); for (const sx of [-1,1]){ const w = box(0.5, 0.06, 0.2, M(0xffffff)); w.position.set(sx*0.3, top - 0.1, 0); w.rotation.z = sx*0.5; g.add(w); } }
    else { g.add(at(sph(0.3, k.gem), 0, top + 0.35, 0)); }
    if (sp.flame) flames(g, 7, sp.flame, top, 0.8, 0.5); tip = top + 0.45; }
  else if (B==='chakram'){ const T = sp.kind;
    if (T==='fan'){ for (let i=0;i<9;i++){ const rib = box(0.05, 1.3, 0.03, k.metal); rib.position.set(0, 0.65, 0); const piv = new THREE.Group(); piv.rotation.z = -0.9 + i*0.225; piv.add(rib); g.add(piv); const pan = box(0.24, 0.9, 0.02, M(sp.rune, {side:THREE.DoubleSide, emissive:sp.rune, emissiveIntensity:0.3})); pan.position.set(0, 0.85, 0.02); const pv2 = new THREE.Group(); pv2.rotation.z = -0.9 + i*0.225; pv2.add(pan); g.add(pv2); } tip = 0.8; }
    else { const R = T==='disc' ? 0.45 : 0.55; if (T==='disc'){ g.add(rot(cyl(R, R, 0.1, k.metal, 20), Math.PI/2, 0, 0)); g.add(rot(cyl(R*0.4, R*0.4, 0.12, k.edge, 16), Math.PI/2, 0, 0)); }
      else { g.add(tor(R, 0.07, k.metal, 6, 24)); g.add(tor(R + 0.06, 0.03, k.edge, 4, 24)); const n = T==='star' ? 12 : T==='star4' ? 4 : 0; for (let i=0;i<n;i++){ const bl = cone(T==='star4' ? 0.18 : 0.08, T==='star4' ? 0.6 : 0.3, k.edge, 4); const a2 = i*Math.PI*2/n; bl.position.set(Math.cos(a2)*(R + 0.15), Math.sin(a2)*(R + 0.15), 0); bl.rotation.z = a2 - Math.PI/2; bl.scale.z = 0.3; g.add(bl); } if (T==='star4') g.add(oct(0.15, k.gem)); }
      g.position.y = 0; g.userData.spinDisc = true; tip = 0; }
    if (sp.flame) flames(g, 5, sp.flame, -0.2, 0.8, 0.4); }
  if (sp.extra){ ASM.build(sp.extra, g, anims); g.userData.anims = (g.userData.anims || []).concat(anims); }
  return finishMyth(g, rar, k, tip, it); }

function finishMyth(g, rar, k, tipY, it){ if (!g.userData.tip) tipMark(g, tipY); if (!g.userData.glow) aura(g, rar, k, Math.max(0.8, tipY)); g.userData.myth = it.myth; return g; }
const EYEM = c => M(c, {emissive:c, emissiveIntensity:1});

function W_book(k, rar, arch){ const g = new THREE.Group(); const cov = {tome:0x6a1a2a, grimoire:0x1c3a6a, psalter:0xe8e0c8}[arch] || 0x4a2a6a, gcol = {tome:'rgba(255,226,122,.8)', grimoire:'rgba(159,232,255,.8)', psalter:'rgba(255,255,255,.8)'}[arch];
  g.add(at(box(1.0, 1.35, 0.26, M(cov, {roughness:0.5})), 0, 1.3, 0)); g.add(at(box(0.9, 1.25, 0.2, M(0xf4ead0)), 0.04, 1.3, 0)); g.add(at(box(0.12, 1.35, 0.3, M(cov, {metalness:0.3})), -0.5, 1.3, 0));
  for (const [x, y] of [[-0.46, 1.9], [0.46, 1.9], [-0.46, 0.7], [0.46, 0.7]]) g.add(at(box(0.18, 0.18, 0.32, k.accent), x, y, 0));
  g.add(at(oct(0.2, k.gem || EYE(0xffe27a)), 0, 1.3, 0.16)); const gs = glow(gcol, 1.4 + rar*0.25); gs.position.set(0, 1.3, 0.3); g.add(gs); if (rar >= 3) for (let i=0;i<5;i++){ const m = glow(gcol, 0.3); m.position.set(Math.cos(i*1.25)*0.9, 1.3 + Math.sin(i*1.25)*0.9, 0.2); m.userData.ember = 1; g.add(m); }
  tipMark(g, 2.2); return g; }
function W_lyre(k, rar){ const g = new THREE.Group(); g.add(at(cyl(0.06, 0.07, 2.2, M(0x6a4422)), 0, 0.9, 0)); g.add(at(tor(0.6, 0.06, k.accent, 6, 20), 0, 2.2, 0)); g.add(at(box(0.07, 0.9, 0.07, k.accent), 0, 2.2, 0)); for (const x of [-0.3, -0.1, 0.1, 0.3]) g.add(at(box(0.02, 1.0, 0.02, M(0xffe27a)), x, 2.2, 0)); const gs = glow('rgba(255,200,100,.8)', 1.4 + rar*0.2); gs.position.set(0, 2.2, 0); g.add(gs); tipMark(g, 3.0); return g; }
function weapon(it){
  const w = it || {arch:'blade', rar:0}; const rar = w.rar||0, ww = w.world||0, k = mats(rar, ww, w.special); const T = w.type || 'Sword';
  if (w.ti === -1) { const g = new THREE.Group(); g.add(at(cyl(0.07, 0.09, 2.2, M(0x8a5a30)), 0, 0.8, 0)); g.add(at(rot(cyl(0.04,0.05,0.5,M(0x8a5a30)),0,0,0.8), 0.15, 1.2, 0)); tipMark(g, 1.9); return g; }
  if (w.special==='atomic') return W_sword(k, 4, {slime:true});
  if (w.myth) return mythWeapon(w);
  switch (T){
    case 'Cutlass': return W_sword(k, rar, {curve:true});
    case 'Greatsword': return W_sword(k, rar, {great:true});
    case 'Glacier Blade': return W_sword(k, rar, {ice:true});
    case 'Harpoon': return W_pole(k, rar, {kind:'harpoon'});
    case 'Trident': return W_pole(k, rar, {kind:'trident'});
    case 'Halberd': return W_pole(k, rar, {kind:'halberd'});
    case 'Frost Lance': return W_pole(k, rar, {lance:true});
    case 'Spear': return W_pole(k, rar, {});
    case 'Flintlock': return W_gun(k, rar);
    case 'Crossbow': return W_xbow(k, rar);
    case 'Rimebow': return W_bow(k, rar, {ice:true});
    case 'Bow': return W_bow(k, rar, {});
    case 'Anchor': return W_heavy(k, rar, {kind:'anchor'});
    case 'Flail': return W_heavy(k, rar, {kind:'flail'});
    case 'Mammoth Maul': return W_heavy(k, rar, {kind:'maul', ice:true});
    case 'Club': return W_heavy(k, rar, {kind:'club'});
    case 'Scythe': return W_scythe(k, rar);
    case 'Ice Claws': return W_claws(k, rar, {claws:true, ice:true});
    case 'Fists': return W_claws(k, rar, {});
  }
  if (w.arch==='lyre') return W_lyre(k, rar); if (w.arch==='tome' || w.arch==='grimoire' || w.arch==='psalter') return W_book(k, rar, w.arch);
  return ({fist:() => W_claws(k, rar), ranged:() => W_bow(k, rar), heavy:() => W_heavy(k, rar, {kind:'club'}), pole:() => W_pole(k, rar), scythe:() => W_scythe(k, rar)}[w.arch] || (() => W_sword(k, rar)))();
}
/* How each weapon is held: arm poses (rotation x, z) + weapon transform inside the hand. */
function holdOf(w){ const sp0 = w && w.myth ? legendSpec(w.myth) : null; if (sp0 && sp0.hold){ const ov = {gun:{arch:'ranged', type:'Flintlock'}, staff:{arch:'staff'}, heavy:{arch:'heavy'}, thrown:{arch:'thrown'}, pole:{arch:'pole'}, blade:{arch:'blade'}, bow:{arch:'ranged'}}[sp0.hold]; if (ov) return holdOf(Object.assign({}, ov, {rar:w.rar})); }
  const T = (w && w.type) || 'Sword', A = (w && w.arch) || 'blade';
  if (w && w.ti === -1) return {R:[-0.9, 0.12], L:[-0.35, -0.15], hand:'R', wr:[Math.PI/2 - 0.3, 0, 0], style:'blade'};
  if (A==='katana') return {R:[-1.0, 0.2], L:[-1.05, -0.45], hand:'R', wr:[Math.PI/2 - 0.55, 0, 0], style:'katana'};
  if (A==='tome' || A==='grimoire' || A==='psalter') return {R:[-1.35, 0.15], L:[-1.35, -0.25], hand:'R', wr:[Math.PI/2, 0, Math.PI/2], style:'scroll'};
  if (A==='lyre') return {R:[-0.55, 0.15], L:[-0.35, -0.15], hand:'R', wr:[0.25, 0, 0], style:'staff'};
  if (A==='staff') return {R:[-0.55, 0.15], L:[-0.35, -0.15], hand:'R', wr:[0.25, 0, 0], style:'staff'};
  if (A==='thrown') return {R:[-1.2, 0.35], L:[-0.6, -0.2], hand:'R', wr:[Math.PI/2, 0, 0], style:'thrown'};
  if (w && w.myth === 'dragon_scroll') return {R:[-1.35, 0.15], L:[-1.35, -0.25], hand:'R', wr:[Math.PI/2, 0, Math.PI/2], style:'scroll'};
  if (T==='Flintlock') return {R:[-1.5, 0.05], L:[-0.25, -0.15], hand:'R', wr:[Math.PI, 0, 0], style:'gun'};
  if (T==='Crossbow') return {R:[-1.45, 0.05], L:[-1.5, -0.4], hand:'R', wr:[Math.PI, 0, 0], style:'xbow'};
  if (A==='ranged') return {R:[-1.45, 0.4], L:[-1.5, -0.08], hand:'L', wr:[Math.PI/2, 0, 0], style:'bow'};
  if (A==='fist') return {R:[-1.25, 0.3], L:[-1.45, -0.3], hand:'both', wr:[0, 0, 0], style:'fist'};
  if (A==='pole') return {R:[-0.55, 0.1], L:[-1.15, -0.35], hand:'R', wr:[1.8, 0, 0], style:'pole'};
  if (A==='scythe') return {R:[-0.8, 0.15], L:[-0.95, -0.45], hand:'R', wr:[0.35, 0, 0], style:'scythe'};
  if (A==='heavy') return {R:[-0.75, 0.15], L:[-0.8, -0.5], hand:'R', wr:[0.55, 0, 0], style:'heavy'};
  if (T==='Greatsword') return {R:[-0.85, 0.12], L:[-0.9, -0.5], hand:'R', wr:[Math.PI/2 - 0.45, 0, 0], style:'blade'};
  return {R:[-0.9, 0.12], L:[-0.35, -0.15], hand:'R', wr:[Math.PI/2 - 0.3, 0, 0], style:'blade'};
}

/* ---------- armour + hero ---------- */
const FACE = {};
function faceTex(eye='#1b1622'){ if (FACE[eye]) return FACE[eye]; const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  g.fillStyle = eye; g.beginPath(); g.ellipse(44,54,9,13,0,0,7); g.ellipse(84,54,9,13,0,0,7); g.fill(); g.fillStyle='#fff'; g.beginPath(); g.ellipse(47,49,3,4,0,0,7); g.ellipse(87,49,3,4,0,0,7); g.fill();
  g.strokeStyle = eye; g.lineWidth = 5; g.lineCap='round'; g.beginPath(); g.moveTo(40,36); g.lineTo(54,40); g.moveTo(88,36); g.lineTo(74,40); g.stroke(); g.beginPath(); g.arc(64,80,16,0.25,Math.PI-0.25); g.stroke();
  return (FACE[eye] = new THREE.CanvasTexture(c)); }
const CLOTH = { // per world, per role, per rarity
  plate:[[0x9aa6b2,0xb4c2d2,0x8f87b8,0xf2e6c0,0x2a1820],[0x8fa6b8,0x9ec8d8,0x6f86c8,0xf0f8ff,0x281428],[0xa89a86,0xc8a878,0x9a6a8a,0xfff0d0,0x2a1410],[0xb8ccd8,0xd8f0ff,0x9ab0ff,0xffffff,0x1a1430]],
  leather:[[0x8a5a34,0x5a6a3a,0x3a3a4a,0x2a3a2a,0x1a1418],[0x7a5a3a,0x2a5a6a,0x2a3a5a,0x1e3a4a,0x1a1424],[0x9a6a3a,0x7a4a2a,0x4a2a3a,0x3a2a1a,0x1a1010],[0x7a8a9a,0x4a6a8a,0x3a4a7a,0x2a3a5a,0x14142a]],
  robe:[[0x6a7bd8,0x2f6fd8,0x3a3a46,0x1c2a1c,0x2a0a18],[0x4a8ab0,0x1f6a8a,0x2a3a7a,0xeef6ff,0x24102a],[0xc89a5a,0xa05a2a,0x6a2a5a,0x2a1a0a,0x200808],[0x9ab8d8,0x5a7ab8,0x4a4a9a,0xf4fbff,0x1a1030]]};
const MYTHARM = {
  achilles_armour:{c:0xcd8a3a, t:0xffcf4a, cape:0xa02020, head:'crest'}, athena_aegis:{c:0xe8d080, t:0xffffff, cape:0x2a4a8a, head:'owl', shield:true},
  fafnir_scale:{c:0x1f4a3a, t:0xff6a20, cape:0x14302a, head:'dragon', scales:true, big:true, noCape:true},
  ares_armour:{c:0x6a0a14, t:0xff3030, cape:0x200008, head:'ares'}, talos_shell:{c:0xb87333, t:0xffa040, cape:0x5a2a10, head:'talos', big:true, noCape:true},
  nemean_hide:{c:0xc89a40, t:0xffd070, cape:0x8a6020, head:'lion'}, hermes_wings:{c:0xf0f4ff, t:0x40c0ff, cape:0x2a8ac0, head:'hermes', skirt:true},
  hades_helm:{c:0x14101c, t:0x40ffc0, cape:0x0a0810, head:'hades'}, golden_fleece:{c:0xd8a020, t:0xfff0a0, cape:0xc08010, head:'ram', fleece:true, noCape:true},
  hecate_robes:{c:0x3a1a5a, t:0xc080ff, cape:0x200a30, head:'hood3', torches:true}, merlin_mantle:{c:0x1a2a6a, t:0xfff0a0, cape:0x0a1440, head:'merlin', stars:true},
  prometheus_fire:{c:0x8a2a10, t:0xff8a30, cape:0x3a0a04, head:'flame', fire:true, chains:true}, odin_cloak:{c:0x4a4a52, t:0xbfd8ff, cape:0x2a2a30, head:'odin', ravens:true}};
function buildHero(P, opts={}){
  const w = (P.eq && P.eq.weapon) || {arch:'blade', rar:0}, a = (P.eq && P.eq.armour) || {role:'robe', rar:0};
  const g = new THREE.Group(); const ar = a.rar || 0, role = (a.role === 'vestment' ? 'robe' : a.role) || 'robe', aw = a.world || 0, shadowSet = a.special === 'shadow';
  const skin = M(opts.skin || 0xffd27f); const pants = M(ar >= 3 ? 0x2a2440 : 0x34375a);
  const MY = a.myth ? (MYTHARM[a.myth] || legendSpec(a.myth)) : null; const clothCol = shadowSet ? 0x15121c : MY ? MY.c : CLOTH[role][aw][ar]; const metal = role==='plate' && !shadowSet;
  const cloth = M(clothCol, metal ? {metalness: ar===4 ? 0.7 : 0.55, roughness: ar>=3 ? 0.25 : 0.35, emissive: ar===4 ? 0x300008 : 0, emissiveIntensity: 0.5} : {roughness: ar>=3 ? 0.45 : 0.6});
  const trimCol = MY ? MY.t : shadowSet ? 0x8a3cff : ar===4 ? RUNE[aw][4] : ar===3 ? 0xffd76a : RC[ar];
  const trim = M(trimCol, {emissive: ar>=3 || shadowSet ? trimCol : 0, emissiveIntensity: ar>=3 || shadowSet ? 0.65 : 0, metalness:0.6, roughness:0.25});
  const accent2 = M(new THREE.Color(clothCol).multiplyScalar(1.3), metal ? {metalness:0.55, roughness:0.3} : {});
  const body = new THREE.Group(); g.add(body);
  const legL = new THREE.Group(), legR = new THREE.Group(); legL.position.set(-0.5, 2, 0); legR.position.set(0.5, 2, 0); legL.add(at(box(0.95, 2, 0.95, pants), 0, -1, 0)); legR.add(at(box(0.95, 2, 0.95, pants), 0, -1, 0));
  const boot = M(ar>=3 ? 0x3a2414 : 0x2a1e18); legL.add(at(box(1.0, 0.45, 1.05, boot), 0, -1.78, 0.04)); legR.add(at(box(1.0, 0.45, 1.05, boot), 0, -1.78, 0.04)); legL.rotation.x = 0.2; legR.rotation.x = -0.2; body.add(legL, legR);
  const torso = at(box(2, 2, 1, cloth), 0, 3, 0); body.add(torso);
  // role silhouettes
  if (role==='plate' && !shadowSet){ body.add(at(box(1.7, 1.5, 0.12, accent2), 0, 3.15, 0.53)); body.add(at(box(2.1, 0.3, 1.1, M(0x3a2a1a)), 0, 2.05, 0)); body.add(at(box(0.4, 0.3, 0.1, trim), 0, 2.05, 0.56));
    if (ar >= 1) for (let i=0;i<3;i++) body.add(at(box(0.55, 0.45, 1.05, accent2), -0.62 + i*0.62, 1.65, 0)); // tassets
    if (ar >= 3){ const em = new THREE.Mesh(new THREE.CircleGeometry(0.32, 6), new THREE.MeshBasicMaterial({color:trimCol})); em.position.set(0, 3.25, 0.6); body.add(em); body.add(at(box(0.08, 1.4, 0.04, trim), -0.55, 3.15, 0.6)); body.add(at(box(0.08, 1.4, 0.04, trim), 0.55, 3.15, 0.6)); } }
  if (role==='leather' && !shadowSet){ for (const sx of [-1,1]){ const tail = box(0.95, 1.6, 0.12, cloth); tail.position.set(sx*0.5, 1.3, -0.45); tail.rotation.x = 0.12; body.add(tail); g.userData.tails = (g.userData.tails||[]).concat([tail]); }
    body.add(at(box(2.1, 0.22, 1.05, M(0x3a2412)), 0, 2.2, 0)); body.add(at(box(0.32, 0.32, 0.1, trim), 0, 2.2, 0.55));
    const strap = box(0.22, 2.4, 0.06, M(0x4a2a14)); strap.position.set(0, 3, 0.52); strap.rotation.z = 0.75; body.add(strap);
    const col = box(2.2, 0.5, 1.2, accent2); col.position.set(0, 3.95, -0.05); body.add(col);
    if (ar >= 2){ const sc = box(1.3, 0.35, 1.1, M(ar>=3 ? 0x7a1828 : 0x5a2a2a)); sc.position.set(0, 4.15, 0.05); body.add(sc); } }
  if (role==='robe' || shadowSet){ const robe = cyl(0.98, 1.4, 2.2, cloth, 6); robe.rotation.y = Math.PI/6; robe.position.y = 1.15; robe.scale.z = 0.7; body.add(robe);
    body.add(at(box(2.08, 0.28, 1.06, trim), 0, 2.15, 0)); if (!shadowSet){ body.add(at(box(0.22, 1.6, 0.06, trim), 0, 3.05, 0.52)); const ring = tor(1.0, 0.05, trim, 4, 24); ring.rotation.x = Math.PI/2; ring.position.y = 0.1; ring.scale.y = 0.7; body.add(ring); } }
  if (shadowSet){ for (const sx of [-1,1]) body.add(at(box(0.5, 2.6, 1.05, cloth), sx*0.75, 1.3, 0)); body.add(at(box(0.08, 2, 0.02, trim), 0, 3, 0.51));
    const coat = box(2.2, 3.6, 1.15, M(0x0c0a12, {roughness:0.5})); coat.position.set(0, 2.15, -0.05); body.add(coat); for (const sx of [-1,1]){ const tl = box(0.9, 2.2, 0.08, M(0x0c0a12, {side:THREE.DoubleSide})); tl.position.set(sx*0.5, 0.4, -0.5); tl.rotation.x = 0.15; body.add(tl); (g.userData.tails = g.userData.tails || []).push(tl); }
    for (const x of [-0.55, 0.55]) body.add(at(box(0.06, 3.4, 0.03, trim), x, 2.3, 0.58)); body.add(at(box(2.25, 0.08, 1.2, trim), 0, 2.15, 0)); body.add(at(box(2.3, 0.7, 1.3, M(0x0c0a12)), 0, 4.0, -0.05));
    const slime = M(0x6a2aff, {emissive:0x5a10ff, emissiveIntensity:1.1, transparent:true, opacity:0.85, roughness:0.1}); for (let i=0;i<8;i++){ const dr = sph(0.08 + (i%3)*0.03, slime, 8, 6); dr.position.set(-0.9 + i*0.26, 0.4 - (i%2)*0.25, -0.5 + (i%3)*0.1); dr.scale.y = 1.6; body.add(dr); } }
  // shoulders: grow with rarity
  if (ar >= 1 || shadowSet){ for (const sx of [-1,1]){ const pd = metal ? sph(0.68, cloth, 12, 8) : box(1.05, 0.45, 1.15, accent2); if (metal){ pd.scale.set(1, 0.65, 1); } pd.position.set(sx*1.3, 3.95, 0); body.add(pd);
      if (ar >= 3 && !shadowSet){ const fil = tor(0.5, 0.05, trim, 4, 16, Math.PI); fil.position.set(sx*1.3, 4.05, 0); fil.rotation.y = Math.PI/2; body.add(fil); const wg = box(0.12, 0.9, 0.8, trim); wg.position.set(sx*1.75, 4.35, -0.1); wg.rotation.z = -sx*0.5; body.add(wg); }
      if (ar === 4 || shadowSet){ for (let i=0;i<3;i++){ const sp = cone(0.14, 0.75 - i*0.12, trim, 6); sp.position.set(sx*(1.2 + i*0.22), 4.35 + (i===1?0.12:0), -0.3 + i*0.3); sp.rotation.z = -sx*(0.3 + i*0.2); body.add(sp); } } } }
  // cape for Legendary+ (gradient lining), long duster for mythic leather
  if ((ar >= 3 || shadowSet) && !(MY && MY.noCape)){ const capeC = MY ? MY.cape : shadowSet ? 0x0c0a12 : ar===4 ? 0x5a0a1a : [0xd8a020,0x2a8ab0,0xc06a20,0x6ab0e0][aw];
    const cape = new THREE.Group(); cape.position.set(0, 4.0, -0.58); const cm = M(capeC, {side:THREE.DoubleSide, roughness:0.6, emissive: ar===4 ? 0x200008 : 0, emissiveIntensity:0.6});
    for (let i=0;i<4;i++){ const seg = box(2.0 - i*0.08, 0.95, 0.06, cm); seg.position.set(0, -0.48 - i*0.9, 0); cape.add(seg); } const hem = box(1.8, 0.1, 0.08, trim); hem.position.y = -3.6; cape.add(hem); cape.rotation.x = 0.1; body.add(cape); g.userData.cape = cape; }
  // arms with hands (pivot at the shoulders)
  const armL = new THREE.Group(), armR = new THREE.Group(); armL.position.set(-1.5, 3.9, 0); armR.position.set(1.5, 3.9, 0);
  for (const arm of [armL, armR]){ arm.add(at(box(0.95, 2, 0.95, cloth), 0, -0.95, 0)); if (ar >= 2 && metal) arm.add(at(box(1.0, 0.5, 1.0, accent2), 0, -1.5, 0)); if (ar >= 3) arm.add(at(box(1.0, 0.12, 1.0, trim), 0, -1.8, 0)); const hand = new THREE.Group(); hand.position.set(0, -2.05, 0); hand.add(box(0.9, 0.5, 0.9, skin)); arm.add(hand); arm.userData.hand = hand; }
  body.add(armL, armR);
  // weapon in hand
  const H = holdOf(w); let wpn = weapon(w), wpnL = null;
  if (H.hand==='both'){ wpn.position.set(0, 0, 0); armR.userData.hand.add(wpn); wpnL = weapon(w); armL.userData.hand.add(wpnL); armR.userData.hand.children[0].visible = false; armL.userData.hand.children[0].visible = false; }
  else { const hd = (H.hand==='L' ? armL : armR).userData.hand; wpn.rotation.set(...H.wr); wpn.scale.setScalar(H.style==='bow' ? 1.25 : H.style==='gun' ? 1.5 : 1.3); hd.add(wpn); }
  armR.rotation.x = H.R[0]; armR.rotation.z = H.R[1]; armL.rotation.x = H.L[0]; armL.rotation.z = H.L[1];
  // head
  const head = new THREE.Group(); head.position.y = 4.65; body.add(head); head.add(cyl(0.68, 0.68, 1.25, skin, 24));
  const face = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.3), new THREE.MeshBasicMaterial({map:faceTex(opts.eye || '#1b1622'), transparent:true})); face.position.set(0, 0, 0.69); head.add(face);
  const hairC = opts.hair || 0x6b3d22;
  if (MY && MY.head){ mythHead(head, MY, trim, cloth); }
  else if (shadowSet){ const hood = sph(0.85, M(0x0c0a12), 16, 12); hood.scale.set(1, 1.05, 1.05); hood.position.set(0, 0.15, -0.12); head.add(hood); head.add(at(box(1.3, 0.55, 0.1, M(0x0c0a12)), 0, -0.3, 0.68)); head.add(at(box(1.1, 0.08, 0.02, trim), 0, 0.12, 0.74)); }
  else if (role==='plate' && ar >= 1){ const hm = cyl(0.78, 0.78, 1.1, cloth, 20); hm.position.y = 0.25; head.add(hm); head.add(at(box(1.3, 0.15, 0.1, M(0x1b1622)), 0, 0.05, 0.75));
    if (ar >= 3){ for (const sx of [-1,1]){ const wg = box(0.1, 0.8, 0.6, trim); wg.position.set(sx*0.82, 0.6, -0.1); wg.rotation.z = -sx*0.5; head.add(wg); } const pl = cone(0.18, 0.9, trim, 6); pl.position.y = 1.2; head.add(pl); }
    if (ar === 4){ for (const sx of [-1,1]){ const hn = cone(0.16, 1.1, M(0x1a0a10, {metalness:0.6}), 6); hn.position.set(sx*0.7, 1.0, 0); hn.rotation.z = -sx*0.6; head.add(hn); } } }
  else if (role==='robe' && ar >= 1){ if (ar >= 3){ const hat = cone(0.95, 1.9, cloth, 16); hat.position.y = 1.35; hat.rotation.z = -0.15; head.add(hat); head.add(at(cyl(1.2, 1.2, 0.1, cloth, 24), 0, 0.6, 0)); head.add(at(cyl(0.98, 0.98, 0.15, trim, 24), 0, 0.72, 0)); const st = oct(0.16, trim); st.position.set(0.25, 2.2, 0); head.add(st); }
    else { const hood = sph(0.82, cloth, 16, 12); hood.position.set(0, 0.12, -0.15); head.add(hood); } }
  else if (role==='leather' && ar >= 2){ head.add(at(box(1.45, 0.45, 1.45, M(hairC)), 0, 0.7, 0)); const hat = cyl(1.0, 1.05, 0.12, M(0x2a1a10), 20); hat.position.y = 0.95; head.add(hat); head.add(at(cyl(0.6, 0.7, 0.5, M(0x2a1a10), 20), 0, 1.25, 0)); if (ar >= 3) head.add(at(cyl(0.71, 0.71, 0.12, trim, 20), 0, 1.08, 0)); }
  else { head.add(at(box(1.45, 0.45, 1.45, M(hairC)), 0, 0.7, 0)); head.add(at(box(1.45, 0.7, 0.3, M(hairC)), 0, 0.35, -0.6)); }
  if (ar === 4 && role !== 'plate' && !(MY && MY.head)){ const halo = tor(0.75, 0.05, M(trimCol, {emissive:trimCol, emissiveIntensity:1.5}), 4, 28); halo.rotation.x = Math.PI/2; halo.position.y = 1.4; head.add(halo); g.userData.halo = halo; }
  // auras for Legendary / Mythical / Shadow
  if (ar >= 3 || shadowSet){ const col = shadowSet ? 0x8a3cff : trimCol; const au = glow(rgba(col, ar>=4||shadowSet ? 0.5 : 0.3), ar>=5 ? 9 : ar===4 ? 7.5 : 6); au.position.y = 2.8; g.add(au); g.userData.aura = au;
    g.userData.orbs = []; for (let i=0;i<(ar>=5 ? 7 : ar===4||shadowSet ? 5 : 3);i++){ const o = glow(rgba(col, 0.95), ar>=4 ? 0.65 : 0.45); g.add(o); g.userData.orbs.push(o); }
    if (ar === 4 && !shadowSet){ g.userData.embers = []; for (let i=0;i<10;i++){ const e = glow(rgba(0xff5a2a, 0.9), 0.3); e.userData.ph = Math.random(); g.add(e); g.userData.embers.push(e); } } }
  if (MY) mythExtras(g, body, armL, legL, legR, MY, trim);
  if (MY && MY.parts){ const an = [], Pp = MY.parts; if (Pp.head) ASM.build(Pp.head, head, an); if (Pp.body) ASM.build(Pp.body, body, an); if (Pp.armL) ASM.build(Pp.armL, armL, an); if (Pp.armR) ASM.build(Pp.armR, armR, an); if (Pp.back) ASM.build(Pp.back, body, an); if (Pp.legs){ ASM.build(Pp.legs, legL, an); ASM.build(Pp.legs, legR, an); } g.userData.anims = an; }
  g.userData.parts = {body, armR, armL, legL, legR, head, wpn, wpnL, hold:H}; g.userData.weaponItem = w;
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.scale.setScalar(MY && MY.big ? 0.6 : 0.52); return g;
}
function mythHead(head, MY, trim, cloth){ const h = MY.head;
  if (h==='crest'){ const hm = cyl(0.8, 0.8, 1.1, cloth, 20); hm.position.y = 0.25; head.add(hm); head.add(at(box(1.0, 0.5, 0.1, M(0x1b1622)), 0, -0.05, 0.76)); head.add(at(box(0.12, 0.3, 1.0, cloth), 0, -0.05, 0.75)); const cr = box(0.22, 0.6, 1.9, M(0xc02020)); cr.position.set(0, 1.1, -0.1); head.add(cr); head.add(at(box(0.3, 0.12, 1.7, trim), 0, 0.85, -0.1)); }
  const C = (c, o) => M(c, o||{}); const gold = C(0xffcf4a, {metalness:0.8, roughness:0.25});
  if (h==='nemes'){ const hd = box(1.6, 1.0, 1.5, C(0xf4e8b0)); hd.position.set(0, 0.6, -0.05); head.add(hd); for (let i=0;i<5;i++) head.add(at(box(1.62, 0.08, 1.52, C(0x1a5aa0)), 0, 0.25 + i*0.2, -0.05)); for (const sx of [-1,1]){ const lap = box(0.45, 1.3, 0.3, C(0xf4e8b0)); lap.position.set(sx*0.7, -0.4, 0.3); head.add(lap); for (let i=0;i<4;i++) head.add(at(box(0.47, 0.06, 0.32, C(0x1a5aa0)), sx*0.7, -0.9 + i*0.3, 0.3)); } const cobra = cone(0.1, 0.4, gold, 5); cobra.position.set(0, 1.05, 0.72); head.add(cobra); head.add(at(box(0.12, 0.5, 0.1, C(0x2a2a8a)), 0, -0.6, 0.66)); }
  if (h==='jackal' || h==='wolf' || h==='falcon'){ const col = h==='jackal' ? 0x14141a : h==='wolf' ? 0x5a5a66 : 0x3a6ab0; const hd = box(1.5, 1.4, 1.5, C(col)); hd.position.y = 0.2; head.add(hd); const sn = h==='falcon' ? cone(0.35, 0.8, gold, 4) : box(0.7, 0.55, 0.9, C(col)); if (h==='falcon'){ sn.rotation.x = Math.PI/2 + 0.4; sn.position.set(0, -0.05, 1.05); } else sn.position.set(0, -0.15, 1.05); head.add(sn);
    if (h!=='falcon'){ for (const sx of [-1,1]){ const ear = cone(0.22, 0.9, C(col), 4); ear.position.set(sx*0.45, 1.25, -0.1); head.add(ear); } head.add(at(box(0.25, 0.15, 0.1, C(0x111111)), 0, -0.05, 1.5)); } for (const sx of [-1,1]) head.add(at(sph(0.1, EYEM(h==='jackal' ? 0xffcf4a : h==='wolf' ? 0x9fe8ff : 0xffcf4a)), sx*0.35, 0.35, 0.77));
    if (h==='wolf'){ for (let i=0;i<4;i++){ const f = cone(0.06, 0.22, C(0xffffff), 4); f.position.set(-0.2 + i*0.13, -0.42, 1.45); f.rotation.x = Math.PI; head.add(f); } } if (h==='jackal'){ head.add(at(box(1.55, 0.12, 1.55, gold), 0, 0.85, 0)); } if (h==='falcon'){ head.add(at(box(0.5, 0.06, 0.05, C(0x111111)), 0.3, 0.2, 0.77)); } }
  if (h==='sundisk'){ head.add(at(cyl(0.8, 0.8, 1.15, gold, 20), 0, 0.2, 0)); head.add(at(box(1.1, 0.18, 0.08, C(0x1b1622)), 0, 0.05, 0.78)); const d = sph(0.7, C(0xffd040, {emissive:0xffa010, emissiveIntensity:1.4}), 18, 12); d.position.y = 1.6; d.scale.z = 0.3; head.add(d); for (const sx of [-1,1]){ const cb = cone(0.1, 0.5, C(0x2a8a5a), 5); cb.position.set(sx*0.55, 1.2, 0.2); head.add(cb); } }
  if (h==='mummy'){ for (let i=0;i<7;i++){ const w = box(1.42, 0.16, 1.42, C(i%2 ? 0xd8ccb0 : 0xc8bc9a)); w.position.y = -0.55 + i*0.2; w.rotation.y = (i%3 - 1)*0.08; head.add(w); } for (const sx of [-1,1]) head.add(at(sph(0.09, EYEM(0x40ffa0)), sx*0.28, 0.1, 0.72)); }
  if (h==='scarab'){ const hm = sph(0.85, C(0x1a5a4a, {metalness:0.7, roughness:0.2}), 16, 10); hm.scale.y = 0.8; hm.position.y = 0.35; head.add(hm); for (const sx of [-1,1]){ const an = cyl(0.03, 0.03, 0.8, C(0x1a3a3a)); an.position.set(sx*0.3, 1.2, 0.3); an.rotation.z = -sx*0.5; head.add(an); } head.add(at(box(1.1, 0.15, 0.08, C(0x40ffd0, {emissive:0x20c0a0, emissiveIntensity:1.2})), 0, 0.05, 0.78)); }
  if (h==='vulture'){ head.add(at(cyl(0.8, 0.8, 0.9, gold, 20), 0, 0.4, 0)); for (const sx of [-1,1]){ const w = box(0.25, 1.2, 0.9, C(0x2a8aff)); w.position.set(sx*0.8, 0.2, -0.1); head.add(w); } const vh = cone(0.12, 0.45, gold, 5); vh.position.set(0, 1.0, 0.75); head.add(vh); head.add(at(cyl(0.3, 0.45, 0.5, C(0xf4f4ff), 12), 0, 1.15, 0)); }
  if (h==='berserker'){ const hm = box(1.6, 1.45, 1.6, C(0x16161c, {metalness:0.75, roughness:0.3})); hm.position.y = 0.2; head.add(hm); const jaw = box(1.2, 0.4, 0.5, C(0x16161c, {metalness:0.75})); jaw.position.set(0, -0.35, 0.75); head.add(jaw); for (let i=0;i<5;i++){ const f = cone(0.07, 0.25, C(0xd8d0c0), 4); f.position.set(-0.4 + i*0.2, -0.2, 1.0); f.rotation.x = Math.PI; head.add(f); }
    for (const sx of [-1,1]){ head.add(at(box(0.32, 0.1, 0.05, C(0xff2020, {emissive:0xff0000, emissiveIntensity:2})), sx*0.33, 0.3, 0.81)); const hn = cone(0.14, 0.9, C(0x16161c), 5); hn.position.set(sx*0.6, 1.2, -0.2); hn.rotation.set(-0.5, 0, -sx*0.4); head.add(hn); } for (let i=0;i<5;i++){ const sp = cone(0.1, 0.5, C(0x16161c), 4); sp.position.set(0, 1.0, 0.5 - i*0.3); sp.rotation.x = -0.6; head.add(sp); } const sm = glow('rgba(255,30,30,.5)', 1.6); sm.position.set(0, 0.3, 0.9); head.add(sm); }
  if (h==='valkyrie' || h==='thor'){ const hm = sph(0.82, C(h==='thor' ? 0x8a96a8 : 0xd8e0ea, {metalness:0.75, roughness:0.25}), 16, 10); hm.scale.y = 0.75; hm.position.y = 0.45; head.add(hm); head.add(at(box(0.15, 0.7, 0.15, C(0x8a96a8)), 0, -0.05, 0.77)); for (const sx of [-1,1]){ const w = new THREE.Group(); for (let i=0;i<4;i++){ const f = box(0.08, 0.35 + i*0.12, 0.55 - i*0.07, C(0xffffff)); f.position.set(0, i*0.15, -i*0.1); w.add(f); } w.position.set(sx*0.85, 0.7, -0.1); w.rotation.z = -sx*0.5; head.add(w); } if (h==='valkyrie') head.add(at(box(1.45, 0.9, 0.3, C(0xf4e080)), 0, -0.15, -0.65)); else head.add(at(box(1.2, 0.8, 0.3, C(0xd8803a)), 0, -0.6, 0.55)); }
  if (h==='loki'){ head.add(at(box(1.45, 0.45, 1.45, C(0x1a1a1a)), 0, 0.7, 0)); head.add(at(box(1.5, 0.25, 0.3, gold), 0, 0.55, 0.62)); for (const sx of [-1,1]){ const hn = new THREE.Group(); for (let i=0;i<6;i++){ const s = cyl(0.1 - i*0.012, 0.11 - i*0.012, 0.35, gold, 6); s.position.set(sx*i*0.12, i*0.3, -i*0.08 + (i>3 ? (i-3)*0.15 : 0)); s.rotation.z = -sx*0.3; hn.add(s); } hn.position.set(sx*0.55, 0.9, 0.3); head.add(hn); } }
  if (h==='jotunn'){ const hm = box(1.7, 1.5, 1.6, C(0x9fc8e0, {metalness:0.2, roughness:0.15, emissive:0x305070, emissiveIntensity:0.3})); hm.position.y = 0.2; head.add(hm); for (let i=0;i<6;i++){ const ic = cone(0.14, 0.8 + (i%2)*0.4, C(0xe8f8ff, {emissive:0x80c8ff, emissiveIntensity:0.4}), 5); ic.position.set(-0.6 + i*0.24, 1.25, -0.1); ic.rotation.z = (i-2.5)*0.12; head.add(ic); } for (const sx of [-1,1]) head.add(at(sph(0.1, EYEM(0x80e0ff)), sx*0.3, 0.25, 0.82)); head.add(at(box(1.3, 0.8, 0.3, C(0xf4f8ff)), 0, -0.6, 0.6)); }
  if (h==='kabuto' || h==='general'){ const hm = cyl(0.85, 0.95, 0.9, C(h==='general' ? 0x2a6a3a : 0x1a1a1a, {metalness:0.6, roughness:0.3}), 16); hm.position.y = 0.55; head.add(hm); head.add(at(cyl(1.3, 1.3, 0.08, C(h==='general' ? 0x2a6a3a : 0x1a1a1a), 16), 0, 0.15, -0.1)); for (const sx of [-1,1]){ const fl = box(0.5, 0.7, 0.08, C(0x8a1a1a)); fl.position.set(sx*0.95, -0.1, 0); fl.rotation.y = sx*0.4; head.add(fl); }
    if (h==='kabuto'){ const cr = tor(0.7, 0.08, gold, 4, 18, Math.PI); cr.position.set(0, 1.2, 0.5); head.add(cr); head.add(at(box(1.1, 0.45, 0.12, C(0x8a1a1a)), 0, -0.4, 0.72)); } else { head.add(at(cone(0.12, 0.8, C(0xb02020), 6), 0, 1.35, 0)); head.add(at(box(1.0, 0.9, 0.3, C(0x111111)), 0, -0.6, 0.6)); } }
  if (h==='oni'){ const ms = box(1.45, 1.35, 0.3, C(0xc02010)); ms.position.set(0, 0.0, 0.72); head.add(ms); head.add(at(box(1.45, 0.45, 1.45, C(0x1a1a1a)), 0, 0.7, 0)); for (const sx of [-1,1]){ const hn = cone(0.16, 0.9, C(0xffcf4a), 5); hn.position.set(sx*0.45, 1.2, 0.3); hn.rotation.z = -sx*0.3; head.add(hn); head.add(at(sph(0.11, EYEM(0xffd020)), sx*0.3, 0.2, 0.9)); const fg = cone(0.07, 0.3, C(0xffffff), 4); fg.position.set(sx*0.3, -0.45, 0.9); fg.rotation.x = Math.PI; head.add(fg); } }
  if (h==='kitsune'){ head.add(at(box(1.45, 0.45, 1.45, C(0xf4f0f8)), 0, 0.7, 0)); const ms = box(1.1, 1.0, 0.25, C(0xffffff)); ms.position.set(0, 0.0, 0.72); head.add(ms); head.add(at(cone(0.25, 0.6, C(0xffffff), 4), 0, -0.2, 1.0)).rotation.x = Math.PI/2; for (const sx of [-1,1]){ const ear = cone(0.25, 0.7, C(0xffffff), 4); ear.position.set(sx*0.5, 1.15, 0); head.add(ear); head.add(at(box(0.3, 0.06, 0.05, C(0xc02040)), sx*0.25, 0.15, 0.86)); } }
  if (h==='strawhat' || h==='tricorn'){ if (h==='strawhat'){ const hat = cone(1.6, 0.8, C(0xd8c080, {roughness:0.95}), 16); hat.position.y = 1.0; head.add(hat); } else { const hat = new THREE.Group(); hat.add(box(1.9, 0.15, 1.5, C(0x111118))); hat.add(at(box(1.1, 0.6, 1.0, C(0x111118)), 0, 0.35, 0)); for (const sx of [-1,1]){ const f = box(0.6, 0.55, 0.1, C(0x111118)); f.position.set(sx*0.75, 0.3, 0); f.rotation.z = -sx*0.5; hat.add(f); } hat.position.y = 0.75; head.add(hat); head.add(at(box(1.2, 0.5, 0.1, C(0x1a1a24)), 0, -0.35, 0.7)); } head.add(at(box(1.45, 0.4, 1.45, C(0x2a1a10)), 0, 0.55, 0)); }
  if (h==='circlet'){ head.add(at(box(1.45, 0.45, 1.45, C(0x2a1a10)), 0, 0.7, 0)); head.add(at(cyl(0.75, 0.75, 0.15, gold, 20), 0, 0.45, 0)); for (const sx of [-1,1]){ const pl = box(0.06, 1.8, 0.12, C(0xc02010, {emissive:0x600000, emissiveIntensity:0.5})); pl.position.set(sx*0.4, 1.4, -0.2); pl.rotation.z = -sx*0.35; pl.rotation.x = -0.3; head.add(pl); } }
  if (h==='jadecrown'){ head.add(at(box(1.5, 0.3, 1.0, C(0x1a1a1a)), 0, 0.85, 0)); head.add(at(box(1.9, 0.08, 1.2, C(0x1a1a1a)), 0, 1.05, 0)); for (let i=0;i<7;i++){ const s = box(0.04, 0.6, 0.04, C(0x3ac080, {emissive:0x20a060, emissiveIntensity:0.6})); s.position.set(-0.75 + i*0.25, 0.75, 0.6); head.add(s); } head.add(at(box(0.8, 0.6, 0.25, C(0x1a1a1a)), 0, -0.6, 0.55)); }
  if (h==='celtic'){ head.add(at(box(1.5, 0.6, 1.5, C(0x8a3a1a)), 0, 0.65, 0)); head.add(at(cyl(0.75, 0.75, 0.12, gold, 20), 0, 0.4, 0)); const halo = glow('rgba(255,200,60,.8)', 2.6); halo.position.y = 0.9; head.add(halo); }
  if (h==='ravenhood'){ const hood = cone(1.0, 1.8, C(0x14141c), 10); hood.position.set(0, 0.6, -0.15); head.add(hood); const bk = cone(0.25, 0.9, C(0x111111), 4); bk.rotation.x = Math.PI/2; bk.position.set(0, 0.5, 0.9); head.add(bk); for (const sx of [-1,1]) head.add(at(sph(0.08, EYEM(0xc02040)), sx*0.3, 0.6, 0.72)); }
  if (h==='sunhelm'){ head.add(at(cyl(0.8, 0.8, 1.15, gold, 20), 0, 0.2, 0)); head.add(at(box(1.1, 0.16, 0.08, C(0x1b1622)), 0, 0.1, 0.78)); for (let i=0;i<9;i++){ const ry = cone(0.1, 0.6, C(0xffa020, {emissive:0xff8000, emissiveIntensity:0.8}), 4); const a2 = -1.2 + i*0.3; ry.position.set(Math.sin(a2)*0.85, 0.85 + Math.cos(a2)*0.5, -0.1); ry.rotation.z = -a2; head.add(ry); } }
  if (h==='mecha'){ const hm = box(1.6, 1.4, 1.6, C(0xe8eef6, {metalness:0.6, roughness:0.2})); hm.position.y = 0.2; head.add(hm); head.add(at(box(1.3, 0.3, 0.08, C(0x40c0ff, {emissive:0x40c0ff, emissiveIntensity:2})), 0, 0.25, 0.81)); for (const sx of [-1,1]){ const ant = cone(0.08, 0.9, C(0xc02030), 4); ant.position.set(sx*0.45, 1.25, 0.2); ant.rotation.z = -sx*0.5; head.add(ant); head.add(at(box(0.2, 0.6, 0.6, C(0x2a4a8a)), sx*0.85, 0.2, 0)); } head.add(at(box(0.5, 0.2, 0.2, C(0xffcf4a)), 0, 0.95, 0.6)); }
  if (h==='shinobi'){ head.add(at(box(1.45, 0.5, 1.45, C(0x1a1a2a)), 0, 0.7, 0)); head.add(at(box(1.42, 0.65, 1.42, C(0x1a1a2a)), 0, -0.4, 0.02)); head.add(at(box(1.5, 0.16, 1.5, C(0xff3040)), 0, 0.45, 0)); const tl = box(0.14, 0.8, 0.06, C(0xff3040)); tl.position.set(0.3, 0.2, -0.78); tl.rotation.z = 0.4; head.add(tl); }
  if (h==='paladin'){ const hm = cyl(0.82, 0.82, 1.2, C(0xf4f4ff, {metalness:0.7, roughness:0.2}), 20); hm.position.y = 0.2; head.add(hm); head.add(at(box(0.1, 0.9, 0.08, gold), 0, 0.15, 0.82)); head.add(at(box(1.0, 0.1, 0.08, gold), 0, 0.3, 0.82)); const pl = box(0.15, 0.6, 1.2, C(0x2a4aa0)); pl.position.y = 1.0; head.add(pl); }
  if (h==='ram'){ head.add(at(box(1.45, 0.45, 1.45, M(0xffe08a, {roughness:0.95})), 0, 0.7, 0)); for (const sx of [-1,1]){ const hn = tor(0.42, 0.13, M(0xe8d8b0, {flatShading:true}), 6, 12, Math.PI*1.6); hn.position.set(sx*0.8, 0.45, -0.1); hn.rotation.y = Math.PI/2; hn.rotation.x = sx*0.3; head.add(hn); } }
  if (h==='hood3'){ const hood = cone(1.0, 1.9, cloth, 12); hood.position.set(0, 0.75, -0.15); head.add(hood); head.add(at(box(1.35, 0.5, 0.1, M(0x0a0510)), 0, 0.45, 0.62)); for (let i=0;i<3;i++){ const mn = tor(0.22, 0.05, M(0xd8c8ff, {emissive:0xa080ff, emissiveIntensity:1.2}), 4, 14, Math.PI); mn.position.set(-0.55 + i*0.55, 1.9 + (i===1?0.25:0), 0.1); mn.rotation.z = i===1 ? 0 : (i ? -1 : 1)*0.6; head.add(mn); } }
  if (h==='flame'){ const fh = new THREE.Group(); fh.position.y = 0.7; head.add(fh); flames(fh, 10, 0xff7a20, 0, 0.9, 0.7); (head.userData.fg = fh); head.add(at(box(1.45, 0.3, 1.45, M(0x3a1a10)), 0, 0.6, 0)); }
  if (h==='owl'){ const hm = sph(0.82, cloth, 16, 10); hm.scale.y = 0.75; hm.position.y = 0.45; head.add(hm); head.add(at(box(1.1, 0.4, 0.1, M(0x1b1622)), 0, 0.0, 0.76)); const owl = new THREE.Group(); owl.add(sph(0.3, M(0xd8d0c0), 10, 8)); for (const sx of [-1,1]){ owl.add(at(sph(0.1, EYEM(0xffc020)), sx*0.12, 0.08, 0.25)); owl.add(at(cone(0.06, 0.2, M(0xd8d0c0), 4), sx*0.14, 0.32, 0)); const wg = box(0.08, 0.45, 0.35, M(0xc8c0b0)); wg.position.set(sx*0.32, 0, -0.05); wg.rotation.z = sx*0.4; owl.add(wg); } owl.position.y = 1.25; head.add(owl); }
  if (h==='dragon'){ const hm = box(1.6, 1.3, 1.6, cloth); hm.position.y = 0.2; head.add(hm); const sn = box(1.1, 0.5, 0.6, cloth); sn.position.set(0, -0.05, 0.95); head.add(sn); head.add(at(box(1.2, 0.14, 0.08, M(0xff6a20, {emissive:0xff4000, emissiveIntensity:1.6})), 0, 0.2, 0.82)); for (const sx of [-1,1]){ const hn = cone(0.16, 1.4, M(0xe8d8b0), 6); hn.position.set(sx*0.6, 1.2, -0.35); hn.rotation.set(-0.7, 0, -sx*0.3); head.add(hn); } for (let i=0;i<5;i++){ const sp = cone(0.1, 0.45, trim, 4); sp.position.set(0, 0.95 - i*0.05, 0.3 - i*0.35); sp.rotation.x = -0.4; head.add(sp); } }
  if (h==='ares'){ const hm = cyl(0.8, 0.82, 1.15, cloth, 20); hm.position.y = 0.25; head.add(hm); head.add(at(box(1.2, 0.15, 0.1, M(0xff3030, {emissive:0xff2020, emissiveIntensity:1.2})), 0, 0.05, 0.78)); for (let i=0;i<5;i++){ const sp = cone(0.12, 0.8, trim, 5); sp.position.set(-0.5 + i*0.25, 1.1, -0.1); sp.rotation.z = (i-2)*0.25; head.add(sp); } const pl = glow(rgba(0xff3a10, 0.9), 1.6); pl.position.y = 1.5; head.add(pl); }
  if (h==='talos'){ const hm = box(1.6, 1.4, 1.5, cloth); hm.position.y = 0.15; head.add(hm); head.add(at(box(1.0, 0.18, 0.05, M(0xffa040, {emissive:0xff8020, emissiveIntensity:1.5})), 0, 0.1, 0.77)); }
  if (h==='lion'){ const lh = box(1.6, 1.0, 1.4, M(0xd8a040, {roughness:0.8})); lh.position.set(0, 0.75, 0.05); head.add(lh); head.add(at(box(0.9, 0.5, 0.4, M(0xd8a040)), 0, 0.6, 0.85)); const mane = tor(1.0, 0.32, M(0x9a5a18, {roughness:0.9, flatShading:true}), 6, 16); mane.position.set(0, 0.6, -0.1); head.add(mane); for (const sx of [-1,1]) head.add(at(cone(0.2, 0.35, M(0xd8a040), 4), sx*0.55, 1.35, 0)); for (const sx of [-1,1]) head.add(at(sph(0.08, M(0x1a1000)), sx*0.28, 0.75, 1.06)); for (let i=0;i<4;i++){ const f = cone(0.05, 0.2, M(0xffffff), 4); f.position.set(-0.24 + i*0.16, 0.38, 1.04); f.rotation.x = Math.PI; head.add(f); } }
  if (h==='hermes'){ const hm = sph(0.78, trim, 16, 10); hm.scale.y = 0.6; hm.position.y = 0.5; head.add(hm); for (const sx of [-1,1]){ const w = new THREE.Group(); for (let i=0;i<4;i++){ const f = box(0.08, 0.28 + i*0.1, 0.5 - i*0.08, M(0xffffff)); f.position.set(0, i*0.12, -i*0.08); w.add(f); } w.position.set(sx*0.8, 0.6, -0.1); w.rotation.z = -sx*0.6; head.add(w); } }
  if (h==='hades'){ const hm = cyl(0.82, 0.82, 1.2, M(0x0c0a12, {metalness:0.7, roughness:0.25}), 20); hm.position.y = 0.2; head.add(hm); head.add(at(box(1.2, 0.12, 0.1, M(0x40ffc0, {emissive:0x20ff90, emissiveIntensity:1.6})), 0, 0.05, 0.8)); for (let i=0;i<7;i++){ const sp = cone(0.09, 0.9, M(0x0c0a12), 5); const a2 = -0.9 + i*0.3; sp.position.set(Math.sin(a2)*0.75, 1.05 + Math.cos(a2)*0.2, -0.1); sp.rotation.z = -a2*0.8; head.add(sp); } }
  if (h==='merlin'){ const hat = cone(0.9, 2.6, cloth, 16); hat.position.y = 1.7; hat.rotation.z = -0.2; head.add(hat); head.add(at(cyl(1.25, 1.25, 0.1, cloth, 24), 0, 0.6, 0)); for (let i=0;i<6;i++){ const st = oct(0.09, M(0xfff0a0, {emissive:0xffe060, emissiveIntensity:1.4})); st.position.set(Math.cos(i)*0.5*(1-i/7), 0.9 + i*0.3, Math.sin(i)*0.5*(1-i/7)); head.add(st); } head.add(at(box(1.0, 0.7, 0.3, M(0xeeeeee)), 0, -0.6, 0.6)); }
  if (h==='odin'){ head.add(at(cyl(1.4, 1.4, 0.1, M(0x2a2a30), 24), 0, 0.6, 0)); head.add(at(cyl(0.7, 0.75, 0.8, M(0x2a2a30), 20), 0, 1.0, 0)); head.add(at(box(0.5, 0.35, 0.05, M(0x111111)), 0.3, 0.05, 0.71)); head.add(at(box(1.1, 0.8, 0.3, M(0xd8d8e0)), 0, -0.6, 0.55)); }
}
function mythExtras(g, body, armL, legL, legR, MY, trim){ const u = g.userData;
  const Cx = (c, o) => M(c, o||{}); const goldX = Cx(0xffcf4a, {metalness:0.8, roughness:0.25});
  if (MY.collar){ const col = cyl(1.25, 1.35, 0.35, goldX, 18); col.position.y = 3.85; col.scale.z = 0.7; body.add(col); for (let i=0;i<3;i++) body.add(at(cyl(1.3 + i*0.02, 1.3 + i*0.02, 0.06, Cx([0x1a6aa0,0xc02020,0x2a8a5a][i]), 18), 0, 3.95 - i*0.12, 0)).scale.z = 0.72; }
  if (MY.wingsBack){ const wings = []; for (const sx of [-1,1]){ const w = new THREE.Group(); for (let i=0;i<5;i++){ const f = box(0.9, 0.22, 0.06, Cx(i%2 ? MY.wingsBack : 0xffffff, {side:THREE.DoubleSide})); f.position.set(sx*(0.6 + i*0.5), 0.6 - i*0.35, 0); f.rotation.z = sx*(0.4 - i*0.18); w.add(f); } w.position.set(sx*0.5, 3.6, -0.65); body.add(w); wings.push(w); } u.wings = wings; }
  if (MY.wraps){ for (let i=0;i<10;i++){ const w = box(2.05, 0.12, 1.05, Cx(i%2 ? 0xd8ccb0 : 0xc8bc9a)); w.position.set(0, 2.2 + i*0.2, 0); w.rotation.z = (i%3 - 1)*0.05; body.add(w); } for (let i=0;i<3;i++){ const tail = box(0.18, 1.0, 0.04, Cx(0xd8ccb0)); tail.position.set(-0.6 + i*0.5, 1.6, 0.55); tail.rotation.z = (i-1)*0.2; body.add(tail); } }
  if (MY.shell){ const sh = sph(1.35, Cx(0x1a5a4a, {metalness:0.7, roughness:0.2}), 16, 10); sh.scale.set(1, 1.2, 0.55); sh.position.set(0, 3.0, -0.6); body.add(sh); body.add(at(box(0.06, 2.6, 0.06, Cx(0x40ffd0, {emissive:0x20c0a0, emissiveIntensity:1})), 0, 3.0, -1.32)); }
  if (MY.bearskin){ const bs = box(2.4, 1.0, 1.4, Cx(0x3a2a1a, {roughness:0.95, flatShading:true})); bs.position.set(0, 4.1, -0.15); body.add(bs); const cape = box(2.2, 3.2, 0.15, Cx(0x2a1e14, {roughness:0.95})); cape.position.set(0, 2.5, -0.7); body.add(cape); for (let i=0;i<5;i++){ const cl = cone(0.07, 0.3, Cx(0xd8d0c0), 4); cl.position.set(-0.8 + i*0.4, 3.6, 0.75); cl.rotation.x = Math.PI; body.add(cl); } }
  if (MY.spikes){ for (const sx of [-1,1]) for (let i=0;i<4;i++){ const sp = cone(0.16, 0.9, Cx(0x16161c, {metalness:0.7}), 5); sp.position.set(sx*(1.2 + i*0.18), 4.3 + (i%2)*0.25, -0.3 + i*0.2); sp.rotation.z = -sx*(0.3 + i*0.25); body.add(sp); } for (let i=0;i<3;i++) body.add(at(box(0.5, 0.08, 0.05, Cx(0xff2020, {emissive:0xff0000, emissiveIntensity:1.2})), 0, 2.6 + i*0.4, 0.53)); }
  if (MY.chainsX){ for (const arm of [armL]){ for (let i=0;i<6;i++){ const l = tor(0.14, 0.05, Cx(0x9a9aa4, {metalness:0.8}), 4, 10); l.position.set(0.2, -1.6 - i*0.24, 0.3); l.rotation.y = i%2 ? Math.PI/2 : 0; arm.add(l); } } body.add(at(box(2.1, 0.25, 1.05, Cx(0x5a5a64, {metalness:0.7})), 0, 2.3, 0)); }
  if (MY.iceSpikes){ for (let i=0;i<10;i++){ const ic = cone(0.18, 0.9 + (i%3)*0.3, Cx(0xe8f8ff, {emissive:0x80c8ff, emissiveIntensity:0.4, transparent:true, opacity:0.9}), 5); ic.position.set(-1.4 + i*0.31, 4.3 + (i%2)*0.2, -0.3); ic.rotation.z = (i - 4.5)*0.12; body.add(ic); } }
  if (MY.belt){ body.add(at(box(2.15, 0.4, 1.1, goldX), 0, 2.15, 0)); body.add(at(rot(cyl(0.25, 0.25, 0.1, Cx(0x8a1a1a), 12), Math.PI/2, 0, 0), 0, 2.15, 0.58)); }
  if (MY.lamellar){ for (let r=0;r<4;r++) for (let c=0;c<4;c++) body.add(at(box(0.45, 0.4, 0.06, Cx(r%2 ? MY.c : 0x1a1a1a, {metalness:0.5, roughness:0.3})), -0.68 + c*0.45, 3.6 - r*0.42, 0.53)); for (const sx of [-1,1]){ const sd = box(1.2, 0.9, 1.2, Cx(MY.c, {metalness:0.5})); sd.position.set(sx*1.45, 3.7, 0); sd.rotation.z = -sx*0.35; body.add(sd); } const sk = cyl(1.1, 1.4, 1.0, Cx(MY.c, {metalness:0.4}), 8); sk.position.y = 1.65; body.add(sk); }
  if (MY.tails9){ u.tails9 = []; for (let i=0;i<9;i++){ const t2 = new THREE.Group(); for (let j=0;j<4;j++){ const s = sph(0.32 - j*0.05, Cx(j===3 ? 0xffffff : 0xffe8d0, {roughness:0.9}), 8, 6); s.position.set(0, j*0.45, -j*0.15); t2.add(s); } t2.position.set(0, 1.9, -0.6); t2.rotation.set(-0.9, 0, (i-4)*0.32); body.add(t2); u.tails9.push(t2); } }
  if (MY.drums){ u.drums = new THREE.Group(); for (let i=0;i<8;i++){ const d = cyl(0.35, 0.35, 0.3, Cx(0x8a1a1a), 12); const a2 = i*0.785; d.position.set(Math.cos(a2)*2.0, Math.sin(a2)*2.0, 0); d.rotation.x = Math.PI/2; u.drums.add(d); u.drums.add(at(sph(0.08, EYEM(0xfff080)), Math.cos(a2)*2.0, Math.sin(a2)*2.0, 0.2)); } u.drums.add(tor(2.0, 0.07, goldX, 4, 32)); u.drums.position.set(0, 3.6, -1.1); body.add(u.drums); }
  if (MY.haori){ const hr = box(2.3, 2.8, 1.25, Cx(MY.c)); hr.position.set(0, 2.6, -0.05); body.add(hr); body.add(at(box(0.25, 2.8, 0.05, Cx(MY.t)), -0.5, 2.6, 0.6)); body.add(at(box(0.25, 2.8, 0.05, Cx(MY.t)), 0.5, 2.6, 0.6)); }
  if (MY.dragonRobe){ for (let i=0;i<9;i++){ const s = box(0.3, 0.3, 0.05, Cx(0x3ac080, {emissive:0x20a060, emissiveIntensity:0.5})); s.position.set(Math.sin(i*0.8)*0.6, 1.4 + i*0.3, 0.6); body.add(s); } }
  if (MY.featherCloak){ for (let i=0;i<14;i++){ const f = box(0.35, 1.4, 0.05, Cx(i%2 ? 0x14141c : 0x2a1a2a, {side:THREE.DoubleSide})); f.position.set(-1.1 + (i%7)*0.37, 2.8 - Math.floor(i/7)*1.0, -0.65); f.rotation.z = ((i%7) - 3)*0.06; body.add(f); } }
  if (MY.sunRing){ u.sunRing = new THREE.Group(); u.sunRing.add(tor(2.2, 0.08, Cx(0xffd040, {emissive:0xffa010, emissiveIntensity:1.2}), 4, 40)); for (let i=0;i<12;i++){ const r2 = cone(0.12, 0.5, Cx(0xffa020, {emissive:0xff8000, emissiveIntensity:1}), 4); const a2 = i*0.5236; r2.position.set(Math.cos(a2)*2.5, Math.sin(a2)*2.5, 0); r2.rotation.z = a2 - Math.PI/2; u.sunRing.add(r2); } u.sunRing.position.set(0, 3.6, -1.0); body.add(u.sunRing); }
  if (MY.core){ body.add(at(new THREE.Mesh(new THREE.CircleGeometry(0.4, 16), new THREE.MeshBasicMaterial({color:0x40c0ff})), 0, 3.2, 0.54)); const cg = glow('rgba(64,192,255,.8)', 1.6); cg.position.set(0, 3.2, 0.7); body.add(cg); for (const sx of [-1,1]) body.add(at(box(1.2, 1.0, 1.3, Cx(0xe8eef6, {metalness:0.6, roughness:0.2})), sx*1.4, 3.9, 0)); }
  if (MY.thrusters){ for (const sx of [-1,1]){ const th = cyl(0.3, 0.4, 1.2, Cx(0x8a96a8, {metalness:0.7}), 10); th.position.set(sx*0.55, 3.0, -0.85); body.add(th); const fl = glow('rgba(80,200,255,.9)', 1.2); fl.position.set(sx*0.55, 2.2, -0.85); body.add(fl); } }
  if (MY.longcoat){ const lc = box(2.15, 3.4, 1.15, Cx(MY.c)); lc.position.set(0, 2.2, -0.04); body.add(lc); body.add(at(box(2.3, 0.8, 1.3, Cx(MY.c)), 0, 4.05, -0.05)); for (let i=0;i<4;i++) body.add(at(sph(0.06, Cx(0xd8e0ff, {metalness:0.8})), 0.3, 3.4 - i*0.4, 0.6)); }
  if (MY.scarf){ const sc = box(1.5, 0.4, 1.5, Cx(MY.t)); sc.position.y = 4.15; body.add(sc); const tail = new THREE.Group(); for (let i=0;i<5;i++) tail.add(at(box(0.4, 0.15, 0.6, Cx(MY.t)), 0, -i*0.05, -i*0.55)); tail.position.set(0.4, 4.1, -0.5); body.add(tail); u.scarfTail = tail; }
  if (MY.swordHalo){ u.swordHalo = new THREE.Group(); for (let i=0;i<6;i++){ const s = new THREE.Group(); s.add(box(0.12, 1.2, 0.04, Cx(0xffffff, {emissive:0xfff0b0, emissiveIntensity:0.8}))); s.add(at(box(0.4, 0.08, 0.08, goldX), 0, -0.5, 0)); const a2 = i*1.047; s.position.set(Math.cos(a2)*1.8, Math.sin(a2)*1.8, 0); s.rotation.z = a2 - Math.PI/2; u.swordHalo.add(s); } u.swordHalo.position.set(0, 3.8, -1.0); body.add(u.swordHalo); }
  if (MY.scales){ const sm = M(0x2f6a50, {metalness:0.5, roughness:0.35, flatShading:true}), sm2 = M(0x1a3a2c, {metalness:0.5, roughness:0.35, flatShading:true});
    for (let r=0;r<4;r++) for (let c=0;c<5;c++){ const sc = cone(0.24, 0.42, (r+c)%2 ? sm : sm2, 4); sc.position.set(-0.8 + c*0.4, 3.75 - r*0.45, 0.58); sc.rotation.set(Math.PI*0.95, Math.PI/4, 0); sc.scale.z = 0.35; body.add(sc); }
    for (const sx of [-1,1]){ const sh = sph(0.9, sm, 8, 6); sh.scale.set(1, 0.7, 1); sh.position.set(sx*1.4, 4.0, 0); body.add(sh); for (let i=0;i<4;i++){ const sp = cone(0.16, 0.8, M(0xe8d8b0), 5); sp.position.set(sx*(1.2 + i*0.25), 4.5 + (i===1||i===2?0.2:0), -0.3 + i*0.2); sp.rotation.z = -sx*(0.2 + i*0.25); body.add(sp); } }
    const wings = []; for (const sx of [-1,1]){ const w = new THREE.Group(); const bone = M(0x14302a); for (let i=0;i<4;i++){ const b = box(0.12, 3.2 - i*0.5, 0.12, bone); b.position.set(sx*(0.6 + i*0.55), 1.3 - i*0.15, 0); b.rotation.z = -sx*(0.4 + i*0.35); w.add(b); const mem = box(0.9, 2.6 - i*0.5, 0.04, M(0xc0401a, {side:THREE.DoubleSide, transparent:true, opacity:0.85, emissive:0x501000, emissiveIntensity:0.5})); mem.position.set(sx*(0.85 + i*0.55), 0.9 - i*0.15, -0.02); mem.rotation.z = -sx*(0.55 + i*0.35); w.add(mem); } w.position.set(sx*0.5, 3.8, -0.65); body.add(w); wings.push(w); } u.wings = wings;
    const tail = new THREE.Group(); for (let i=0;i<6;i++){ const s = sph(0.42 - i*0.06, sm, 8, 6); s.position.set(0, -i*0.35, -i*0.45); tail.add(s); } tail.add(at(cone(0.25, 0.6, M(0xff6a20, {emissive:0xff4000, emissiveIntensity:0.8}), 4), 0, -2.2, -2.8)); tail.position.set(0, 2.1, -0.6); body.add(tail); u.tail = tail;
    flames(body, 4, 0xff6a20, 4.6, 0.6, 0.4); }
  if (MY.shield){ const sh = new THREE.Group(); sh.add(cyl(1.1, 1.1, 0.15, M(0xe8c060, {metalness:0.8, roughness:0.2}), 24)); const face = cyl(0.42, 0.42, 0.18, M(0x5a8a5a), 16); sh.add(face); for (let i=0;i<10;i++){ const s = cone(0.07, 0.45, M(0x3a6a3a), 4); const a2 = i*0.628; s.position.set(Math.cos(a2)*0.6, 0.1, Math.sin(a2)*0.6); s.rotation.set(Math.PI/2, 0, -a2 + Math.PI/2); sh.add(s); } sh.rotation.z = Math.PI/2; sh.position.set(-0.6, -1.2, 0); armL.add(sh); }
  if (MY.fleece){ const fm = M(0xffd040, {roughness:0.95, emissive:0x705000, emissiveIntensity:0.45, flatShading:true}); for (let i=0;i<22;i++){ const a2 = (i/22)*Math.PI*2; const f = sph(0.42, fm, 7, 5); f.position.set(Math.cos(a2)*1.5, 3.7 + Math.sin(i*1.7)*0.12, Math.sin(a2)*0.85 - 0.05); body.add(f); } for (let i=0;i<10;i++){ const f = sph(0.4, fm, 7, 5); f.position.set(-0.9 + (i%5)*0.45, 3.3 - Math.floor(i/5)*0.7, -0.6); body.add(f); } }
  if (MY.torches){ u.torches = []; for (let i=0;i<3;i++){ const t = new THREE.Group(); t.add(cyl(0.06, 0.08, 0.7, M(0x4a2a10))); const f = glow(rgba(0xc080ff, 0.95), 0.9); f.position.y = 0.5; t.add(f); g.add(t); u.torches.push(t); } }
  if (MY.fire){ for (const sx of [-1,1]){ const s = new THREE.Group(); s.position.set(sx*1.3, 4.3, 0); body.add(s); flames(s, 6, 0xff7a20, 0, 0.8, 0.6); (u.fireGroups = u.fireGroups || []).push(s); } }
  if (MY.ravens){ u.ravens = []; for (let i=0;i<2;i++){ const r = new THREE.Group(); r.add(box(0.35, 0.25, 0.6, M(0x111118))); const wl = box(0.9, 0.05, 0.35, M(0x111118)); wl.position.x = 0; r.add(wl); r.add(at(cone(0.06, 0.2, M(0x333333), 4), 0, 0, 0.4)); r.add(at(sph(0.05, EYEM(0xffd040)), 0.1, 0.08, 0.25)); g.add(r); u.ravens.push(r); } }
  if (MY.stars){ u.starSp = []; for (let i=0;i<8;i++){ const s = glow(rgba(0xfff0a0, 0.95), 0.3); s.userData.ph = Math.random()*6; g.add(s); u.starSp.push(s); } }
  if (MY.head==='hermes'){ for (const lg of [legL, legR]){ for (const sx of [-1,1]){ const w = box(0.06, 0.3, 0.5, M(0xffffff)); w.position.set(sx*0.55, -1.6, -0.2); w.rotation.x = -0.5; lg.add(w); } } }
  if (MY.head==='hades'){ u.smoke = []; for (let i=0;i<8;i++){ const s = glow('rgba(30,10,40,.55)', 2.0); s.userData.ph = Math.random(); g.add(s); u.smoke.push(s); } }
  if (MY.chains){ for (const arm of [armL, armL.parent.children.find(c => c !== armL && c.userData && c.userData.hand)]){ if (!arm) continue; for (let i=0;i<3;i++){ const l = tor(0.14, 0.05, M(0x6a6a70, {metalness:0.8}), 4, 10); l.position.set(0.35 + i*0.18, -1.7 - i*0.12, 0.3); l.rotation.y = i%2 ? Math.PI/2 : 0; arm.add(l); } } body.add(at(new THREE.Mesh(new THREE.CircleGeometry(0.35, 12), new THREE.MeshBasicMaterial({color:0xffb040})), 0, 3.3, 0.53)); }
  if (MY.skirt){ const sk = cyl(1.05, 1.35, 1.2, M(0xffffff), 8); sk.position.y = 1.6; body.add(sk); body.add(at(box(2.1, 0.2, 1.05, M(0x40c0ff, {emissive:0x2080c0, emissiveIntensity:0.5})), 0, 2.2, 0)); }
  if (MY.head==='talos'){ body.add(at(box(0.12, 1.8, 0.05, M(0xffa040, {emissive:0xff8020, emissiveIntensity:1.6})), 0.3, 3, 0.53)); }
}
/* per-frame idle animation for weapons and auras (called by the renderer) */
function animate(g, t, dt){
  const u = g.userData; if (!u.parts) return; if (u.anims) ASM.tick(u.anims, t, dt);
  const wps = [u.parts.wpn, u.parts.wpnL].filter(Boolean);
  for (const w of wps){ const d = w.userData; if (d.anims) ASM.tick(d.anims, t, dt);
    if (d.sparkles) d.sparkles.forEach((s, i) => { const k = (t*0.6 + s.userData.ph) % 1; s.position.set(Math.sin(t*2 + i)*0.25, s.userData.y + Math.sin(t + i)*0.2, Math.cos(t*2 + i)*0.25); s.material.opacity = Math.sin(k*Math.PI); });
    if (d.shards) d.shards.forEach((s, i) => { const a = t*2.4 + i*2.09; s.position.set(Math.cos(a)*0.55, d.tipY*0.55 + Math.sin(t*1.7 + i)*0.4, Math.sin(a)*0.55); s.rotation.x += dt*3; s.rotation.y += dt*2; });
    if (d.light) d.light.intensity = (d.shards ? 1.4 : 0.9) + Math.sin(t*4)*0.35;
    if (d.glow) d.glow.material.opacity = 0.7 + Math.sin(t*3)*0.3;
    if (d.flail) d.flail.position.x = Math.sin(t*2.2)*0.12;
    if (d.runes) d.runes.forEach((r, i) => { const a = t*1.2 + i*1.26; r.position.x = Math.cos(a)*0.4; r.position.z = Math.sin(a)*0.4; r.rotation.y = -a; });
    if (d.spinDisc) w.rotation.y += dt*1.5;
    if (d.flames) d.flames.forEach((s, i) => { const kk = (t*0.9 + s.userData.ph) % 1; const b = s.userData.base; s.position.set(b[0] + Math.sin(t*3+i)*0.08, b[1] + kk*0.9, b[2]); s.material.opacity = Math.sin(kk*Math.PI); });
  }
  if (u.orbs) u.orbs.forEach((o, i) => { const a = t*1.6 + i*(Math.PI*2/u.orbs.length); o.position.set(Math.cos(a)*2.2, 3 + Math.sin(a*1.3)*1.2, Math.sin(a)*2.2); });
  if (u.embers) u.embers.forEach((e, i) => { const k = (t*0.35 + e.userData.ph) % 1; e.position.set(Math.sin(i*1.7 + t)*1.4, 0.5 + k*7, Math.cos(i*2.3)*0.9); e.material.opacity = Math.sin(k*Math.PI); });
  if (u.aura) u.aura.material.opacity = 0.75 + Math.sin(t*2)*0.25;
  if (u.halo) u.halo.rotation.z += dt;
  if (u.wings) u.wings.forEach((w, i) => w.rotation.y = (i ? -1 : 1)*(0.25 + Math.sin(t*2.2)*0.18));
  if (u.tail) u.tail.rotation.y = Math.sin(t*1.6)*0.35;
  if (u.tails9) u.tails9.forEach((t2, i) => t2.rotation.z = (i-4)*0.32 + Math.sin(t*2 + i)*0.08);
  if (u.drums) u.drums.rotation.z += dt*0.4;
  if (u.sunRing) u.sunRing.rotation.z -= dt*0.3;
  if (u.swordHalo) u.swordHalo.rotation.z += dt*0.6;
  if (u.scarfTail) u.scarfTail.rotation.y = Math.sin(t*3)*0.3;
  if (u.torches) u.torches.forEach((tc, i) => { const a = t*1.3 + i*2.09; tc.position.set(Math.cos(a)*2.4, 4.5 + Math.sin(t*2 + i)*0.3, Math.sin(a)*2.4); });
  if (u.ravens) u.ravens.forEach((r, i) => { const a = t*1.1 + i*Math.PI; r.position.set(Math.cos(a)*3, 6 + Math.sin(t*2 + i)*0.5, Math.sin(a)*2.4); r.rotation.y = -a; r.children[1].rotation.z = Math.sin(t*12 + i)*0.5; });
  if (u.starSp) u.starSp.forEach((s, i) => { s.position.set(Math.sin(i*1.7)*1.3, 1 + ((t*0.2 + i*0.13) % 1)*4, Math.cos(i*2.1)*0.8); s.material.opacity = 0.5 + Math.sin(t*4 + s.userData.ph)*0.5; });
  if (u.smoke) u.smoke.forEach((s, i) => { const kk = (t*0.3 + s.userData.ph) % 1; s.position.set(Math.sin(i*1.9)*1.5, 0.5 + kk*5, Math.cos(i*1.3)*1.0); s.material.opacity = 0.55*Math.sin(kk*Math.PI); });
  if (u.parts && u.parts.head && u.parts.head.userData.fg){ const fg = u.parts.head.userData.fg; fg.userData.flames.forEach((s, i) => { const kk = (t*1.4 + s.userData.ph) % 1; const b = s.userData.base; s.position.set(b[0], b[1] + kk*1.0, b[2]); s.material.opacity = Math.sin(kk*Math.PI); }); }
  if (u.fireGroups) u.fireGroups.forEach(fg => fg.userData.flames && fg.userData.flames.forEach((s, i) => { const kk = (t*1.2 + s.userData.ph) % 1; const b = s.userData.base; s.position.set(b[0], b[1] + kk*1.2, b[2]); s.material.opacity = Math.sin(kk*Math.PI); }));
  if (u.cape) u.cape.rotation.x = 0.1 + Math.sin(t*2.4)*0.07 + (u.capeKick||0);
  if (u.tails) u.tails.forEach((tl, i) => tl.rotation.x = 0.12 + Math.sin(t*2.6 + i)*0.06 + (u.capeKick||0)*0.6);
  if (u.capeKick) u.capeKick *= 0.92;
}
/* bowstring pull: d in 0..1 */
function drawBow(g, d){ const w = g.userData.parts && g.userData.parts.wpn; if (!w || !w.userData.bow) return; const b = w.userData.bow; const z = b.z0 - d*0.9;
  const pos = b.str.geometry.attributes.position; pos.setXYZ(1, 0, 0, z); pos.needsUpdate = true; b.arrow.position.z = z; b.arrow.visible = d > 0.02 || !g.userData.shot; }
return {buildHero, weapon, holdOf, animate, drawBow, glow, rgba, RC, RUNE, mats};
})();
