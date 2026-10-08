/* ===== Essay Quest v8 — KIT: smooth modelling toolkit (three.js r128) =====
   rbox     rounded boxes with true smooth normals (the soft "Roblox" body)
   sweep    a tube swept along a curve with a radius that changes along it (limbs, necks, tails, horns, tentacles)
   blob     a squashed / noisy sphere (heads, bodies, muscles)
   chain    a jointed chain of segments, each joint a Group, so necks / tails / tentacles bend smoothly
   wing     a bat / dragon wing: finger bones with a membrane stretched between them
   joints   every model can list joints with a sway (axis, amplitude, speed, phase); KIT.tick animates them */
const KIT = (() => {
const GC = {}, MC = {};
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
function rboxGeo(w, h, d, r, s){ r = Math.max(0.001, Math.min(r, w/2, h/2, d/2)); s = s || 3; const key = `rb${w.toFixed(3)}|${h.toFixed(3)}|${d.toFixed(3)}|${r.toFixed(3)}|${s}`; if (GC[key]) return GC[key];
  const g = new THREE.BoxGeometry(w, h, d, s, s, s), p = g.attributes.position, n = g.attributes.normal; const hw = w/2 - r, hh = h/2 - r, hd = d/2 - r; const v = new THREE.Vector3(), c = new THREE.Vector3();
  for (let i = 0; i < p.count; i++){ v.fromBufferAttribute(p, i); c.set(clamp(v.x, -hw, hw), clamp(v.y, -hh, hh), clamp(v.z, -hd, hd)); v.sub(c); if (v.lengthSq() < 1e-12) v.fromBufferAttribute(n, i); v.normalize(); p.setXYZ(i, c.x + v.x*r, c.y + v.y*r, c.z + v.z*r); n.setXYZ(i, v.x, v.y, v.z); }
  p.needsUpdate = true; n.needsUpdate = true; g.computeBoundingSphere(); return (GC[key] = g); }
/* sweep: pts = [[x,y,z],...]; rad = number | [r0, r1] | fn(t); o.ex/ey squash the cross-section; o.radial, o.segs; o.cap ends */
function sweepGeo(pts, rad, o){ o = o || {}; const radial = o.radial || 10, segs = o.segs || Math.max(6, pts.length*5); const curve = new THREE.CatmullRomCurve3(pts.map(q => new THREE.Vector3(q[0], q[1], q[2])), false, 'centripetal');
  const rf = typeof rad === 'function' ? rad : Array.isArray(rad) ? (t => rad[0] + (rad[1] - rad[0])*t) : (() => rad); const F = curve.computeFrenetFrames(segs, false); const ex = o.ex || 1, ey = o.ey || 1;
  const pos = [], idx = [], P = new THREE.Vector3(), D = new THREE.Vector3();
  for (let i = 0; i <= segs; i++){ const t = i/segs; curve.getPointAt(t, P); const N = F.normals[i], B = F.binormals[i], r = Math.max(0.0005, rf(t));
    for (let j = 0; j <= radial; j++){ const a = j/radial*Math.PI*2; D.copy(N).multiplyScalar(Math.cos(a)*ex).addScaledVector(B, Math.sin(a)*ey); pos.push(P.x + D.x*r, P.y + D.y*r, P.z + D.z*r); } }
  for (let i = 0; i < segs; i++) for (let j = 0; j < radial; j++){ const a = i*(radial + 1) + j, b = a + radial + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  if (o.cap !== false){ for (const [i0, tt] of [[0, 0], [segs, 1]]){ curve.getPointAt(tt, P); const ci = pos.length/3; pos.push(P.x, P.y, P.z); for (let j = 0; j < radial; j++){ const a = i0*(radial + 1) + j; if (tt === 0) idx.push(ci, a + 1, a); else idx.push(ci, a, a + 1); } } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g; }
function blobGeo(r, sx, sy, sz, bump, seed){ const key = `bl${r}|${sx}|${sy}|${sz}|${bump||0}|${seed||0}`; if (GC[key]) return GC[key]; const g = new THREE.SphereGeometry(r, 28, 20); const p = g.attributes.position; const v = new THREE.Vector3(); const s0 = seed || 1;
  for (let i = 0; i < p.count; i++){ v.fromBufferAttribute(p, i); let k = 1; if (bump){ k += bump*(Math.sin(v.x*3.1*s0 + v.y*1.7) * Math.cos(v.z*2.3 + v.y*2.9*s0)); } p.setXYZ(i, v.x*sx*k, v.y*sy*k, v.z*sz*k); }
  g.computeVertexNormals(); return (GC[key] = g); }
/* materials: kinds = skin, cloth, leather, metal, gold, bone, scale, fur, glow, glass, eye, dark */
function mat(c, kind, o){ kind = kind || 'skin'; const key = c + '|' + kind + '|' + (o ? JSON.stringify(o) : ''); if (MC[key]) return MC[key];
  const base = {skin:{roughness:0.62, metalness:0.02}, cloth:{roughness:0.86, metalness:0}, leather:{roughness:0.7, metalness:0.05}, metal:{roughness:0.3, metalness:0.82}, gold:{roughness:0.24, metalness:0.95},
    bone:{roughness:0.55, metalness:0}, scale:{roughness:0.42, metalness:0.12}, fur:{roughness:0.95, metalness:0}, dark:{roughness:0.5, metalness:0.3}}[kind] || {roughness:0.6, metalness:0.05};
  let m; if (kind === 'eye') m = new THREE.MeshBasicMaterial({color:c}); else if (kind === 'glow') m = new THREE.MeshStandardMaterial({color:c, emissive:c, emissiveIntensity:1.6, roughness:0.3, metalness:0.1});
  else if (kind === 'glass') m = new THREE.MeshStandardMaterial({color:c, roughness:0.08, metalness:0.1, transparent:true, opacity:0.55, emissive:c, emissiveIntensity:0.25});
  else m = new THREE.MeshStandardMaterial(Object.assign({color:c}, base, o || {}));
  if (o && o.side) m.side = THREE.DoubleSide; return (MC[key] = m); }
const mesh = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.castShadow = true; o.receiveShadow = true; if (x != null) o.position.set(x, y, z); return o; };
const rbox = (w, h, d, r, m, x, y, z) => mesh(rboxGeo(w, h, d, r), m, x, y, z);
const sweep = (pts, rad, m, o) => mesh(sweepGeo(pts, rad, o), m);
const blob = (r, sx, sy, sz, m, x, y, z, bump, seed) => mesh(blobGeo(r, sx, sy, sz, bump, seed), m, x, y, z);
const sph = (r, m, x, y, z, ws) => mesh(new THREE.SphereGeometry(r, ws || 16, Math.max(8, ((ws || 16)*0.66)|0)), m, x, y, z);
const cyl = (rt, rb, h, m, x, y, z, s) => mesh(new THREE.CylinderGeometry(rt, rb, h, s || 16), m, x, y, z);
const cone = (r, h, m, x, y, z, s) => mesh(new THREE.ConeGeometry(r, h, s || 12), m, x, y, z);
const tor = (r, t, m, x, y, z, arc, rs, ts) => mesh(new THREE.TorusGeometry(r, t, rs || 8, ts || 24, arc || Math.PI*2), m, x, y, z);
const grp = (x, y, z) => { const g = new THREE.Group(); if (x != null) g.position.set(x, y || 0, z || 0); return g; };
const rot = (o, x, y, z) => { o.rotation.set(x || 0, y || 0, z || 0); return o; };
/* a horn / claw / spike: a curved cone swept from base (r0) to a point; dir in local space */
function horn(len, r0, curve, m, o){ o = o || {}; const n = 6, pts = []; for (let i = 0; i <= n; i++){ const t = i/n; pts.push([Math.sin(t*curve)*len*0.35*(o.sx || 1), t*len, (1 - Math.cos(t*curve))*len*0.3*(o.sz != null ? o.sz : 1)]); } return sweep(pts, t => r0*(1 - t*0.97), m, {radial:o.radial || 8, segs:14}); }
/* a jointed chain along +Y (rotate the root to aim it). Returns {root, joints:[Group], tip}. rad(t) gives each segment's radius */
function chain(n, len, rad, m, o){ o = o || {}; const root = grp(); let cur = root; const joints = []; const sl = len/n;
  for (let i = 0; i < n; i++){ const j = grp(0, i ? sl : 0, 0); cur.add(j); joints.push(j); const r0 = rad(i/n), r1 = rad((i + 1)/n);
    j.add(mesh(new THREE.CylinderGeometry(r1, r0, sl*1.04, o.radial || 12), m, 0, sl/2, 0)); j.add(mesh(new THREE.SphereGeometry(r0*1.0, o.radial || 12, 8), m, 0, 0, 0));
    if (o.ex){ j.children.forEach(c => c.scale.set(1, 1, o.ex)); } cur = j; }
  const tip = grp(0, sl, 0); cur.add(tip); return {root, joints, tip}; }
/* a wing on the +X side: arm bone then 3-4 fingers, membrane between. span ~ length. returns group (rotate/mirror by caller) */
function wing(span, m, mem, o){ o = o || {}; const g = grp(); const fingers = o.fingers || 4; const arm = sweep([[0, 0, 0], [span*0.25, span*0.12, -0.05], [span*0.45, span*0.18, 0]], [0.16*span/4, 0.08*span/4], m, {radial:8, segs:10}); g.add(arm);
  const hub = [span*0.45, span*0.18, 0]; const tips = [];
  for (let i = 0; i < fingers; i++){ const a = -0.1 - i*(1.15/(fingers - 1)); const L = span*(0.62 - i*0.06); const tip = [hub[0] + Math.cos(a)*L, hub[1] + Math.sin(a)*L, -0.05*i]; tips.push(tip);
    g.add(sweep([hub, [(hub[0] + tip[0])/2, (hub[1] + tip[1])/2 + 0.08*span/4, tip[2]/2], tip], [0.06*span/4, 0.015], m, {radial:6, segs:8})); if (o.claws) g.add(rot(cone(0.05*span/4, 0.25*span/4, o.claws, tip[0], tip[1], tip[2], 6), 0, 0, -Math.PI/2 + a)); }
  const verts = [], body = [0, -span*0.35, 0], idx = []; const ring = [[0, 0, 0], hub].concat(tips).concat([body]); ring.forEach(q => verts.push(q[0], q[1], q[2]));
  // fan the membrane from the hub, with a scalloped edge between finger tips
  for (let i = 2; i < ring.length - 1; i++) idx.push(1, i, i + 1); idx.push(0, 1, ring.length - 1); idx.push(1, ring.length - 2, ring.length - 1);
  const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3)); mg.setIndex(idx); mg.computeVertexNormals(); g.add(mesh(mg, mem));
  return g; }
/* feathered wing: layered rounded feathers along a bone */
function featherWing(span, c1, c2, o){ o = o || {}; const g = grp(); const bone = mat(c1, o.metal ? 'metal' : 'fur'), f1 = mat(c1, o.metal ? 'metal' : 'fur'), f2 = mat(c2, o.metal ? 'gold' : 'fur'); const u = span/4;
  g.add(sweep([[0, 0, 0], [span*0.35, span*0.12, 0], [span*0.62, span*0.08, 0], [span*0.85, span*0.02, 0]], [0.2*u, 0.07*u], bone, {radial:8}));
  const feather = (L, w, m, x, y, z, a) => { const f = blob(0.5, w, L, 0.05, m); f.position.set(x, y - L*0.45*Math.cos(a), z); f.rotation.z = a; g.add(f); };
  // primaries fan out from the wrist, secondaries hang from the forearm, coverts overlap on top
  for (let i = 0; i < 7; i++){ const t = i/6; feather(span*(0.55 - t*0.12), 0.32*u + 0.08, i % 2 ? f2 : f1, span*(0.62 + t*0.22), span*0.06, -0.02*i, -0.25 - t*0.8); }
  for (let i = 0; i < 6; i++){ const t = i/5; feather(span*(0.36 - t*0.05), 0.3*u + 0.08, i % 2 ? f1 : f2, span*(0.12 + t*0.48), span*0.1, -0.03, 0.05 - t*0.12); }
  if ((o.rows || 3) >= 3) for (let i = 0; i < 6; i++){ const t = i/5; feather(span*0.18, 0.28*u + 0.06, f2, span*(0.1 + t*0.6), span*0.13, 0.04, 0.0 - t*0.3); }
  return g; }
function eyeGlow(c, r, x, y, z){ const g = grp(x, y, z); g.add(sph(r, mat(c, 'eye'), 0, 0, 0, 12)); const s = sprite(c, r*7); g.add(s); return g; }
const SPR = {}; function sprite(c, size){ const key = typeof c === 'number' ? c : String(c); if (!SPR[key]){ const cv = document.createElement('canvas'); cv.width = cv.height = 64; const x = cv.getContext('2d'); const col = typeof c === 'number' ? `rgba(${c>>16&255},${c>>8&255},${c&255},` : null;
    const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, col ? col + '1)' : c); gr.addColorStop(0.35, col ? col + '.45)' : c); gr.addColorStop(1, col ? col + '0)' : 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); SPR[key] = new THREE.CanvasTexture(cv); }
  const s = new THREE.Sprite(new THREE.SpriteMaterial({map:SPR[key], transparent:true, depthWrite:false, blending:THREE.AdditiveBlending})); s.scale.setScalar(size); return s; }
/* joint sway: J = [{o, ax, a, f, p, b}] */
function sway(list, o, ax, a, f, p){ list.push({o, ax, a, f, p: p || 0, b: o.rotation[ax]}); return o; }
function tick(J, t){ if (!J) return; for (const j of J){ j.o.rotation[j.ax] = j.b + j.a*Math.sin(t*j.f + j.p); } }
const shade = (c, k) => { const C = new THREE.Color(c); C.multiplyScalar(k); return C.getHex(); };
const mix = (a, b, k) => new THREE.Color(a).lerp(new THREE.Color(b), k).getHex();
return {rboxGeo, sweepGeo, blobGeo, mat, mesh, rbox, sweep, blob, sph, cyl, cone, tor, grp, rot, horn, chain, wing, featherWing, eyeGlow, sprite, sway, tick, shade, mix, clamp};
})();
