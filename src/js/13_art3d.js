
/* ===== Essay Quest v5 — 3D blocky (Roblox-style) renderer on three.js r128 ===== */
const ART3D = (() => {
let MOTION = true; let R, scene, cam, clock, root, hero = null, foes = {}, fxGroup, W = 960, H = 540, host, t = 0, mode = 'title', shake = 0, camBase = null, lights = {};
const RC = [0xc9ced6, 0x4aa3ff, 0xb06cff, 0xffb52e, 0xff4d6d];
const M = (c, o={}) => new THREE.MeshStandardMaterial(Object.assign({color:c, roughness:0.55, metalness:0.05}, o));
const box = (w,h,d,m) => { const g = new THREE.Mesh((typeof KIT !== 'undefined' ? KIT.rboxGeo(w, h, d, Math.min(0.22, Math.min(w, h, d)*0.2), 2) : new THREE.BoxGeometry(w, h, d)), m); g.castShadow = true; g.receiveShadow = true; return g; };
const cyl = (rt,rb,h,m,s=16) => { const g = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,s), m); g.castShadow = true; return g; };
const sph = (r,m,ws=16,hs=12) => { const g = new THREE.Mesh(new THREE.SphereGeometry(r,ws,hs), m); g.castShadow = true; return g; };
const cone = (r,h,m,s=12) => { const g = new THREE.Mesh(new THREE.ConeGeometry(r,h,s), m); g.castShadow = true; return g; };
const tor = (r,t,m,rs=6,ts=20,arc=Math.PI*2) => { const g = new THREE.Mesh(new THREE.TorusGeometry(r,t,rs,ts,arc), m); g.castShadow = true; return g; };
const rot = (o,x,y,z) => { o.rotation.set(x,y,z); return o; };
const at = (o,x,y,z) => { o.position.set(x,y,z); return o; };
function faceTex(kind='hero', eye='#1b1622'){
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.fillStyle = 'rgba(0,0,0,0)'; g.fillRect(0,0,128,128);
  if (kind==='hero'){ g.fillStyle = eye; g.beginPath(); g.ellipse(44,54,9,13,0,0,7); g.ellipse(84,54,9,13,0,0,7); g.fill(); g.fillStyle='#fff'; g.beginPath(); g.ellipse(47,49,3,4,0,0,7); g.ellipse(87,49,3,4,0,0,7); g.fill();
    g.strokeStyle = eye; g.lineWidth = 5; g.lineCap='round'; g.beginPath(); g.moveTo(40,36); g.lineTo(54,40); g.moveTo(88,36); g.lineTo(74,40); g.stroke(); g.beginPath(); g.arc(64,80,16,0.25,Math.PI-0.25); g.stroke(); }
  else if (kind==='angry'){ g.fillStyle = eye; g.beginPath(); g.moveTo(30,44); g.lineTo(58,56); g.lineTo(30,62); g.fill(); g.beginPath(); g.moveTo(98,44); g.lineTo(70,56); g.lineTo(98,62); g.fill(); g.strokeStyle='#1b1622'; g.lineWidth=6; g.beginPath(); g.moveTo(44,92); g.lineTo(84,92); g.stroke(); }
  else if (kind==='scary'){ g.shadowColor = eye; g.shadowBlur = 18; g.fillStyle = eye; g.beginPath(); g.moveTo(24,40); g.lineTo(58,58); g.lineTo(26,64); g.fill(); g.beginPath(); g.moveTo(104,40); g.lineTo(70,58); g.lineTo(102,64); g.fill();
    g.shadowBlur = 0; g.fillStyle = '#1b1622'; g.beginPath(); g.moveTo(30,84); for (let i=0;i<=8;i++) g.lineTo(30+i*8.5, i%2? 104 : 84); g.lineTo(98,84); g.fill(); }
  const tx = new THREE.CanvasTexture(c); tx.anisotropy = 4; return tx;
}
function gradientBG(top, bot){ const c = document.createElement('canvas'); c.width = 4; c.height = 256; const g = c.getContext('2d'); const gr = g.createLinearGradient(0,0,0,256); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0,0,4,256); const tx = new THREE.CanvasTexture(c); return tx; }
function glowSprite(color, size){ const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const r = g.createRadialGradient(32,32,2,32,32,32); r.addColorStop(0,'rgba(255,255,255,1)'); r.addColorStop(0.3, color); r.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0,0,64,64);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c), blending:THREE.AdditiveBlending, transparent:true, depthWrite:false})); s.scale.set(size,size,size); return s; }

/* ---------- init ---------- */
function init(el){
  host = el; R = new THREE.WebGLRenderer({antialias:true, alpha:false, preserveDrawingBuffer:true});
  R.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
  el.appendChild(R.domElement); R.domElement.style.width = '100%'; R.domElement.style.height = '100%'; R.domElement.style.display = 'block';
  cam = new THREE.PerspectiveCamera(46, 16/9, 0.1, 200); clock = new THREE.Clock(); resize(); makeEnv(); postInit();
  window.addEventListener('resize', resize); requestAnimationFrame(loop);
}
function resize(){ if (!host) return; const w = host.clientWidth || 960; const h = Math.round(w*9/16); R.setSize(w, h, false); W = w; H = h; cam.aspect = w/h; cam.updateProjectionMatrix(); if (typeof postResize === 'function' && post) postResize(); }

const WPAL = [
  {sky:['#7cc6ff','#e2f4ff'], ground:0x6cc35a, ground2:0x4a9a3e, fog:0xcfeaff, hill:0x5aa64e},
  {sky:['#5a8fc9','#cfe8f7'], ground:0xf0d999, ground2:0xd9bd73, fog:0xbfe0f5, hill:0x3f8a6a},
  {sky:['#f08a3a','#ffd9a0'], ground:0xe8b86a, ground2:0xcf9a4a, fog:0xffcf9a, hill:0xc07a3a},
  {sky:['#8fcff0','#f4fbff'], ground:0xf4fbff, ground2:0xd5e9f3, fog:0xe6f5ff, hill:0xbcdcee}];
const THEME = [['tree','tree','pillar','cave','keep'],['palm','ship','cave','palm','magic'],['cactus','ember','pillar','bones','rift'],['pine','cave','lake','aurora','barn']];
function clearScene(){ if (scene){ scene.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material){ (Array.isArray(o.material)?o.material:[o.material]).forEach(m => { if (m.map) m.map.dispose(); m.dispose(); }); } }); }
  scene = new THREE.Scene(); root = new THREE.Group(); scene.add(root); fxGroup = new THREE.Group(); scene.add(fxGroup); hero = null; foes = {}; lights = {}; scene.environment = ENV || makeEnv(); resetEnvFx(); }
function world(w, theme, night){
  const X7 = !night && TH7[theme]; const P = X7 ? Object.assign({}, WPAL[w], X7.p) : WPAL[w], th = THEME[w][theme||0] || (X7 ? 'x7' : 0), dark = !!X7 && theme===6 || night || ['cave','rift','magic','keep','aurora','ember','bones'].includes(th);
  scene.background = X7 ? gradientBG(X7.sky[0], X7.sky[1]) : gradientBG(night ? '#0d1030' : th==='rift' ? '#1a0b2e' : dark ? '#3a3f5a' : P.sky[0], night ? '#2a2550' : th==='rift' ? '#4a1d6a' : dark ? '#6a6f8a' : P.sky[1]);
  scene.fog = new THREE.Fog(X7 ? X7.fog : night ? 0x1a1a3a : dark ? 0x4a4a66 : P.fog, X7 ? X7.near : 30, X7 ? X7.far : 75);
  const hemi = new THREE.HemisphereLight(night ? 0x5a6aa0 : 0xffffff, night ? 0x1a1020 : 0x6a5a40, night ? 0.3 : dark ? 0.4 : 0.55); scene.add(hemi);
  const sun = new THREE.DirectionalLight(X7 ? X7.sun : night ? 0x8090ff : th==='rift' ? 0xc080ff : 0xfff2dd, night ? 0.25 : dark ? 0.6 : 1.05); sun.position.set(-8, 16, 10); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, {left:-16, right:16, top:12, bottom:-6, near:1, far:50}); scene.add(sun); lights.sun = sun;
  const g = new THREE.PlaneGeometry(80, 40, 40, 20); g.rotateX(-Math.PI/2); const pos = g.attributes.position; for (let i=0;i<pos.count;i++){ const x = pos.getX(i), z = pos.getZ(i); if (z < -6) pos.setY(i, Math.sin(x*0.25)*0.6 + Math.cos(z*0.4)*0.4 + (-z-6)*0.15); }
  g.computeVertexNormals(); const ground = new THREE.Mesh(g, M(night ? new THREE.Color(P.ground).multiplyScalar(0.35) : P.ground, {flatShading:true})); ground.receiveShadow = true; ground.position.z = -6; root.add(ground);
  // battle pad
  const pad = new THREE.Mesh(new THREE.CircleGeometry(9, 40), M(new THREE.Color(P.ground2).multiplyScalar(night ? 0.4 : 1), {roughness:0.9})); pad.rotation.x = -Math.PI/2; pad.position.set(0, 0.02, 0); pad.receiveShadow = true; root.add(pad);
  // hills
  for (let i=0;i<7;i++){ const hl = new THREE.Mesh(new THREE.SphereGeometry(6+i%3*2, 12, 8), M(new THREE.Color(P.hill).multiplyScalar(night?0.35:dark?0.6:1), {flatShading:true})); hl.position.set(-30 + i*10, -2.5, -28 - (i%2)*6); hl.scale.y = 0.6; root.add(hl); }
  if (w===3 || th==='pine'){ for (let i=0;i<5;i++){ const m = cone(5, 10, M(0xe8f4ff, {flatShading:true}), 5); m.position.set(-24+i*12, 3, -34); root.add(m); } }
  props(w, th, night); if (X7) worldEx(theme);
  if (w===1 && !['cave','magic'].includes(th)){ const sea = new THREE.Mesh(new THREE.PlaneGeometry(90, 14), M(0x3d8fd0, {roughness:0.2, metalness:0.2, transparent:true, opacity:0.92})); sea.rotation.x = -Math.PI/2; sea.position.set(0, 0.05, -18); root.add(sea); lights.sea = sea; }
}
function tree(x, z, s=1, col=0x3f9a3c){ const g = new THREE.Group(); g.add(at(cyl(0.25*s, 0.35*s, 2*s, M(0x7a4b2a)), 0, s, 0)); const c = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4*s, 0), M(col, {flatShading:true})); c.castShadow = true; c.position.y = 2.6*s; g.add(c); g.position.set(x, 0, z); root.add(g); }
function props(w, th, night){
  const L = [[-12,-5],[-9,-10],[10,-8],[13,-4],[-15,-12],[16,-13],[4,-14],[-5,-15]];
  if (th==='tree') L.forEach(([x,z],i) => tree(x, z, 0.9 + (i%3)*0.25, i%2 ? 0x3f9a3c : 0x5cbf55));
  if (th==='pine') L.forEach(([x,z],i) => { const g = new THREE.Group(); g.add(at(cyl(0.2,0.3,1.2,M(0x6b4426)),0,0.6,0)); for (let k=0;k<3;k++){ g.add(at(cone(1.4-k*0.35, 1.6, M(0x2f6f5a,{flatShading:true}), 7), 0, 1.6+k*0.9, 0)); g.add(at(cone(1.0-k*0.3, 0.5, M(0xffffff), 7), 0, 2.2+k*0.9, 0)); } g.position.set(x,0,z); g.scale.setScalar(1+(i%3)*0.3); root.add(g); });
  if (th==='palm') L.forEach(([x,z],i) => { const g = new THREE.Group(); for (let k=0;k<6;k++) g.add(at(cyl(0.22,0.26,0.6,M(0x9a6b3a)), k*0.08, 0.3+k*0.55, 0)); for (let k=0;k<6;k++){ const lf = box(2.4, 0.08, 0.6, M(0x3faa4a)); lf.position.set(0.4, 3.4, 0); lf.rotation.y = k*1.05; lf.rotation.z = -0.4; lf.translateX(1); g.add(lf); } g.position.set(x,0,z); root.add(g); });
  if (th==='cactus') L.forEach(([x,z],i) => { const m = M(0x4f9a4a, {flatShading:true}); const g = new THREE.Group(); g.add(at(cyl(0.45,0.5,3.2,m,8),0,1.6,0)); g.add(at(cyl(0.3,0.3,1.2,m,8),-0.8,1.8,0)); g.add(at(cyl(0.3,0.3,1.4,m,8),0.8,2.2,0)); g.position.set(x,0,z); root.add(g); });
  if (th==='pillar' || th==='keep') L.slice(0,6).forEach(([x,z],i) => { const m = M(w===2 ? 0xd9b98a : 0x9aa3ab, {flatShading:true}); const h = th==='keep' ? 7 : 2 + (i%3)*1.6; root.add(at(box(1.4, h, 1.4, m), x, h/2, z)); root.add(at(box(1.8, 0.4, 1.8, m), x, h+0.2, z));
    if (th==='keep'){ const scr = box(1.1, 0.8, 0.1, M(0x1c2a3a, {emissive:0xff2020, emissiveIntensity:0.35})); scr.position.set(x, h-1.5, z+0.75); root.add(scr); } });
  if (th==='cave' || th==='rift'){ const m = M(w===3 ? 0x7fa8c4 : w===1 ? 0x3a4f5f : 0x4a4038, {flatShading:true}); for (let i=0;i<14;i++){ const rk = new THREE.Mesh(new THREE.DodecahedronGeometry(1.5 + (i%4)*0.8, 0), m); rk.castShadow = true; rk.position.set(-18 + i*2.8, 0.5, -9 - (i%3)*3); root.add(rk); }
    for (let i=0;i<10;i++){ const st = cone(0.5, 2.5 + (i%3), m, 6); st.rotation.x = Math.PI; st.position.set(-14 + i*3, 9, -6 - (i%2)*4); root.add(st); }
    for (let i=0;i<6;i++){ const cr = new THREE.Mesh(new THREE.OctahedronGeometry(0.5 + (i%2)*0.3), M(th==='rift' ? 0xb050ff : w===3 ? 0xbfe6f7 : 0x5fffc0, {emissive: th==='rift' ? 0x8030ff : 0x30ffb0, emissiveIntensity:0.8})); cr.position.set(-10 + i*4, 0.6, -6 - (i%2)*2); root.add(cr); } }
  if (th==='rift'){ const pl = new THREE.PointLight(0xb050ff, 2, 30); pl.position.set(0, 6, -10); scene.add(pl); const ring = new THREE.Mesh(new THREE.TorusGeometry(4, 0.4, 8, 40), M(0x8030ff, {emissive:0x8030ff, emissiveIntensity:1.2})); ring.position.set(0, 6, -16); root.add(ring); lights.ring = ring; }
  if (th==='ship'){ const hull = box(9, 2.5, 3, M(0x6b4426, {flatShading:true})); hull.position.set(9, 1, -12); hull.rotation.z = 0.15; root.add(hull); root.add(at(cyl(0.2,0.2,8,M(0x5a3a20)), 8, 6, -12)); const sail = box(0.1, 4, 3, M(0xefe6cf)); sail.position.set(8.4, 6, -12); root.add(sail); }
  if (th==='magic'){ for (let i=0;i<8;i++){ const s = glowSprite('rgba(200,140,255,.9)', 1.2); s.position.set(-10+i*3, 2+Math.sin(i)*2, -6); s.userData.float = i; fxGroup.add(s); } }
  if (th==='ember'){ for (let i=0;i<24;i++){ const s = glowSprite('rgba(255,140,40,.9)', 0.4); s.position.set(-14+Math.random()*28, Math.random()*6, -8+Math.random()*8); s.userData.ember = 1; fxGroup.add(s); } }
  if (th==='bones'){ for (let i=0;i<10;i++){ const b = cyl(0.12,0.12,1.4,M(0xf1e6cc)); b.rotation.z = Math.PI/2; b.rotation.y = i; b.position.set(-12+i*2.6, 0.15, -3 - (i%3)*2); root.add(b); root.add(at(sph(0.35, M(0xf1e6cc)), -12+i*2.6+0.7, 0.3, -3-(i%3)*2)); } }
  if (th==='lake'){ const lk = new THREE.Mesh(new THREE.CircleGeometry(6, 32), M(0xbfe6f7, {roughness:0.05, metalness:0.3})); lk.rotation.x = -Math.PI/2; lk.position.set(0, 0.03, -8); root.add(lk); }
  if (th==='aurora' && false){ for (let k=0;k<3;k++){ const a = new THREE.Mesh(new THREE.PlaneGeometry(60, 6, 30, 1), new THREE.MeshBasicMaterial({color:[0x5affb4,0x78b4ff,0xc878ff][k], transparent:true, opacity:0.14, side:THREE.DoubleSide, blending:THREE.AdditiveBlending, depthWrite:false})); a.position.set(0, 22+k*2.5, -45); a.userData.aur = k; fxGroup.add(a); } }
  if (th==='barn'){ const b = new THREE.Group(); b.add(at(box(6, 4, 4, M(0xb5423b)), 0, 2, 0)); const roof = cone(4.6, 2.5, M(0x6b2a24), 4); roof.rotation.y = Math.PI/4; roof.position.y = 5.2; b.add(roof); b.add(at(box(1.6, 2.4, 0.1, M(0x3a1a14)), 0, 1.2, 2.05)); b.position.set(10, 0, -11); root.add(b); }
}
const EYE = c => M(c, {emissive:c, emissiveIntensity:1.4});
/* ---------- expansion enemy art (all face +Z) ---------- */
function hum(g, o){ const s = o.s || 1, b = new THREE.Group(); const lm = o.limb || o.body; const lw = o.thin ? 0.45 : 0.9;
  const legL = at(box(lw*s, 1.9*s, lw*s, lm), -0.5*s, 0.95*s, 0), legR = at(box(lw*s, 1.9*s, lw*s, lm), 0.5*s, 0.95*s, 0); b.add(legL, legR);
  const torso = at(box((o.thin ? 1.4 : 2)*s, 2*s, (o.thin ? 0.6 : 1)*s, o.body), 0, 2.9*s, 0); b.add(torso);
  const aL = at(box(lw*s, 1.9*s, lw*s, lm), -(o.thin ? 1.0 : 1.45)*s, 2.9*s, 0), aR = at(box(lw*s, 1.9*s, lw*s, lm), (o.thin ? 1.0 : 1.45)*s, 2.9*s, 0); aR.rotation.x = -0.7; b.add(aL, aR);
  g.add(b); g.userData.aR = aR; return {b, headY: 4.55*s, s}; }
function beastHead(g, kind, col, y, s=1){ const hm = M(col, {flatShading:true}); const hd = new THREE.Group(); hd.position.y = y;
  hd.add(box(1.35*s, 1.3*s, 1.35*s, hm));
  if (kind==='bull'){ hd.add(at(box(0.9*s, 0.7*s, 0.7*s, hm), 0, -0.25*s, 0.8*s)); hd.add(at(tor(0.2*s, 0.05*s, M(0xffcf4a, {metalness:0.8}), 4, 10), 0, -0.45*s, 1.15*s)); for (const sx of [-1,1]){ const hn = cone(0.15*s, 1.1*s, M(0xf0e8d8), 6); hn.position.set(sx*0.95*s, 0.45*s, 0); hn.rotation.z = -sx*1.1; hd.add(hn); } }
  if (kind==='jackal'){ hd.add(at(box(0.6*s, 0.5*s, 0.9*s, hm), 0, -0.15*s, 0.95*s)); for (const sx of [-1,1]) hd.add(at(cone(0.22*s, 0.9*s, hm, 4), sx*0.4*s, 1.0*s, 0)); hd.add(at(box(1.4*s, 0.15*s, 1.4*s, M(0xffcf4a, {metalness:0.8})), 0, 0.5*s, 0)); }
  if (kind==='croc'){ hd.add(at(box(0.8*s, 0.45*s, 1.6*s, hm), 0, -0.25*s, 1.3*s)); for (let i=0;i<6;i++) hd.add(at(rot(cone(0.05*s, 0.18*s, M(0xffffff), 4), Math.PI, 0, 0), (i%2 ? 0.3 : -0.3)*s, -0.5*s, (0.7 + i*0.25)*s)); }
  if (kind==='shark'){ hd.add(at(box(1.0*s, 0.8*s, 1.0*s, hm), 0, 0, 0.9*s)); hd.add(at(cone(0.3*s, 1.0*s, hm, 4), 0, 1.0*s, -0.1*s)); for (let i=0;i<5;i++) hd.add(at(rot(cone(0.06*s, 0.2*s, M(0xffffff), 4), Math.PI, 0, 0), (-0.3 + i*0.15)*s, -0.35*s, 1.4*s)); }
  if (kind==='goat'){ for (const sx of [-1,1]){ const hn = tor(0.35*s, 0.1*s, M(0xd8c8a8), 5, 10, Math.PI*1.3); hn.position.set(sx*0.6*s, 0.7*s, -0.1*s); hn.rotation.y = Math.PI/2; hd.add(hn); } hd.add(at(box(0.3*s, 0.5*s, 0.2*s, M(0xd8c8a8)), 0, -0.85*s, 0.55*s)); }
  for (const sx of [-1,1]) hd.add(at(sph(0.11*s, EYE(kind==='jackal' ? 0xffcf4a : 0xff3030)), sx*0.32*s, 0.15*s, 0.69*s)); g.add(hd); return hd; }
const NEWART = {
  rat:(g,e,m,dk) => { const bd = sph(1.1, m, 12, 8); bd.scale.set(0.9, 0.75, 1.4); bd.position.y = 1.0; g.add(bd); const hd = cone(0.6, 1.2, m, 8); hd.rotation.x = Math.PI/2; hd.position.set(0, 1.1, 1.7); g.add(hd); for (const sx of [-1,1]){ g.add(at(sph(0.35, M(0xd89a9a)), sx*0.45, 1.75, 1.2)); g.add(at(sph(0.09, EYE(0xff2020)), sx*0.25, 1.35, 1.95)); } const tl = cyl(0.06, 0.12, 2.4, M(0xd89a9a)); tl.rotation.x = -1.2; tl.position.set(0, 0.8, -2.0); g.add(tl); for (const [x,z] of [[-0.5,0.6],[0.5,0.6],[-0.5,-0.6],[0.5,-0.6]]) g.add(at(box(0.25, 0.6, 0.25, dk), x, 0.3, z)); },
  drone:(g,e,m) => { const orb = sph(1.0, M(0xaab0b8, {metalness:0.7, roughness:0.3}), 18, 12); orb.position.y = 3.2; g.add(orb); g.add(at(sph(0.45, EYE(0xff2020)), 0, 3.2, 0.8)); for (const sx of [-1,1]){ const r = box(1.6, 0.08, 0.35, M(0x444a52)); r.position.set(sx*1.3, 3.5, 0); g.add(r); } g.userData.spin = orb; },
  treant:(g,e,m,dk) => { const bark = M(0x5a3a20, {flatShading:true, roughness:0.95}); g.add(at(cyl(0.9, 1.2, 4.2, bark, 7), 0, 2.1, 0)); for (const sx of [-1,1]){ const br = cyl(0.25, 0.4, 2.4, bark, 6); br.position.set(sx*1.4, 3.3, 0.3); br.rotation.z = -sx*0.9; g.add(br); for (let i=0;i<3;i++){ const tw = cone(0.1, 0.8, bark, 4); tw.position.set(sx*(2.2 + i*0.15), 4.0 + i*0.2, 0.3); tw.rotation.z = -sx*(0.3 + i*0.4); g.add(tw); } }
    for (let i=0;i<5;i++){ const lf = new THREE.Mesh(new THREE.IcosahedronGeometry(1.0 + (i%2)*0.3, 0), M(e.color, {flatShading:true})); lf.position.set(-1.2 + i*0.6, 4.8 + (i%2)*0.6, -0.2); g.add(lf); } for (const sx of [-1,1]) g.add(at(sph(0.14, EYE(0x9fff60)), sx*0.35, 3.2, 1.0)); g.add(at(box(0.6, 0.15, 0.1, M(0x1a1008)), 0, 2.7, 1.0)); },
  harpy:(g,e,m,dk) => { const H = hum(g, {body:m, limb:dk, thin:1}); g.userData.aR.visible = false; g.add(at(box(1.0, 1.0, 1.0, M(0xe8c9a8)), 0, 4.2, 0)); g.add(at(box(1.05, 0.5, 1.05, dk), 0, 4.75, -0.05)); for (const sx of [-1,1]) g.add(at(sph(0.1, EYE(0xffcf4a)), sx*0.25, 4.25, 0.51)); const wings = []; for (const sx of [-1,1]){ const w = new THREE.Group(); for (let i=0;i<5;i++){ const f = box(0.9, 0.2, 0.05, i%2 ? m : dk); f.position.set(sx*(0.5 + i*0.45), -i*0.3, 0); f.rotation.z = sx*(0.3 - i*0.15); w.add(f); } w.position.set(sx*0.7, 3.6, -0.3); g.add(w); wings.push(w); } g.userData.wings = wings; for (const sx of [-1,1]) g.add(at(cone(0.08, 0.4, M(0x333333), 4), sx*0.5, 0.1, 0.3)); g.position.y = 0.4; },
  beastman:(g,e,m,dk) => { const big = ['minotaur','setE','crocman','sharkman'].includes(e.key); const H = hum(g, {body:m, limb:dk, s: big ? 1.25 : 1}); const kind = {minotaur:'bull', sharkman:'shark', crocman:'croc', satyr:'goat', jackal:'jackal', anubisE:'jackal', setE:'jackal'}[e.key] || 'jackal'; beastHead(g, kind, e.color, H.headY, H.s);
    if (['jackal','anubisE','setE'].includes(e.key)){ g.add(at(box(2.1*H.s, 0.5*H.s, 1.1*H.s, M(0xffcf4a, {metalness:0.7})), 0, 3.7*H.s, 0)); const sp = cyl(0.07, 0.07, 4.5, M(0xffcf4a, {metalness:0.7})); sp.position.set(1.8*H.s, 3*H.s, 0.8); g.add(sp); }
    if (e.key==='minotaur'){ const ax = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.12, 16, 1, false, 0, Math.PI), M(0xb8c0c8, {metalness:0.7})); ax.rotation.set(Math.PI/2, 0, -Math.PI/2); ax.position.set(2.2, 4.8, 0.9); g.add(ax); g.add(at(cyl(0.1, 0.1, 3.6, M(0x5a3a20)), 2.0, 3.6, 0.9)); } },
  cyclops:(g,e,m,dk) => { const H = hum(g, {body:m, limb:dk, s: e.boss ? 1.5 : 1.3}); const hd = box(1.5*H.s, 1.4*H.s, 1.4*H.s, m); hd.position.y = H.headY; g.add(hd); g.add(at(sph(0.42*H.s, M(0xffffff)), 0, H.headY + 0.1*H.s, 0.7*H.s)); g.add(at(sph(0.2*H.s, EYE(0xff3020)), 0, H.headY + 0.1*H.s, 0.98*H.s)); g.add(at(box(2.1*H.s, 0.8*H.s, 1.1*H.s, M(0x6a4a2a)), 0, 2.1*H.s, 0)); const cl = cyl(0.25, 0.5, 3.4, M(0x5a3a20)); cl.position.set(2.4*H.s/1.3, 4.2, 0.8); cl.rotation.z = -0.4; g.add(cl); },
  spider:(g,e,m,dk) => { const ab = sph(1.2, m, 12, 8); ab.position.set(0, 1.4, -0.9); g.add(ab); g.add(at(sph(0.7, dk, 10, 8), 0, 1.2, 0.5)); for (let i=0;i<6;i++) g.add(at(sph(0.1, EYE(e.color==='#bfe8ff' ? 0x60c0ff : 0xff2020)), -0.25 + (i%3)*0.25, 1.4 + Math.floor(i/3)*0.18, 1.08)); for (const sx of [-1,1]) for (let i=0;i<4;i++){ const lg = new THREE.Group(); const up = box(1.4, 0.12, 0.12, dk); up.position.x = sx*0.7; up.rotation.z = sx*0.6; lg.add(up); const dn = box(0.12, 1.4, 0.12, dk); dn.position.set(sx*1.5, 0.0, 0); lg.add(dn); lg.position.set(sx*0.4, 1.4, 0.7 - i*0.45); lg.rotation.y = sx*(-0.6 + i*0.4); g.add(lg); } g.userData.squish = ab; },
  bat:(g,e,m,dk) => { const bd = sph(0.7, m, 10, 8); bd.position.y = 3.0; bd.scale.y = 1.2; g.add(bd); g.add(at(sph(0.5, m), 0, 3.85, 0.1)); for (const sx of [-1,1]){ g.add(at(cone(0.2, 0.6, m, 4), sx*0.3, 4.4, 0)); g.add(at(sph(0.09, EYE(e.key==='bee' ? 0x111111 : 0xff3030)), sx*0.2, 3.9, 0.5)); }
    if (e.key==='bee'){ for (let i=0;i<3;i++) g.add(at(cyl(0.72, 0.72, 0.15, M(0x1a1a1a), 12), 0, 2.6 + i*0.35, 0)); g.add(at(rot(cone(0.12, 0.6, M(0x1a1a1a), 6), Math.PI, 0, 0), 0, 1.9, 0)); }
    const wings = []; for (const sx of [-1,1]){ const w = new THREE.Group(); const mem = new THREE.Mesh(new THREE.ConeGeometry(1.4, 2.2, 3), M(e.key==='bee' ? 0xe8f4ff : 0x2a1a2a, {side:THREE.DoubleSide, transparent: e.key==='bee', opacity: e.key==='bee' ? 0.6 : 1, flatShading:true})); mem.rotation.z = sx*Math.PI/2; mem.scale.z = 0.08; mem.position.x = sx*1.2; w.add(mem); w.position.set(sx*0.4, 3.3, 0); g.add(w); wings.push(w); } g.userData.wings = wings; g.position.y = 0.4; },
  skeleton:(g,e,m,dk) => { const bone = M(e.color, {roughness:0.7}); const H = hum(g, {body:bone, limb:bone, thin:1, s: e.key==='draugr' ? 1.15 : 1}); g.children[g.children.length-1].children[2].visible = false;
    for (let i=0;i<4;i++) g.add(at(box(1.3*H.s, 0.12, 0.6*H.s, bone), 0, (2.3 + i*0.4)*H.s, 0)); g.add(at(box(0.16, 2.0*H.s, 0.16, bone), 0, 2.9*H.s, -0.1)); const sk = box(1.1*H.s, 1.1*H.s, 1.1*H.s, bone); sk.position.y = 4.4*H.s; g.add(sk); for (const sx of [-1,1]) g.add(at(box(0.3, 0.3, 0.05, M(0x000000)), sx*0.25*H.s, 4.5*H.s, 0.56*H.s)); g.add(at(sph(0.08, EYE(e.key==='ghostsailor' ? 0x60e0ff : e.key==='draugr' ? 0x80c8ff : 0xff3030)), -0.25*H.s, 4.5*H.s, 0.6*H.s));
    if (e.key==='draugr'){ g.add(at(sph(0.62*H.s, M(0x6a6a74, {metalness:0.6}), 12, 8), 0, 4.75*H.s, 0)); for (const sx of [-1,1]) g.add(rot(at(cone(0.12, 0.7, M(0xe8e0d0), 5), sx*0.6*H.s, 5.0*H.s, 0), 0, 0, -sx*0.8)); const axe = box(0.7, 0.6, 0.08, M(0x8a96a8, {metalness:0.7})); axe.position.set(1.4*H.s, 4.0*H.s, 1.1); g.add(axe); }
    else { const sw = box(0.12, 2.0, 0.08, M(0xb8c0c8, {metalness:0.6})); sw.position.set(1.1, 3.3, 1.1); sw.rotation.x = 0.6; g.add(sw); } if (e.key==='ghostsailor'){ g.traverse(o => { if (o.isMesh){ o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.75; } }); g.add(at(glowSprite('rgba(120,220,255,.4)', 6), 0, 3, 0)); } },
  mummy:(g,e,m,dk) => { const wrap = M(e.key==='pharaoh' ? 0xd8ccb0 : e.color, {roughness:0.9}); const H = hum(g, {body:wrap, limb:wrap, s: e.boss ? 1.35 : 1}); const hd = box(1.25*H.s, 1.25*H.s, 1.25*H.s, wrap); hd.position.y = H.headY; g.add(hd);
    for (let i=0;i<10;i++){ const st = box(2.05*H.s, 0.08, 1.05*H.s, M(0xb8ac90)); st.position.y = (2.0 + i*0.2)*H.s; st.rotation.z = (i%3-1)*0.06; g.add(st); } for (const sx of [-1,1]) g.add(at(sph(0.1*H.s, EYE(0x40ffa0)), sx*0.3*H.s, H.headY + 0.1, 0.64*H.s));
    if (e.key==='pharaoh'){ const nm = box(1.6*H.s, 0.9*H.s, 1.5*H.s, M(0xffcf4a, {metalness:0.7})); nm.position.y = H.headY + 0.5*H.s; g.add(nm); for (let i=0;i<4;i++) g.add(at(box(1.62*H.s, 0.07, 1.52*H.s, M(0x1a5aa0)), 0, H.headY + (0.2 + i*0.2)*H.s, 0)); g.add(at(box(1.0*H.s, 1.1*H.s, 0.1, M(0xffcf4a, {metalness:0.8})), 0, H.headY, 0.66*H.s)); g.add(at(cyl(1.4*H.s, 1.5*H.s, 0.4*H.s, M(0xffcf4a, {metalness:0.8}), 16), 0, 3.85*H.s, 0)); } },
  gorgon:(g,e,m,dk) => { const H = hum(g, {body:M(0x2a5a3a), limb:M(0x9ac8a0)}); const hd = box(1.2, 1.2, 1.2, M(0x9ac8a0)); hd.position.y = H.headY; g.add(hd); for (const sx of [-1,1]) g.add(at(sph(0.12, EYE(0xffff40)), sx*0.28, H.headY + 0.1, 0.62));
    g.userData.snakes = []; for (let i=0;i<10;i++){ const sn = new THREE.Group(); for (let j=0;j<4;j++){ const s = sph(0.12 - j*0.015, M(0x3a8a3a), 6, 5); s.position.set(0, j*0.2, -j*0.06); sn.add(s); } const a2 = i*0.63; sn.position.set(Math.cos(a2)*0.55, H.headY + 0.5, Math.sin(a2)*0.55); sn.rotation.set(Math.sin(a2)*0.8, 0, -Math.cos(a2)*0.8); g.add(sn); g.userData.snakes.push(sn); } const bw = tor(0.6, 0.06, M(0x8a5a2a), 5, 16, Math.PI); bw.position.set(1.6, 3.3, 0.8); bw.rotation.y = Math.PI/2; g.add(bw); },
  hound3:(g,e,m,dk) => { const bd = box(1.8, 1.6, 3.4, m); bd.position.y = 2.0; g.add(bd); for (const [x,z] of [[-0.6,1.2],[0.6,1.2],[-0.6,-1.2],[0.6,-1.2]]) g.add(at(box(0.45, 1.4, 0.45, dk), x, 0.7, z)); for (const sx of [-1,0,1]){ const hd = box(0.9, 0.9, 1.2, m); hd.position.set(sx*0.85, 2.9 + (sx ? 0 : 0.3), 2.0); hd.rotation.y = -sx*0.3; g.add(hd); for (const ex of [-1,1]) g.add(at(sph(0.09, EYE(0xff6020)), sx*0.85 + ex*0.2, 3.1 + (sx ? 0 : 0.3), 2.6)); g.add(at(cone(0.15, 0.45, m, 4), sx*0.85 + 0.25, 3.5 + (sx ? 0 : 0.3), 1.8)); } const fl = glowSprite('rgba(255,90,20,.5)', 4); fl.position.set(0, 3, 2.4); g.add(fl); const tl = box(0.25, 0.25, 1.6, dk); tl.position.set(0, 2.6, -2.2); tl.rotation.x = 0.6; g.add(tl); },
  colossus:(g,e,m,dk) => { const H = hum(g, {body:M(0x3a3a46, {metalness:0.5}), limb:M(0x2a2a34, {metalness:0.5}), s:1.5}); const tv = box(2.0, 1.6, 1.4, M(0x1a1a20, {metalness:0.6})); tv.position.y = H.headY; g.add(tv); const scr = box(1.6, 1.2, 0.05, M(0x1c2a3a, {emissive:0xff2020, emissiveIntensity:0.6})); scr.position.set(0, H.headY, 0.72); g.add(scr); g.add(at(sph(0.3, EYE(0xffffff)), 0, H.headY, 0.78)); g.add(at(box(0.6, 0.6, 0.06, EYE(0xff2020)), 0, 2.9*1.5, 0.78)); },
  hydra:(g,e,m,dk) => { const bd = sph(1.8, m, 14, 10); bd.position.y = 1.6; bd.scale.set(1.2, 0.9, 1.3); g.add(bd); const n = e.key==='scylla' ? 6 : 5; g.userData.necks = []; for (let i=0;i<n;i++){ const nk = new THREE.Group(); for (let j=0;j<5;j++){ const s = sph(0.42 - j*0.03, m, 8, 6); s.position.set(0, j*0.55, j*0.12); nk.add(s); } const hd = box(0.8, 0.6, 1.1, m); hd.position.set(0, 2.9, 0.75); nk.add(hd); for (const sx of [-1,1]) nk.add(at(sph(0.08, EYE(0xffcf20)), sx*0.25, 3.05, 1.25)); nk.add(at(rot(cone(0.06, 0.2, M(0xffffff), 4), Math.PI, 0, 0), 0.2, 2.6, 1.25)); const a2 = -0.9 + i*(1.8/(n-1)); nk.position.set(Math.sin(a2)*1.2, 2.2, 0.6); nk.rotation.z = -a2*0.6; nk.rotation.x = 0.2; g.add(nk); g.userData.necks.push(nk); } const tl = cone(0.5, 2.5, m, 8); tl.rotation.x = -1.3; tl.position.set(0, 1.0, -2.4); g.add(tl); },
  jelly:(g,e,m,dk) => { const big = e.boss || e.mini; const s = big ? 1.6 : 1; const dome = new THREE.Mesh(new THREE.SphereGeometry(1.3*s, 18, 10, 0, Math.PI*2, 0, Math.PI/2), M(e.color, {transparent:true, opacity:0.75, emissive:e.color, emissiveIntensity:0.4, roughness:0.1})); dome.position.y = 3.2*s; g.add(dome); g.userData.tent = []; for (let i=0;i<8;i++){ const t2 = cyl(0.06, 0.02, 2.4*s, M(e.color, {transparent:true, opacity:0.7, emissive:e.color, emissiveIntensity:0.5}), 4); const a2 = i*0.785; t2.position.set(Math.cos(a2)*0.8*s, 2.0*s, Math.sin(a2)*0.8*s); g.add(t2); g.userData.tent.push(t2); } g.add(at(glowSprite('rgba(160,220,255,.5)', 4*s), 0, 3*s, 0)); g.userData.float = true; },
  serpent:(g,e,m,dk) => { const big = e.boss ? 1.7 : e.key==='seaserpent' || e.key==='sandwurm' ? 1.25 : 1; g.userData.coils = []; for (let i=0;i<9;i++){ const s = sph((0.65 - i*0.04)*big, i%2 ? m : dk, 10, 8); s.position.set(Math.sin(i*0.9)*1.1*big, (0.6 + Math.max(0, 3 - i)*0.75)*big, (0.6 - i*0.45)*big); g.add(s); g.userData.coils.push(s); }
    const hd = box(0.9*big, 0.6*big, 1.2*big, m); hd.position.set(0, 3.0*big, 1.1*big); g.add(hd); for (const sx of [-1,1]) g.add(at(sph(0.1*big, EYE(e.boss ? 0xff2020 : 0xffcf20)), sx*0.3*big, 3.2*big, 1.65*big)); for (const sx of [-1,1]) g.add(at(rot(cone(0.06*big, 0.3*big, M(0xffffff), 4), Math.PI, 0, 0), sx*0.2*big, 2.7*big, 1.6*big));
    if (e.key==='cobra' || e.key==='apophis'){ const hood = new THREE.Mesh(new THREE.CircleGeometry(0.9*big, 14), M(e.color, {side:THREE.DoubleSide})); hood.position.set(0, 2.8*big, 0.85*big); g.add(hood); } if (e.key==='eel'){ g.add(at(glowSprite('rgba(255,240,120,.5)', 3), 0, 2, 0)); } if (e.key==='apophis'){ for (let i=0;i<8;i++) g.add(at(cone(0.15*big, 0.6*big, M(0xa040ff, {emissive:0x6020c0, emissiveIntensity:0.8}), 4), 0, (2.0 + i*0.3)*big, (0.4 - i*0.4)*big)); } },
  horse:(g,e,m,dk) => { const bd = box(1.3, 1.5, 3.0, m); bd.position.y = 2.2; g.add(bd); for (const [x,z] of [[-0.45,1.1],[0.45,1.1],[-0.45,-1.1],[0.45,-1.1]]) g.add(at(box(0.35, 1.6, 0.35, dk), x, 0.8, z)); const nk = box(0.7, 1.6, 0.8, m); nk.position.set(0, 3.3, 1.5); nk.rotation.x = 0.5; g.add(nk); const hd = box(0.65, 0.65, 1.3, m); hd.position.set(0, 4.0, 2.2); g.add(hd); for (let i=0;i<8;i++) g.add(at(box(0.15, 0.5, 0.15, M(0x2ab0a0, {emissive:0x108070, emissiveIntensity:0.5})), 0, 3.6 - i*0.05, 1.3 - i*0.2)); for (const sx of [-1,1]) g.add(at(sph(0.08, EYE(0x60ffe0)), sx*0.3, 4.1, 2.6)); },
  puffer:(g,e,m) => { const bd = sph(1.3, m, 14, 10); bd.position.y = 2.6; g.add(bd); for (let i=0;i<26;i++){ const sp = cone(0.08, 0.45, M(0xf4f0e0), 4); const p = new THREE.Vector3().setFromSphericalCoords(1.35, Math.acos(1 - 2*(i+0.5)/26), i*2.4); sp.position.copy(p).add(V3(0, 2.6, 0)); sp.lookAt(V3(0, 2.6, 0)); sp.rotateX(-Math.PI/2); g.add(sp); } for (const sx of [-1,1]) g.add(at(sph(0.18, EYE(0x111111)), sx*0.5, 2.9, 1.15)); g.userData.float = true; g.userData.squish = bd; },
  djinn:(g,e,m,dk) => { const tail = cone(0.9, 2.6, M(e.color, {transparent:true, opacity:0.7, emissive:e.color, emissiveIntensity:0.4}), 10); tail.rotation.x = Math.PI; tail.position.y = 1.6; g.add(tail); g.add(at(box(1.8, 1.6, 0.9, m), 0, 3.6, 0)); const hd = sph(0.7, m, 12, 10); hd.position.y = 4.9; g.add(hd); for (const sx of [-1,1]){ g.add(at(sph(0.11, EYE(e.key==='icewraith' ? 0x80e0ff : 0xffff60)), sx*0.25, 5.0, 0.62)); const ar = box(0.6, 1.6, 0.6, m); ar.position.set(sx*1.25, 3.6, 0.2); ar.rotation.z = sx*0.3; g.add(ar); } g.add(at(glowSprite(e.key==='stormdjinn' ? 'rgba(120,180,255,.5)' : e.key==='icewraith' ? 'rgba(220,240,255,.5)' : 'rgba(255,200,120,.5)', 5), 0, 3, 0)); g.userData.float = true; },
  kraken:(g,e,m,dk) => { const hd = sph(2.2, m, 18, 14); hd.position.y = 4.0; hd.scale.y = 1.3; g.add(hd); for (const sx of [-1,1]) g.add(at(sph(0.45, EYE(0xffcf20)), sx*0.9, 3.6, 1.8)); g.userData.tent = []; for (let i=0;i<8;i++){ const t2 = new THREE.Group(); for (let j=0;j<6;j++){ const s = sph(0.45 - j*0.06, j%2 ? m : dk, 8, 6); s.position.set(0, -j*0.55, j*0.15); t2.add(s); } const a2 = i*0.785; t2.position.set(Math.cos(a2)*1.6, 2.2, Math.sin(a2)*1.6); t2.rotation.set(Math.sin(a2)*0.7, 0, -Math.cos(a2)*0.7); g.add(t2); g.userData.tent.push(t2); } },
  scorpion:(g,e,m,dk) => { const bd = box(1.6, 0.7, 2.2, m); bd.position.y = 0.9; g.add(bd); for (const sx of [-1,1]){ for (let i=0;i<4;i++){ const l = box(1.2, 0.12, 0.12, dk); l.position.set(sx*1.2, 0.6, 0.6 - i*0.45); l.rotation.z = sx*0.6; g.add(l); } const arm = box(0.3, 0.3, 1.2, m); arm.position.set(sx*0.8, 1.0, 1.6); arm.rotation.y = -sx*0.3; g.add(arm); g.add(at(box(0.6, 0.35, 0.7, m), sx*1.0, 1.0, 2.3)); }
    const tail = new THREE.Group(); for (let i=0;i<6;i++){ const s = sph(0.35 - i*0.03, i%2 ? m : dk, 8, 6); s.position.set(0, i*0.5, -Math.sin(i*0.5)*0.9 + i*0.1); tail.add(s); } const st = cone(0.15, 0.6, M(0x1a1a1a), 5); st.position.set(0, 3.1, 0.6); st.rotation.x = 2.4; tail.add(st); tail.position.set(0, 1.1, -1.2); g.add(tail); for (const sx of [-1,1]) g.add(at(sph(0.08, EYE(0xff3020)), sx*0.25, 1.35, 1.12)); },
  beetle:(g,e,m,dk) => { for (let k=0;k<3;k++){ const sc = new THREE.Group(); const sh = sph(0.8, M(e.color, {metalness:0.6, roughness:0.2}), 12, 8); sh.scale.set(1, 0.6, 1.2); sc.add(sh); sc.add(at(box(0.03, 0.5, 1.8, M(0x40ffd0, {emissive:0x20c0a0, emissiveIntensity:0.8})), 0, 0.3, 0)); for (const sx of [-1,1]) for (let i=0;i<3;i++){ const l = box(0.7, 0.08, 0.08, M(0x111111)); l.position.set(sx*0.8, -0.2, 0.4 - i*0.4); l.rotation.z = sx*0.5; sc.add(l); } sc.position.set(-1.2 + k*1.2, 0.7 + (k===1 ? 0.5 : 0), k===1 ? 0.6 : -0.3); g.add(sc); } },
  sphinx:(g,e,m,dk) => { const bd = box(2.2, 1.8, 3.8, m); bd.position.y = 1.4; g.add(bd); for (const sx of [-1,1]) g.add(at(box(0.7, 0.7, 1.6, m), sx*0.75, 0.35, 2.4)); const hd = box(1.4, 1.5, 1.3, M(0xd8b070)); hd.position.set(0, 3.2, 1.6); g.add(hd); const nm = box(1.8, 1.3, 1.5, M(0xffcf4a, {metalness:0.6})); nm.position.set(0, 3.5, 1.4); g.add(nm); for (let i=0;i<4;i++) g.add(at(box(1.82, 0.08, 1.52, M(0x1a5aa0)), 0, 3.0 + i*0.25, 1.4)); for (const sx of [-1,1]) g.add(at(sph(0.12, EYE(0x40e0ff)), sx*0.3, 3.3, 2.27)); const wings = []; for (const sx of [-1,1]){ const w = box(0.1, 1.6, 2.6, M(0xffcf4a, {metalness:0.5})); w.position.set(sx*1.3, 2.8, 0); w.rotation.z = -sx*0.5; g.add(w); wings.push(w); } },
  fox:(g,e,m,dk) => { const bd = box(1.1, 1.0, 2.2, m); bd.position.y = 1.2; g.add(bd); for (const [x,z] of [[-0.35,0.8],[0.35,0.8],[-0.35,-0.8],[0.35,-0.8]]) g.add(at(box(0.3, 0.9, 0.3, dk), x, 0.45, z)); const hd = box(0.9, 0.8, 0.9, m); hd.position.set(0, 1.9, 1.3); g.add(hd); g.add(at(box(0.4, 0.35, 0.6, m), 0, 1.75, 1.95)); for (const sx of [-1,1]){ g.add(at(cone(0.2, 0.6, m, 4), sx*0.3, 2.5, 1.2)); g.add(at(sph(0.08, EYE(0x60c0ff)), sx*0.22, 2.0, 1.76)); } for (let i=0;i<3;i++){ const t2 = cone(0.35, 1.6, M(0xffffff), 6); t2.position.set(-0.4 + i*0.4, 1.8, -1.6); t2.rotation.x = -0.9; t2.rotation.z = (i-1)*0.4; g.add(t2); } },
  mammoth:(g,e,m,dk) => { const bd = sph(1.8, M(e.color, {flatShading:true, roughness:0.95}), 10, 8); bd.position.y = 2.6; bd.scale.set(1, 0.9, 1.3); g.add(bd); for (const [x,z] of [[-0.8,1.0],[0.8,1.0],[-0.8,-1.0],[0.8,-1.0]]) g.add(at(cyl(0.45, 0.5, 1.8, dk, 8), x, 0.9, z)); const hd = sph(1.0, M(e.color, {flatShading:true}), 10, 8); hd.position.set(0, 3.4, 2.0); g.add(hd); const tr = cyl(0.2, 0.35, 2.2, dk, 8); tr.position.set(0, 2.2, 2.7); tr.rotation.x = 0.3; g.add(tr); for (const sx of [-1,1]){ const tk = tor(0.9, 0.12, M(0xf4ecd8), 6, 14, Math.PI*0.9); tk.position.set(sx*0.5, 2.3, 2.6); tk.rotation.set(0, Math.PI/2, Math.PI*0.6); g.add(tk); g.add(at(sph(0.1, EYE(0xff3020)), sx*0.5, 3.6, 2.85)); } },
  bear:(g,e,m,dk) => { const bd = box(2.2, 2.0, 3.2, m); bd.position.y = 2.1; g.add(bd); for (const [x,z] of [[-0.75,1.1],[0.75,1.1],[-0.75,-1.1],[0.75,-1.1]]) g.add(at(box(0.7, 1.4, 0.7, dk), x, 0.7, z)); const hd = box(1.3, 1.2, 1.3, m); hd.position.set(0, 3.0, 2.0); g.add(hd); g.add(at(box(0.6, 0.5, 0.6, m), 0, 2.8, 2.8)); for (const sx of [-1,1]){ g.add(at(sph(0.25, m), sx*0.5, 3.7, 1.8)); g.add(at(sph(0.08, EYE(0x111111)), sx*0.3, 3.2, 2.66)); } g.add(at(sph(0.12, M(0x111111)), 0, 2.9, 3.12)); },
  giant:(g,e,m,dk) => { const s = e.boss ? 2.0 : e.mini ? 1.7 : 1.45; const stone = e.key==='hrungnir'; const H = hum(g, {body:M(e.color, {flatShading:true, roughness: stone ? 0.95 : 0.2, metalness: stone ? 0 : 0.1, emissive: stone ? 0 : 0x305070, emissiveIntensity:0.25}), limb:dk, s}); const hd = box(1.4*s, 1.4*s, 1.4*s, M(e.color, {flatShading:true})); hd.position.y = H.headY; g.add(hd); for (const sx of [-1,1]) g.add(at(sph(0.12*s, EYE(stone ? 0xffa020 : 0x80e0ff)), sx*0.3*s, H.headY + 0.1*s, 0.71*s)); g.add(at(box(1.2*s, 0.9*s, 0.3*s, M(0xf4f8ff)), 0, H.headY - 0.7*s, 0.6*s));
    for (let i=0;i<6;i++){ const ic = cone(0.18*s, (0.7 + (i%2)*0.4)*s, M(stone ? 0x6a6a6a : 0xe8f8ff, {flatShading:true, emissive: stone ? 0 : 0x80c8ff, emissiveIntensity:0.3}), 5); ic.position.set((-1 + i*0.4)*s, (4.0 + (i%2)*0.2)*s, -0.4*s); ic.rotation.x = -0.4; g.add(ic); } if (e.key==='ymir'){ const cr = tor(0.8*s, 0.1*s, M(0xbfe8ff, {emissive:0x80c0ff, emissiveIntensity:0.8}), 5, 16); cr.rotation.x = Math.PI/2; cr.position.y = H.headY + 0.75*s; g.add(cr); } }
};
/* v8: smooth jointed creatures (CREATURES) replace the blocky v5 models; the v7 bespoke bosses keep their own builders */
function buildEnemy(e){ if (typeof CREATURES === 'undefined' || !CREATURES.has(e)) return buildEnemy0(e); let g; try { g = CREATURES.build(e); } catch (err){ console.warn('v8 creature failed', e.key, err); return buildEnemy0(e); }
  const A = e.art, boss = !!e.boss, elite = !!e.elite; g.userData.hover = g.userData.hoverY || 0;
  if (boss || elite || e.mini){ const aura = glowSprite(boss ? (LIGHTCSS7[A] || 'rgba(255,40,40,.4)') : e.mini ? 'rgba(255,120,30,.38)' : 'rgba(255,200,60,.3)', boss ? 12 : 8); aura.position.y = 3.2; g.add(aura); g.userData.aura = aura;
    const ring = new THREE.Mesh(new THREE.RingGeometry(2.2, 2.8, 48), new THREE.MeshBasicMaterial({color: boss ? (LIGHT7[A] || 0xff2020) : e.mini ? 0xffaa30 : 0xffcf40, transparent:true, opacity:0.45, side:THREE.DoubleSide, blending:THREE.AdditiveBlending, depthWrite:false})); ring.rotation.x = -Math.PI/2; ring.position.y = 0.05; g.add(ring); g.userData.ring = ring;
    if (boss){ const pl = new THREE.PointLight(LIGHT7[A] || 0xff3030, 1.8, 14); pl.position.set(0, 4, 2); g.add(pl); g.userData.bossLight = pl; } }
  const sc = (boss ? 1.0 : e.mini ? 0.85 : elite ? 0.7 : 0.6) * ({golem:0.95, giant:0.85, colossus:0.8, kraken:0.75, hydra:0.85, orochi:0.85, typhon:0.8, gashadokuro:0.85, sphinx:0.85, mammoth:0.9, eye:0.8}[A] || 1); const KS = {fenrir:1.5, skoll:1.25, cerberus:1.15, kraken:1.2, apophis:1.15}; const sc2 = sc*(KS[e.key] || 1);
  g.scale.multiplyScalar(sc2); g.userData.base = g.scale.x; return g; }
function buildEnemy0(e){
  const g = new THREE.Group(); const c = new THREE.Color(e.color); const m = M(c, {flatShading:true}), dk = M(c.clone().multiplyScalar(0.65), {flatShading:true});
  const boss = !!e.boss, elite = !!e.elite; const eyeC = boss ? 0xff2a2a : elite ? 0xffb52e : 0xff4040; const A = e.art;
  const blocky = (headCol, bodyCol, opts={}) => { const s = opts.s || 1; const b = new THREE.Group();
    b.add(at(box(0.9*s, 1.9*s, 0.9*s, dk), -0.5*s, 0.95*s, 0)); b.add(at(box(0.9*s, 1.9*s, 0.9*s, dk), 0.5*s, 0.95*s, 0));
    b.add(at(box(2*s, 2*s, 1*s, bodyCol), 0, 2.9*s, 0)); const hd = at(box(1.3*s, 1.3*s, 1.3*s, headCol), 0, 4.55*s, 0); b.add(hd);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(1.25*s, 1.25*s), new THREE.MeshBasicMaterial({map:faceTex(boss ? 'scary' : 'angry', boss ? '#ff2020' : '#ff3030'), transparent:true})); face.position.set(0, 4.55*s, 0.67*s); b.add(face);
    const aL = at(box(0.9*s, 1.9*s, 0.9*s, bodyCol), -1.45*s, 2.9*s, 0), aR = at(box(0.9*s, 1.9*s, 0.9*s, bodyCol), 1.45*s, 2.9*s, 0); aR.rotation.x = -0.7; b.add(aL, aR); b.userData.hd = hd; b.userData.aR = aR; return b; };
  if (A==='slime'){ const s = sph(1.6, M(c, {transparent:true, opacity:0.85, roughness:0.15}), 20, 14); s.scale.y = 0.75; s.position.y = 1.2; g.add(s); g.add(at(sph(0.25, EYE(0x111111)), -0.5, 1.6, 1.3)); g.add(at(sph(0.25, EYE(0x111111)), 0.5, 1.6, 1.3)); g.add(at(sph(0.5, M(0xffffff,{transparent:true,opacity:0.5})), -0.6, 2.0, 0.8)); g.userData.squish = s; }
  else if (A==='boar' || A==='wolf' || A==='cat' || A==='crab'){
    if (A==='crab'){ const sh = sph(1.6, m, 16, 10); sh.scale.set(1.2, 0.6, 0.9); sh.position.y = 1.1; g.add(sh); for (const sx of [-1,1]){ g.add(at(box(1, 0.7, 0.7, m), sx*2.2, 1.6, 0.6)); for (let i=0;i<3;i++){ const l = box(0.15, 1.2, 0.15, dk); l.position.set(sx*(1.2+i*0.3), 0.5, -0.5+i*0.4); l.rotation.z = sx*0.6; g.add(l); } }
      g.add(at(sph(0.22, EYE(0x111111)), -0.4, 2.2, 0.8)); g.add(at(sph(0.22, EYE(0x111111)), 0.4, 2.2, 0.8)); }
    else { const bd = box(3, 1.5, 1.4, m); bd.position.set(0, 1.9, 0); g.add(bd); for (const [x,z] of [[-1,-0.5],[-1,0.5],[1,-0.5],[1,0.5]]) g.add(at(box(0.4, 1.3, 0.4, dk), x, 0.65, z));
      const hd = box(1.3, 1.2, 1.2, m); hd.position.set(-1.9, 2.4, 0); g.add(hd); g.add(at(sph(0.13, EYE(eyeC)), -2.55, 2.6, 0.35)); g.add(at(sph(0.13, EYE(eyeC)), -2.55, 2.6, -0.35));
      if (A==='boar'){ for (const z of [-0.35,0.35]){ const tk = cone(0.1, 0.6, M(0xffffff), 6); tk.position.set(-2.7, 2.0, z); tk.rotation.z = Math.PI/2.4; g.add(tk); } }
      else { for (const z of [-0.4,0.4]) g.add(at(cone(0.22, 0.6, m, 4), -1.8, 3.2, z)); const tl = at(box(1.6, 0.25, 0.25, m), 1.9, 2.4, 0); tl.rotation.z = 0.5; g.add(tl); }
      if (A==='cat'){ const fog = glowSprite('rgba(255,240,120,.45)', 6); fog.position.y = 2; g.add(fog); }
      g.rotation.y = Math.PI; g.scale.x = -1; }
  }
  else if (A==='bird'){ const bd = sph(1.1, m, 14, 10); bd.position.y = 2.2; bd.scale.y = 1.2; g.add(bd); g.add(at(sph(0.7, M(c.clone().multiplyScalar(1.2))), 0, 2, 0.6)); const bk = cone(0.25, 0.6, M(0xffb52e), 6); bk.rotation.x = Math.PI/2; bk.position.set(0, 2.6, 1.15); g.add(bk);
    g.add(at(sph(0.2, EYE(e.key==='owl' ? 0xffa020 : eyeC)), -0.4, 2.9, 0.9)); g.add(at(sph(0.2, EYE(e.key==='owl' ? 0xffa020 : eyeC)), 0.4, 2.9, 0.9));
    const wl = box(2.2, 0.15, 1, dk), wr = box(2.2, 0.15, 1, dk); wl.position.set(-1.6, 2.4, 0); wr.position.set(1.6, 2.4, 0); g.add(wl, wr); g.userData.wings = [wl, wr]; g.position.y = 0.6; }
  else if (A==='wisp'){ const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 1), M(c, {emissive:c, emissiveIntensity:0.9, transparent:true, opacity:0.9})); core.position.y = 2.6; g.add(core); const gl = glowSprite('rgba(120,230,255,.8)', 5); gl.position.y = 2.6; g.add(gl); const pl = new THREE.PointLight(0x80e0ff, 1.5, 8); pl.position.y = 2.6; g.add(pl); g.userData.spin = core; }
  else if (A==='golem'){ const b = blocky(m, dk, {s:1.25}); g.add(b); b.traverse(o => { if (o.isMesh && o.material !== undefined && !o.material.map) o.material = new THREE.MeshStandardMaterial({color:o.material.color, flatShading:true, roughness:0.4, metalness: e.key==='golem' ? 0.3 : 0.1}); });
    for (let i=0;i<4;i++){ const cr = new THREE.Mesh(new THREE.OctahedronGeometry(0.35), M(0x9fe8ff, {emissive:0x60d0ff, emissiveIntensity:0.8})); cr.position.set(-0.8+i*0.55, 4.3 + (i%2)*0.3, 0.3); g.add(cr); } }
  else if (A==='eye'){ const dark = e.key==='shadow'; const orb = sph(2.2, M(dark ? 0x1a1426 : 0xe9e4da, {roughness:0.3}), 32, 24); orb.position.y = 4.2; g.add(orb);
    const iris = sph(1.05, M(dark ? 0x9a30ff : 0xc01818, {emissive: dark ? 0x7a10ff : 0xa01010, emissiveIntensity:0.9}), 24, 16); iris.position.set(0, 4.2, 1.95); iris.scale.z = 0.5; g.add(iris); const pup = sph(0.5, M(0x050505)); pup.scale.z = 0.4; g.add(at(pup, 0, 4.2, 2.42)); for (let v=0; v<6; v++){ const vein = box(0.06, 1.4, 0.06, EYE(0xc01818)); const a = v*1.05; vein.position.set(Math.cos(a)*1.7, 4.2 + Math.sin(a)*1.7, 1.25); vein.rotation.z = a + Math.PI/2; g.add(vein); }
    for (let i=0;i<10;i++){ const tn = cone(0.3, 3.2, M(dark ? 0x2a1a40 : 0x5a5a6a, {flatShading:true}), 6); const a = i/10*Math.PI*2; tn.position.set(Math.cos(a)*2.6, 4.2 + Math.sin(a)*2.6, -0.4); tn.rotation.z = a - Math.PI/2; g.add(tn); }
    g.userData.iris = iris; g.userData.spinRing = true; }
  else if (A==='wyrm'){ const body = new THREE.Group(); for (let i=0;i<8;i++){ const seg = sph(1.4 - i*0.11, m, 14, 10); seg.position.set(1.6 + i*1.1, 1.4 + Math.sin(i*0.8)*0.6, -i*0.4); body.add(seg); } g.add(body);
    const neck = cyl(0.8, 1.1, 3, m, 10); neck.position.set(0.6, 3.4, 0.4); neck.rotation.z = 0.5; g.add(neck); const hd = box(2.6, 1.4, 1.6, m); hd.position.set(-0.8, 5.0, 0.6); g.add(hd); const jaw = box(2.2, 0.5, 1.4, dk); jaw.position.set(-1.0, 4.2, 0.6); g.add(jaw);
    for (const z of [0.1, 1.1]){ const hn = cone(0.25, 1.6, M(0xe8f6ff), 6); hn.position.set(0, 6.2, z); hn.rotation.z = -0.5; g.add(hn); g.add(at(sph(0.2, EYE(0x40c0ff)), -1.8, 5.3, z)); }
    for (const z of [-1, 2]){ const wg = box(4, 0.15, 2.5, dk); wg.position.set(2.5, 5, z); wg.rotation.x = z<0 ? 0.6 : -0.6; g.add(wg); (g.userData.wings = g.userData.wings || []).push(wg); }
    g.rotation.y = 0.35; }
  else if (NEWART[A]) NEWART[A](g, e, m, dk, c, eyeC);
  else { // humanoids
    const s = (A==='brute' || A==='yeti') ? 1.3 : 1;
    const headCol = A==='knight' ? M(0x7d8b9e, {metalness:0.6, roughness:0.3}) : A==='inquisitor' || A==='mage' ? M(0xe8c9a8) : A==='scarecrow' ? M(0xe8d6a0) : m;
    const bodyCol = A==='scarecrow' ? M(0xa8763a) : A==='inquisitor' ? M(0x23232c) : A==='mage' ? M(0x5b3d8f) : A==='knight' ? M(0x4a5a72, {metalness:0.5, roughness:0.35}) : A==='yeti' ? M(0xf4f8fb) : m;
    const b = blocky(headCol, bodyCol, {s}); g.add(b);
    if (A==='goblin'){ for (const sx of [-1,1]){ const ear = cone(0.3, 1.2, m, 4); ear.position.set(sx*0.95, 4.7, 0); ear.rotation.z = -sx*1.2; g.add(ear); } }
    if (A==='scarecrow'){ const hat = cone(1.3, 1.4, M(0x7a4b2a), 8); hat.position.y = 5.8; g.add(hat); g.add(at(cyl(1.5,1.5,0.1,M(0x7a4b2a),16), 0, 5.2, 0)); for (let i=0;i<6;i++){ const st = box(0.06, 0.8, 0.06, M(0xe8c96a)); st.position.set(-0.8+i*0.32, 1.7, 0.5); st.rotation.z = (i-3)*0.15; g.add(st); } }
    if (A==='inquisitor'){ g.add(at(box(1.5, 0.3, 1.5, M(0x111118)), 0, 5.25, 0)); g.add(at(box(1.2, 0.25, 0.1, M(0x9fe8ff, {emissive:0x6fd8ff, emissiveIntensity:0.9})), 0, 4.65, 0.68)); }
    if (A==='knight'){ g.add(at(box(1.7, 2.4, 0.25, M(0x5a6a82, {metalness:0.5})), -1.6, 2.8, 0.7)); g.add(at(box(1.2, 0.18, 0.05, EYE(0xff3030)), 0, 4.6, 0.68)); }
    if (A==='mage'){ const hat = cone(1.0, 2.2, M(0x4a2f78), 12); hat.position.set(0, 6.2, 0); hat.rotation.z = 0.2; g.add(hat); g.add(at(box(0.9, 1.0, 0.1, M(0xeeeeee)), 0, 3.9, 0.66)); const st = cyl(0.08, 0.08, 4.5, M(0x6b4426)); st.position.set(1.8, 3, 0.6); g.add(st); const orb = sph(0.4, M(0x8fe0ff, {emissive:0x60c0ff, emissiveIntensity:1})); orb.position.set(1.8, 5.4, 0.6); g.add(orb); const pl = new THREE.PointLight(0x80c0ff, 1.5, 7); pl.position.copy(orb.position); g.add(pl); }
    if (A==='brute' || A==='yeti'){ const club = cyl(0.25, 0.45, 3.2, M(0x6b4426)); club.position.set(2.3, 4.2, 0.6); club.rotation.z = -0.4; g.add(club); for (const sx of [-1,1]){ const tk = cone(0.15, 0.5, M(0xffffff), 6); tk.position.set(sx*0.4, 5.2, 0.8); tk.rotation.x = Math.PI; g.add(tk); } }
    if (A==='ghoul'){ g.traverse(o => { if (o.isMesh && o.material && !o.material.map){ o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.85; } }); const gl = glowSprite('rgba(120,255,160,.35)', 6); gl.position.y = 3; g.add(gl); }
    if (A==='goblin' || A==='ghoul' || A==='scarecrow'){ const sw = box(0.15, 2.2, 0.1, M(0xd8dde3, {metalness:0.6, roughness:0.3})); sw.position.set(1.6*s, 3.4*s, 1.3); sw.rotation.x = 0.5; g.add(sw); }
  }
  // terror for bosses / minis / elites
  if (boss || elite || e.mini){ const top0 = new THREE.Box3().setFromObject(g).max.y;
    const divine = A === 'god'; const aura = glowSprite(divine ? 'rgba(255,225,140,.22)' : boss ? (LIGHTCSS7[A] || 'rgba(255,30,30,.55)') : e.mini ? 'rgba(255,120,30,.45)' : 'rgba(255,200,60,.35)', boss ? 12 : 8); aura.position.y = 3.2; g.add(aura); g.userData.aura = aura;
    if ((boss || e.mini) && !divine){ const top = top0; for (let i=0;i<(NOSPIKE7.has(A) || ['wyrm','eye','hydra','kraken','serpent','jelly','hound3','sphinx','beetle','spider','bat','harpy','puffer'].includes(A)?0:(boss?7:4));i++){ const sp = cone(0.22, 1.1, M(0x1b1622, {flatShading:true}), 5); const a = -0.9 + i*(1.8/((boss?7:4)-1)); sp.position.set(Math.sin(a)*1.0, top - 0.25 + Math.cos(a)*0.3, -0.2); sp.rotation.z = -a*0.8; g.add(sp); }
      const crown = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.12, 6, 18), M(boss ? 0xffcf3a : 0xff8a3c, {metalness:0.8, roughness:0.2, emissive: boss ? 0x664400 : 0x442200})); crown.rotation.x = Math.PI/2; crown.position.y = top - 0.45; if (!NOSPIKE7.has(A) && !['wyrm','eye','hydra','kraken','serpent','jelly','hound3','sphinx','beetle','spider','bat','harpy','puffer'].includes(A)) g.add(crown); }
    const ring = new THREE.Mesh(new THREE.RingGeometry(2.2, 2.8, 40), new THREE.MeshBasicMaterial({color: divine ? 0xffe27a : boss ? (LIGHT7[A] || 0xff2020) : 0xffaa30, transparent:true, opacity:0.45, side:THREE.DoubleSide, blending:THREE.AdditiveBlending, depthWrite:false})); ring.rotation.x = -Math.PI/2; ring.position.y = 0.05; g.add(ring); g.userData.ring = ring;
    if (boss){ const pl = new THREE.PointLight(divine ? 0xffe0a0 : (LIGHT7[A] || 0xff2020), divine ? 0.6 : 2.2, 14); pl.position.set(0, 4, 2); g.add(pl); g.userData.bossLight = pl; g.userData.debris = []; if (!NOSPIKE7.has(A)) for (let i=0;i<6;i++){ const d = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18 + (i%3)*0.08, 0), M(0x2a2030, {flatShading:true})); g.add(d); g.userData.debris.push(d); } }
  }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  const sc = (boss ? 1.05 : e.mini ? 0.85 : elite ? 0.68 : 0.58) * ({wyrm:0.75, eye:0.8, golem:0.9, giant:0.85, colossus:0.8, kraken:0.75, hydra:0.85, sphinx:0.85, rat:0.8, bat:0.85, beetle:0.85, puffer:0.8, god:0.66}[A] || SCALE7[A] || 1); const KS = {fenrir:1.7, skoll:1.35, cerberus:1.3, mammoth:1.15, polarbear:1.1, kraken:1.2, apophis:1.15}; const sc2 = sc * (KS[e.key] || 1); g.scale.setScalar(sc2); g.userData.base = sc2;
  return g;
}
/* ---------- campfire / tent / chest ---------- */
function campfire(x, z){ const g = new THREE.Group(); for (let i=0;i<5;i++){ const lg = cyl(0.15, 0.15, 1.6, M(0x6b4426), 8); lg.rotation.z = Math.PI/2; lg.rotation.y = i*1.26; lg.position.y = 0.15; g.add(lg); }
  const flames = []; [[0xff5a1f,0.7,1.6],[0xffa51f,0.5,1.2],[0xfff07a,0.3,0.8]].forEach(([col,r,h]) => { const f = cone(r, h, new THREE.MeshBasicMaterial({color:col, transparent:true, opacity:0.95}), 8); f.position.y = 0.3 + h/2; g.add(f); flames.push(f); });
  const pl = new THREE.PointLight(0xff9a40, 2.6, 16, 1.6); pl.position.y = 1.4; pl.castShadow = true; g.add(pl); const glow = glowSprite('rgba(255,160,60,.6)', 5); glow.position.y = 1; g.add(glow);
  g.userData = {flames, pl}; g.position.set(x, 0, z); root.add(g); lights.fire = g; return g; }
function tent(x, z){ const t = cone(2.4, 3, M(0xc4563b, {flatShading:true}), 4); t.rotation.y = Math.PI/4; t.position.set(x, 1.5, z); root.add(t); root.add(at(box(0.9, 1.6, 0.05, M(0x3a1f1a)), x, 0.8, z + 1.2)); }
function chest(x, z, rar){ const g = new THREE.Group(); const wood = M(0x8a5a2a), gold = M(0xe3b04b, {metalness:0.7, roughness:0.3}); g.add(at(box(2, 1.1, 1.3, wood), 0, 0.55, 0)); g.add(at(box(2.05, 0.2, 1.35, gold), 0, 0.9, 0));
  const lid = new THREE.Group(); lid.position.set(0, 1.1, -0.65); const lb = box(2, 0.5, 1.3, wood); lb.position.set(0, 0.25, 0.65); lid.add(lb); lid.add(at(box(0.3, 0.35, 0.1, gold), 0, 0.15, 1.32)); g.add(lid);
  const glow = glowSprite(['rgba(220,220,230,.8)','rgba(80,160,255,.8)','rgba(180,110,255,.85)','rgba(255,180,50,.9)','rgba(255,70,110,.95)'][rar||0], 0.1); glow.position.y = 1.6; g.add(glow); g.userData = {lid, glow, open:0}; g.position.set(x, 0, z); root.add(g); return g; }
function enemyDeco(g, e){ const K = e.key, s = (e.art==='brute' || e.art==='yeti') ? 1.3 : e.art==='golem' ? 1.25 : 1; const Y = v => v*s;
  const add = (o, x, y, z) => { o.position.set(x*s, y*s, z*s); g.add(o); return o; };
  if (K==='brawler'){ add(box(1.4, 0.25, 1.5, M(0x4a4a5a)), 0, 5.25, 0.1); add(box(1.0, 0.12, 0.5, M(0x4a4a5a)), 0, 5.15, 0.85); for (const sx of [-1,1]) add(box(0.95, 0.45, 0.95, M(0xf4f0e8)), sx*1.45, 1.95, 0.5); for (const sx of [-1,1]) add(box(0.15, 2.0, 0.05, M(0x8a2a2a)), sx*0.5, 2.9, 0.52); }
  if (K==='goblin'){ const hd = cone(0.9, 1.0, M(0x3a5a2a), 6); add(hd, 0, 5.5, -0.1); add(box(0.3, 0.6, 0.1, M(0x5a3a1a)), 0.5, 2.6, 0.52); }
  if (K==='drowned'){ add(cyl(0.75, 0.75, 0.3, M(0xf4f4f4), 12), 0, 5.3, 0); add(box(1.5, 0.08, 1.5, M(0x1a2a5a)), 0, 5.2, 0); for (let i=0;i<6;i++){ const sw = box(0.08, 1.2 + (i%3)*0.3, 0.08, M(0x2a8a4a)); sw.rotation.z = (i-3)*0.15; add(sw, -0.8 + i*0.32, 3.0 - (i%2)*0.4, 0.52); } }
  if (K==='pirate'){ const hat = new THREE.Group(); hat.add(box(1.7, 0.18, 1.3, M(0x15151a))); hat.add(at(box(1.1, 0.6, 1.0, M(0x15151a)), 0, 0.35, 0)); for (const sx of [-1,1]){ const f = box(0.5, 0.5, 0.1, M(0x15151a)); f.position.set(sx*0.7, 0.3, 0); f.rotation.z = -sx*0.5; hat.add(f); } hat.add(at(box(0.25, 0.25, 0.05, M(0xffffff)), 0, 0.4, 0.52)); add(hat, 0, 5.35, 0); add(box(0.4, 0.3, 0.05, M(0x000000)), -0.3, 4.65, 0.69); add(tor(0.1, 0.03, M(0xffcf4a, {metalness:0.8}), 4, 10), 0.7, 4.3, 0); const cut = box(0.18, 1.8, 0.08, M(0xd8dde3, {metalness:0.7})); cut.rotation.x = 0.6; add(cut, 1.6, 3.4, 1.3); const gl = glowSprite('rgba(120,220,255,.35)', 6); add(gl, 0, 3, 0); }
  if (K==='husk'){ add(box(0.9, 0.9, 0.1, M(0x0a0806)), 0, 3.0, 0.52); for (let i=0;i<6;i++){ const st = box(0.06, 0.6, 0.06, M(0xe8c96a)); st.rotation.z = (i-3)*0.4; add(st, 0, 3.0, 0.55); } add(box(1.0, 0.4, 0.1, M(0x5a4a3a)), 0, 4.3, 0.7); }
  if (K==='bandit'){ add(box(1.35, 0.55, 0.1, M(0xb02a2a)), 0, 4.3, 0.68); add(cyl(1.3, 1.3, 0.1, M(0x8a6a3a), 16), 0, 5.25, 0); add(cyl(0.7, 0.75, 0.6, M(0x8a6a3a), 16), 0, 5.55, 0); const pn = cyl(1.2, 1.7, 1.6, M(0xc89a5a), 6); add(pn, 0, 3.3, 0); }
  if (K==='sgoblin'){ add(box(1.5, 0.35, 1.5, M(0xc02030)), 0, 3.95, 0); const tail = box(0.35, 1.0, 0.1, M(0xc02030)); tail.rotation.z = 0.2; add(tail, 0.5, 3.4, 0.6); add(cone(0.75, 1.0, M(0x2a5aa0), 10), 0, 5.6, 0); add(sph(0.2, M(0xffffff)), 0, 6.15, 0); }
  if (K==='yeti'){ for (const sx of [-1,1]){ const hn = cone(0.2, 0.9, M(0x9ab0c0), 6); hn.rotation.z = -sx*0.6; add(hn, sx*0.75, 5.4, 0); } for (let i=0;i<8;i++){ const f = cone(0.25, 0.5, M(0xffffff), 5); f.rotation.x = Math.PI; add(f, -0.85 + (i%4)*0.55, 2.0 + Math.floor(i/4)*1.6, 0.45); } for (const sx of [-1,1]) for (let i=0;i<3;i++){ const c = cone(0.07, 0.4, M(0x223344), 4); c.rotation.x = Math.PI; add(c, sx*1.45 - 0.2 + i*0.2, 1.75, 0.4); } }
  if (K==='golem'){ for (const sx of [-1,1]) for (let i=0;i<3;i++){ const ic = cone(0.22, 1.1, M(0xd8f4ff, {emissive:0x60c8ff, emissiveIntensity:0.5, transparent:true, opacity:0.9}), 5); ic.rotation.z = -sx*(0.3 + i*0.3); add(ic, sx*(1.1 + i*0.2), 4.1 + i*0.15, 0); } }
  if (K==='sgolem'){ for (let i=0;i<5;i++){ const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35 + (i%2)*0.15, 0), M(0xc8a060, {flatShading:true})); add(r, -1.2 + i*0.6, 4.05 + (i%2)*0.3, -0.2); } add(box(1.1, 0.2, 0.05, EYE(0xffb040)), 0, 4.6, 0.68); }
  if (K==='enforcer' || K==='captain'){ add(box(1.5, 0.2, 1.5, M(0x111118)), 0, 5.25, 0); add(box(2.05, 0.3, 1.05, M(0x111118)), 0, 2.1, 0); add(box(0.25, 0.25, 0.06, EYE(0xff3030)), 0.55, 3.5, 0.52); }
  if (K==='sprite'){ for (let i=0;i<3;i++){ const b = new THREE.Group(); const pts = [[0,0],[0.2,0.4],[0,0.45],[0.25,0.9]]; for (let j=0;j<3;j++){ const [x1,y1] = pts[j], [x2,y2] = pts[j+1]; const L = Math.hypot(x2-x1,y2-y1); const sg = box(0.08, L, 0.08, EYE(0xfff080)); sg.position.set((x1+x2)/2, (y1+y2)/2, 0); sg.rotation.z = -Math.atan2(x2-x1, y2-y1); b.add(sg); } b.position.set(Math.cos(i*2.1)*1.5, 2.6 + Math.sin(i*2.1)*0.8, 0.3); g.add(b); } }
  if (K==='vulture'){ const rf = tor(0.45, 0.15, M(0xf4f0e0), 5, 12); rf.rotation.x = Math.PI/2; add(rf, 0, 2.5, 0.5); add(sph(0.45, M(0xd88a8a)), 0, 3.0, 0.75); }
  if (K==='gull'){ add(box(0.9, 0.1, 0.5, M(0x2a2a3a)), 0, 3.15, 0.5); }
  if (K==='owl'){ for (const sx of [-1,1]) add(cone(0.15, 0.45, M(0x9ab0c0), 4), sx*0.5, 3.6, 0.3); }
  if (K==='pwisp'){ const mg = cone(0.4, 0.9, M(0x8a8a8a, {metalness:0.6}), 10); mg.rotation.x = -Math.PI/2; add(mg, 0, 2.6, 1.1); }
  if (K==='hel'){ add(box(0.66, 1.32, 0.08, M(0x1a2a3a)), -0.33, 4.55, 0.68); add(sph(0.12, EYE(0x80e0ff)), -0.3, 4.65, 0.74); for (let i=0;i<5;i++) add(cone(0.08, 0.5, M(0xe8e0d0), 4), -0.5 + i*0.25, 5.4, 0); }
  if (K==='sycorax'){ for (let i=0;i<8;i++){ const st = box(0.12, 1.6 + (i%3)*0.3, 0.12, M(0x2a8a5a)); st.rotation.z = (i-3.5)*0.12; add(st, -0.7 + i*0.2, 4.2, -0.5); } add(glowSprite('rgba(120,255,180,.7)', 1.2), 1.8, 5.4, 0.6); }
  if (K==='magus'){ for (let i=0;i<5;i++) add(cone(0.1, 0.4, M(0xffcf4a, {metalness:0.8}), 4), -0.4 + i*0.2, 5.35, 0.4); add(box(0.5, 0.4, 0.4, M(0xffcf4a, {metalness:0.7})), -1.4, 2.4, 0.9); }
  if (K==='fenrir' || K==='skoll'){ for (let i=0;i<4;i++){ const l = tor(0.18, 0.06, M(0x9a9aa4, {metalness:0.8}), 4, 10); l.rotation.y = i%2 ? Math.PI/2 : 0; add(l, -1.6 - i*0.25, 2.1, 0.6); } add(glowSprite(K==='skoll' ? 'rgba(255,200,80,.6)' : 'rgba(120,200,255,.6)', 3), -2.4, 2.6, 0); }
  if (K==='slime'){ add(sph(0.35, M(0x2a5a1a, {transparent:true, opacity:0.7})), 0.4, 1.0, 0.6); add(box(0.12, 0.5, 0.12, M(0x5a3a1a)), -0.5, 2.3, 0.2); }
}
function bossDeco(g, e){ const K = e.key, u = g.userData; if (u.v8 && ['oBrien','captain','caliban','troll','hollowKing','shadow'].includes(K)) return;
  const bb = new THREE.Box3().setFromObject(g); const top = bb.max.y / (g.scale.y || 1);
  if (K==='prospero'){ u.books = []; for (let i=0;i<3;i++){ const bk = new THREE.Group(); bk.add(box(0.9, 0.18, 0.7, M(0x6a2a1a))); bk.add(at(box(0.84, 0.12, 0.66, M(0xf4ead0)), 0, 0.1, 0)); const gl = glowSprite('rgba(170,120,255,.6)', 1.2); bk.add(gl); g.add(bk); u.books.push(bk); } }
  if (K==='oBrien'){ g.add(at(box(1.2, 0.18, 0.06, M(0x111111, {metalness:0.8})), 0, 4.75, 0.7)); const hand = glowSprite('rgba(255,60,60,.8)', 1.4); hand.position.set(1.6, 3.2, 1.0); g.add(hand); u.handGlow = hand; }
  if (K==='captain'){ const bt = cyl(0.12, 0.12, 2.2, M(0x111118)); bt.position.set(2.0, 3.4, 0.8); bt.rotation.x = 0.6; g.add(bt); g.add(at(sph(0.2, EYE(0xff3030)), 2.0, 4.3, 1.35)); }
  if (K==='caliban'){ for (let i=0;i<6;i++){ const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3, 0), M(0x5a5a4a, {flatShading:true})); r.position.set(-1.6 + i*0.6, 2.2 + (i%2)*1.2, -0.7); g.add(r); } }
  if (K==='troll'){ for (let i=0;i<5;i++){ const ic = cone(0.25, 1.2, M(0xd8f4ff, {emissive:0x60c8ff, emissiveIntensity:0.4}), 5); ic.position.set(-1 + i*0.5, 4.6, -0.7); ic.rotation.x = -0.4; g.add(ic); } }
  if (K==='arielStorm'){ u.rings = []; for (let i=0;i<3;i++){ const r = new THREE.Mesh(new THREE.TorusGeometry(1.4 + i*0.5, 0.06, 4, 30), new THREE.MeshBasicMaterial({color:0xbff8ff, transparent:true, opacity:0.55, blending:THREE.AdditiveBlending})); r.position.y = 1.4 + i*1.2; r.rotation.x = Math.PI/2; g.add(r); u.rings.push(r); } }
  if (K==='fogcat'){ u.fog = []; for (let i=0;i<6;i++){ const f = glowSprite('rgba(240,220,110,.35)', 3); g.add(f); u.fog.push(f); } }
  if (K==='hollowKing'){ g.add(at(sph(0.16, EYE(0xffd040)), -0.3, 4.6, 0.7)); g.add(at(sph(0.16, EYE(0xffd040)), 0.3, 4.6, 0.7)); }
  if (K==='winterOwl'){ u.snow = []; for (let i=0;i<10;i++){ const s = glowSprite('rgba(255,255,255,.9)', 0.25); g.add(s); u.snow.push(s); } }
  if (K==='shadow'){ u.tendrils = []; for (let i=0;i<8;i++){ const t = cone(0.25, 3.0, M(0x1a1026, {emissive:0x3a0a6a, emissiveIntensity:0.5}), 5); t.position.set(Math.cos(i*0.8)*2.0, 1.4, Math.sin(i*0.8)*1.2 - 0.5); g.add(t); u.tendrils.push(t); } }
  if (K==='wyrm'){ const mist = glowSprite('rgba(170,230,255,.45)', 4); mist.position.set(-1.8, 4.6, 0.6); g.add(mist); u.mist = mist; }
}
/* ---------- scenes ---------- */
let chestObj = null, enemyOrder = [], heroes = {}, heroOrder = [], camGoal = null, camLook = null;
const V3 = (x,y,z) => new THREE.Vector3(x,y,z);
function rows(i, n, x0, dir, dx){ if (n===1) return [x0, 1]; if (n===2) return i ? [x0 + dir*dx*1.05, -1.1] : [x0, 1.5];
  const front = Math.ceil(n/2); if (i < front) return [x0 + dir*i*dx, 1.9]; const j = i - front; return [x0 + dir*(j + 0.5)*dx, -1.5]; }
function heroSlot(i, n){ return n===1 ? [-4.6, 1] : rows(i, n, -3.6, -1, 3.5); }
function enemySlot(i, n, list){ const bossI = list.findIndex(e => e.boss && !e.minion);
  if (list.filter(e => e.boss && !e.minion).length >= 2){ const bs = list.filter(e => e.boss && !e.minion), ms = list.filter(e => !(e.boss && !e.minion)); const e0 = list[i]; if (e0.boss && !e0.minion){ const k = bs.indexOf(e0); return [2.4 + k*5.2, k%2 ? -3.0 : -1.2]; } const k = ms.indexOf(e0); return [0.4 + k*2.6, k%2 ? 3.6 : 2.2]; }
  if (n===1) return [3.6, 0.4];
  if (bossI >= 0){ const m = n - 1; const front = m; if (i === bossI) return [2.8 + 3.4*Math.max(0, m-1)/2 + (m===1 ? 1.6 : 0.6), -3.4]; const j = i > bossI ? i-1 : i; return m===1 ? [1.4, 2.4] : [1.2 + j*3.5*(m>3 ? 0.88 : 1), j%2 ? 0.6 : 2.4]; }
  return rows(i, n, 2.3, 1, 3.9); }
function placeHero(id, P, i, n, name){ const h = GEAR3D.buildHero(P, P.look || {}); const [x, z] = heroSlot(i, n); h.position.set(x, 0, z); h.rotation.y = 1.27; h.userData.home = V3(x, 0, z); h.userData.id = id; scene.add(h); heroes[id] = h; heroOrder.push(id); if (id === 'p') hero = h; return h; }
function pageBG(kind, o){ const th = o.theme || 0, en = o.enemies || []; let k = 'w' + (o.world || 0);
  if (kind==='camp') k += ' night'; else if (kind==='battle'){ if (th===6) k = 'p10'; else if (th===5) k = 'p7'; else if (en.some(e => e.god)) k = 'god'; else if (en.some(e => e.boss && !e.minion)) k = 'boss ' + k; }
  try { document.body.className = k; } catch(e){} }
function setScene(kind, o={}){
  pageBG(kind, o); endCut(); mode = kind; clearScene(); chestObj = null; enemyOrder = []; heroes = {}; heroOrder = []; camGoal = null;
  const w = o.world || 0, theme = o.theme || 0;
  if (kind==='camp'){ world(w, theme, true); campfire(1.2, 1); tent(-6, -2); const log = cyl(0.35, 0.35, 2.6, M(0x6b4426), 10); log.rotation.z = Math.PI/2; log.position.set(-2.4, 0.35, 1.2); root.add(log);
    hero = GEAR3D.buildHero(o.P, (o.P && o.P.look) || {}); hero.position.set(-2.4, 0.15, 1.2); hero.rotation.y = 1.25; sit(hero); scene.add(hero); heroes.p = hero;
    const seats = [[4.0, 0.6], [2.4, -1.6], [-0.2, -1.9], [4.6, 2.6]]; (o.party || []).slice(0, 4).forEach((pp, i) => { const h = GEAR3D.buildHero(pp.P, pp.P.look || {}); const [sx, sz] = seats[i]; h.position.set(sx, 0.15, sz); h.rotation.y = Math.atan2(1.2 - sx, 1 - sz); sit(h); scene.add(h); heroes[pp.id] = h; });
    cam.position.set(0.5, 3.6, 10.5); camBase = V3(-0.6, 1.4, 0); }
  else if (kind==='battle' || kind==='chest' || kind==='map' || kind==='title'){
    world(w, theme, false);
    if (kind==='battle'){ const hs = o.heroes || [{id:'p', P:o.P}]; hs.forEach((x, i) => placeHero(x.id, x.P, i, hs.length));
      const n = o.enemies.length; o.enemies.forEach((e, i) => addFoe(e, i, n, o.enemies)); camBase = V3(0.6, 2.1, 0); frame(true);
      if (o.enemies.some(e => e.boss || e.mini)){ shake = 0.6; const b = o.enemies.find(e => e.boss || e.mini); if (b) intro(b.id); try { cutscene(o.enemies, theme); } catch(err){ console.warn(err); } } }
    else { hero = GEAR3D.buildHero(o.P, (o.P && o.P.look) || {}); hero.position.set(kind==='title' ? -1.6 : -4.2, 0, 1); hero.rotation.y = kind==='title' ? 0.45 : 1.27; scene.add(hero); heroes.p = hero;
      if (kind==='chest'){ chestObj = chest(1.2, 1, o.rar || 0); cam.position.set(-1, 3.6, 10); camBase = V3(-0.6, 1.4, 0); }
      else if (kind==='title'){ if (o.demo) addFoe(o.demo, 0, 1, [o.demo]); cam.position.set(0, 3.4, 11); camBase = V3(0.6, 2.0, 0); }
      else { cam.position.set(-1, 3.8, 11); camBase = V3(-1.5, 1.8, 0); } }
  }
  cam.lookAt(camBase);
}
function frame(instant){ const xs = []; let boss = false, tall = 0;
  for (const id in heroes){ const h = heroes[id]; xs.push((h.userData.home ? h.userData.home.x : h.position.x) - 2.0); }
  for (const id in foes){ const f = foes[id], u = f.userData; if (u.dying) continue; const big = u.e && u.e.boss && !u.e.minion; if (big) boss = true; const x = u.tx !== undefined ? u.tx : f.position.x; if (u.hw === undefined){ const bb = new THREE.Box3().setFromObject(f); u.hw = Math.min(9, Math.max(0.5, (bb.max.x - bb.min.x)/2)); u.ht = bb.max.y; } const r = Math.max(big ? 2.8 : 1.5, u.hw*0.85); if (u.ht > 7 && !(u.e && u.e.minion)) tall = Math.max(tall, u.ht - 7); xs.push(x - r, x + r); }
  if (!xs.length) return; const min = Math.min(...xs), max = Math.max(...xs), cx = (min + max)/2, span = max - min;
  const hf = Math.atan(Math.tan(cam.fov*Math.PI/360) * cam.aspect); const d = Math.max(boss ? 12.5 : 11.5, (span/2 + 0.8) / Math.tan(hf)) + tall*1.5;
  const crowd = Object.keys(heroes).length + Object.keys(foes).length > 4; camGoal = V3(cx - 0.7, (crowd ? 6.2 + span*0.14 : 4.6 + span*0.09) + (boss ? 0.8 : 0), d + 2.2); camLook = V3(cx + 0.2, (crowd ? 0.8 : 1.3) + (boss ? 0.6 : 0) + tall*0.45, 0);
  if (instant){ cam.position.copy(camGoal); camBase = camLook.clone(); } }
let introUntil = 0;
function intro(id){ const f = foes[id]; if (!f) return; const goal = camGoal.clone(), look = camLook.clone(); const fp = f.position.clone(); introUntil = t + 1.7;
  const hb = new THREE.Box3().setFromObject(f); const top = hb.max.y; cam.position.set(fp.x - 1.8, top*0.75 + 1.2, fp.z + 6 + top*1.1); camBase = V3(fp.x, top*0.62, fp.z); camGoal = null;
  tween(1.7, k => { if (k < 0.45){ cam.position.x += 0.004; } else { const kk = (k-0.45)/0.55; cam.position.lerp(goal, kk*0.12); camBase.lerp(look, kk*0.12); } }, () => { camGoal = goal; camLook = look; }); }
function addFoe(e, i, n, list){ const g = buildEnemy(e); if (!g.userData.v8) enemyDeco(g, e); if (e.boss || e.mini) bossDeco(g, e); const [x, z] = enemySlot(i, n, list || [e]); g.position.set(x, 0, z); g.userData.tx = x; g.userData.tz = z;
  g.rotation.y = g.userData.v8 ? -1.2 : ['wyrm','boar','wolf','cat'].includes(e.art) ? 0.3 : e.art==='eye' ? -0.9 : -1.27; g.userData.e = e; scene.add(g); foes[e.id] = g; enemyOrder.push(e.id);
  if (e.minion){ g.scale.setScalar(0.01); const b = g.userData.base; tween(0.5, k => g.scale.setScalar(b*Math.min(1, k*1.2)), null); portal(g.position, 0xb050ff); } }
function sit(h){ const p = h.userData.parts; p.legL.rotation.x = -1.4; p.legR.rotation.x = -1.4; p.legL.position.set(-0.5, 2.0, 0.1); p.legR.position.set(0.5, 2.0, 0.1); p.body.position.y = -2; p.armR.rotation.x = -0.6; p.armL.rotation.x = -0.6; h.userData.sitting = true; }
function setEnemies(list){ const alive = list.filter(e => e.hp > 0); list.forEach(e => { if (!foes[e.id] && e.hp > 0) addFoe(e, alive.indexOf(e), alive.length, alive); else if (foes[e.id]) foes[e.id].userData.e = e; });
  alive.forEach((e, i) => { const g = foes[e.id]; if (g){ const [x, z] = enemySlot(i, alive.length, alive); g.userData.tx = x; g.userData.tz = z; } }); frame(false); }
function setHeroes(list){ // party sync: [{id, P, down, frozen, guard}]
  list.forEach((x, i) => { let h = heroes[x.id]; if (!h) h = placeHero(x.id, x.P, i, list.length); const u = h.userData;
    if (x.down && !u.down){ u.down = true; tween(0.5, k => { h.rotation.z = k*1.45; h.position.y = -k*0.3; }); } else if (!x.down && u.down){ u.down = false; h.rotation.z = 0; h.position.y = 0; flameBurst(h, 0xffc040); }
    setIce(h, !!x.frozen); setShield(h, !!x.guard); });
  for (const id in heroes) if (!list.some(x => x.id === id) && id !== 'p'){ scene.remove(heroes[id]); delete heroes[id]; }
  heroOrder = list.map(x => x.id); list.forEach((x, i) => { const h = heroes[x.id]; const [hx, hz] = heroSlot(i, list.length); h.userData.home = V3(hx, 0, hz); if (!h.userData.busy) h.position.set(hx, h.position.y, hz); }); frame(false); }
function setIce(h, on){ const u = h.userData; if (on && !u.ice){ const ic = new THREE.Mesh(new THREE.BoxGeometry(3.4, 6.2, 2.6), new THREE.MeshStandardMaterial({color:0xbfefff, transparent:true, opacity:0.45, roughness:0.05, metalness:0.1, emissive:0x60c8ff, emissiveIntensity:0.3})); ic.position.y = 3; h.add(ic); u.ice = ic; burstAt(wpos(h, 1.5), 0xbfefff, 16); }
  if (!on && u.ice){ h.remove(u.ice); u.ice = null; burstAt(wpos(h, 1.5), 0xffffff, 12); } }
function setShield(h, on){ const u = h.userData; if (on && !u.shield){ const s = new THREE.Mesh(new THREE.SphereGeometry(4.2, 18, 12, 0, Math.PI*2, 0, Math.PI/1.7), new THREE.MeshBasicMaterial({color:0x7fd0ff, transparent:true, opacity:0.22, wireframe:false, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide})); s.position.y = 0.5; h.add(s);
    const hexes = new THREE.Mesh(new THREE.SphereGeometry(4.25, 8, 6, 0, Math.PI*2, 0, Math.PI/1.7), new THREE.MeshBasicMaterial({color:0xbfe8ff, wireframe:true, transparent:true, opacity:0.5})); hexes.position.y = 0.5; h.add(hexes); u.shield = [s, hexes]; }
  if (!on && u.shield){ u.shield.forEach(x => h.remove(x)); u.shield = null; } }

/* ---------- fx primitives ---------- */
const anims = [];
function tween(dur, fn, done){ anims.push({t:0, dur, fn, done}); }
const wpos = (o, dy=0) => { if (!o) return V3(0,2,0); const c = new THREE.Vector3(); new THREE.Box3().setFromObject(o).getCenter(c); c.y += dy; return c; };
const hpos = id => heroes[id] || hero;
function sprite(col, size, pos){ const s = glowSprite(col, size); s.position.copy(pos); fxGroup.add(s); return s; }
function burstAt(c, col, n, up, speed=1){ for (let i=0;i<n;i++){ const s = sprite(`rgba(${col>>16&255},${col>>8&255},${col&255},1)`, 0.45, c); const v = V3((Math.random()-.5)*6*speed, up ? 2+Math.random()*3 : (Math.random()-.2)*6*speed, (Math.random()-.5)*3);
    tween(0.6, k => { s.position.addScaledVector(v, 0.016); s.material.opacity = 1 - k; }, () => fxGroup.remove(s)); } }
function burst(obj, col, n, up){ if (obj) burstAt(wpos(obj), col, n, up); }
function ring(pos, col, r0=0.3, r1=5, dur=0.5, y=0.08, thick=0.5){ const m = new THREE.Mesh(new THREE.RingGeometry(Math.max(0.01, r1 - thick), r1, 48), new THREE.MeshBasicMaterial({color:col, transparent:true, side:THREE.DoubleSide, blending:THREE.AdditiveBlending, depthWrite:false})); m.rotation.x = -Math.PI/2; m.position.set(pos.x, y, pos.z); fxGroup.add(m);
  const s0 = Math.max(0.02, r0/r1); m.scale.setScalar(s0); tween(dur, k => { const e = 1 - (1-k)*(1-k); m.scale.setScalar(s0 + (1 - s0)*e); m.material.opacity = 1 - k; }, () => fxGroup.remove(m)); }
function shock(pos, col, size=1){ ring(pos, col, 0.4*size, 5*size, 0.55, 0.08, 0.35); burstAt(V3(pos.x, 0.4, pos.z), 0xcab89a, 10, true); }
function arc(pos, col, opts={}){ // crescent slash
  const m = new THREE.Mesh(new THREE.RingGeometry(opts.r || 1.6, (opts.r || 1.6) + (opts.w || 0.45), 32, 1, 0, Math.PI*(opts.len || 0.9)), new THREE.MeshBasicMaterial({color:col, transparent:true, opacity:0.85, side:THREE.DoubleSide, blending:THREE.AdditiveBlending, depthWrite:false}));
  m.position.copy(pos); m.rotation.set(opts.rx || 0, opts.ry || 0, opts.rz != null ? opts.rz : 0.6); fxGroup.add(m); const spin = opts.spin || -4;
  tween(opts.dur || 0.28, k => { m.rotation.z += spin*0.016; m.material.opacity = 1 - k; m.scale.setScalar(1 + k*0.4); }, () => fxGroup.remove(m)); }
function line(a, b, col, dur=0.25, jag=0){ const pts = []; const n = jag ? 9 : 2; for (let i=0;i<n;i++){ const p = a.clone().lerp(b, i/(n-1)); if (jag && i>0 && i<n-1) p.add(V3((Math.random()-.5)*jag, (Math.random()-.5)*jag, (Math.random()-.5)*jag*0.4)); pts.push(p); }
  const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({color:col, transparent:true, blending:THREE.AdditiveBlending})); fxGroup.add(l);
  const g2 = sprite(`rgba(${col>>16&255},${col>>8&255},${col&255},.9)`, 1.6, b); tween(dur, k => { l.material.opacity = 1 - k; g2.material.opacity = 1 - k; }, () => { fxGroup.remove(l); fxGroup.remove(g2); }); }
function lightning(a, b, col=0xbfe8ff){ line(a, b, col, 0.3, 1.2); line(a, b, 0xffffff, 0.18, 0.7); flashLight(b, col); }
function beam(a, b, col, dur=0.4, w=0.25){ const len = a.distanceTo(b); const m = new THREE.Mesh(new THREE.CylinderGeometry(w, w, len, 8, 1, true), new THREE.MeshBasicMaterial({color:col, transparent:true, blending:THREE.AdditiveBlending, depthWrite:false}));
  m.position.copy(a).lerp(b, 0.5); m.lookAt(b); m.rotateX(Math.PI/2); fxGroup.add(m); const core = m.clone(); core.material = new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, blending:THREE.AdditiveBlending}); core.scale.set(0.4, 1, 0.4); fxGroup.add(core);
  tween(dur, k => { const s = k < 0.2 ? k/0.2 : 1 - (k-0.2)/0.8; m.scale.set(s, 1, s); core.scale.set(0.4*s, 1, 0.4*s); }, () => { fxGroup.remove(m); fxGroup.remove(core); }); }
/* a fixed pool of point lights: adding/removing lights at runtime forces every material to recompile (a visible hitch) */
let LPOOL = [], lpi = 0;
function flashLight(pos, col, I=4){ if (!LPOOL.length) return; const l = LPOOL[lpi++ % LPOOL.length]; l.position.copy(pos); l.color.set(col); l.intensity = I; const tk = l.userData.tk = (l.userData.tk || 0) + 1;
  tween(0.3, k => { if (l.userData.tk === tk) l.intensity = I*(1-k); }, () => { if (l.userData.tk === tk) l.intensity = 0; }); }
function projectile(a, b, mk, dur, arcH, onHit, trailCol){ const o = mk(); o.position.copy(a); fxGroup.add(o); let last = 0;
  tween(dur, k => { const p = a.clone().lerp(b, k); p.y += Math.sin(k*Math.PI)*arcH; const prev = o.position.clone(); o.position.copy(p); if (o.userData.orient){ o.lookAt(p.clone().add(p.clone().sub(prev))); }
    if (trailCol && k - last > 0.04){ last = k; const s = sprite(trailCol, 0.4, p); tween(0.3, kk => s.material.opacity = 1 - kk, () => fxGroup.remove(s)); } }, () => { fxGroup.remove(o); if (onHit) onHit(); }); }
const arrowMesh = (col=0xd04040) => () => { const g = new THREE.Group(); const sh = cyl(0.03, 0.03, 1.4, M(0x8a5a30), 5); sh.rotation.x = Math.PI/2; g.add(sh); const tp = cone(0.08, 0.25, M(0xdddddd, {metalness:0.7}), 4); tp.rotation.x = Math.PI/2; tp.position.z = 0.8; g.add(tp); g.add(at(box(0.02, 0.14, 0.3, M(col)), 0, 0, -0.6)); g.userData.orient = true; return g; };
const orbMesh = (col, size=0.5) => () => { const g = new THREE.Group(); g.add(glowSprite(col, size*2.4)); g.add(sph(size*0.35, new THREE.MeshBasicMaterial({color:0xffffff}))); return g; };
function portal(pos, col){ ring(pos, col, 0.3, 4, 0.8, 0.1, 0.35); burstAt(V3(pos.x, 0.5, pos.z), col, 18, true); }
function flameBurst(o, col=0xff7a30){ const c = wpos(o); for (let i=0;i<20;i++){ const s = sprite(`rgba(${col>>16&255},${col>>8&255},${col&255},1)`, 0.7, V3(c.x + (Math.random()-.5)*1.6, 0.2, c.z + (Math.random()-.5)*1.2)); const v = 2 + Math.random()*4; tween(0.8, k => { s.position.y += v*0.016; s.material.opacity = 1 - k; s.scale.setScalar(0.7*(1-k*0.5)); }, () => fxGroup.remove(s)); } flashLight(c, col); }
function trailOn(h, dur, col){ const w = h.userData.parts.wpn; if (!w || !w.userData.tip) return; let last = 0; tween(dur, k => { if (k - last < 0.05) return; last = k; const p = new THREE.Vector3(); w.userData.tip.getWorldPosition(p); const s = sprite(col, 0.55, p); tween(0.25, kk => s.material.opacity = 1 - kk, () => fxGroup.remove(s)); }); }
const tipPos = h => { const p = new THREE.Vector3(); const w = h.userData.parts.wpn; if (w && w.userData.tip) w.userData.tip.getWorldPosition(p); else p.copy(wpos(h, 0.5)); return p; };

/* ---------- hero actions ---------- */
function armTo(arm, x, z, k){ arm.rotation.x += (x - arm.rotation.x)*k; if (z != null) arm.rotation.z += (z - arm.rotation.z)*k; }
function heroAct(id, kind, targets, opts={}){ const h0 = hpos(id); if (!h0) return 400;
  if (kind==='heavy' || kind==='special'){ const tg = (targets||[]).map(t => foes[t]).filter(Boolean); const wi = h0.userData.weaponItem || {}; const rar = wi.rar || 0; const col = rar >= 4 ? 0xff3060 : rar >= 3 ? 0xffcf3a : kind==='heavy' ? 0xff9a3c : 0x7fd0ff;
    const gp = V3(h0.position.x, 0.08, h0.position.z);
    if (kind==='heavy'){ // wind-up: energy gathers on the weapon, then a crushing impact
      const c = wpos(h0, 0.6); for (let i=0;i<14;i++){ const a = i/14*Math.PI*2; const s = sprite('rgba(255,170,80,1)', 0.45, V3(c.x + Math.cos(a)*2.4, c.y + Math.sin(a)*1.6, c.z)); const p0 = s.position.clone(); tween(0.35, k => { s.position.copy(p0.clone().lerp(c, k)); }, () => fxGroup.remove(s)); }
      ring(gp, col, 0.3, 3, 0.35, 0.08, 0.3); flashLight(c, col, 4);
      setTimeout(() => { heroAct(id, 'attack', targets); }, 300);
      setTimeout(() => { for (const f of tg){ const fp = V3(f.position.x, 0, f.position.z); shock(fp, col, 1.4); ring(fp, 0xffffff, 0.2, 3, 0.3, 0.1, 0.2); flashLight(wpos(f), col, 7); for (let i=0;i<6;i++){ const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22), M(0x6a5a4a)); r.position.set(fp.x, 0.3, fp.z); fxGroup.add(r); const v = V3((Math.random()-.5)*4, 3+Math.random()*3, (Math.random()-.5)*3); tween(0.7, kk => { r.position.addScaledVector(v, 0.016); v.y -= 0.22; }, () => fxGroup.remove(r)); } } shake = Math.max(shake, 0.6); }, 560);
      return 860; }
    // special: a rune circle and a pillar of light, then the weapon's own myth element on every target
    const cs = `rgba(${col>>16&255},${col>>8&255},${col&255},.9)`;
    ring(gp, col, 0.4, 4.5, 0.7, 0.1, 0.25); ring(gp, 0xffffff, 0.2, 3, 0.6, 0.12, 0.12); beam(V3(gp.x, 0, gp.z), V3(gp.x, 11, gp.z), col, 0.7, 0.8);
    for (let i=0;i<20;i++){ const a = i/20*Math.PI*2; const s = sprite(cs, 0.5, V3(gp.x + Math.cos(a)*2.2, 0.3, gp.z + Math.sin(a)*1.6)); tween(0.7, k => { s.position.y += 0.08; s.material.opacity = 1 - k; }, () => fxGroup.remove(s)); }
    flashLight(wpos(h0), col, 7);
    setTimeout(() => heroAct(id, 'skill', targets), 380);
    setTimeout(() => { for (const f of tg){ const p = wpos(f, 0.2); if (wi.fx) mythFx(wi.fx, f); beam(V3(p.x, 12, p.z), V3(p.x, 0, p.z), col, 0.45, 0.5); ring(V3(f.position.x, 0.1, f.position.z), col, 0.3, 3.6, 0.5, 0.1, 0.35); } shake = Math.max(shake, 0.5); }, 700);
    return 1050; }
  if (kind==='attack' && opts.fx==='myth1'){ const tg = (targets||[]).map(t => foes[t]).filter(Boolean); setTimeout(() => tg.forEach(f => { ring(V3(f.position.x, 0.1, f.position.z), 0xff3060, 0.3, 2.6, 0.4, 0.1, 0.25); burstAt(wpos(f, 0.2), 0xff5080, 10); }), 280); }
  const h = h0; const P = h.userData.parts, H = P.hold, home = h.userData.home ? h.userData.home.clone() : h.position.clone(); const st = H.style;
  const tg = (targets||[]).map(t => foes[t]).filter(Boolean); const f0 = tg[0]; const tx = f0 ? f0.position.x - 2.4 : home.x + 3, tz = f0 ? f0.position.z + 0.3 : home.z;
  const rar = (h.userData.weaponItem && h.userData.weaponItem.rar) || 0, trailCol = rar >= 4 ? 'rgba(255,60,90,.9)' : rar >= 3 ? 'rgba(255,215,110,.9)' : null;
  const reset = () => { P.armR.rotation.x = H.R[0]; P.armR.rotation.z = H.R[1]; P.armL.rotation.x = H.L[0]; P.armL.rotation.z = H.L[1]; P.armR.position.z = 0; P.armL.position.z = 0; P.body.rotation.y = 0; h.position.copy(home); h.userData.busy = false; GEAR3D.drawBow(h, 0); };
  h.userData.busy = true; if (h.userData.cape !== undefined) h.userData.capeKick = 0.5;
  const dash = (dur, hitAt, strike, back=true, lift=0) => { tween(dur, k => { const a = k < hitAt ? k/hitAt : back ? Math.max(0, 1 - (k-hitAt)/(1-hitAt)) : 1; const e = a*a*(3-2*a); h.position.x = home.x + (tx - home.x)*e; h.position.z = home.z + (tz - home.z)*e; h.position.y = Math.sin(e*Math.PI)*lift; strike(k); }, reset); if (trailCol) trailOn(h, dur, trailCol); };
  const tgtPos = f => wpos(f, 0.2);
  if (kind==='attack' || kind==='skill'){
    const skill = kind==='skill';
    if (st==='blade'){
      if (!skill){ let hit = false; dash(0.55, 0.42, k => { if (k < 0.4) armTo(P.armR, -2.8, 0.2, 0.25); else { armTo(P.armR, -0.2, 0.7, 0.45); if (!hit && k > 0.45){ hit = true; if (f0) arc(tgtPos(f0), rar>=3 ? 0xffe27a : 0xffffff, {rz:2.2, spin:-6}); } } }); return 300; }
      let hit = false; const cxp = tg.length ? tg.reduce((a,f)=>a+f.position.x,0)/tg.length - 1.6 : tx; const keep = tx; dash(0.75, 0.45, k => { if (k > 0.25 && k < 0.65){ P.body.rotation.y = (k-0.25)/0.4*Math.PI*2; armTo(P.armR, -1.57, 1.2, 0.4); } if (!hit && k > 0.42){ hit = true; const c = V3(cxp + 1.6, 1.8, tz); arc(c, rar>=3 ? 0xffe27a : 0x9fd8ff, {r:2.6, w:0.35, len:1.9, rx:-Math.PI/2, rz:0, spin:-10, dur:0.4}); ring(V3(c.x, 0, c.z), 0xffffff, 0.5, 4.5, 0.4, 0.1, 0.25); shake = Math.max(shake, 0.3); } }); return 420; }
    if (st==='fist'){ let n = 0; const hits = skill ? 3 : 2; dash(skill ? 0.8 : 0.55, 0.3, k => { if (k < 0.3) return; const ph = Math.floor((k-0.3)/((0.85-0.3)/hits)); if (ph < hits){ const arm = ph%2 ? P.armL : P.armR; const other = ph%2 ? P.armR : P.armL; arm.position.z = 0.9; arm.rotation.x = -1.57; other.position.z = 0; if (ph >= n){ n = ph+1; if (f0){ burstAt(tgtPos(f0), 0xffe14d, 6); ring(V3(f0.position.x, 2.2, f0.position.z+1), 0xffffff, 0.2, 2, 0.2, 2.2, 0.15); } } } }); return skill ? 300 : 280; }
    if (st==='pole'){ let hit = false; const dur = skill ? 0.75 : 0.5; dash(dur, skill ? 0.5 : 0.4, k => { if (k < 0.35) armTo(P.armR, 0.1, null, 0.3); else { armTo(P.armR, -1.35, null, 0.6); P.armR.position.z = 0.8; } if (!hit && k > (skill ? 0.5 : 0.42)){ hit = true; if (f0){ const p = tgtPos(f0); if (skill){ beam(V3(p.x-3, p.y, p.z), V3(p.x+4, p.y, p.z), rar>=3 ? 0xffe27a : 0x9fe8ff, 0.4, 0.3); shake = Math.max(shake, 0.35); } else line(V3(p.x-1.5, p.y, p.z), V3(p.x+1.2, p.y, p.z), 0xffffff, 0.2); } } }); return skill ? 450 : 320; }
    if (st==='heavy'){ let hit = false; const dur = skill ? 0.85 : 0.6; dash(dur, skill ? 0.55 : 0.45, k => { if (k < (skill?0.5:0.4)) armTo(P.armR, -3.0, 0.1, 0.25); else armTo(P.armR, -0.15, 0.2, 0.55); if (!hit && k > (skill ? 0.55 : 0.47)){ hit = true; if (f0){ const p = f0.position; shock(V3(p.x, 0, p.z), skill ? 0xffb050 : 0xffffff, skill ? 1.3 : 0.7); if (skill){ for (let i=0;i<8;i++){ const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.25), M(0x6a5a4a)); r.position.set(p.x, 0.3, p.z); fxGroup.add(r); const v = V3((Math.random()-.5)*5, 4+Math.random()*3, (Math.random()-.5)*3); tween(0.8, kk => { r.position.addScaledVector(v, 0.016); v.y -= 0.25; }, () => fxGroup.remove(r)); } } shake = Math.max(shake, skill ? 0.7 : 0.35); } } }, true, skill ? 2.2 : 0); return skill ? 520 : 400; }
    if (st==='scythe'){ let hit = false; const dur = skill ? 0.8 : 0.55; dash(dur, 0.45, k => { if (k < 0.4){ armTo(P.armR, -1.6, 1.3, 0.3); P.body.rotation.y = -0.6*k/0.4; } else { armTo(P.armR, -1.6, -0.6, 0.4); P.body.rotation.y = skill ? (k-0.4)/0.4*Math.PI*2 : 0.5; } if (!hit && k > 0.47){ hit = true; if (skill){ const c = V3(tx + 2.4, 1.6, tz); arc(c, 0x9a2aff, {r:3.8, w:0.8, len:2, rx:-Math.PI/2, rz:0, spin:-12, dur:0.45}); tg.forEach(f => { const s = sprite('rgba(255,40,80,1)', 0.6, tgtPos(f)); const a = tgtPos(f), b = wpos(h); tween(0.6, kk => { s.position.copy(a.clone().lerp(b, kk)); s.material.opacity = 1 - kk*0.5; }, () => fxGroup.remove(s)); }); }
      else if (f0) arc(tgtPos(f0), rar>=3 ? 0xffd070 : 0xc080ff, {r:2.2, w:0.55, len:1.1, rx:-1.2, rz:1.0, spin:-8}); } }); return skill ? 450 : 320; }
    if (st==='katana'){ let hit = false; const dur = skill ? 0.55 : 0.45; const far = f0 ? f0.position.x + 1.8 : home.x + 5; tween(dur, k => { if (k < 0.3){ armTo(P.armR, -0.3, -0.6, 0.35); P.body.rotation.y = -0.4; } else if (k < 0.55){ const kk = (k-0.3)/0.25; h.position.x = home.x + (far - home.x)*kk; h.position.z = home.z + (tz - home.z)*kk; armTo(P.armR, -1.6, 1.2, 0.6); P.body.rotation.y = 0.5; } else { const kk = (k-0.55)/0.45; h.position.x = far + (home.x - far)*kk; h.position.z = tz + (home.z - tz)*kk; }
        if (!hit && k > 0.45){ hit = true; (skill ? tg : [f0]).filter(Boolean).forEach((f, i) => setTimeout(() => { const p = tgtPos(f); line(V3(p.x - 3, p.y + 0.3, p.z), V3(p.x + 3, p.y - 0.3, p.z), rar>=3 ? 0xffe27a : 0xffffff, 0.3); arc(p, 0xd8eaff, {r:1.4, w:0.18, len:1.0, rz:Math.random()*3, spin:-12, dur:0.2}); }, i*60)); if (skill) shake = Math.max(shake, 0.35); } }, reset); if (trailCol) trailOn(h, dur, trailCol); return skill ? 420 : 360; }
    if (st==='staff'){ const n = skill ? 1 : 1; tween(0.55, k => { P.armR.rotation.x = H.R[0] - Math.sin(k*Math.PI)*1.6; }, reset);
      const ring0 = V3(h.position.x, 0.1, h.position.z); ring(ring0, rar>=3 ? 0xffe27a : 0xb080ff, 0.3, 2.5, 0.5, 0.1, 0.2);
      setTimeout(() => { const a = tipPos(h); if (skill){ tg.forEach((f, i) => setTimeout(() => { const p = tgtPos(f); projectile(V3(p.x - 2, 12, p.z), p, orbMesh('rgba(255,140,60,1)', 1.2), 0.35, 0, () => { flameBurst(f); ring(V3(f.position.x, 0, f.position.z), 0xff8a30, 0.3, 3.5, 0.4, 0.08, 0.3); shake = Math.max(shake, 0.3); }, 'rgba(255,120,40,.8)'); }, i*90)); }
        else if (f0){ projectile(a, tgtPos(f0), orbMesh(rar>=3 ? 'rgba(255,220,110,1)' : 'rgba(170,120,255,1)', 0.8), 0.32, 0.8, () => burstAt(tgtPos(f0), 0xd0b0ff, 10), rar>=3 ? 'rgba(255,220,110,.8)' : 'rgba(170,120,255,.7)'); } }, 260); return skill ? 700 : 520; }
    if (st==='thrown'){ const w = P.wpn; const seq = skill ? [0,1,2,3,4].map(i => tg[i % Math.max(1, tg.length)]) : [f0]; tween(0.3, k => { P.armR.rotation.x = H.R[0] - Math.sin(k*Math.PI)*1.2; P.armR.rotation.z = H.R[1] + Math.sin(k*Math.PI)*0.8; }, reset);
      setTimeout(() => { if (w) w.visible = false; let prev = tipPos(h); const pts = seq.filter(Boolean).map(f => tgtPos(f)).concat([wpos(h, 0.5)]); const it = h.userData.weaponItem || {};
        const mk = () => { const o = GEAR3D.weapon(it); o.scale.setScalar(0.5); o.userData.orient = false; return o; };
        let i = 0; const next = () => { if (i >= pts.length){ if (w) w.visible = true; return; } const a = prev, b = pts[i]; const last = i === pts.length - 1; i++; const o = mk(); o.position.copy(a); fxGroup.add(o); tween(0.2, k => { o.position.copy(a.clone().lerp(b, k)); o.position.y += Math.sin(k*Math.PI)*0.6; o.rotation.z += 0.6; o.rotation.x = Math.PI/2; }, () => { fxGroup.remove(o); if (!last) burstAt(b, 0xffffff, 8); prev = b; next(); }); }; next(); }, 160);
      return skill ? 900 : 500; }
    if (st==='scroll'){ const n = skill ? 4 : 1; tween(0.35 + n*0.15, k => { P.armR.rotation.x = H.R[0] - Math.sin(k*Math.PI)*0.3; P.armL.rotation.x = H.L[0] - Math.sin(k*Math.PI)*0.3; }, reset);
      for (let s=0;s<n;s++) setTimeout(() => { const a = tipPos(h); const fs = skill ? tg : [f0]; fs.filter(Boolean).forEach(f => { const b = tgtPos(f); for (let i=0;i<14;i++) setTimeout(() => projectile(a, V3(b.x + (Math.random()-.5)*0.8, b.y + (Math.random()-.5)*0.8, b.z), orbMesh('rgba(255,110,30,.95)', 0.7 + Math.random()*0.5), 0.3, (Math.random()-.5)*1.2, i===13 ? () => flameBurst(f) : null), i*16); }); flashLight(a, 0xff6a20, 4); }, 200 + s*160);
      return 450 + n*160; }
    if (st==='bow' || st==='gun' || st==='xbow'){ // ranged: stay put, aim, shoot
      const shots = skill ? 4 : 1; const drawT = st==='bow' ? 0.3 : 0.15; const total = drawT + 0.12*shots + 0.15;
      tween(total, k => { const tt = k*total; if (st==='bow'){ const ph = tt < drawT ? tt/drawT : 1 - Math.min(1, (tt - drawT)/0.08); GEAR3D.drawBow(h, Math.max(0, ph)); armTo(P.armR, H.R[0] + 0.45*Math.max(0, ph), H.R[1] - 0.25*Math.max(0, ph), 0.6); } else { P.armR.rotation.x = H.R[0] - (tt > drawT && ((tt - drawT) % 0.12) < 0.05 ? 0.35 : 0); } }, reset);
      for (let i=0;i<shots;i++){ setTimeout(() => { const a = tipPos(h); const f = skill ? tg[Math.floor(Math.random()*tg.length)] : f0; if (!f) return; const b = tgtPos(f);
        if (st==='gun'){ const mf = sprite('rgba(255,220,120,1)', 1.4, a); tween(0.12, k => mf.material.opacity = 1 - k, () => fxGroup.remove(mf)); flashLight(a, 0xffd080, 3); const sm = sprite('rgba(200,200,210,.6)', 1.2, a); tween(0.8, k => { sm.position.y += 0.01; sm.material.opacity = 0.6*(1-k); sm.scale.setScalar(1.2 + k*1.5); }, () => fxGroup.remove(sm)); line(a, b, 0xffe8a0, 0.15); burstAt(b, 0xffe8a0, 6); }
        else { const col = rar >= 3 ? (rar===4 ? 'rgba(255,60,90,.9)' : 'rgba(255,215,110,.9)') : 'rgba(255,255,255,.5)'; if (skill && st==='bow'){ const up = V3(a.x + 2, a.y + 7, a.z); projectile(a, up, arrowMesh(), 0.25, 0, () => projectile(V3(b.x - 0.5, b.y + 7, b.z), b, arrowMesh(), 0.22, 0, () => burstAt(b, 0xffffff, 6), col), col); }
          else projectile(a, b, arrowMesh(st==='xbow' ? 0x4a4a4a : 0xd04040), 0.22, st==='bow' ? 0.6 : 0.1, () => burstAt(b, 0xffffff, 6), col); } }, (drawT + i*0.12)*1000); }
      return Math.round((drawT + 0.12*shots + 0.15)*1000); }
  }
  if (kind==='focus'){ const c = wpos(h); for (let i=0;i<18;i++){ const a = i/18*Math.PI*2; const s = sprite('rgba(255,225,77,1)', 0.5, V3(c.x + Math.cos(a)*3, c.y + Math.sin(a*2), c.z + Math.sin(a)*2)); const p0 = s.position.clone(); tween(0.55, k => { s.position.copy(p0.clone().lerp(c, k)); s.material.opacity = 0.3 + k*0.7; }, () => fxGroup.remove(s)); }
    setTimeout(() => { ring(V3(h.position.x, 0, h.position.z), 0xffe14d, 0.4, 5, 0.5); flashLight(c, 0xffe14d); }, 500); tween(0.6, k => { P.armL.rotation.x = H.L[0] - Math.sin(k*Math.PI)*0.8; }, reset); return 550; }
  if (kind==='guard'){ setShield(h, true); setTimeout(() => { if (!h.userData.keepShield) setShield(h, false); }, 1300); tween(0.3, k => { armTo(P.armL, -1.5, -0.6, 0.4); }, () => { h.userData.busy = false; }); return 250; }
  if (kind && kind.startsWith('item')){ const it = kind.split(':')[1];
    if (it==='fire'){ const a = wpos(h, 1), b = tg.length ? wpos(tg[Math.floor(tg.length/2)]) : V3(4, 1, 0); tween(0.4, k => armTo(P.armR, -2.6 + k*2, null, 0.4), reset); projectile(a, b, orbMesh('rgba(255,120,40,1)', 0.5), 0.45, 2.2, () => { tg.forEach(f => flameBurst(f)); shake = Math.max(shake, 0.3); }, 'rgba(255,140,40,.8)'); return 650; }
    if (it==='smoke'){ const c = wpos(h); for (let i=0;i<14;i++){ const s = sprite('rgba(200,200,215,.6)', 2.2, V3(c.x + (Math.random()-.5)*2.5, 0.8 + Math.random()*2, c.z + (Math.random()-.5)*2)); tween(1.2, k => { s.material.opacity = 0.6*(1-k); s.scale.setScalar(2.2 + k*2); }, () => fxGroup.remove(s)); } h.userData.busy = false; return 400; }
    tween(0.6, k => { P.armR.rotation.x = H.R[0] - Math.sin(k*Math.PI)*1.5; P.armR.rotation.z = H.R[1] - Math.sin(k*Math.PI)*0.6; }, reset);
    const col = {str:0xff4040, iron:0xc8d0e0, cleanse:0xffffff}[it] || 0x60ff90; setTimeout(() => { burst(h, col, 16, true); ring(V3(h.position.x, 0, h.position.z), col, 0.4, 4, 0.5); }, 350); return 500; }
  h.userData.busy = false; return 200;
}
/* legacy single-hero entry point */
function heroAttack(targetId, kind='attack', targets){ return heroAct('p', kind, targets || [targetId]); }

/* ---------- ability + status fx ---------- */
function fx(k, a, b, hid='p'){
  const fa = foes[a], fb = foes[b], h = hpos(hid);
  if (k==='sig' && h){ ring(V3(h.position.x, 0, h.position.z), 0xffcf3a, 0.5, 6, 0.6); flashLight(wpos(h), 0xffcf3a, 6); burstAt(wpos(h), 0xffe27a, 20, true); return; }
  if (k==='chain' && fa && fb) lightning(wpos(fa, 0.3), wpos(fb, 0.3), 0xbfe8ff);
  else if (k==='quake'){ for (const id of (Array.isArray(a) ? a : [a])){ const f = foes[id]; if (f) ring(V3(f.position.x, 0, f.position.z), 0xb070ff, 0.3, 4.5, 0.45); } shake = Math.max(shake, 0.3); }
  else if (k==='lifesteal' && fa && h){ for (let i=0;i<5;i++){ const s = sprite('rgba(255,40,80,1)', 0.5, wpos(fa)); const p0 = wpos(fa), p1 = wpos(h); const off = V3(0, 1 + Math.random()*2, (Math.random()-.5)*2); tween(0.55 + i*0.06, kk => { const p = p0.clone().lerp(p1, kk); p.addScaledVector(off, Math.sin(kk*Math.PI)); s.position.copy(p); }, () => fxGroup.remove(s)); } }
  else if (k==='burn' && fa) flameBurst(fa);
  else if (k==='stun' && fa){ burstAt(wpos(fa, 1.5), 0xffe14d, 10, true); }
  else if (k==='double' && fa) arc(wpos(fa, 0.2), 0xffffff, {rz:-0.6, spin:6});
  else if (k==='counter' && fa && h){ arc(wpos(fa, 0.2), 0xbfe8ff, {rz:2.6, spin:-8, dur:0.2}); }
  else if (k==='thorns' && h){ const c = wpos(h); for (let i=0;i<10;i++){ const sp = cone(0.08, 0.6, M(0x4fd36f, {emissive:0x2a8a3a, emissiveIntensity:0.6}), 4); sp.position.copy(c); const v = V3(Math.cos(i*0.63)*3, Math.sin(i*1.3)*2, Math.sin(i*0.63)*2); sp.lookAt(c.clone().add(v)); sp.rotateX(Math.PI/2); fxGroup.add(sp); tween(0.35, kk => sp.position.addScaledVector(v, 0.016), () => fxGroup.remove(sp)); } }
  else if (k==='phoenix' && h){ phoenixFx(hid); }
  else if (k==='aegis'){ for (const id2 in heroes){ const hh = heroes[id2]; ring(V3(hh.position.x, 0, hh.position.z), 0xffe27a, 0.4, 3.4, 0.7, 0.08, 0.4); burst(hh, 0xffe27a, 8, true); } flashScreen(0xffe27a, 0.12); }
  else if (k==='barrier' && fa){ const c = wpos(fa); const dome = new THREE.Mesh(new THREE.IcosahedronGeometry(Math.max(3, (fa.userData.hw || 2.5)*1.2), 1), new THREE.MeshBasicMaterial({color:0x7fd0ff, wireframe:true, transparent:true, opacity:0.7, blending:THREE.AdditiveBlending, depthWrite:false})); dome.position.copy(c); fxGroup.add(dome); tween(1.2, kk => { dome.rotation.y += 0.04; dome.material.opacity = 0.7*(1 - Math.max(0, kk - 0.5)/0.5); dome.scale.setScalar(0.6 + Math.min(1, kk*3)*0.4); }, () => fxGroup.remove(dome)); flashLight(c, 0x7fd0ff, 6); }
  else if (k==='standing' && h){ const gp = V3(h.position.x, 0, h.position.z); ring(gp, 0xff4a4a, 0.4, 4, 0.7, 0.08, 0.5); flashScreen(0xff2020, 0.18); slowMo(0.4, 500); burst(h, 0xffe0e0, 12, true); }
  else if (k==='frozen' && h) setIce(h, true);
  else if (k==='thaw' && h) setIce(h, false);
  else if (k==='enrage' && fa){ ring(V3(fa.position.x, 0, fa.position.z), 0xff2020, 0.5, 7, 0.6); flashLight(wpos(fa), 0xff2020, 6); const b0 = fa.userData.base; tween(0.5, kk => fa.scale.setScalar(b0*(1 + Math.sin(kk*Math.PI)*0.15)), () => { fa.userData.base = b0*1.06; fa.scale.setScalar(fa.userData.base); }); shake = Math.max(shake, 0.4); }
  else if (k==='dodge' && h){ const p0 = h.position.clone(); const ghost = sprite('rgba(160,210,255,.5)', 3, wpos(h)); tween(0.35, kk => { h.position.x = p0.x - Math.sin(kk*Math.PI)*1.2; ghost.material.opacity = 0.5*(1-kk); }, () => { h.position.x = p0.x; fxGroup.remove(ghost); }); }
  else if (k==='summon' && fa) portal(fa.position, 0xb050ff);
  else if (k==='poison' && fa){ for (let j=0;j<8;j++){ const b = sprite('rgba(170,90,255,.85)', 0.45, V3(fa.position.x + (Math.random()-.5)*2, 0.5, fa.position.z + (Math.random()-.5)*1.5)); tween(0.9, kk => { b.position.y += 0.03; b.material.opacity = 0.85*(1-kk); }, () => fxGroup.remove(b)); } }
  else if (k==='blind' && fa){ const s = sprite('rgba(30,30,40,.85)', 2.4, wpos(fa, 1.2)); tween(0.9, kk => { s.material.opacity = 0.85*(1-kk); s.scale.setScalar(2.4 + kk); }, () => fxGroup.remove(s)); }
  else if (k==='slow' && fa){ ring(V3(fa.position.x, 0.1, fa.position.z), 0x8aa0c0, 3, 0.5, 0.6, 0.1, 0.3); }
  else if (k==='frozen' && fa){ burstAt(wpos(fa), 0xcff4ff, 16); ring(V3(fa.position.x, 0.1, fa.position.z), 0x9fe8ff, 0.3, 3, 0.5, 0.1, 0.35); }
  else if (k.startsWith('hst_') && h){ const s = k.slice(4), c = wpos(h), gp = V3(h.position.x, 0.1, h.position.z);
    if (s==='burn') flameBurst(h, 0xff6a20);
    else if (s==='poison'){ for (let j=0;j<8;j++){ const b = sprite('rgba(150,255,110,.85)', 0.4, V3(gp.x + (Math.random()-.5)*1.6, 0.4, gp.z + (Math.random()-.5)*1.2)); tween(0.9, kk => { b.position.y += 0.03; b.material.opacity = 0.85*(1-kk); }, () => fxGroup.remove(b)); } }
    else if (s==='freeze') setIce(h, true);
    else if (s==='blind'){ const b = sprite('rgba(20,20,30,.9)', 2, wpos(h, 1.4)); tween(0.9, kk => { b.material.opacity = 0.9*(1-kk); }, () => fxGroup.remove(b)); }
    else if (s==='slow' || s==='weak' || s==='vuln') ring(gp, s==='vuln' ? 0xff4060 : 0x8aa0c0, 2.6, 0.4, 0.6, 0.1, 0.25);
    else if (s==='empower'){ ring(gp, 0xff5030, 0.3, 3.4, 0.5); flameBurst(h, 0xff4020); }
    else if (s==='swift'){ for (let j=0;j<6;j++) line(V3(c.x - 2, c.y + (j-3)*0.3, c.z), V3(c.x + 1, c.y + (j-3)*0.3, c.z), 0x9fe8ff, 0.3); }
    else if (s==='enlight'){ for (let j=0;j<12;j++){ const b = sprite('rgba(255,230,120,.95)', 0.35, V3(c.x + (Math.random()-.5)*2, c.y + (Math.random()-.5)*2, c.z)); tween(0.8, kk => { b.position.y += 0.02; b.material.opacity = 1-kk; }, () => fxGroup.remove(b)); } }
    else if (s==='god'){ beam(V3(gp.x, 0, gp.z), V3(gp.x, 14, gp.z), 0xffe070, 1.0, 1.2); ring(gp, 0xffe070, 0.3, 6, 0.8); ring(gp, 0xff9ad8, 0.3, 4, 0.7); flashLight(c, 0xffe070, 10); shake = Math.max(shake, 0.4); } }
}
function mythFx(fx, f){ const p = wpos(f, 0.2), gp = V3(f.position.x, 0, f.position.z);
  if (fx==='thunder'){ lightning(V3(p.x + (Math.random()-.5), 14, p.z), p, 0xbfe8ff); ring(gp, 0xbfe8ff, 0.3, 3.5, 0.4, 0.08, 0.25); }
  else if (fx==='fire' || fx==='blood' || fx==='dragonfire' || fx==='forge'){ flameBurst(f, fx==='blood' ? 0xff2030 : 0xff7a20); }
  else if (fx==='holy' || fx==='sun'){ beam(V3(p.x, 12, p.z), V3(p.x, 0, p.z), fx==='sun' ? 0xffc040 : 0xfff0b0, 0.4, 0.6); }
  else if (fx==='gorgon'){ ring(gp, 0x60ff90, 0.3, 3, 0.5, 0.08, 0.3); flash(f, 0x8a8a8a); }
  else if (fx==='rune' || fx==='divine'){ ring(V3(p.x, 0.1, p.z), 0x6fd0ff, 0.3, 3.2, 0.5, 0.1, 0.2); ring(V3(p.x, 0.1, p.z), 0xffffff, 0.2, 2.2, 0.4, 0.12, 0.12); }
  else if (fx==='wave'){ ring(gp, 0x40c0ff, 0.3, 4.5, 0.6, 0.08, 0.5); burstAt(V3(p.x, 0.6, p.z), 0x80e0ff, 16, true); }
  else if (fx==='moon'){ arc(p, 0xe0eaff, {r:1.2, w:0.3, len:1.2, rz:0.8, spin:-5}); }
  else if (fx==='soul' || fx==='underworld'){ for (let i=0;i<6;i++){ const s = sprite(fx==='soul' ? 'rgba(220,235,255,.9)' : 'rgba(60,255,190,.9)', 0.7, V3(p.x + (Math.random()-.5), p.y, p.z)); tween(0.9, k => { s.position.y += 0.03; s.material.opacity = 1 - k; }, () => fxGroup.remove(s)); } }
  else if (fx==='lion'){ ring(gp, 0xffc040, 0.3, 3.5, 0.4, 0.08, 0.35); shake = Math.max(shake, 0.3); }
  else if (fx==='life'){ ring(gp, 0x60ff90, 0.3, 3, 0.5, 0.08, 0.3); }
  else if (fx==='time'){ for (let i=0;i<10;i++){ const s = sprite('rgba(255,215,110,.9)', 0.35, V3(p.x + Math.cos(i)*0.8, p.y + Math.sin(i)*0.8, p.z)); tween(0.6, k => { s.position.x += Math.cos(i + k*4)*0.02; s.material.opacity = 1 - k; }, () => fxGroup.remove(s)); } }
  else if (fx==='raven' || fx==='barbs'){ burstAt(p, fx==='raven' ? 0x222230 : 0xff3030, 14); }
  else if (fx==='bronze'){ burstAt(p, 0xffb050, 12); }
}
function hitEnemy(id, crit, hid){ const f = foes[id]; if (!f) return; const hh = hid ? (heroes[hid] || (hid==='p' ? hero : null)) : hero; const wi = hh && hh.userData.weaponItem; if (wi && wi.fx && t - (hh.userData.lastMyth||0) > 0.3){ hh.userData.lastMyth = t; mythFx(wi.fx, f); } flash(f); burst(f, crit ? 0xffe14d : 0xffffff, crit ? 22 : 12); if (crit){ ring(V3(f.position.x, 2.2, f.position.z + 1), 0xffe14d, 0.3, 3.5, 0.3, 2.2, 0.25); flashLight(wpos(f), 0xffe14d, 5); }
  const p0 = f.userData.tx !== undefined ? f.userData.tx : f.position.x; tween(0.18, k => { f.position.x = p0 + Math.sin(k*Math.PI)*0.35; }); shake = Math.max(shake, crit ? 0.35 : 0.15); }
function hitHero(big, hid='p'){ const h = hpos(hid); if (!h) return; flash(h, 0xff3030); burst(h, 0xff5050, 10); shake = Math.max(shake, big ? 0.5 : 0.18); const p0 = h.userData.home ? h.userData.home.x : h.position.x; if (!h.userData.busy) tween(0.2, k => { h.position.x = p0 - Math.sin(k*Math.PI)*0.4; }); }
function healFx(who){ const o = who==='p' || (typeof who==='string' && heroes[who]) ? hpos(who) : foes[who]; if (!o) return; burst(o, 0x60ff90, 10, true); const c = o.position; ring(V3(c.x, 0, c.z), 0x60ff90, 0.3, 3, 0.5); }
function killEnemy(id){ const f = foes[id]; if (!f) return; const u = f.userData; if (u.dying) return; u.dying = true; const e = u.e || {}; const big = (e.boss || e.mini) && !e.minion;
  flash(f, 0xffffff); burst(f, 0xffffff, big ? 60 : 24); if (big){ flameBurst(f, e.god ? 0xffe27a : 0xff4040); ring(V3(f.position.x, 0, f.position.z), 0xffffff, 0.5, 12, 0.9); shake = 0.8; flashLight(wpos(f), 0xffffff, 8); }
  f.traverse(o => { if (o.isMesh && o.material && !Array.isArray(o.material)){ o.material = o.material.clone(); o.material.transparent = true; } });
  const x0 = f.position.x, y0 = f.position.y, T = big ? 2.2 : 1.3;
  // stagger back, topple over with a little bounce, then fade away as the spirit rises
  tween(T, k => { f.position.x = x0 + Math.sin(Math.min(1, k/0.2)*Math.PI/2)*0.8; f.rotation.z = -Math.min(1, k/0.45)*1.45;
      f.position.y = y0 + (k < 0.45 ? Math.sin(k/0.45*Math.PI)*0.5 : 0) - Math.max(0, k - 0.45)*0.6;
      const fade = Math.max(0, (k - 0.55)/0.45); f.traverse(o => { if (o.isMesh && o.material && o.material.transparent) o.material.opacity = 1 - fade; }); f.scale.setScalar(u.base*(1 - fade*0.35));
      if (!u.soul && k > 0.5){ u.soul = true; if (k > 0.45 && !big) shake = Math.max(shake, 0.15); soulRise(f, big); } },
    () => { scene.remove(f); delete foes[id]; frame(false); }); }
function soulRise(f, big){ const c = wpos(f); const col = big ? 'rgba(255,220,150,.9)' : 'rgba(200,230,255,.85)';
  for (let i=0;i<(big ? 10 : 5);i++){ const s = sprite(col, big ? 1.4 : 0.9, V3(c.x + (Math.random()-.5)*1.5, c.y, c.z + (Math.random()-.5))); const dx = (Math.random()-.5)*0.6, sp = 2 + Math.random()*2;
    setTimeout(() => tween(1.1, k => { s.position.y += 0.03*sp; s.position.x += dx*0.02; s.material.opacity = 0.9*(1-k); s.scale.setScalar((big ? 1.4 : 0.9)*(1 + k*0.6)); }, () => fxGroup.remove(s)), i*60); } }
function victory(){ let i = 0; for (const id in heroes){ const h = heroes[id]; if (h.userData.down) continue; const y0 = 0; setTimeout(() => { h.userData.busy = true; tween(0.9, k => { h.position.y = y0 + Math.abs(Math.sin(k*Math.PI*2))*0.7; }, () => { h.position.y = y0; h.userData.busy = false; }); }, i*90); i++;
    const c = wpos(h); for (let j=0;j<10;j++){ const cols = ['255,207,58','95,224,138','127,192,255','255,138,108']; burstAt(V3(c.x, c.y + 2, c.z), parseInt(cols[j%4].split(',').map(n => (+n).toString(16).padStart(2,'0')).join(''), 16), 1, true); } } }
function flash(obj, col=0xffffff){ if (!obj) return; const mats = []; obj.traverse(o => { if (o.isMesh && o.material && o.material.emissive){ mats.push([o.material, o.material.emissive.getHex(), o.material.emissiveIntensity]); o.material.emissive.setHex(col); o.material.emissiveIntensity = 0.9; } });
  setTimeout(() => mats.forEach(([m, c, i]) => { m.emissive.setHex(c); m.emissiveIntensity = i; }), 110); }

/* ---------- enemy actions ---------- */
/* ---------- arena-style originals (siege, clockwork and horde foes) ---------- */
Object.assign(NEWART, {
  execut:(g,e,m,dk) => { const s = 1.45, plate = M(e.color, {metalness:0.75, roughness:0.3}), dark = M(0x1a1a20, {metalness:0.6, roughness:0.4}); const H = hum(g, {body:plate, limb:dark, s});
    const hd = box(1.4*s, 1.5*s, 1.4*s, plate); hd.position.y = H.headY + 0.1; g.add(hd); g.add(at(box(1.0*s, 0.14*s, 0.05, EYE(e.key==='frostExec' ? 0x60d0ff : e.key==='brineExec' ? 0x40ffd0 : 0xff6a20)), 0, H.headY + 0.2, 0.72*s));
    for (let i=0;i<5;i++) g.add(at(box(0.12*s, 0.5*s, 0.12*s, plate), (-0.5 + i*0.25)*s, H.headY + 1.0*s, 0));
    for (const sx of [-1,1]){ const pd = sph(0.75*s, plate, 10, 8); pd.scale.y = 0.6; pd.position.set(sx*1.5*s, 3.9*s, 0); g.add(pd); for (let i=0;i<3;i++) g.add(rot(at(cone(0.12*s, 0.6*s, dark, 5), sx*(1.2 + i*0.3)*s, 4.25*s, 0), 0, 0, -sx*0.5)); }
    const cape = box(2.2*s, 3.2*s, 0.08, M(0x2a0a0a)); cape.position.set(0, 2.6*s, -0.6*s); cape.rotation.x = 0.12; g.add(cape);
    const cl = new THREE.Group(); cl.add(at(cyl(0.12, 0.12, 2.6, M(0x3a2010)), 0, -0.6, 0)); const bl = box(0.12, 2.8, 1.5, M(0xc8ccd4, {metalness:0.85, roughness:0.2})); bl.position.set(0, 1.9, 0.45); cl.add(bl); cl.add(at(box(0.14, 2.8, 0.15, M(0x8a2020)), 0, 1.9, 1.15)); cl.position.set(2.15*s, 3.0*s, 0.9); cl.rotation.x = -0.35; g.add(cl); g.userData.cleaver = cl; },
  bomber:(g,e,m,dk) => { const brass = M(e.color, {metalness:0.7, roughness:0.35}); const bd = sph(0.9, brass, 12, 10); bd.position.y = 1.9; bd.scale.y = 1.15; g.add(bd); const hd = sph(0.6, M(0xe8e0d0), 12, 10); hd.position.y = 3.2; g.add(hd);
    for (const sx of [-1,1]){ g.add(at(sph(0.13, EYE(0xffa020)), sx*0.22, 3.25, 0.5)); g.add(at(box(0.25, 1.0, 0.25, dk), sx*0.4, 0.5, 0)); } const gear = tor(0.55, 0.12, M(0x8a6a2a, {metalness:0.8}), 4, 12); gear.position.set(0, 2.2, -0.9); g.add(gear); g.userData.spin = gear;
    const bomb = sph(0.75, M(0x18181c, {metalness:0.3, roughness:0.4}), 14, 10); bomb.position.set(0, 4.3, 0.2); g.add(bomb); g.add(at(cyl(0.06, 0.06, 0.5, M(0x8a6a4a)), 0.2, 5.15, 0.2)); const sp = glowSprite('rgba(255,180,60,.9)', 1.2); sp.position.set(0.25, 5.45, 0.2); g.add(sp);
    for (const sx of [-1,1]){ const ar = box(0.22, 1.2, 0.22, brass); ar.position.set(sx*0.75, 3.7, 0.2); ar.rotation.z = sx*0.5; g.add(ar); } },
  horde:(g,e,m,dk) => { const bone = M(e.color, {roughness:0.7}); for (const [x,z,rr] of [[-1.6,0.3,0.25],[0,-0.5,0],[1.6,0.3,-0.25]]){ const u = new THREE.Group(); const H = hum(u, {body:bone, limb:bone, thin:1, s:0.6}); const sk = box(0.8, 0.75, 0.75, bone); sk.position.y = H.headY; u.add(sk);
      for (const sx of [-1,1]) u.add(at(box(0.18, 0.18, 0.04, M(0x000000)), sx*0.17, H.headY + 0.05, 0.38)); u.add(at(sph(0.06, EYE(0xff3030)), -0.17, H.headY + 0.05, 0.42)); const sw = box(0.08, 1.2, 0.06, M(0xb8c0c8, {metalness:0.6})); sw.position.set(0.7, 1.9, 0.6); sw.rotation.x = 0.7; u.add(sw);
      u.position.set(x, 0, z); u.rotation.y = rr; g.add(u); } },
  balloon:(g,e,m,dk) => { const env = sph(2.0, m, 16, 12); env.position.y = 6.2; env.scale.y = 1.15; g.add(env); for (let i=0;i<6;i++){ const st = new THREE.Mesh(new THREE.SphereGeometry(2.02, 16, 12, i*Math.PI/3, Math.PI/10), dk); st.position.y = 6.2; st.scale.y = 1.15; g.add(st); }
    g.add(at(box(1.0, 1.0, 0.1, M(0xf4f0e0)), 0, 6.2, 2.0)); for (const sx of [-1,1]) g.add(at(box(0.25, 0.25, 0.05, M(0x111111)), sx*0.22, 6.35, 2.06)); for (const [x,z] of [[-0.7,-0.7],[0.7,-0.7],[-0.7,0.7],[0.7,0.7]]){ const rp = cyl(0.03, 0.03, 2.2, M(0x6a4a2a), 4); rp.position.set(x*0.9, 3.6, z*0.9); g.add(rp); }
    g.add(at(box(1.8, 0.9, 1.8, M(0x7a5030)), 0, 2.4, 0)); g.add(at(box(1.9, 0.15, 1.9, M(0x4a3018)), 0, 2.9, 0)); const bomb = sph(0.5, M(0x18181c), 12, 10); bomb.position.set(0, 1.6, 0); g.add(bomb); g.userData.bomb = bomb; g.add(at(glowSprite('rgba(255,200,80,.5)', 1.5), 0, 4.3, 0)); g.userData.float = true; },
  furnace:(g,e,m,dk) => { const stone = M(e.color, {flatShading:true, roughness:0.95}); const hut = cyl(1.7, 2.1, 3.0, stone, 8); hut.position.y = 1.5; g.add(hut); const roof = cone(2.2, 1.6, M(0x3a2a20, {flatShading:true}), 8); roof.position.y = 3.8; g.add(roof);
    const ch = cyl(0.45, 0.55, 1.8, stone, 6); ch.position.set(0.8, 4.4, -0.4); g.add(ch); const mouth = box(1.3, 1.1, 0.2, M(0xff6a10, {emissive:0xff5000, emissiveIntensity:1.6})); mouth.position.set(0, 1.0, 1.9); g.add(mouth);
    for (let i=0;i<3;i++){ const fl = glowSprite('rgba(255,120,30,.8)', 1.6 + i*0.4); fl.position.set(0.8, 5.5 + i*0.6, -0.4); fl.userData.ember = 1; g.add(fl); } g.add(at(glowSprite('rgba(255,110,20,.6)', 4), 0, 1.2, 2.2)); for (const sx of [-1,1]) g.add(at(sph(0.15, EYE(0xffd040)), sx*0.4, 2.4, 1.85)); },
  rider:(g,e,m,dk) => { const hide = M(e.color, {flatShading:true}); const bd = box(1.8, 1.6, 3.2, hide); bd.position.y = 1.6; g.add(bd); for (const [x,z] of [[-0.6,1.1],[0.6,1.1],[-0.6,-1.1],[0.6,-1.1]]) g.add(at(box(0.45, 1.0, 0.45, dk), x, 0.5, z));
    const sn = box(1.1, 1.0, 1.0, hide); sn.position.set(0, 1.6, 2.0); g.add(sn); for (const sx of [-1,1]){ g.add(rot(at(cone(0.1, 0.7, M(0xf4f0e0), 5), sx*0.45, 1.4, 2.5), -1.2, 0, sx*0.3)); g.add(at(sph(0.09, EYE(0xff3030)), sx*0.35, 1.95, 2.5)); }
    const r = new THREE.Group(); const H = hum(r, {body:M(0x6a3a20), limb:M(0xe0b080), s:0.75}); const hd = box(0.95, 0.95, 0.95, M(0xe0b080)); hd.position.y = H.headY; r.add(hd); r.add(at(box(1.0, 0.25, 0.4, M(0x2a1a10)), 0, H.headY - 0.2, 0.4));
    const hm = new THREE.Group(); hm.add(cyl(0.07, 0.07, 2.0, M(0x5a3a20))); hm.add(at(box(0.8, 0.5, 0.5, M(0x8a8a90, {metalness:0.7})), 0, 1.0, 0)); hm.position.set(1.0, 3.2, 0.5); hm.rotation.z = -0.6; r.add(hm); r.position.y = 1.6; g.add(r); },
  cart:(g,e,m,dk) => { const wood = M(0x6a4a2a, {flatShading:true}); g.add(at(box(2.4, 1.0, 3.0, wood), 0, 1.3, 0)); for (const [x,z] of [[-1.3,1.0],[1.3,1.0],[-1.3,-1.0],[1.3,-1.0]]){ const wh = tor(0.6, 0.12, M(0x3a2a1a), 5, 12); wh.position.set(x, 0.7, z); wh.rotation.y = Math.PI/2; g.add(wh); }
    const coil = new THREE.Group(); coil.add(cyl(0.25, 0.4, 2.4, M(e.color, {metalness:0.7}))); for (let i=0;i<5;i++) coil.add(at(tor(0.38, 0.07, M(0xc87a3a, {metalness:0.9}), 4, 14), 0, -0.9 + i*0.45, 0)); coil.children.slice(1).forEach(c => c.rotation.x = Math.PI/2);
    const top = sph(0.55, M(0xbff8ff, {emissive:0x60e0ff, emissiveIntensity:1.5}), 14, 10); top.position.y = 1.5; coil.add(top); coil.position.set(0, 3.0, 0); g.add(coil); g.add(at(glowSprite('rgba(120,230,255,.6)', 3), 0, 4.5, 0)); g.userData.iris = top; },
  ram:(g,e,m,dk) => { const log = cyl(0.5, 0.5, 4.6, M(0x6a4a2a, {flatShading:true}), 8); log.rotation.x = Math.PI/2; log.position.set(0, 2.0, 0.4); g.add(log); const hd = cone(0.75, 1.3, M(0x8a8a92, {metalness:0.7}), 8); hd.rotation.x = Math.PI/2; hd.position.set(0, 2.0, 3.2); g.add(hd);
    for (const sx of [-1,1]) g.add(rot(at(tor(0.4, 0.13, M(0xd8c8a8), 5, 10, Math.PI*1.4), sx*0.55, 2.4, 2.7), 0, Math.PI/2, 0));
    for (const [sx,z] of [[-1,1.0],[1,-0.8]]){ const u = new THREE.Group(); const H = hum(u, {body:m, limb:M(0xe0a070), s:0.62}); const h2 = box(1.0, 1.0, 1.0, M(0xe0a070)); h2.position.y = H.headY; u.add(h2); u.add(at(box(1.05, 0.35, 1.05, M(0xd8a020)), 0, H.headY + 0.4, 0)); u.add(at(sph(0.08, EYE(0xff3030)), 0.2, H.headY, 0.52)); u.position.set(sx*1.15, 0, z); g.add(u); } }
});
/* ---------- ★★★★★★ myth gods: towering, haloed, each with a signature weapon ---------- */
Object.assign(NEWART, {
  god:(g,e,m,dk) => { const K = e.key, s = 1.75; const gold = M(0xffcf3a, {metalness:0.85, roughness:0.25, emissive:0x553300}); const gl = c => M(c, {emissive:c, emissiveIntensity:1.4});
    const skin = M({poseidonGod:0x9fd8c8, raGod:0x3a6a4a, sekhmetGod:0xc8903a}[K] || 0xe8c9a8); const robe = M(e.color, {metalness:0.25, roughness:0.5});
    const H = hum(g, {body:robe, limb: M(new THREE.Color(e.color).multiplyScalar(0.7).getHex(), {roughness:0.6}), s}); const hy = H.headY; const hx = 1.45*s, hand = [hx, 3.8, 1.07];
    g.add(at(box(2.3*s, 0.35*s, 1.15*s, gold), 0, 2.0*s, 0)); for (const sx of [-1,1]){ const pd = sph(0.62*s, gold, 12, 8); pd.scale.y = 0.55; pd.position.set(sx*1.45*s, 3.85*s, 0); g.add(pd); }
    const cape = box(2.4*s, 3.4*s, 0.1, M(K === 'aresGod' ? 0x5a0a0a : K === 'odinGod' ? 0x2a2a3a : 0xf0e6c8)); cape.position.set(0, 2.5*s, -0.65*s); cape.rotation.x = 0.1; g.add(cape);
    // head
    if (K === 'raGod'){ const hd = box(1.2*s, 1.25*s, 1.3*s, M(0x2a5a3a)); hd.position.y = hy; g.add(hd); g.add(at(rot(cone(0.28*s, 0.8*s, gold, 6), Math.PI/2, 0, 0), 0, hy - 0.15*s, 0.95*s)); for (const sx of [-1,1]) g.add(at(sph(0.11*s, gl(0xffe060)), sx*0.32*s, hy + 0.1*s, 0.66*s)); g.add(at(box(1.3*s, 0.9*s, 1.35*s, M(0x1a3a8a)), 0, hy - 0.1*s, -0.15*s));
      const sun = sph(0.95*s, gl(0xff7a20), 20, 14); sun.position.set(0, hy + 1.35*s, -0.3); g.add(sun); g.add(at(glowSprite('rgba(255,150,40,.8)', 7), 0, hy + 1.35*s, -0.2)); const cob = cone(0.14*s, 0.6*s, gold, 6); cob.position.set(0, hy + 0.55*s, 0.72*s); g.add(cob); }
    else if (K === 'sekhmetGod'){ const hd = box(1.3*s, 1.25*s, 1.3*s, skin); hd.position.y = hy; g.add(hd); g.add(at(box(0.8*s, 0.55*s, 0.5*s, skin), 0, hy - 0.2*s, 0.8*s)); g.add(at(box(0.3*s, 0.2*s, 0.15*s, M(0x2a1a10)), 0, hy, 1.06*s));
      const mane = tor(0.85*s, 0.35*s, M(0x8a4a1a, {flatShading:true}), 6, 14); mane.position.set(0, hy, -0.05*s); g.add(mane); for (const sx of [-1,1]) g.add(at(sph(0.11*s, gl(0xffb020)), sx*0.32*s, hy + 0.15*s, 0.66*s));
      const sun = sph(0.55*s, gl(0xff5020), 16, 12); sun.position.set(0, hy + 1.15*s, -0.2); g.add(sun); g.add(at(glowSprite('rgba(255,90,30,.8)', 5), 0, hy + 1.15*s, -0.1)); }
    else { const hd = box(1.25*s, 1.25*s, 1.25*s, skin); hd.position.y = hy; g.add(hd);
      const eyeC = K === 'zeusGod' || K === 'thorGod' ? 0x9fdcff : K === 'poseidonGod' ? 0x60ffe0 : K === 'aresGod' ? 0xff3020 : K === 'susanooGod' ? 0xb0a0ff : 0xffe080;
      for (const sx of [-1,1]) if (!(K === 'odinGod' && sx === 1)) g.add(at(sph(0.1*s, gl(eyeC)), sx*0.3*s, hy + 0.1*s, 0.64*s));
      const beardC = {zeusGod:0xf4f4f4, poseidonGod:0x2a6a5a, odinGod:0xa8a8b0, thorGod:0xc0401a}[K]; if (beardC){ const bd = box(1.0*s, 0.9*s, 0.4*s, M(beardC, {flatShading:true})); bd.position.set(0, hy - 0.6*s, 0.5*s); g.add(bd); g.add(at(box(1.3*s, 0.4*s, 1.3*s, M(beardC)), 0, hy + 0.55*s, -0.05*s)); }
      if (K === 'zeusGod'){ const lr = tor(0.68*s, 0.08*s, M(0x6ab040, {metalness:0.4}), 5, 18); lr.rotation.x = Math.PI/2; lr.position.y = hy + 0.62*s; g.add(lr); }
      if (K === 'aresGod'){ g.add(at(box(1.35*s, 1.0*s, 1.35*s, M(0xb08a3a, {metalness:0.8, roughness:0.3})), 0, hy + 0.3*s, 0)); for (let i=0;i<7;i++) g.add(at(box(0.18*s, 0.5*s, 0.25*s, M(0xc01818)), 0, hy + 1.0*s - Math.abs(i-3)*0.06*s, (-0.75 + i*0.25)*s)); g.add(at(box(0.6*s, 0.12*s, 0.05, M(0x111111)), 0, hy + 0.1*s, 0.69*s)); }
      if (K === 'poseidonGod'){ for (let i=0;i<5;i++){ const c = cone(0.12*s, 0.6*s, M(0xff7a6a), 5); c.position.set((-0.5 + i*0.25)*s, hy + 0.95*s, 0.2*s); c.rotation.z = (i-2)*0.2; g.add(c); } }
      if (K === 'susanooGod'){ g.add(at(box(1.3*s, 0.18*s, 1.3*s, M(0xf4f4f4)), 0, hy + 0.3*s, 0)); g.add(at(sph(0.32*s, M(0x1a1a22)), 0, hy + 0.85*s, -0.2*s)); }
      if (K === 'odinGod'){ g.add(at(cyl(1.25*s, 1.25*s, 0.1*s, M(0x2a2a3a), 16), 0, hy + 0.7*s, 0)); g.add(at(cone(0.55*s, 1.0*s, M(0x2a2a3a), 12), 0, hy + 1.2*s, 0)); g.add(at(box(0.32*s, 0.32*s, 0.05, M(0x111111)), 0.3*s, hy + 0.1*s, 0.64*s)); }
      if (K === 'thorGod'){ g.add(at(box(1.35*s, 0.6*s, 1.35*s, M(0xb8c0c8, {metalness:0.8})), 0, hy + 0.45*s, 0)); for (const sx of [-1,1]){ const wg = cone(0.2*s, 0.9*s, M(0xf4f4f4), 4); wg.position.set(sx*0.8*s, hy + 0.75*s, 0); wg.rotation.z = -sx*0.9; g.add(wg); } } }
    // halo and divine light
    const halo = tor(1.05*s, 0.07*s, gl(0xfff0b0), 6, 32); halo.position.set(0, hy + 0.2*s, -0.75*s); g.add(halo); g.userData.halo = halo;
    // signature weapons
    const w = new THREE.Group(); w.position.set(hand[0], hand[1], hand[2]); g.add(w);
    if (K === 'zeusGod'){ const bolt = gl(0xfff27a); const zz = [[0,1.6,0.3],[0.35,0.9,-0.6],[-0.3,0.2,0.5],[0.3,-0.5,-0.5],[0,-1.2,0.3]]; for (let i=0;i<zz.length-1;i++){ const a = zz[i], b = zz[i+1]; const seg = box(0.22, Math.hypot(b[0]-a[0], b[1]-a[1]) + 0.1, 0.22, bolt); seg.position.set((a[0]+b[0])/2, (a[1]+b[1])/2 + 0.8, 0); seg.rotation.z = Math.atan2(-(b[0]-a[0]), b[1]-a[1]); w.add(seg); } w.add(at(glowSprite('rgba(255,240,140,.8)', 3), 0, 0.8, 0)); }
    if (K === 'aresGod'){ w.add(at(cyl(0.08, 0.08, 5.2, M(0x5a3a20)), 0, 0.8, 0)); w.add(at(cone(0.22, 0.9, M(0xd8dde3, {metalness:0.8}), 6), 0, 3.8, 0));
      const sh = cyl(1.1*s, 1.1*s, 0.15, M(0xb08a3a, {metalness:0.8, roughness:0.3}), 20); sh.rotation.x = Math.PI/2; sh.position.set(-hx - 0.2, 3.2*s, 0.8); g.add(sh); g.add(at(sph(0.25*s, M(0xc01818)), -hx - 0.2, 3.2*s, 0.95)); }
    if (K === 'poseidonGod'){ w.add(at(cyl(0.09, 0.09, 5.4, gold), 0, 0.8, 0)); for (const dx of [-0.45, 0, 0.45]) w.add(at(cone(0.1, 0.9, gold, 5), dx, 3.9 + (dx ? -0.15 : 0), 0)); w.add(at(box(1.0, 0.12, 0.12, gold), 0, 3.4, 0)); w.add(at(glowSprite('rgba(90,240,220,.6)', 2.5), 0, 3.6, 0)); }
    if (K === 'susanooGod'){ const bl = box(0.1, 4.2, 0.28, M(0xe8eef4, {metalness:0.9, roughness:0.15})); bl.position.set(0, 2.0, 0); w.add(bl); w.add(at(box(0.18, 0.9, 0.18, M(0x2a1a3a)), 0, -0.3, 0)); w.rotation.x = 0.5; for (let i=0;i<4;i++){ const cl = glowSprite('rgba(170,170,230,.45)', 3.5); cl.position.set(-2 + i*1.3, 1.0 + (i%2), -1); g.add(cl); } }
    if (K === 'raGod' || K === 'sekhmetGod'){ w.add(at(cyl(0.08, 0.08, 4.6, gold), 0, 0.6, 0)); if (K === 'raGod'){ const ank = tor(0.35, 0.08, gold, 5, 12); ank.position.y = 3.3; w.add(ank); w.add(at(box(0.8, 0.12, 0.12, gold), 0, 2.85, 0)); } else { w.add(at(glowSprite('rgba(255,110,30,.9)', 2.5), 0, 3.0, 0)); g.add(at(glowSprite('rgba(255,110,30,.8)', 2), -hx, 2.4*s, 0.6)); } }
    if (K === 'odinGod'){ w.add(at(cyl(0.08, 0.08, 5.6, M(0x5a4a3a)), 0, 0.8, 0)); w.add(at(cone(0.2, 1.1, gl(0xbfe8ff), 6), 0, 4.1, 0)); for (const sx of [-1,1]){ const rv = new THREE.Group(); rv.add(box(0.5, 0.35, 0.8, M(0x111116))); for (const wx of [-1,1]){ const wg = box(0.8, 0.06, 0.4, M(0x111116)); wg.position.x = wx*0.55; wg.rotation.z = wx*0.4; rv.add(wg); } rv.add(at(sph(0.06, gl(0xffe060)), 0.12, 0.08, 0.4)); rv.position.set(sx*2.6*s, hy + 0.6*s, 0.3); g.add(rv); (g.userData.wings = g.userData.wings || []).push(rv); } }
    if (K === 'thorGod'){ w.add(at(cyl(0.11, 0.11, 1.7, M(0x5a3a20)), 0, 0.2, 0)); w.add(at(box(1.3, 0.8, 0.8, M(0xa8b0b8, {metalness:0.85, roughness:0.25})), 0, 1.3, 0)); w.add(at(glowSprite('rgba(150,210,255,.7)', 2.4), 0, 1.3, 0)); }
    g.add(at(glowSprite('rgba(255,236,170,.16)', 9), 0, 4.5, -2.2)); g.userData.float = true; }
});
/* ===== Essay Quest v7 — ★7 Promised bosses + minions (built from ASM parts; every model faces +Z) ===== */
const PI = Math.PI;
const SCALE7 = {};   // art -> extra scale on top of the usual boss scale
const NOSPIKE7 = new Set();   // arts that get no generic spike-crown
const pk = (k, d, p, c, o) => Object.assign({k, d, p, c}, o || {});
const pb = (d, p, c, o) => pk('box', d, p, c, o), pc = (d, p, c, o) => pk('cyl', d, p, c, o), pn = (d, p, c, o) => pk('cone', d, p, c, o), ps = (d, p, c, o) => pk('sph', d, p, c, o), pt = (d, p, c, o) => pk('tor', d, p, c, o),
      po = (d, p, c, o) => pk('oct', d, p, c, o), pg = (d, p, c, o) => pk('glow', d, p, c, o), pp = (d, p, c, o) => pk('plane', d, p, c, o);
const mtl = (c, o) => Object.assign({mt:0.8, rg:0.28, c}, o || {});
const rg = (n, f) => Array.from({length:n}, (_, i) => f(i, n));
const EM = (e, i) => ({e, ei:i || 1.6});
/* a plain blocky body to hang a boss on: legs, torso, arms, head (pass s = scale) */
function human(o){ const s = o.s || 1, bc = o.body, lc = o.limb != null ? o.limb : bc, sk = o.skin != null ? o.skin : 0xe8c9a8, M0 = o.mat || {}; const P = [];
  P.push(pb([0.95*s, 1.9*s, 0.95*s], [-0.5*s, 0.95*s, 0], lc, M0), pb([0.95*s, 1.9*s, 0.95*s], [0.5*s, 0.95*s, 0], lc, M0), pb([2*s, 2*s, 1*s], [0, 2.9*s, 0], bc, M0));
  P.push(pb([0.95*s, 1.9*s, 0.95*s], [-1.45*s, 2.9*s, 0], lc, Object.assign({r:o.armL || [0,0,0.08]}, M0)), pb([0.95*s, 1.9*s, 0.95*s], [1.45*s, 2.9*s, 0], lc, Object.assign({r:o.armR || [0,0,-0.08]}, M0)));
  if (!o.nohead) P.push(pb([1.3*s, 1.3*s, 1.3*s], [0, 4.55*s, 0], sk, o.headMat || {}));
  return P; }
const eyes = (s, y, c, w) => [pb([0.3*s, 0.12*s, 0.05], [-(w || 0.3)*s, y, 0.66*s], c, EM(c, 2.6)), pb([0.3*s, 0.12*s, 0.05], [(w || 0.3)*s, y, 0.66*s], c, EM(c, 2.6))];
const A7 = {};   // art -> (g, e) => parts[]
function reg7(art, scale, fn, nospike){ A7[art] = fn; SCALE7[art] = scale; if (nospike !== false) NOSPIKE7.add(art); }

// ================= ZEUS PRIME =================
reg7('zeusprime', 0.74, (g, e) => { const s = 1.9, gold = 0xe3b53a, wht = 0xf4f0ff; return [
  ...human({s, body:wht, limb:0xe6d9bd, skin:0xf0cfb0, armR:[-1.3,0,-0.1]}),
  pb([2.2*s, 1.5*s, 0.2], [0, 3.4*s, 0.56*s], gold, mtl(gold)), po([0.5*s], [0, 3.4*s, 0.7*s], 0xfff27a, {e:0xfff27a, ei:2.4, s:[1,1.6,0.35]}), pb([2.3*s, 0.3*s, 1.15*s], [0, 2.0*s, 0], gold, mtl(gold)), ...rg(6, i => pb([0.4*s, 0.9*s, 0.08], [(-1.0 + i*0.4)*s, 1.5*s, 0.55*s], 0xf1e7c8, {r:[0.1,0,0]})),
  ...[-1,1].map(sx => ps([0.7*s, 12, 8], [sx*1.5*s, 4.1*s, 0], gold, mtl(gold, {s:[1,0.65,1.1]}))), ...[-1,1].flatMap(sx => rg(3, i => pn([0.16*s, 0.8*s, 5], [sx*(1.3 + i*0.3)*s, 4.7*s, -0.1*s], gold, mtl(gold, {r:[0,0,-sx*(0.3+i*0.3)]})))),
  // head: wild white hair + beard + laurel + lightning crown
  ps([0.85*s, 12, 8], [0, 5.0*s, -0.15*s], wht, {rg:1, s:[1.1,0.85,1.0]}), pb([1.1*s, 1.3*s, 0.5*s], [0, 4.1*s, 0.6*s], wht, {rg:1}), ...rg(5, i => pn([0.22*s, 1.0*s, 5], [(-0.5+i*0.25)*s, 3.65*s, 0.7*s], wht, {rg:1, r:[PI+0.0,0,(i-2)*0.12]})),
  ...eyes(s, 4.7*s, 0x9fe0ff, 0.3), ...rg(9, i => pn([0.12*s, 0.9*s, 4], [Math.cos(i*0.698)*0.85*s, 5.6*s + (i%2)*0.2*s, Math.sin(i*0.698)*0.85*s], 0xfff27a, {...EM(0xfff27a, 2.2), r:[0,0,(i%2?0.2:-0.2)]})),
  pt([1.0*s, 0.06*s], [0, 5.45*s, 0], 0x6ab040, mtl(0x6ab040,{r:[PI/2,0,0]})), pt([1.35*s, 0.05*s], [0, 4.8*s, -0.85*s], 0xfff0b0, {...EM(0xfff0b0, 1.6), r:[0,0,0], an:{t:'spin', ax:'z', v:0.5}}),
  // cape of cloud + the thunderbolt in his fist + orbiting bolts
  pp([2.8*s, 3.8*s], [0, 2.6*s, -0.75*s], 0x5a7ad8, {ds:1, op:0.9, an:{t:'sway', a:0.04, v:1.5}}), ...rg(4, i => pb([0.16*s, 1.2*s, 0.16*s], [Math.cos(i*1.57)*3.4, 6.0 + Math.sin(i*1.9)*0.6, Math.sin(i*1.57)*1.5], 0xfff27a, {...EM(0xfff27a, 2.4), r:[0,0,0.5], an:{t:'orbit', R:3.4, Rz:1.6, y:0.6, v:0.9, ph:i*1.57}})),
  pb([0.22*s, 1.6*s, 0.22*s], [2.0*s, 3.0*s, 1.0*s], 0xfff27a, {...EM(0xfff27a, 2.6), r:[0.3,0,0.5]}), pb([0.22*s, 1.2*s, 0.22*s], [2.5*s, 3.9*s, 1.25*s], 0xfff27a, {...EM(0xfff27a, 2.6), r:[0.3,0,-0.4]}), pg([6], [2.2*s, 3.5*s, 1.1*s], 'rgba(255,240,140,.7)', {an:{t:'pulse', a:0.3, v:5}}), pg([9*1.0], [0, 4.6*s, -0.8], 'rgba(160,200,255,.28)', {an:{t:'pulse', a:0.15, v:2}})]; });

// ================= ATLAS PRIME =================
reg7('atlas', 0.7, (g, e) => { const s = 2.2, rock = 0x8a7a6a, dk = 0x5a4e44; return [
  pb([1.15*s, 1.9*s, 1.15*s], [-0.62*s, 0.95*s, 0], rock, {fl:1, rg:0.95}), pb([1.15*s, 1.9*s, 1.15*s], [0.62*s, 0.95*s, 0], rock, {fl:1, rg:0.95}), pb([2.6*s, 2.3*s, 1.5*s], [0, 3.05*s, 0], dk, {fl:1, rg:0.95}),
  ...rg(5, i => pk('dod', [0.45*s, 0], [(-1+i*0.5)*s, (2.2 + (i%2)*1.3)*s, 0.65*s], rock, {fl:1, rg:0.9})), pb([0.18*s, 1.6*s, 0.05], [0, 3.0*s, 0.78*s], 0x6ad8ff, EM(0x6ad8ff, 2)), pb([1.4*s, 0.14*s, 0.05], [0, 3.4*s, 0.78*s], 0x6ad8ff, EM(0x6ad8ff, 2)),
  ...[-1,1].map(sx => pb([1.0*s, 2.4*s, 1.0*s], [sx*1.95*s, 4.3*s, 0.1*s], rock, {fl:1, rg:0.95, r:[0, 0, -sx*0.5]})), ...[-1,1].map(sx => pk('dod', [0.8*s, 0], [sx*2.2*s, 4.2*s, 0.2*s], dk, {fl:1, rg:0.95})),
  pb([1.2*s, 1.2*s, 1.2*s], [0, 4.9*s, 0.3*s], rock, {fl:1, rg:0.95}), ...eyes(s, 4.9*s, 0x6ad8ff, 0.28), pb([1.3*s, 0.3*s, 0.1], [0, 4.25*s, 0.88*s], 0x2a2420),
  // the world on his shoulders
  ps([2.8*s, 24, 18], [0, 8.4*s, -0.1*s], 0x2a6ad8, {rg:0.5, an:{t:'spin', ax:'y', v:0.15}}), ...rg(6, i => ps([(1.0+((i*5)%4)*0.18)*s, 12, 8], [Math.cos(i*1.05)*2.3*s, 8.4*s + Math.sin(i*1.9)*1.6*s, Math.sin(i*1.05)*1.6*s], 0x3a9a4a, {rg:0.9, s:[1,0.5,1], r:[0,0,0], an:{t:'spin', ax:'y', v:0.15}})),
  pt([4.4*s, 0.08*s, PI*2, 4, 60], [0, 8.4*s, 0], 0xd8c8a0, {r:[1.3,0,0.4], op:0.8, an:{t:'spin', ax:'z', v:0.1}}), pg([22], [0, 8.4*s, -0.5], 'rgba(120,180,255,.3)', {an:{t:'pulse', a:0.1, v:1.5}}),
  ...[-1,1].map(sx => pb([0.9*s, 2.6*s, 0.9*s], [sx*2.0*s, 6.0*s, 0.2*s], rock, {fl:1, rg:0.95, r:[0, 0, -sx*0.3]})), ...rg(8, i => pn([0.14*s, 0.5*s, 4], [Math.cos(i*0.8)*1.3*s, 9.9*s, Math.sin(i*0.8)*0.8*s], 0xfff0b0, {...EM(0xfff0b0, 1.6), an:{t:'bob', a:0.3, v:2}}))]; });

// ================= RED, THE MOUNTAIN CHAMPION =================
reg7('trainer', 0.95, (g, e) => { const s = 1.5, red = 0xd8302a; return [
  ...human({s, body:red, limb:0x2a3a6a, skin:0xf0cfb0, armL:[0,0,0.1], armR:[0,0,-0.1]}), pb([2.1*s, 1.5*s, 1.1*s], [0, 3.2*s, 0], red), pb([2.05*s, 0.7*s, 1.02*s], [0, 4.1*s, 0], 0xf4f4f4), pb([0.95*s, 0.7*s, 0.95*s], [-1.45*s, 3.9*s, 0], 0xf4f4f4), pb([0.95*s, 0.7*s, 0.95*s], [1.45*s, 3.9*s, 0], 0xf4f4f4),
  pb([2.2*s, 0.3*s, 1.15*s], [0, 2.0*s, 0], 0x222222), pb([0.95*s, 0.5*s, 0.95*s], [-0.5*s, 0.4*s, 0.1*s], 0x1a1a1a), pb([0.95*s, 0.5*s, 0.95*s], [0.5*s, 0.4*s, 0.1*s], 0x1a1a1a),
  // cap with a white badge, black hair, red scarf, yellow pack
  pb([1.45*s, 0.55*s, 1.45*s], [0, 5.2*s, 0], red), pb([1.2*s, 0.15*s, 0.9*s], [0, 4.95*s, 0.95*s], red), pb([0.4*s, 0.3*s, 0.05], [0, 5.25*s, 0.74*s], 0xf4f4f4), pb([1.4*s, 0.5*s, 0.4*s], [0, 4.7*s, -0.55*s], 0x15151a), ...eyes(s, 4.55*s, 0x332211, 0.3),
  pb([1.5*s, 1.9*s, 0.6*s], [0, 3.2*s, -0.85*s], 0xf0c030), pb([1.6*s, 0.25*s, 0.2*s], [0, 4.0*s, 0.3*s], 0xd0e0ff),
  // the six orbs orbiting him
  ...rg(6, i => ({k:'grp', p:[0, 3.4*s, 0], an:{t:'orbit', R:3.2, Rz:2.4, y:0.7, v:0.9, ph:i*1.047}, g:[ps([0.42, 14, 10, 0, PI*2, 0, PI/2], [0, 0.0, 0], 0xe8302a, {rg:0.2}), ps([0.42, 14, 10, 0, PI*2, PI/2, PI/2], [0, 0.0, 0], 0xf4f4f4, {rg:0.2}), pc([0.43, 0.43, 0.08, 14], [0, 0, 0], 0x222222), ps([0.1, 8, 6], [0, 0, 0.43], 0xf4f4f4, EM(0xffffff, 1)), pg([1.8], [0, 0, 0], 'rgba(255,255,255,.3)')]})),
  pg([7], [0, 3.0*s, 0], 'rgba(255,60,50,.25)', {an:{t:'pulse', a:0.15, v:3}})]; });

// ================= PRIME MUSASHI (Mecha Shogun) =================
reg7('mechashogun', 0.72, (g, e) => { const s = 2.0, stl = 0x9aa4b4, red = 0x9a1a22, blk = 0x1a1c22; return [
  pb([1.3*s, 2.0*s, 1.3*s], [-0.7*s, 1.0*s, 0], blk, mtl(blk)), pb([1.3*s, 2.0*s, 1.3*s], [0.7*s, 1.0*s, 0], blk, mtl(blk)), ...[-1,1].map(sx => pb([1.4*s, 0.6*s, 1.8*s], [sx*0.7*s, 0.3*s, 0.2*s], stl, mtl(stl))), ...[-1,1].map(sx => pb([1.5*s, 0.5*s, 1.2*s], [sx*0.7*s, 1.6*s, 0.25*s], red, mtl(red))),
  pb([2.8*s, 2.4*s, 1.6*s], [0, 3.2*s, 0], red, mtl(red)), pb([2.0*s, 1.6*s, 0.2*s], [0, 3.3*s, 0.8*s], blk, mtl(blk)), po([0.4*s], [0, 3.3*s, 0.95*s], 0xffcf4a, {...EM(0xffcf4a, 1.4), s:[1,1,0.4]}), ...rg(5, i => pb([0.45*s, 0.9*s, 0.12], [(-0.9+i*0.45)*s, 1.9*s, 0.85*s], red, mtl(red))), pb([3.0*s, 0.4*s, 1.7*s], [0, 2.0*s, 0], 0xffcf4a, mtl(0xffcf4a)),
  ...[-1,1].flatMap(sx => [pb([1.6*s, 0.35*s, 1.9*s], [sx*1.9*s, 4.5*s, 0], stl, mtl(stl)), pb([1.5*s, 0.35*s, 1.8*s], [sx*1.95*s, 4.15*s, 0], red, mtl(red)), pb([1.4*s, 0.35*s, 1.7*s], [sx*2.0*s, 3.8*s, 0], stl, mtl(stl)), pb([1.1*s, 2.2*s, 1.1*s], [sx*2.1*s, 2.4*s, 0], blk, mtl(blk)), pb([1.2*s, 0.8*s, 1.2*s], [sx*2.1*s, 1.1*s, 0.1*s], stl, mtl(stl)),
    ...rg(3, i => pc([0.12*s, 0.12*s, 1.2*s], [sx*(1.9 + (i-1)*0.34)*s, 5.0*s, 0.6*s], stl, mtl(stl, {r:[PI/2, 0, 0]}))), ...rg(3, i => pn([0.14*s, 0.5*s, 6], [sx*(1.9 + (i-1)*0.34)*s, 5.0*s, 1.4*s], 0xff5a2a, {...EM(0xff5a2a, 1.4), r:[PI/2, 0, 0]}))]),
  pb([1.5*s, 1.5*s, 1.5*s], [0, 5.0*s, 0], stl, mtl(stl)), pb([1.1*s, 0.5*s, 0.2], [0, 4.95*s, 0.76*s], 0x061018, {rg:0.1}), ...eyes(s, 4.98*s, 0x40e0ff, 0.3), pb([1.6*s, 0.4*s, 1.6*s], [0, 5.9*s, 0], red, mtl(red)), pb([1.0*s, 0.15*s, 0.2], [0, 6.1*s, 0.78*s], 0xffcf4a, mtl(0xffcf4a)),
  ...[-1,1].map(sx => pt([0.9*s, 0.08*s, PI*1.1, 5, 16], [sx*0.0, 6.5*s, 0.5*s], 0xffcf4a, mtl(0xffcf4a, {r:[0,0,sx*0.0 + (sx>0?-0.3:PI-0.0)], p:[sx*0.55*s, 6.4*s, 0.5*s]}))),
  // twin swords on his back, a katana in hand, jet thrusters
  pb([0.14*s, 4.6*s, 0.3*s], [-0.8*s, 4.2*s, -1.0*s], 0xe8f0ff, mtl(0xe8f0ff, {r:[0,0,0.5]})), pb([0.14*s, 4.6*s, 0.3*s], [0.8*s, 4.2*s, -1.0*s], 0xe8f0ff, mtl(0xe8f0ff, {r:[0,0,-0.5]})), pb([0.16*s, 4.4*s, 0.34*s], [2.6*s, 1.4*s, 1.3*s], 0xe8f0ff, mtl(0xe8f0ff, {r:[1.0,0,0.15]})), pb([0.5*s, 0.2*s, 0.4*s], [2.6*s, 2.6*s, 0.9*s], 0xffcf4a, mtl(0xffcf4a)),
  ...[-1,1].flatMap(sx => [pc([0.4*s, 0.5*s, 1.2*s], [sx*0.7*s, 3.6*s, -1.2*s], 0x444a56, mtl(0x444a56, {r:[PI/2, 0, 0]})), pg([2.4], [sx*0.7*s, 3.6*s, -2.1*s], 'rgba(80,220,255,.85)', {an:{t:'pulse', a:0.3, v:9}})]), pg([4], [0, 3.3*s, 1.1*s], 'rgba(255,200,80,.25)')]; });

// ================= COUNT MIDNIGHT =================
reg7('vampire', 0.82, (g, e) => { const s = 1.65; const blk = 0x15101c, wine = 0x7a1226; return [
  ...human({s, body:0x1c1424, limb:0x15101c, skin:0xdcd8e8, armL:[0,0,0.25], armR:[0,0,-0.25]}), pb([1.1*s, 2.1*s, 0.1], [0, 3.1*s, 0.58*s], 0xf0e6ea), pb([0.5*s, 0.4*s, 0.12], [0, 3.9*s, 0.64*s], wine), po([0.16*s], [0, 3.75*s, 0.7*s], 0xff2040, {...EM(0xff2040, 2), s:[1,1.4,0.4]}),
  pb([1.4*s, 1.3*s, 0.2], [-1.0*s, 4.3*s, -0.35*s], wine, {r:[0,0.5,0.3]}), pb([1.4*s, 1.3*s, 0.2], [1.0*s, 4.3*s, -0.35*s], wine, {r:[0,-0.5,-0.3]}), pp([3.0*s, 4.4*s], [0, 2.4*s, -0.75*s], wine, {ds:1, an:{t:'sway', a:0.03, v:1.6}}), pp([2.7*s, 4.2*s], [0, 2.4*s, -0.7*s], 0x15101c, {ds:1}),
  pb([1.3*s, 0.6*s, 1.0*s], [0, 5.1*s, -0.2*s], 0x0a0810), pb([1.35*s, 0.4*s, 0.45*s], [0, 5.0*s, 0.2*s], 0x0a0810, {r:[0.2,0,0]}), ...eyes(s, 4.55*s, 0xff2040, 0.3), ...[-1,1].map(sx => pn([0.07*s, 0.3*s, 4], [sx*0.2*s, 4.2*s, 0.68*s], 0xffffff, {r:[PI,0,0]})), ...[-1,1].map(sx => pn([0.18*s, 0.8*s, 4], [sx*0.6*s, 5.2*s, 0], 0xdcd8e8, {r:[0,0,-sx*0.2]})),
  // wings of a bat, scalloped
  ...[-1,1].flatMap(sx => [...rg(4, i => pb([0.1*s, (3.0 - i*0.35)*s, 0.08], [sx*(1.6 + i*0.8)*s, (3.6 - i*0.15)*s, -1.0*s], 0x2a1a38, {r:[0, 0, -sx*(0.9 + i*0.3)], an:{t:'wing', a:0.08, v:1.6}})), pp([3.6*s, 3.0*s], [sx*2.9*s, 3.4*s, -1.05*s], 0x3a1a4a, {ds:1, op:0.92, r:[0,0,-sx*0.5], an:{t:'wing', a:0.08, v:1.6}})]),
  ...[-1,1].flatMap(sx => rg(4, i => pn([0.07*s, 0.8*s, 4], [sx*1.45*s + sx*0.0, 1.4*s - 0.0, (0.4 + i*0.0)*s], 0xdcd8e8, {r:[PI - 0.2 - i*0.0, 0, sx*0.1], p:[sx*(1.15 + i*0.18)*s, 1.55*s, 0.4*s]}))),
  ...rg(6, i => ps([0.16, 8, 6], [Math.cos(i*1.05)*2.4, 4.0 + Math.sin(i*2)*0.6, Math.sin(i*1.05)*1.5], 0xff2040, {...EM(0xff2040, 1.6), an:{t:'orbit', R:2.4, Rz:1.5, y:0.5, v:0.8, ph:i*1.05}})), pg([8], [0, 3.2*s, -0.2], 'rgba(255,30,60,.22)', {an:{t:'pulse', a:0.2, v:2}})]; });

// ================= THE PALE HORSEMAN =================
reg7('horseman', 0.78, (g, e) => { const bone = 0xd8d4c0, gh = 0x9ad8d0; return [
  pb([1.7, 1.6, 4.2], [0, 2.7, 0], bone, {rg:0.9}), ...rg(7, i => pb([1.75, 0.1, 0.22], [0, 2.7 + (i%2)*0.05, -1.7 + i*0.6], 0x15151a, {})), pb([0.9, 1.9, 1.1], [0, 3.9, 2.0], bone, {r:[-0.5,0,0]}), pb([0.85, 0.8, 1.7], [0, 4.7, 2.9], bone, {rg:0.9}), pb([0.7, 0.4, 0.9], [0, 4.15, 3.5], bone), ...[-1,1].map(sx => ps([0.12, 8, 6], [sx*0.3, 4.9, 3.6], gh, EM(gh, 3))), ...[-1,1].map(sx => pn([0.14, 0.6, 4], [sx*0.3, 5.3, 2.5], bone)),
  ...[[-0.6,1.7],[0.6,1.7],[-0.6,-1.6],[0.6,-1.6]].flatMap(([x,z]) => [pb([0.4, 1.5, 0.4], [x, 1.1, z], bone), pb([0.45, 0.4, 0.6], [x, 0.2, z + 0.1], 0x2a2a30)]), pb([0.3, 0.3, 2.8], [0, 2.9, -2.9], bone, {r:[0.7,0,0]}),
  ...rg(10, i => pg([1.2 - (i%3)*0.2], [0, 5.4 - i*0.18, 2.0 - i*0.28], 'rgba(120,230,240,.9)', {an:{t:'rise', v:0.9, h:1.0, o:0.9}})), ...rg(8, i => pg([0.9], [0, 3.0, -3.0 - i*0.0], 'rgba(120,230,240,.8)', {p:[(i%2?0.3:-0.3), 3.2, -3.4], an:{t:'rise', v:0.7, h:1.4, o:0.8}})),
  // the rider
  pb([1.8, 2.4, 1.1], [0, 5.3, -0.2], 0x14161c, {r:[0.1,0,0]}), pp([2.6, 3.4], [0, 4.2, -0.9], 0x14161c, {ds:1, an:{t:'sway', a:0.05, v:2}}), pb([1.6, 1.6, 1.5], [0, 7.1, 0], 0x14161c), pb([1.1, 1.1, 1.0], [0, 7.0, 0.35], bone), ...[-1,1].map(sx => pb([0.3, 0.3, 0.1], [sx*0.28, 7.1, 0.9], 0x041018)), ...[-1,1].map(sx => ps([0.08, 6, 5], [sx*0.28, 7.1, 0.92], gh, EM(gh, 3))), pb([0.7, 0.2, 0.1], [0, 6.65, 0.9], 0x041018),
  pb([0.9, 0.8, 0.9], [-1.4, 5.5, 0.9], 0x14161c, {r:[-1.0,0,0]}), pb([0.9, 0.8, 0.9], [1.4, 5.5, 0.8], 0x14161c, {r:[-1.0,0,0]}),
  pc([0.1, 0.1, 6.8], [1.6, 6.0, 1.3], 0x3a2a1a, {r:[0.2,0,0]}), ...rg(8, i => pb([0.45 - i*0.03, 0.4, 0.08], [1.6 - Math.sin(i*0.4)*0.0 + (i*0.26), 9.2 + Math.cos(i*0.42)*0.6 - i*0.28, 1.3], 0xdcf4f0, mtl(0xdcf4f0, {...EM(0x9ad8d0, 0.6), r:[0,0,-0.7 - i*0.1]}))), pg([3], [3.2, 8.2, 1.3], 'rgba(150,240,230,.6)', {an:{t:'pulse', a:0.3, v:3}}),
  pg([10], [0, 3.5, 0], 'rgba(120,230,230,.2)', {an:{t:'pulse', a:0.15, v:2}})]; });

// ================= GORATH, THE CITY-EATER =================
reg7('kaiju', 0.62, (g, e) => { const sk = 0x3a5a4a, dk = 0x24382e, plate = 0x1a2a3a; return [
  ...[-1,1].map(sx => pb([2.2, 3.4, 2.4], [sx*1.5, 1.7, -0.2], sk, {fl:1, rg:0.9})), ...[-1,1].map(sx => pb([2.6, 0.7, 3.2], [sx*1.5, 0.35, 0.5], dk, {fl:1, rg:0.9})), ...[-1,1].flatMap(sx => rg(3, i => pn([0.25, 0.7, 4], [sx*1.5 + (i-1)*0.7, 0.4, 2.2], 0xe8e0c8, {r:[PI/2,0,0]}))),
  pb([5.0, 4.4, 3.6], [0, 5.0, -0.8], sk, {fl:1, rg:0.9, r:[-0.25,0,0]}), pb([3.6, 3.0, 0.4], [0, 4.6, 0.9], 0xb8c8a0, {fl:1, rg:0.9, r:[-0.25,0,0]}), ...rg(5, i => pb([3.4, 0.08, 0.2], [0, 3.6 + i*0.6, 1.08 - i*0.06], 0x8a9a78, {r:[-0.25,0,0]})),
  pb([3.6, 3.6, 3.0], [0, 8.0, 0.9], sk, {fl:1, rg:0.9, r:[0.0,0,0]}), pb([3.0, 1.6, 3.6], [0, 8.1, 2.8], sk, {fl:1, rg:0.9}), pb([2.8, 0.9, 3.2], [0, 6.8, 2.6], dk, {fl:1, rg:0.9, r:[0.1,0,0]}), ...rg(7, i => pn([0.14, 0.5, 4], [-1.2 + i*0.4, 7.3, 4.1], 0xf4ecd0, {r:[PI,0,0]})), ...rg(7, i => pn([0.14, 0.5, 4], [-1.2 + i*0.4, 7.4, 4.2], 0xf4ecd0, {r:[PI,0,0]})),
  ...[-1,1].map(sx => ps([0.3, 8, 6], [sx*1.3, 9.0, 3.2], 0xffd040, EM(0xffd040, 2.4))), ...[-1,1].map(sx => ps([0.12, 6, 5], [sx*1.3, 9.0, 3.45], 0x100800)), ...[-1,1].map(sx => ps([0.2, 6, 5], [sx*0.55, 8.1, 4.55], 0x100800)),
  pg([5], [0, 7.3, 4.0], 'rgba(90,220,255,.6)', {an:{t:'pulse', a:0.4, v:4}}),
  ...[-1,1].map(sx => pb([0.9, 2.2, 0.9], [sx*2.9, 5.2, 1.0], sk, {fl:1, rg:0.9, r:[-0.7,0,-sx*0.2]})), ...[-1,1].flatMap(sx => rg(3, i => pn([0.12, 0.7, 4], [sx*2.9 + (i-1)*0.2, 4.4, 2.0], 0xe8e0c8, {r:[PI*0.8,0,0]}))),
  // tail
  ...rg(7, i => pb([(3.0 - i*0.38), (2.6 - i*0.3), 2.2], [0, 2.8 - i*0.1, -3.0 - i*1.6], sk, {fl:1, rg:0.9, r:[0, Math.sin(i*0.7)*0.15, 0]})),
  // glowing dorsal plates
  ...rg(10, i => pn([0.6 + (i<5? i*0.1 : (9-i)*0.1), 1.8 + (i<5? i*0.2 : (9-i)*0.2), 4], [0, 8.8 - i*0.9 + (i>5?-0.6:0), -0.6 - i*0.38 - (i>5?0.4:0)], plate, {r:[-0.3,0,0], ...EM(0x30c8ff, 0.9), an:{t:'pulse', a:0.2, v:3, ph:i*0.5}})), pg([14], [0, 7, -1], 'rgba(60,200,255,.18)', {an:{t:'pulse', a:0.2, v:2}})]; });

// ================= MATRIARCH LEVIATHAN =================
reg7('leviathan', 0.66, (g, e) => { const sk = 0x1a4a6a, dk = 0x0e2a3e, belly = 0x6aa0b0; return [
  ...rg(9, i => ps([(2.3 - i*0.12), 14, 10], [Math.sin(i*0.8)*2.0 - 1.0, 2.2 + Math.max(0, 4.6 - i*0.9) , -i*1.6 + 2.6], i%2 ? sk : dk, {rg:0.4, s:[1,1,1.15]})), ...rg(6, i => ps([0.3, 8, 6], [Math.sin(i*0.8)*2.0 - 1.0, 2.6 + Math.max(0, 4.6 - i*0.9), -i*1.6 + 2.6 + 0.0], belly, {rg:0.5, p:[Math.sin(i*0.8)*2.0 - 1.0, 1.0 + Math.max(0, 4.6 - i*0.9), -i*1.6 + 2.9]})),
  // anglerfish head
  ps([3.0, 16, 12], [-1.0, 7.2, 3.1], sk, {rg:0.4, s:[1.1,0.95,1.15]}), pb([3.4, 0.7, 3.4], [-1.0, 5.6, 4.0], dk, {rg:0.5, r:[0.2,0,0]}), pb([3.2, 1.4, 3.6], [-1.0, 6.2, 4.2], dk, {rg:0.5, r:[-0.1,0,0]}), ...rg(10, i => pn([0.18, 0.9 + (i%2)*0.3, 4], [-2.2 + i*0.27, 6.2, 5.8], 0xf4f0d8, {r:[PI,0,0]})), ...rg(10, i => pn([0.16, 0.7, 4], [-2.2 + i*0.27, 5.8, 5.8], 0xf4f0d8, {r:[0,0,0]})),
  ...[-1,1].flatMap(sx => [ps([0.55, 12, 8], [-1.0 + sx*1.5, 8.3, 4.2], 0xf8e070, EM(0xf8e070, 2.2)), ps([0.25, 8, 6], [-1.0 + sx*1.5, 8.3, 4.65], 0x080808), ...rg(2, i => ps([0.2, 8, 6], [-1.0 + sx*(2.4 + i*0.2), 7.2 + i*0.6, 4.0], 0xf8e070, EM(0xf8e070, 1.8)))]),
  M7tube([[-1.0, 9.0, 3.2], [-1.0, 11.6, 4.6], [-1.0, 12.4, 6.6], [-1.0, 11.2, 7.8]], 0.14, 0x0e2a3e), ps([0.7, 12, 10], [-1.0, 11.2, 7.9], 0xfff0a0, EM(0xfff0a0, 3)), pg([7], [-1.0, 11.2, 7.9], 'rgba(255,240,130,.85)', {an:{t:'pulse', a:0.3, v:3}}),
  ...[-1,1].map(sx => pb([0.15, 3.4, 2.4], [-1.0 + sx*3.0, 6.6, 3.0], sk, {ds:1, op:0.85, r:[0,sx*0.6,sx*0.5], an:{t:'wing', a:0.15, v:2}})), ...rg(12, i => pn([0.2, 0.9, 4], [-1.0, 8.8 - i*0.5 + (i>5? -0.7:0), 1.8 - i*0.9 - (i>5?0.4:0)], dk, {r:[-0.8,0,0]})),
  ...rg(10, i => pg([0.9], [-3 + (i%5)*1.4, 0.3, 3 + (i>4?1.5:0)], 'rgba(120,200,255,.5)', {an:{t:'rise', v:0.5, h:3, o:0.6}})), pg([14], [-1, 5.5, 3], 'rgba(60,160,230,.2)')]; });
function M7tube(pts, r, c){ return {k:'tube', d:[r, 6], p:[0,0,0], c, pts, seg:22, rg:0.5}; }

// ================= RAMSES PRIME =================
reg7('pharaohprime', 0.7, (g, e) => { const s = 1.9, gold = 0xe0b83a, blk = 0x14141c; return [
  ...human({s, body:0xd8ccb0, limb:blk, skin:0x14141c, armL:[-0.9,0,0.2], armR:[-0.9,0,-0.2]}), pb([2.3*s, 0.6*s, 1.15*s], [0, 1.75*s, 0], 0xf4f0e0), pb([2.1*s, 0.7*s, 1.1*s], [0, 1.4*s, 0.1], 0xf4f0e0, {r:[0.15,0,0]}), pb([0.4*s, 0.5*s, 0.1], [0, 1.9*s, 0.62*s], gold, mtl(gold)),
  pt([1.2*s, 0.28*s, PI, 6, 24], [0, 3.9*s, 0.15*s], gold, mtl(gold, {r:[PI/2.3, 0, PI]})), pt([1.0*s, 0.16*s, PI, 6, 24], [0, 3.8*s, 0.2*s], 0x1aa3a3, {r:[PI/2.3, 0, PI]}), pt([0.8*s, 0.12*s, PI, 6, 24], [0, 3.7*s, 0.25*s], 0xc4161c, {r:[PI/2.3, 0, PI]}),
  pb([1.7*s, 1.3*s, 1.7*s], [0, 5.35*s, -0.05*s], gold, mtl(gold)), ...rg(5, i => pb([1.72*s, 0.1*s, 1.72*s], [0, (4.9 + i*0.22)*s, -0.05*s], 0x1a4aa0)), ...[-1,1].flatMap(sx => [pb([0.45*s, 1.6*s, 0.35*s], [sx*0.95*s, 4.2*s, 0.45*s], gold, mtl(gold)), ...rg(4, i => pb([0.47*s, 0.08*s, 0.37*s], [sx*0.95*s, (3.6 + i*0.35)*s, 0.45*s], 0x1a4aa0))]),
  pb([0.4*s, 0.9*s, 0.12], [0, 4.0*s, 0.85*s], 0x2a2a8a), ...eyes(s, 4.65*s, 0x40ffe0, 0.3), pn([0.13*s, 0.6*s, 6], [0, 6.2*s, 0.5*s], 0x2fb860, {...EM(0x2fb860, 1.4), r:[-0.2,0,0]}), pn([0.16*s, 0.5*s, 6], [0, 5.9*s, 0.85*s], gold, mtl(gold, {r:[PI/2,0,0]})),
  // ankh staff + flail crossed
  pc([0.07*s, 0.07*s, 5.4*s], [1.9*s, 3.4*s, 1.0*s], gold, mtl(gold)), pt([0.5*s, 0.1*s], [1.9*s, 6.4*s, 1.0*s], gold, mtl(gold, {s:[1,1.3,1]})), pb([1.0*s, 0.18*s, 0.18*s], [1.9*s, 5.9*s, 1.0*s], gold, mtl(gold)), pg([4], [1.9*s, 6.4*s, 1.0*s], 'rgba(255,215,90,.6)', {an:{t:'pulse', a:0.3, v:4}}),
  pc([0.06*s, 0.06*s, 2.6*s], [-1.9*s, 3.0*s, 1.0*s], 0x6a4a1a), ...rg(3, i => M7tube([[-1.9*s, 4.3*s, 1.0*s], [-2.2*s - i*0.2*s, 3.6*s, 1.3*s + i*0.1*s], [-2.5*s - i*0.3*s, 3.0*s, 1.5*s]], 0.04*s, gold)),
  // behind him: a sun disk and floating scarabs
  ps([2.6*s, 18, 14], [0, 5.6*s, -2.0*s], 0xffcf4a, {...EM(0xffa010, 1.1), s:[1,1,0.15]}), pt([3.1*s, 0.1*s, PI*2, 4, 40], [0, 5.6*s, -2.0*s], gold, {...EM(0xffa010, 1.4), an:{t:'spin', ax:'z', v:0.3}}), pg([14*1], [0, 5.6*s, -2.2*s], 'rgba(255,170,40,.4)', {an:{t:'pulse', a:0.15, v:2}}),
  ...rg(8, i => ps([0.28, 8, 6], [0, 3.0, 0], 0x1aa3a3, {...mtl(0x1aa3a3,{s:[1,0.6,1.3]}), an:{t:'orbit', R:3.6, Rz:2.8, y:1.2, v:0.9, ph:i*0.785}, p:[0, 4.5 + (i%3)*0.8, 0]}))]; });

// ================= RYUGA, THE DRAGON EMPEROR =================
reg7('dragonemp', 0.62, (g, e) => { const red = 0xc01820, gold = 0xe0b83a, dk = 0x7a0e14; const body = [[0,1.4,-3.5],[2.5,1.0,-1.8],[3.2,2.2,0.2],[1.6,4.0,1.4],[-1.0,5.4,0.8],[-2.6,4.4,-0.6],[-2.6,2.2,-1.4],[-0.6,1.0,-2.6],[0.4,2.4,-0.8]];
  return [
  M7tube(body.slice(0, 8), 1.1, red), ...body.slice(0, 8).map(([x,y,z], i) => ps([1.2 - i*0.04, 10, 8], [x, y, z], i%2 ? red : dk, {rg:0.35})),
  ...rg(14, i => { const t = i/13, k = Math.floor(t*6.99); const a = body[k], b = body[k+1]; const u = t*6.99 - k; return pn([0.28, 0.9, 4], [a[0]+(b[0]-a[0])*u, a[1]+(b[1]-a[1])*u + 1.1, a[2]+(b[2]-a[2])*u], gold, mtl(gold, {r:[0,0,0]})); }),
  // the head: broad snout, antlers, whiskers, mane
  pb([2.2, 1.7, 2.8], [-2.0, 6.0, 1.9], red, {rg:0.35}), pb([1.8, 0.8, 1.8], [-2.0, 5.2, 3.4], dk, {rg:0.35}), pb([1.9, 1.1, 1.7], [-2.0, 6.5, 3.3], red, {rg:0.35}), ...rg(6, i => pn([0.12, 0.45, 4], [-2.8 + i*0.32, 5.55, 4.25], 0xf4f0d8, {r:[PI,0,0]})),
  ...[-1,1].flatMap(sx => [ps([0.26, 8, 6], [-2.0 + sx*0.95, 6.7, 3.0], 0xffe040, EM(0xffe040, 2.4)), ps([0.1, 6, 5], [-2.0 + sx*0.95, 6.7, 3.25], 0x100000), M7tube([[-2.0 + sx*0.5, 6.1, 4.8], [-2.0 + sx*1.8, 6.3, 5.6], [-2.0 + sx*3.2, 5.2, 5.4], [-2.0 + sx*4.0, 3.8, 5.0]], 0.05, 0xf4f0d8), pb([0.15, 2.0, 0.15], [-2.0 + sx*0.7, 7.9, 1.8], gold, mtl(gold, {r:[0,0,-sx*0.5]})), ...rg(3, i => pb([0.12, 0.9, 0.12], [-2.0 + sx*(1.2 + i*0.35), 8.6 + i*0.2, 1.8], gold, mtl(gold, {r:[0,0,-sx*(0.7 + i*0.4)]})))]),
  ...rg(8, i => pg([1.6], [-2.0 + (i-3.5)*0.0 , 5.8 + (i%4)*0.35, 0.2 - i*0.15], 'rgba(255,120,40,.85)', {an:{t:'rise', v:0.7, h:1.4, o:0.8}})),
  // the pearl and clouds
  ps([0.7, 14, 10], [-4.2, 3.2, 3.4], 0xbfe0ff, {...EM(0x80c0ff, 1.8), an:{t:'bob', a:0.3, v:2}}), pg([5], [-4.2, 3.2, 3.4], 'rgba(160,220,255,.7)', {an:{t:'pulse', a:0.3, v:3}}), ...rg(6, i => pg([4.0], [-3 + (i%3)*3.0, 0.4, -2 + (i>2?2.5:0)], 'rgba(230,240,255,.35)', {an:{t:'drift', a:0.6, v:0.5}}))]; });

// ================= MINIONS: Red's six beasts + other small summons =================
const M3 = (art, scale, fn) => reg7(art, scale, fn, true);
M3('pcdrake', 1.0, (g, e) => { const o = 0xff7a30, y = 0xf6c070; return [ps([1.4, 12, 8], [0, 2.0, -0.2], o, {s:[1,1,1.35]}), ps([0.95, 10, 8], [0, 1.6, 0.1], y, {s:[0.8,1,1.35], p:[0, 1.4, 0.55]}), ps([1.0, 12, 8], [0, 3.5, 1.4], o), pb([0.8, 0.6, 0.9], [0, 3.2, 2.1], o), ...[-1,1].map(sx => ps([0.12, 6, 5], [sx*0.4, 3.8, 2.0], 0x101010)), ...[-1,1].map(sx => pn([0.14, 0.6, 4], [sx*0.4, 4.4, 0.9], 0xffe0a0, {r:[0,0,-sx*0.3]})),
  ...[-1,1].map(sx => pb([0.2, 2.0, 2.0], [sx*1.4, 3.0, -0.3], 0x2a8aa0, {ds:1, op:0.92, r:[0,sx*0.3,sx*0.7], an:{t:'wing', a:0.25, v:3}})), M7tube([[0, 1.4, -1.0], [0, 0.8, -2.2], [0, 1.6, -3.2], [0, 2.6, -3.6]], 0.28, o), pn([0.5, 1.4, 6], [0, 3.2, -3.7], 0xff5a10, {...EM(0xff5a10, 1.6), an:{t:'pulse', a:0.2, v:6}}), pg([3], [0, 3.2, -3.7], 'rgba(255,150,40,.8)', {an:{t:'pulse', a:0.3, v:5}}), ...[-0.7,0.7].map(x => pb([0.5, 1.2, 0.6], [x, 0.6, 0.3], o))]; });
M3('pcturtle', 1.0, (g, e) => { const b = 0x3a8ac8, sh = 0x8a6a3a; return [ps([1.9, 14, 8, 0, PI*2, 0, PI/2], [0, 1.3, 0], sh, {rg:0.6, s:[1,0.9,1.15]}), ...rg(6, i => pb([0.6, 0.08, 0.6], [Math.cos(i*1.05)*1.0, 2.5, Math.sin(i*1.05)*1.0], 0xc8a060, {r:[0,i,0]})), pb([3.3, 0.5, 3.6], [0, 1.2, 0], 0xe8d8a0), ps([0.9, 12, 8], [0, 1.8, 2.3], b), pb([0.5, 0.5, 0.5], [0, 1.4, 2.8], b), ...[-1,1].map(sx => ps([0.1, 6, 5], [sx*0.35, 2.0, 2.65], 0x101010)),
  ...[-1,1].flatMap(sx => [pb([0.8, 0.8, 0.9], [sx*1.4, 0.4, 1.3], b), pb([0.8, 0.8, 0.9], [sx*1.4, 0.4, -1.3], b), pc([0.28, 0.28, 1.4, 8], [sx*1.4, 3.3, -0.4], 0x6a6a74, mtl(0x6a6a74, {r:[PI/2, 0, 0]})), pc([0.3, 0.3, 0.3, 8], [sx*1.4, 3.3, 0.35], 0x2a2a30, mtl(0x2a2a30, {r:[PI/2, 0, 0]}))]), pg([2.6], [0, 1.4, 0], 'rgba(100,180,255,.35)')]; });
M3('pctoad', 1.0, (g, e) => { const gr = 0x4ac060, dg = 0x2a7a3a; return [ps([1.5, 12, 8], [0, 1.3, 0], gr, {s:[1.15,0.85,1]}), ps([0.95, 10, 8], [0, 1.9, 1.0], gr), ...[-1,1].map(sx => ps([0.38, 8, 6], [sx*0.55, 2.7, 1.2], 0xf8e070)), ...[-1,1].map(sx => ps([0.16, 6, 5], [sx*0.55, 2.75, 1.5], 0x101010)), pb([1.1, 0.12, 0.2], [0, 1.55, 1.9], 0x1a3a1a),
  // the bloom on his back
  ...rg(6, i => pn([0.34, 1.6, 6], [Math.cos(i*1.05)*0.5, 3.4, -0.3 + Math.sin(i*1.05)*0.5], 0xff7ac8, {r:[Math.sin(i*1.05)*0.5, 0, -Math.cos(i*1.05)*0.5], rg:0.6})), ps([0.45, 10, 8], [0, 3.6, -0.3], 0xf8e070, EM(0xf8e070, 0.8)), ps([0.8, 12, 8], [0, 2.4, -0.2], dg, {s:[1,0.7,1]}),
  ...[-1,1].flatMap(sx => [pb([0.5, 1.2, 0.7], [sx*1.3, 0.6, 0.9], dg), pb([0.55, 1.0, 0.9], [sx*1.1, 0.4, -0.8], dg)]), ...rg(4, i => pg([0.5], [0, 3.4, -0.3], 'rgba(255,230,120,.8)', {an:{t:'rise', v:0.5, h:1.4, o:0.8}}))]; });
M3('pcmouse', 1.0, (g, e) => { const y = 0xffd830; return [ps([1.0, 12, 8], [0, 1.6, 0], y, {s:[1,1.1,1]}), ps([0.75, 10, 8], [0, 2.9, 0.2], y), ...[-1,1].flatMap(sx => [pn([0.22, 1.3, 4], [sx*0.55, 3.9, 0], y, {r:[0,0,-sx*0.3]}), pn([0.23, 0.45, 4], [sx*0.62, 4.45, 0], 0x1a1a1a, {r:[0,0,-sx*0.3]}), ps([0.2, 8, 6], [sx*0.55, 2.7, 0.7], 0xe83030, EM(0xe83030, 0.8)), ps([0.09, 6, 5], [sx*0.3, 3.1, 0.88], 0x101010)]), pn([0.1, 0.18, 4], [0, 2.7, 0.9], 0x101010, {r:[PI/2,0,0]}),
  M7tube([[0, 1.0, -0.8], [0.0, 1.2, -1.6], [0.0, 2.6, -2.0], [0.0, 3.6, -1.4], [0, 3.1, -2.4], [0, 4.8, -2.4]], 0.1, y, {}), ...rg(3, i => pb([0.7, 0.14, 0.12], [0, 2.2 + i*0.9, -1.6 - (i%2)*0.4], 0xffe040, {...EM(0xffe040, 2), r:[0,0,0.6]})), pg([2.4], [0, 1.8, 0], 'rgba(255,240,100,.6)', {an:{t:'pulse', a:0.4, v:8}}), ...[-1,1].flatMap(sx => [pb([0.4, 0.9, 0.4], [sx*0.5, 0.45, 0.3], y), pb([0.9, 0.6, 0.6], [sx*0.9, 1.7, 0.6], y)])]; });
M3('pcgiant', 1.0, (g, e) => { const c = 0x5a8a9a, bl = 0xe8e0c0; return [ps([2.4, 14, 10], [0, 2.4, 0], c, {s:[1.1,1,1]}), ps([1.7, 12, 8], [0, 2.1, 0.8], bl, {s:[1,1,0.75]}), ps([1.4, 12, 8], [0, 4.6, 0.7], c, {s:[1.1,0.9,1]}), ...[-1,1].flatMap(sx => [pn([0.35, 0.9, 4], [sx*1.1, 5.7, 0.4], c, {r:[0,0,-sx*0.3]}), pb([0.5, 0.08, 0.1], [sx*0.55, 4.7, 1.65], 0x101010)]), pb([0.7, 0.1, 0.1], [0, 4.1, 1.8], 0x1a2a2a), ...[-1,1].map(sx => ps([0.7, 8, 6], [sx*2.3, 1.8, 0.4], c)), ...[-1,1].map(sx => pb([1.2, 0.8, 1.4], [sx*1.1, 0.4, 1.0], c)),
  ...rg(3, i => pg([1.0], [0.9 + i*0.5, 6.4 + i*0.6, 0.6], 'rgba(200,220,255,.8)', {an:{t:'rise', v:0.35, h:1.6, o:0.8}}))]; });
M3('pcpsy', 1.0, (g, e) => { const p = 0xc07ae0; return [ps([0.9, 10, 8], [0, 3.0, 0], p, {s:[1,1.2,1.1], an:{t:'bob', a:0.25, v:2}}), ps([0.8, 10, 8], [0, 4.2, 0.4], p, {an:{t:'bob', a:0.25, v:2}}), ...[-1,1].flatMap(sx => [pn([0.3, 0.8, 4], [sx*0.5, 5.0, 0.2], p, {r:[0,0,-sx*0.2], an:{t:'bob', a:0.25, v:2}}), ps([0.16, 8, 6], [sx*0.32, 4.4, 1.12], 0xf8f0ff, EM(0xc0a0ff, 2), {an:{t:'bob', a:0.25, v:2}})]), po([0.22], [0, 4.7, 1.0], 0xff7ad8, {...EM(0xff7ad8, 2.2), s:[1,1.4,0.6]}), M7tube([[0, 2.6, -0.7], [0.0, 2.2, -1.6], [0.2, 3.4, -2.3], [-0.2, 4.4, -2.0]], 0.12, p),
  ...rg(3, i => ps([0.18, 8, 6], [0, 3.4, 0], 0xffb0ff, {...EM(0xffb0ff, 1.6), an:{t:'orbit', R:1.8, Rz:1.4, y:0.6, v:1.4, ph:i*2.1}, p:[0, 3.5, 0]})), pg([3.4], [0, 3.6, 0], 'rgba(200,120,255,.45)', {an:{t:'pulse', a:0.2, v:3}}), ...[-1,1].map(sx => pb([0.35, 1.4, 0.35], [sx*0.4, 1.1, 0.3], p, {an:{t:'bob', a:0.25, v:2}}))]; });
M3('wraithrider', 0.9, (g, e) => { const gh = 0x9ad8d0; return [pb([1.2, 1.2, 3.0], [0, 2.1, 0], 0xcfe8e4, {op:0.85}), pb([0.7, 1.4, 0.8], [0, 3.0, 1.6], 0xcfe8e4, {op:0.85, r:[-0.5,0,0]}), pb([0.7, 0.6, 1.3], [0, 3.6, 2.3], 0xcfe8e4, {op:0.85}), ...[-1,1].map(sx => ps([0.1, 6, 5], [sx*0.25, 3.8, 2.8], gh, EM(gh, 3))), ...[[-0.5,1.2],[0.5,1.2],[-0.5,-1.2],[0.5,-1.2]].map(([x,z]) => pb([0.3, 1.5, 0.3], [x, 0.8, z], 0xcfe8e4, {op:0.8})),
  pb([1.3, 1.6, 0.9], [0, 4.0, -0.2], 0x14161c, {op:0.92}), ps([0.65, 10, 8], [0, 5.2, 0], 0x14161c), ps([0.34, 8, 6], [0, 5.15, 0.4], 0xdcf4f0), ...[-1,1].map(sx => ps([0.07, 6, 5], [sx*0.17, 5.2, 0.7], gh, EM(gh, 3))), pc([0.06, 0.06, 4.2], [1.0, 4.4, 0.5], 0x3a2a1a), pb([1.4, 0.18, 0.08], [1.5, 6.5, 0.5], 0xdcf4f0, mtl(0xdcf4f0, {...EM(gh, 0.8), r:[0,0,0.3]})), ...rg(5, i => pg([1.2], [0, 2.4 + i*0.5, -1.3], 'rgba(130,230,230,.8)', {an:{t:'rise', v:0.8, h:1.4, o:0.8}})), pg([5], [0, 3.2, 0], 'rgba(120,230,230,.25)')]; });
M3('lizard', 0.9, (g, e) => { const c = 0x4a7a5a; return [pb([1.6, 1.6, 2.6], [0, 1.8, -0.2], c, {fl:1}), pb([1.2, 1.3, 1.6], [0, 2.6, 1.3], c, {fl:1}), pb([0.9, 0.7, 1.0], [0, 2.3, 2.2], c, {fl:1}), ...rg(5, i => pn([0.07, 0.25, 4], [-0.35 + i*0.18, 2.0, 2.7], 0xf4ecd0, {r:[PI,0,0]})), ...[-1,1].map(sx => ps([0.16, 6, 5], [sx*0.4, 3.0, 1.9], 0xffd040, EM(0xffd040, 2))), ...[[-0.5,0.7],[0.5,0.7],[-0.5,-0.9],[0.5,-0.9]].map(([x,z]) => pb([0.45, 1.2, 0.5], [x, 0.6, z], c, {fl:1})), ...rg(4, i => pb([0.8 - i*0.15, 0.8 - i*0.15, 1.2], [0, 1.6 - i*0.1, -1.8 - i*1.0], c, {fl:1})), ...rg(5, i => pn([0.25, 0.7, 4], [0, 3.0 - i*0.12, 0.8 - i*0.7], 0x20b0e0, {...EM(0x20b0e0, 0.9), r:[-0.2,0,0]}))]; });
M3('angler', 0.9, (g, e) => { const c = 0x2a6a8a; return [ps([1.5, 12, 8], [0, 2.4, 0], c, {s:[1,0.95,1.2]}), pb([1.6, 0.4, 1.4], [0, 1.7, 1.2], 0x0e2a3e), ...rg(6, i => pn([0.09, 0.45, 4], [-0.7 + i*0.28, 1.95, 1.8], 0xf4f0d8, {r:[PI,0,0]})), ...[-1,1].map(sx => ps([0.2, 8, 6], [sx*0.6, 3.0, 1.2], 0xf8e070, EM(0xf8e070, 2))), M7tube([[0, 3.4, 0.4], [0, 4.6, 1.0], [0, 4.8, 2.0]], 0.07, 0x0e2a3e), ps([0.3, 10, 8], [0, 4.8, 2.0], 0xfff0a0, EM(0xfff0a0, 3)), pg([3], [0, 4.8, 2.0], 'rgba(255,240,140,.8)', {an:{t:'pulse', a:0.3, v:4}}), pn([0.8, 1.4, 4], [0, 2.4, -1.8], c, {r:[PI/2,0,0], s:[1,1,0.3]})]; });
M3('dragonling', 0.9, (g, e) => { const c = 0xd83a30; return [M7tube([[0, 0.8, -1.8], [0.6, 1.2, -0.6], [-0.4, 2.2, 0.4], [0, 3.2, 0.8]], 0.55, c), ...rg(4, i => ps([0.6 - i*0.05, 8, 6], [[0,0.6,-0.9,0.1][i]*0 + [0.0,0.6,-0.4,0.0][i], [0.8,1.2,2.2,3.2][i], [-1.8,-0.6,0.4,0.8][i]], c)), pb([0.8, 0.7, 1.0], [0, 3.3, 1.5], c), ...[-1,1].map(sx => ps([0.12, 6, 5], [sx*0.3, 3.55, 1.7], 0xffe040, EM(0xffe040, 2.4))), ...[-1,1].map(sx => pn([0.1, 0.6, 4], [sx*0.3, 3.9, 0.8], 0xffe0a0, {r:[0,0,-sx*0.3]})), ...[-1,1].map(sx => pb([0.1, 1.8, 1.6], [sx*1.0, 2.5, -0.2], 0x8a1a1a, {ds:1, op:0.9, r:[0,sx*0.3,sx*0.7], an:{t:'wing', a:0.3, v:4}})), pg([2], [0, 3.3, 1.9], 'rgba(255,170,60,.7)', {an:{t:'pulse', a:0.3, v:6}})]; });

/* ===== Essay Quest v7 — final boss: Primal Arceus + Giratina (Origin Forme), with Dialga, Palkia and Giratina's shadow clones ===== */
const TYPECOL7 = [0xa8a878,0xf08030,0x6890f0,0xf8d030,0x78c850,0x98d8d8,0xc03028,0xa040a0,0xe0c068,0xa890f0,0xf85888,0xa8b820,0xb8a038,0x705898,0x7038f8,0x705848,0xb8b8d0,0xee99ac,0x7df9ff];
reg7('arceus', 0.72, (g, e) => { const w = 0xf6f3ea, gd = 0xe8c040, gr = 0xa8a898, G = mtl(gd, {mt:0.9, rg:0.22}), red = 0xff2a2a;
  const legs = []; for (const fx of [-1, 1]) for (const fz of [2.0, -2.0]) legs.push(pb([1.0, 2.6, 1.0], [fx*1.25, 1.3, fz], w, {rg:0.4}), pb([1.2, 0.45, 1.3], [fx*1.25, 0.22, fz + 0.1], gd, G), pb([1.15, 0.3, 1.15], [fx*1.25, 2.0, fz], gd, G));
  const wheel = []; for (let i = 0; i < 17; i++){ const a = i/17*PI*2; wheel.push(ps([0.3, 8, 6], [Math.cos(a)*4.6, Math.sin(a)*4.6, 0], TYPECOL7[i], {e:TYPECOL7[i], ei:2.2}), pb([0.22, 0.9, 0.22], [Math.cos(a)*4.6, Math.sin(a)*4.6, 0], gd, {...G, r:[0, 0, a]})); }
  return [
  pb([3.2, 2.3, 5.4], [0, 3.7, 0], w, {rg:0.4}), pb([2.8, 0.5, 4.8], [0, 2.6, 0], gr), pb([3.4, 1.7, 1.3], [0, 3.9, 2.5], gd, G), pb([3.0, 2.1, 1.5], [0, 3.8, -2.8], w), ...legs,
  pb([3.5, 0.4, 5.6], [0, 4.9, 0], gd, G), ...rg(5, i => pb([3.0 - i*0.1, 0.18, 0.5], [0, 5.15, -2.4 + i*1.2], gd, {...G, e:0xffd060, ei:0.5})),
  pb([1.4, 2.6, 1.4], [0, 5.5, 3.0], w, {r:[-0.35, 0, 0]}), pb([1.8, 1.5, 2.1], [0, 6.8, 3.8], w), pb([1.1, 0.85, 1.2], [0, 6.45, 5.0], w), pb([1.15, 0.2, 0.9], [0, 6.0, 4.9], gr),
  ...[-1, 1].flatMap(sx => [pb([0.34, 0.2, 0.1], [sx*0.55, 7.0, 4.82], red, EM(red, 3.0)), pn([0.28, 1.6, 5], [sx*0.55, 7.7, 3.0], gd, {...G, r:[-1.1, 0, 0]}), pn([0.2, 1.1, 5], [sx*0.95, 7.3, 3.2], gd, {...G, r:[-0.9, 0, sx*0.5]})]),
  M7tube([[0, 3.8, -3.4], [0, 3.2, -4.8], [0, 4.4, -6.2]], 0.35, w),
  // the Cross Wheel: seventeen plates, spinning behind the shoulders
  { k:'grp', p:[0, 4.2, 0.2], an:{t:'spin', ax:'z', v:0.35}, g:[pt([4.6, 0.3], [0, 0, 0], gd, {...G, e:0xffd060, ei:0.8}), pt([3.4, 0.14], [0, 0, 0], gd, G), pb([9.2, 0.2, 0.2], [0, 0, 0], gd, G), pb([0.2, 9.2, 0.2], [0, 0, 0], gd, G), ...wheel] },
  pg([13], [0, 4.2, 0], 'rgba(255,240,190,.4)', {an:{t:'pulse', a:0.1, v:1.4}}), pg([5], [0, 7.0, 3.8], 'rgba(255,255,255,.55)')]; });

const giraParts = (g, e, k) => { const dk = 0x25202f, rd = 0xc81c2c, gd = 0xe0a830, G = mtl(gd, {mt:0.9, rg:0.22}), body = [[0, 1.4, -5.2], [0, 2.2, -3.2], [0, 3.4, -1.2], [0, 4.6, 0.4], [0, 5.8, 1.2], [0, 6.8, 2.2]];
  return [
  M7tube(body, 1.05, dk), ...body.slice(0, 5).map(([x, y, z], i) => ps([1.15 - i*0.06, 10, 8], [x, y, z], i%2 ? dk : 0x302a3c, {rg:0.4})),
  ...body.slice(0, 5).map(([x, y, z], i) => pb([1.6, 0.35, 0.9], [x, y - 0.75, z + 0.35], rd, {e:rd, ei:0.5, r:[0.4, 0, 0]})), ...rg(8, i => pn([0.26, 1.0, 4], [0, 1.6 + i*0.62, -4.4 + i*0.62], rd, {e:rd, ei:0.7, r:[-0.9, 0, 0]})),
  // head: long crest, jaw, golden collar, red eyes
  pb([1.7, 1.5, 2.3], [0, 7.3, 3.0], dk), pb([1.2, 0.5, 1.5], [0, 6.7, 3.6], 0x201a28), ...[-1, 1].flatMap(sx => [pb([0.34, 0.2, 0.1], [sx*0.5, 7.5, 4.17], 0xff3030, EM(0xff3030, 3.2)), pn([0.3, 2.4, 5], [sx*0.7, 8.4, 2.2], gd, {...G, r:[-1.25, 0, sx*0.3]}), pn([0.22, 1.7, 5], [sx*1.0, 7.9, 2.1], rd, {e:rd, ei:0.8, r:[-1.1, 0, sx*0.7]})]),
  pb([1.4, 0.5, 1.4], [0, 6.3, 2.2], gd, G),
  // six spiked "wings": the legs of the Origin Forme, black blades tipped in red
  ...[[1.3, 4.3, -0.4, 5.0, -1.15], [1.2, 3.2, -1.8, 4.2, -1.0], [1.1, 4.9, 0.9, 3.6, -1.3]].map(([x, y, z, L, a], i) => ({...pn([0.62, L, 5], [x + Math.sin(-a)*L*0.45, y + Math.cos(a)*L*0.45, z], dk, {r:[0, 0, a], an:{t:'wing', a:0.05, v:0.8 + i*0.2}}), mir:true, g:[pn([0.28, L*0.4, 4], [0, L*0.55, 0], rd, {e:rd, ei:1.0})]})),
  pt([3.4, 0.26], [0, 4.6, -2.8], gd, {...G, e:0xffb030, ei:0.9, an:{t:'spin', ax:'z', v:0.25}}), pt([2.7, 0.1], [0, 4.6, -2.85], rd, {e:rd, ei:1.4}), pg([8], [0, 4.6, -2.8], 'rgba(255,60,60,.45)', {an:{t:'pulse', a:0.12, v:1.2}}),
  ...rg(10, i => pg([2.2], [Math.sin(i*1.9)*3.0, 1.0 + (i%4)*1.2, -2 + Math.cos(i*1.3)*3], 'rgba(120,40,200,.4)', {an:{t:'drift', a:0.5, v:0.6}}))]; };
reg7('giratina', 0.72, (g, e) => giraParts(g, e, 1));
reg7('giratinaclone', 0.36, (g, e) => giraParts(g, e, 0.5));

const quadDrag = (c1, c2, gem, o) => { const G = mtl(c2, {mt:0.9, rg:0.22}), legs = []; for (const fx of [-1, 1]) for (const fz of [1.8, -1.8]) legs.push(pb([1.1, 2.7, 1.1], [fx*1.3, 1.35, fz], c1, {rg:0.35}), pb([1.3, 0.4, 1.5], [fx*1.3, 0.2, fz + 0.15], c2, G));
  return [pb([3.2, 2.5, 4.8], [0, 3.8, 0], c1, {rg:0.35}), pb([3.0, 0.5, 4.4], [0, 2.7, 0], c2, G), pb([3.4, 1.9, 1.4], [0, 4.0, 2.3], c2, G), ...legs,
  pb([1.5, 2.8, 1.5], [0, 5.5, 2.9], c1, {r:[-0.4, 0, 0]}), pb([1.9, 1.6, 2.3], [0, 7.0, 3.7], c1), pb([1.2, 0.9, 1.4], [0, 6.6, 5.0], c1), pb([1.3, 0.25, 1.1], [0, 6.1, 4.9], c2, G),
  ...[-1, 1].flatMap(sx => [pb([0.34, 0.2, 0.1], [sx*0.6, 7.2, 4.88], 0xff3030, EM(0xff3030, 3)), pn([0.36, 2.2, 5], [sx*0.8, 8.0, 3.0], c2, {...G, r:[-1.0, 0, sx*0.3]}), ps([0.55, 8, 6], [sx*2.0, 4.6, 1.8], o.pearl, {...EM(o.pearl, 1.4)})]),
  po([0.65], [0, 4.2, 3.2], gem, {...EM(gem, 2.6), s:[1, 1.5, 0.6]}), pg([3.2], [0, 4.2, 3.4], css7(gem), {an:{t:'pulse', a:0.2, v:2}}),
  ...rg(7, i => pn([0.3, 1.0 + (i%2)*0.5, 4], [0, 5.4, -2.2 + i*0.75], c2, {...G, r:[0, 0, 0]})), M7tube([[0, 3.8, -2.6], [0, 3.4, -4.2], [0, 4.4, -5.6]], 0.5, c1), pn([0.6, 1.6, 5], [0, 4.6, -6.1], c2, {...G, r:[-1.2, 0, 0]}),
  ...(o.ring ? [pt([5.0, 0.2], [0, 4.6, 0], o.ring, {...EM(o.ring, 1.4), an:{t:'spin', ax:'z', v:0.3}}), pg([10], [0, 4.4, 0], css7(o.ring), {an:{t:'pulse', a:0.1, v:1}})] : [])]; };
const css7 = n => `rgba(${n>>16&255},${n>>8&255},${n&255},.5)`;
reg7('dialga', 0.66, () => quadDrag(0x3a66c0, 0xb8c4d8, 0x9fe8ff, {pearl:0x9fe8ff, ring:0x4a90ff}));
reg7('palkia', 0.66, () => quadDrag(0xc088d8, 0xf0e0f8, 0xff8ad8, {pearl:0xffb0f0, ring:0xff6ad0}));

/* ===== Essay Quest v7 — ★10 Outerversal horrors and their healers ===== */
// ================= THE GRIN BENEATH =================
reg7('batgrin', 0.7, (g, e) => { const s = 2.2, blk = 0x14101e, pur = 0x2a1c40, grn = 0x7dff3a; return [
  ...human({s, body:blk, limb:pur, skin:0x2a2236, armL:[0.2,0,0.4], armR:[0.2,0,-0.4]}), pb([2.2*s, 2.0*s, 0.2], [0, 3.0*s, 0.56*s], pur, mtl(pur)), ...rg(5, i => pb([0.14*s, 2.0*s, 0.06], [(-0.8+i*0.4)*s, 3.0*s, 0.68*s], grn, EM(grn, 1.6))), ...rg(3, i => pb([2.1*s, 0.1*s, 0.1], [0, (2.4 + i*0.55)*s, 0.66*s], 0x9a9aa8, mtl(0x9a9aa8, {r:[0,0,(i-1)*0.1]}))),
  ...[-1,1].flatMap(sx => [ps([0.85*s, 12, 8], [sx*1.6*s, 4.1*s, 0], blk, mtl(blk, {s:[1,0.7,1.1]})), ...rg(4, i => pn([0.18*s, 1.1*s, 5], [sx*(1.4 + i*0.32)*s, 4.8*s + (i%2)*0.2*s, -0.1*s], 0x9a9aa8, mtl(0x9a9aa8, {r:[0,0,-sx*(0.3 + i*0.22)]})))]),
  // cowl with the grin
  pb([1.6*s, 1.5*s, 1.5*s], [0, 4.7*s, 0], blk), ...[-1,1].map(sx => pn([0.3*s, 1.5*s, 4], [sx*0.55*s, 6.0*s, -0.1*s], blk, {r:[0,0,-sx*0.1]})), pb([1.5*s, 0.5*s, 0.1], [0, 5.0*s, 0.76*s], blk), ...[-1,1].map(sx => pb([0.6*s, 0.18*s, 0.06], [sx*0.38*s, 4.95*s, 0.8*s], grn, {...EM(grn, 3), r:[0,0,-sx*0.3]})), pg([4], [0, 4.95*s, 0.9*s], 'rgba(125,255,58,.6)'),
  pb([1.5*s, 0.55*s, 0.1], [0, 4.2*s, 0.76*s], 0x1a0a14), ...rg(13, i => pb([0.1*s, 0.28*s, 0.06], [(-0.65 + i*0.108)*s, 4.4*s - Math.abs(i-6)*0.012*s*6, 0.82*s], 0xf4f1e8, EM(0xbfffa0, 0.5))), ...rg(13, i => pb([0.1*s, 0.28*s, 0.06], [(-0.65 + i*0.108)*s, 4.04*s + Math.abs(i-6)*0.012*s*6, 0.82*s], 0xf4f1e8, EM(0xbfffa0, 0.5))), pb([1.7*s, 0.06*s, 0.06], [0, 4.22*s, 0.86*s], grn, EM(grn, 2.4)), pg([8], [0, 4.2*s, 0.9*s], 'rgba(125,255,58,.35)', {an:{t:'pulse', a:0.2, v:3}}),
  // six barbed chains and a cape of bats
  ...rg(6, i => { const a = -1.25 + i*0.5; return M7tube([[Math.sin(a)*0.6*s, 4.0*s, -0.8*s], [Math.sin(a)*2.2*s, 3.5*s, -2.0*s], [Math.sin(a)*3.6*s, 2.0*s, -2.4*s], [Math.sin(a)*4.4*s, 0.6*s, -1.6*s]], 0.07*s, 0x9a9aa8, {}); }), ...rg(6, i => { const a = -1.25 + i*0.5; return pn([0.4*s, 0.9*s, 4], [Math.sin(a)*4.4*s, 0.6*s, -1.6*s], grn, {...EM(grn, 1.4), r:[PI,0,0], an:{t:'bob', a:0.2, v:2, ph:i}}); }),
  pp([3.2*s, 4.6*s], [0, 2.6*s, -0.9*s], 0x2a1c40, {ds:1, an:{t:'sway', a:0.03, v:1.4}}), ...rg(7, i => pn([0.45*s, 0.9*s, 3], [(-1.35 + i*0.45)*s, 0.35*s, -0.92*s], 0x2a1c40, {r:[PI,0,0], s:[1,1,0.2]})),
  ...rg(10, i => pg([1.0], [0, 2.0, 0], 'rgba(125,255,58,.7)', {p:[(i%5 - 2)*1.1, 1.0, -2.0 + (i>4?1.6:0)], an:{t:'rise', v:0.5, h:5, o:0.7}})), pg([12], [0, 3.5*s, 0], 'rgba(125,255,58,.15)', {an:{t:'pulse', a:0.2, v:2}})]; });

// ================= PRIME SUN-TYRANT =================
reg7('suntyrant', 0.7, (g, e) => { const s = 2.3, blk = 0x1c1a20, gold = 0xe8b830, red = 0xc4161c; return [
  ...human({s, body:blk, limb:0x22242c, skin:0xc9b99a, armL:[0,0,0.12], armR:[0,0,-0.12], mat:mtl(blk,{mt:0.6})}), pb([2.1*s, 2.0*s, 0.2], [0, 3.1*s, 0.56*s], gold, mtl(gold, {e:0xffa010, ei:0.5})), pk('prism', [0.7*s, 0.7*s, 0.12, 4], [0, 3.2*s, 0.7*s], gold, mtl(gold, {r:[PI/2,0,PI/4], s:[1.1,1,1.3], ...EM(0xffa010, 1)})), pk('prism', [0.4*s, 0.4*s, 0.14, 4], [0, 3.2*s, 0.72*s], red, {r:[PI/2,0,PI/4], s:[1.1,1,1.3], ...EM(0xff1a10, 1.8)}),
  pb([2.3*s, 0.4*s, 1.15*s], [0, 2.0*s, 0], gold, mtl(gold)), ...[-1,1].flatMap(sx => [ps([0.9*s, 12, 8], [sx*1.6*s, 4.2*s, 0], blk, mtl(blk, {s:[1,0.7,1.1]})), ...rg(4, i => pn([0.17*s, 1.0*s, 5], [sx*(1.4 + i*0.3)*s, 4.8*s, -0.1*s + i*0.2*s], gold, mtl(gold, {r:[0,0,-sx*(0.3+i*0.2)]})))]),
  ...rg(9, i => pn([0.2*s, 1.3*s, 4], [(i-4)*0.18*s, 5.6*s, -0.1*s], 0x0c0c10, {r:[0.1,0,-(i-4)*0.3]})), pb([1.5*s, 0.5*s, 1.5*s], [0, 5.0*s, -0.04*s], 0x0c0c10), ...[-1,1].map(sx => pb([0.42*s, 0.12*s, 0.06], [sx*0.3*s, 4.6*s, 0.68*s], 0xff2a1a, EM(0xff1a10, 3.2))), ...[-1,1].map(sx => pg([0.8*s], [sx*0.3*s, 4.6*s, 0.78*s], 'rgba(255,40,30,.9)', {an:{t:'pulse', a:0.3, v:6}})),
  pp([3.0*s, 5.0*s], [0, 2.6*s, -0.8*s], red, {ds:1, an:{t:'sway', a:0.04, v:1.8}}),
  // the dead sun behind him
  ps([2.4*s, 18, 14], [0, 5.0*s, -2.2*s], 0x2a1608, {...EM(0xff6a10, 0.7), s:[1,1,0.2]}), pk('ring', [2.6*s, 3.6*s, 48], [0, 5.0*s, -2.1*s], 0xffa010, {ds:1, bs:1, add:1, an:{t:'spin', ax:'z', v:0.25}}), ...rg(16, i => pn([0.25*s, 1.3*s, 4], [Math.cos(i*0.3927)*3.5*s, 5.0*s + Math.sin(i*0.3927)*3.5*s, -2.2*s], 0xffa010, {...EM(0xff8a10, 1.6), r:[0,0,i*0.3927 - PI/2], an:{t:'pulse', a:0.2, v:3, ph:i}})), pg([22], [0, 5.0*s, -2.4*s], 'rgba(255,120,30,.3)', {an:{t:'pulse', a:0.12, v:2}}),
  ...rg(8, i => ps([0.3, 8, 6], [0, 3.0, 0], 0xff9a30, {...EM(0xff7a10, 2), an:{t:'orbit', R:4.8, Rz:2.8, y:1.4, v:0.5 + (i%3)*0.15, ph:i*0.785}, p:[0, 4.5, 0]}))]; });

// ================= KHONSHU'S HOLLOW AVATAR =================
reg7('moonavatar', 0.7, (g, e) => { const s = 2.2, wht = 0xe6eaf8, bone = 0xdfe4f2; return [
  ...human({s, body:0xcfd4e8, limb:wht, skin:wht, nohead:true, armL:[-0.4,0,0.3], armR:[-0.4,0,-0.3], mat:{rg:0.9}}), ...rg(9, i => pb([2.04*s, 0.14*s, 1.04*s], [0, (2.0 + i*0.22)*s, 0], i%2 ? wht : 0xc8cce0, {r:[0,0,(i%3-1)*0.05]})), pk('prism', [0.3*s, 0.3*s, 0.1, 4], [0, 3.0*s, 0.54*s], 0x9fb0ff, {...EM(0x9fb0ff, 1.6), r:[PI/2,0,PI/4]}), ...rg(6, i => pb([0.2*s, 1.8*s, 0.06], [(-1.0 + i*0.4)*s, 0.9*s, 0.6*s], wht, {r:[0,0,(i-2.5)*0.12]})),
  // the skull of a bird and a crescent crown
  ps([0.9*s, 14, 10], [0, 4.9*s, 0], bone, {s:[1,1.05,1.0], rg:0.5}), pn([0.55*s, 1.9*s, 4], [0, 4.6*s, 1.0*s], bone, {r:[PI/2 + 0.12,0,0], rg:0.5}), pn([0.5*s, 0.9*s, 4], [0, 4.25*s, 1.1*s], bone, {r:[PI/2 - 0.5,0,0], rg:0.5}), ...[-1,1].map(sx => ps([0.3*s, 10, 8], [sx*0.45*s, 5.0*s, 0.65*s], 0x0a0f20)), ...[-1,1].map(sx => ps([0.12*s, 8, 6], [sx*0.45*s, 5.0*s, 0.85*s], 0x80b0ff, EM(0x80b0ff, 3.2))), ...[-1,1].map(sx => pg([1.2*s], [sx*0.45*s, 5.0*s, 0.95*s], 'rgba(120,170,255,.9)')),
  pt([1.5*s, 0.14*s, PI*1.3, 6, 28], [0, 6.0*s, -0.2*s], 0xfaf6e0, {...EM(0xe0e8ff, 1.4), r:[0,0,PI*0.35], s:[1,1,0.5]}), pt([2.4*s, 0.04*s, PI*2, 4, 48], [0, 5.0*s, -1.0*s], 0xcfe0ff, {...EM(0xcfe0ff, 1.8), an:{t:'spin', ax:'z', v:0.3}}), pg([12], [0, 5.0*s, -1.2*s], 'rgba(170,200,255,.3)', {an:{t:'pulse', a:0.15, v:2}}),
  // wings of bandage and a crescent staff
  ...[-1,1].flatMap(sx => rg(5, i => pb([0.28*s, (3.4 - i*0.4)*s, 0.05], [sx*(1.6 + i*0.7)*s, (4.0 - i*0.1)*s, -0.8*s], wht, {r:[0,0,-sx*(0.4 + i*0.2)], ds:1, an:{t:'wing', a:0.1, v:1.5, ph:i*0.3}}))), ...rg(6, i => pb([0.35*s, 0.05, 2.2*s], [(-1.1 + i*0.44)*s, 0.05, 0.6*s], wht, {r:[0,i*0.4,0], an:{t:'sway', a:0.1, v:1.6}})),
  pc([0.07*s, 0.08*s, 5.8*s], [2.3*s, 3.0*s, 1.0*s], 0xc8cce0, mtl(0xc8cce0)), pt([0.75*s, 0.1*s, PI*1.4, 6, 24], [2.3*s, 6.2*s, 1.0*s], 0xfaf6e0, {...EM(0xe0e8ff, 1.6), r:[0,0,PI*0.15]}), pg([5], [2.3*s, 6.2*s, 1.0*s], 'rgba(180,210,255,.6)', {an:{t:'pulse', a:0.3, v:3}}),
  ...rg(4, i => ps([0.34, 12, 8], [0, 0, 0], i%2 ? 0xf4f6ff : 0x2a3050, {...EM(i%2 ? 0xcfe0ff : 0x203060, 0.8), p:[0, 7.0, 0], an:{t:'orbit', R:4.2, Rz:2.0, y:0.8, v:0.6, ph:i*1.57}}))]; });

// ================= THANATOS-PRIME, THE MAD TITAN =================
reg7('madtitan', 0.68, (g, e) => { const s = 2.5, pur = 0x5a2a8a, dk = 0x3a1a5a, gold = 0xe8b830; const gem = [0x2a8aff,0xff2a3a,0xb04aff,0xff9a1a,0x3adb5a,0xffe14a]; return [
  pb([1.1*s, 2.0*s, 1.1*s], [-0.62*s, 1.0*s, 0], dk), pb([1.1*s, 2.0*s, 1.1*s], [0.62*s, 1.0*s, 0], dk), ...[-1,1].map(sx => pb([1.2*s, 0.5*s, 1.5*s], [sx*0.62*s, 0.25*s, 0.2*s], gold, mtl(gold))), pb([2.8*s, 2.5*s, 1.5*s], [0, 3.2*s, 0], pur, {rg:0.5}), pb([2.4*s, 0.5*s, 0.2], [0, 2.4*s, 0.8*s], gold, mtl(gold)), pb([2.0*s, 1.4*s, 0.2], [0, 3.6*s, 0.8*s], gold, mtl(gold)), ...rg(6, i => po([0.13*s], [(-0.75 + i*0.3)*s, 3.4*s, 0.95*s], gem[i], EM(gem[i], 2))),
  ...[-1,1].flatMap(sx => [pb([1.2*s, 2.6*s, 1.2*s], [sx*2.0*s, 3.2*s, 0], dk, {r:[0,0,sx*0.12]}), ps([1.0*s, 12, 8], [sx*1.9*s, 4.5*s, 0], pur, mtl(pur, {s:[1,0.75,1.1]})), ...rg(4, i => pn([0.19*s, 1.1*s, 5], [sx*(1.6 + i*0.3)*s, 5.2*s, -0.1*s + i*0.2*s], gold, mtl(gold, {r:[0,0,-sx*(0.3+i*0.2)]})))]),
  // the Gauntlet of six stones
  pb([1.5*s, 1.3*s, 1.4*s], [2.5*s, 1.6*s, 0.6*s], gold, mtl(gold, {...EM(0xffa010, 0.5)})), ...rg(6, i => po([0.2*s], [(2.0 + (i%3)*0.5)*s, (1.9 + Math.floor(i/3)*0.7)*s, 1.4*s], gem[i], EM(gem[i], 2.6))), ...rg(6, i => pg([1.4*s], [(2.0 + (i%3)*0.5)*s, (1.9 + Math.floor(i/3)*0.7)*s, 1.5*s], ['rgba(60,140,255,.9)','rgba(255,50,60,.9)','rgba(176,74,255,.9)','rgba(255,154,26,.9)','rgba(58,219,90,.9)','rgba(255,225,74,.9)'][i], {an:{t:'pulse', a:0.3, v:4 + i}})),
  // the head: gold brow-plate, deep chin
  pb([1.9*s, 1.8*s, 1.7*s], [0, 5.3*s, 0.05*s], pur, {rg:0.5}), pb([1.5*s, 0.6*s, 1.1*s], [0, 4.5*s, 0.6*s], 0x6a3a98), pb([2.0*s, 0.5*s, 1.8*s], [0, 6.1*s, 0], gold, mtl(gold)), pb([0.4*s, 0.9*s, 0.2], [0, 5.9*s, 0.9*s], gold, mtl(gold)), ...rg(5, i => pb([0.07*s, 1.0*s, 0.06], [(-0.45 + i*0.22)*s, 4.8*s, 0.88*s], dk)), ...[-1,1].map(sx => pb([0.5*s, 0.14*s, 0.06], [sx*0.45*s, 5.3*s, 0.9*s], 0xffe28a, EM(0xff8a3a, 3))),
  pp([3.4*s, 5.0*s], [0, 2.8*s, -0.9*s], 0x2a1650, {ds:1, an:{t:'sway', a:0.03, v:1.4}}), ...rg(6, i => ps([0.38, 10, 8], [0, 8.0, 0], gem[i], {...EM(gem[i], 2), an:{t:'orbit', R:5.0, Rz:3.0, y:0.8, v:0.5, ph:i*1.047}})), pg([22], [0, 4.0*s, -1.2], 'rgba(176,74,255,.22)', {an:{t:'pulse', a:0.15, v:2}})]; });

// ================= DORMUUN, LORD OF THE DARK DIMENSION =================
reg7('darklord', 0.7, (g, e) => { const s = 2.3, ft = 0xe8601a, rob = 0x3a1a6a, gold = 0xe8b830; return [
  pb([2.4*s, 3.8*s, 1.5*s], [0, 1.9*s, 0], rob, {rg:0.7}), pp([3.4*s, 3.2*s], [0, 1.6*s, 0.8*s], rob, {ds:1, op:0.92, an:{t:'sway', a:0.04, v:1.5}}), pb([2.6*s, 2.0*s, 1.5*s], [0, 3.8*s, 0], 0x5a2a9a, {rg:0.6}), pb([2.4*s, 0.3*s, 1.55*s], [0, 3.0*s, 0], gold, mtl(gold)), ...rg(6, i => pb([0.06*s, 2.2*s, 0.06], [(-1.0 + i*0.4)*s, 3.8*s, 0.8*s], gold, mtl(gold, {...EM(0xffa010, 0.8)}))),
  ...[-1,1].flatMap(sx => [pb([1.0*s, 2.6*s, 1.0*s], [sx*2.2*s, 3.5*s, 0.5*s], 0x5a2a9a, {r:[-0.7,0,sx*0.9]}), ps([0.5*s, 10, 8], [sx*3.2*s, 4.4*s, 1.3*s], ft, EM(ft, 2.4)), pg([4*s], [sx*3.2*s, 4.4*s, 1.3*s], 'rgba(255,130,30,.8)', {an:{t:'pulse', a:0.3, v:5}}), ...rg(5, i => pg([1.2*s], [sx*3.2*s, 4.4*s, 1.3*s], 'rgba(255,140,40,.85)', {an:{t:'rise', v:0.8, h:2.5, o:0.8}}))]),
  // a head of living flame inside a hood
  pn([1.2*s, 2.8*s, 8], [0, 6.4*s, -0.1*s], rob, {r:[-0.1,0,0]}), ps([0.8*s, 12, 8], [0, 5.5*s, 0.2*s], 0x14081e), ...rg(9, i => pg([2.0*s], [(i-4)*0.15*s, 5.3*s + (i%3)*0.1*s, 0.5*s], 'rgba(255,120,30,.9)', {an:{t:'rise', v:0.9, h:2.0*s, o:0.9}})), ...[-1,1].map(sx => ps([0.18*s, 8, 6], [sx*0.3*s, 5.55*s, 0.75*s], 0xfff0a0, EM(0xffe080, 3.6))), ...[-1,1].map(sx => pg([1.1*s], [sx*0.3*s, 5.55*s, 0.9*s], 'rgba(255,230,120,.9)')),
  // dimensional rings behind him
  ...rg(3, i => pk('ring', [(3.2 + i*1.2)*s*0.8, (3.35 + i*1.2)*s*0.8, 48], [0, 4.6*s, -1.4*s - i*0.1], i%2 ? ft : 0xffd040, {ds:1, bs:1, add:1, an:{t:'spin', ax:'z', v:(i%2 ? -0.3 : 0.4)}})), ...rg(16, i => pn([0.22*s, 0.9*s, 4], [Math.cos(i*0.3927)*3.6*s, 4.6*s + Math.sin(i*0.3927)*3.6*s, -1.5*s], 0xffd040, {...EM(0xffa010, 1.8), r:[0,0,i*0.3927 - PI/2], an:{t:'pulse', a:0.2, v:2, ph:i}})), ps([2.6*s, 18, 12], [0, 4.6*s, -2.0*s], 0x1a0a30, {...EM(0x6a2ad8, 0.6), s:[1,1,0.1]}), pg([20], [0, 4.6*s, -2.2*s], 'rgba(160,80,255,.3)', {an:{t:'pulse', a:0.15, v:2}})]; });

// ================= THE SIN-ICON =================
reg7('sinicon', 0.62, (g, e) => { const st = 0x6a6a74, red = 0x8a1a1a, flesh = 0x7a4a3a, bone = 0xe8e0d0; return [
  pb([5.2, 4.2, 3.4], [0, 3.4, 0], flesh, {fl:1, rg:0.8}), pb([4.6, 3.4, 0.5], [0, 3.5, 1.7], st, mtl(st, {fl:1})), ...rg(5, i => pb([0.3, 3.0, 0.2], [-1.8 + i*0.9, 3.5, 2.0], red, {...EM(0xff2a10, 0.6)})), ...rg(8, i => ps([0.34, 8, 6], [-2.0 + (i%4)*1.3, 2.0 + Math.floor(i/4)*2.2, 2.1], bone, {rg:0.8})),
  ...[-1,1].flatMap(sx => [pb([2.0, 4.4, 2.0], [sx*3.8, 3.8, 0], flesh, {fl:1, r:[0,0,sx*0.3]}), ps([1.7, 12, 8], [sx*3.6, 6.4, 0], st, mtl(st, {s:[1,0.8,1]})), ...rg(5, i => pn([0.28, 1.4, 5], [sx*(3.0 + i*0.5), 7.6 + (i%2)*0.3, -0.3 + i*0.3], 0x2a2a30, mtl(0x2a2a30, {r:[0,0,-sx*(0.2+i*0.18)]})))]),
  // the great skull face
  pb([4.0, 3.4, 3.2], [0, 7.4, 0.2], st, mtl(st, {fl:1})), pb([3.4, 1.4, 0.4], [0, 7.5, 1.9], 0x14080a), ...[-1,1].map(sx => ps([0.5, 10, 8], [sx*1.0, 7.9, 2.0], 0xff2a10, EM(0xff2a10, 3.4))), ...[-1,1].map(sx => pg([3.2], [sx*1.0, 7.9, 2.2], 'rgba(255,50,20,.9)', {an:{t:'pulse', a:0.3, v:5}})), pb([2.8, 1.5, 2.6], [0, 5.9, 1.2], 0x4a4a54, mtl(0x4a4a54, {fl:1})), ...rg(10, i => pn([0.14, 0.7, 4], [-1.3 + i*0.29, 5.5, 2.4], bone, {r:[0,0,0]})), ...rg(10, i => pn([0.14, 0.7, 4], [-1.3 + i*0.29, 6.1, 2.4], bone, {r:[PI,0,0]})),
  ...rg(5, i => pn([0.4, 2.2, 5], [-2.0 + i*1.0, 9.6 + (i===2?0.6:0), 0], 0x2a2a30, mtl(0x2a2a30))), ...[-1,1].flatMap(sx => [ps([0.7, 10, 8], [sx*2.3, 8.7, 1.0], bone), ps([0.18, 6, 5], [sx*2.3, 8.7, 1.65], 0xff2a10, EM(0xff2a10, 2.4))]),
  // the rocket cannon arms
  ...[-1,1].flatMap(sx => [pc([0.7, 0.9, 3.4, 10], [sx*3.9, 4.4, 2.4], 0x3a3a44, mtl(0x3a3a44, {r:[PI/2, 0, 0]})), ...rg(4, i => pc([0.2, 0.2, 0.5, 8], [sx*(3.5 + (i%2)*0.8), 4.0 + Math.floor(i/2)*0.8, 4.2], 0x1a1a1a, {r:[PI/2,0,0]})), ...rg(2, i => pg([1.6], [sx*(3.5 + i*0.8), 4.4, 4.4], 'rgba(255,120,40,.8)', {an:{t:'pulse', a:0.4, v:7+i}}))]),
  pg([14], [0, 5, 1], 'rgba(255,40,20,.18)', {an:{t:'pulse', a:0.2, v:2}})]; });

// ================= THE HUNGERING FIREBIRD =================
reg7('firebird', 0.66, (g, e) => { const fl = [0xff3a00, 0xff5a10, 0xff8a10, 0xffa020, 0xffc83a, 0xffe28a]; return [
  ps([2.4, 16, 12], [0, 5.0, 0], 0x5a0a1a, {s:[1,1.25,1.3], ...EM(0xff3a00, 0.5)}), ps([1.2, 12, 10], [0, 7.7, 1.5], 0x7a1226, EM(0xff3a00, 0.5)), pn([0.6, 1.8, 6], [0, 7.5, 3.0], 0xffc83a, {...EM(0xffa020, 1.4), r:[PI/2 + 0.2, 0, 0]}), ...[-1,1].map(sx => ps([0.26, 8, 6], [sx*0.6, 8.0, 2.4], 0xfff0a0, EM(0xffe080, 3.6))), ...[-1,1].map(sx => pg([1.6], [sx*0.6, 8.0, 2.6], 'rgba(255,230,120,.9)')),
  ...rg(5, i => pn([0.22, 1.5 - Math.abs(i-2)*0.25, 4], [(i-2)*0.4, 9.0 + (i===2?0.4:0), 1.0], fl[i], {...EM(fl[i], 1.8), r:[-0.2,0,(i-2)*-0.28], an:{t:'sway', a:0.1, v:3, ph:i}})), pt([1.8, 0.06, PI*2, 4, 40], [0, 8.4, 0.2], 0xffe28a, {...EM(0xffd060, 2), an:{t:'spin', ax:'z', v:0.7}, r:[0.4,0,0]}),
  ...[-1,1].flatMap(sx => [...rg(8, i => pn([0.45 - i*0.025, 4.2 - i*0.25, 4], [sx*(2.0 + i*0.75), 6.4 - i*0.28 + (i%2)*0.2, -0.4 - i*0.15], fl[Math.min(5, Math.floor(i*0.75))], {...EM(fl[Math.min(5, Math.floor(i*0.75))], 1.6), s:[1,1,0.25], r:[0,0,-sx*(1.15 + i*0.1)], an:{t:'wing', a:0.18, v:2.2, ph:i*0.2}})), ...rg(5, i => ps([0.22, 8, 6], [sx*(3.0 + i*1.2), 6.0 - i*0.6, -0.5], 0xfff0a0, {...EM(0xffe080, 2.6), an:{t:'pulse', a:0.3, v:3, ph:i}})), ...rg(5, i => pg([1.6], [sx*(3.0 + i*1.2), 6.0 - i*0.6, -0.5], 'rgba(255,230,120,.8)'))]),
  ...rg(7, i => pn([0.32 - i*0.02, 5.0 - i*0.2, 4], [(i-3)*0.55, 2.8 - Math.abs(i-3)*0.1, -2.5 - i*0.0], fl[Math.floor(i*0.8)], {...EM(fl[Math.floor(i*0.8)], 1.7), s:[1,1,0.3], r:[-1.2 - Math.abs(i-3)*0.08, 0, (i-3)*0.18], an:{t:'sway', a:0.06, v:2, ph:i}})),
  ...rg(18, i => pg([1.6 + (i%3)*0.6], [(i%6 - 2.5)*1.0, 3.0 + (i%4)*0.6, (i%3 - 1)*1.2], 'rgba(255,100,20,.9)', {an:{t:'rise', v:0.5 + (i%3)*0.15, h:5, o:0.9}})), pg([20], [0, 5.5, -0.4], 'rgba(255,60,10,.28)', {an:{t:'pulse', a:0.2, v:2}}), ...[-1,1].map(sx => pb([0.5, 1.8, 0.5], [sx*0.8, 0.9, 0.2], 0xffa020, {...EM(0xff8a10, 1), r:[0.2,0,0]}))]; });

// ================= ULTHAR-RHEL, THE DREAMER =================
reg7('cthulhu', 0.6, (g, e) => { const gr = 0x1a5a50, dk = 0x0c2a28, lit = 0xb8ff6a; return [
  pb([5.6, 1.0, 5.0], [0, 0.5, 0], 0x2a3a38, {fl:1, rg:0.95}), pb([4.2, 0.8, 3.8], [0, 1.4, 0], 0x34484a, {fl:1, rg:0.95}), ...rg(4, i => pb([1.2, 2.4 + i*0.4, 1.2], [-3.2 + i*2.1, 1.2, -1.2], 0x24302e, {fl:1, r:[0.1*(i-1.5),0.3*i,0.1*(i%2?1:-1)]})),
  ps([2.4, 14, 10], [0, 4.4, 0.2], gr, {s:[1.25,1.35,1.0], rg:0.4}), ps([2.0, 14, 10], [0, 7.4, 0.9], gr, {s:[1.1,1.15,1.05], rg:0.4}), ...rg(14, i => ps([0.3, 8, 6], [(i%7 - 3)*0.55, 7.8 + Math.floor(i/7)*0.7, 2.0], 0x24807a, {rg:0.3, s:[1,0.6,1]})), ...rg(5, i => ps([0.18 + (i%2)*0.06, 8, 6], [(i-2)*0.55, 8.6 + (i%2)*0.4, 2.35], lit, {...EM(lit, 3), an:{t:'pulse', a:0.4, v:1.5 + i*0.4}})), ...[-1,1].map(sx => ps([0.34, 8, 6], [sx*0.95, 7.5, 2.55], 0xffe040, EM(0xffe040, 3.4))),
  ...rg(9, i => { const a = -1.2 + i*0.3; return M7tube([[Math.sin(a)*0.8, 6.6, 2.7], [Math.sin(a)*1.6, 5.0, 3.6], [Math.sin(a)*2.3 + Math.cos(i)*0.4, 3.4, 4.0], [Math.sin(a)*2.6 + Math.sin(i)*0.6, 2.0, 3.4]], 0.16 + (i%2)*0.06, i%2 ? gr : 0x24807a, {}); }),
  ...[-1,1].flatMap(sx => [pb([1.6, 1.6, 1.4], [sx*3.0, 4.2, 0.8], gr, {rg:0.4}), ...rg(3, i => pn([0.14, 0.9, 4], [sx*(3.5 + (i-1)*0.35), 3.2, 1.8], 0xe8e8e0, {r:[PI*0.8,0,0]})), pb([0.2, 4.4, 3.6], [sx*2.0, 7.6, -1.0], 0x0c2a28, {ds:1, op:0.92, r:[0,sx*0.4,sx*0.8], an:{t:'wing', a:0.12, v:1.6}}), ...rg(5, i => ps([0.18, 6, 5], [sx*(2.0 + i*0.5), 8.6 - i*0.4, -1.1], lit, {...EM(lit, 2.4), an:{t:'pulse', a:0.4, v:2, ph:i}}))]),
  pg([14], [0, 6.0, 1.2], 'rgba(120,255,170,.22)', {an:{t:'pulse', a:0.2, v:2}}), ...rg(10, i => pg([1.4], [(i%5 - 2)*1.8, 0.3, 2 + (i>4?1.5:0)], 'rgba(120,255,200,.5)', {an:{t:'rise', v:0.4, h:3.5, o:0.5}}))]; });

// ================= THE DEVOURER OF WORLDS =================
reg7('devourer', 0.55, (g, e) => { const s = 3.0, pur = 0x6a2fb0, dk = 0x3a1a6a, gold = 0xffd54a, cy = 0x7dd8ff; return [
  pb([1.2*s, 2.2*s, 1.2*s], [-0.7*s, 1.1*s, 0], dk, mtl(dk)), pb([1.2*s, 2.2*s, 1.2*s], [0.7*s, 1.1*s, 0], dk, mtl(dk)), ...[-1,1].map(sx => pb([1.3*s, 0.6*s, 1.7*s], [sx*0.7*s, 0.3*s, 0.2*s], gold, mtl(gold))), pb([3.0*s, 2.5*s, 1.6*s], [0, 3.5*s, 0], pur, mtl(pur, {mt:0.6})), pb([2.6*s, 0.5*s, 1.7*s], [0, 2.4*s, 0], gold, mtl(gold)), ...rg(5, i => pb([2.0*s, 0.07*s, 0.06], [0, (2.9 + i*0.35)*s, 0.82*s], dk)), pk('tor', [0.4*s, 0.09*s], [0, 3.7*s, 0.86*s], gold, mtl(gold)), ps([0.22*s, 10, 8], [0, 3.7*s, 0.95*s], cy, EM(cy, 3)),
  ...[-1,1].flatMap(sx => [pb([1.2*s, 2.6*s, 1.2*s], [sx*2.2*s, 3.4*s, 0], pur, mtl(pur, {r:[0,0,sx*0.1]})), ps([1.1*s, 12, 8], [sx*2.0*s, 4.8*s, 0], pur, mtl(pur, {s:[1,0.75,1.1]})), ...rg(4, i => pb([0.38*s, (1.7 + i*0.45)*s, 0.14*s], [sx*(2.0 + i*0.22)*s, (5.6 + i*0.3)*s, -0.1*s], gold, mtl(gold, {r:[0,0,-sx*(0.25+i*0.2)]}))), pb([1.2*s, 1.2*s, 1.3*s], [sx*2.5*s, 1.5*s, 0.3*s], dk, mtl(dk))]),
  // the helm: tall, with great swept antenna-vanes
  pb([1.7*s, 1.7*s, 1.6*s], [0, 5.6*s, 0], pur, mtl(pur)), pb([1.4*s, 0.6*s, 0.2], [0, 5.5*s, 0.82*s], 0x1a0a30, mtl(0x1a0a30, {rg:0.1})), ...[-1,1].map(sx => pb([0.4*s, 0.1*s, 0.06], [sx*0.38*s, 5.55*s, 0.95*s], cy, EM(cy, 3.4))), pb([1.8*s, 0.35*s, 1.8*s], [0, 6.5*s, 0], gold, mtl(gold)),
  ...[-1,1].flatMap(sx => [pb([0.5*s, 3.4*s, 0.4*s], [sx*1.35*s, 7.6*s, -0.1*s], pur, mtl(pur, {r:[0,0,-sx*0.38]})), pb([0.32*s, 2.8*s, 0.3*s], [sx*1.95*s, 8.0*s, -0.1*s], gold, mtl(gold, {r:[0,0,-sx*0.5]})), pn([0.28*s, 1.2*s, 4], [sx*2.7*s, 9.4*s, -0.1*s], gold, mtl(gold, {r:[0,0,-sx*0.55]}))]), pb([0.5*s, 1.8*s, 0.4*s], [0, 7.7*s, -0.2*s], pur, mtl(pur)), ps([0.28*s, 10, 8], [0, 8.8*s, -0.2*s], cy, EM(cy, 2.6)),
  pp([4.4*s, 5.6*s], [0, 3.2*s, -0.95*s], 0x2b9ad8, {ds:1, op:0.95, an:{t:'sway', a:0.03, v:1.4}}),
  // worlds orbit the Devourer
  pk('tor', [5.6*s, 0.08*s, PI*2, 4, 60], [0, 5.0*s, 0], cy, {...EM(cy, 1.6), r:[1.35,0.1,0.2], an:{t:'spin', ax:'z', v:0.2}}), ...rg(5, i => ps([(0.5 + i*0.08)*s, 14, 10], [0, 0, 0], [0xff9a3a,0x3a9aff,0x9aff5a,0xff5a9a,0xe8e8f0][i], {rg:0.5, p:[0, 5.5*s, 0], an:{t:'orbit', R:(4.8 + i*0.35)*s, Rz:(2.6 + i*0.3)*s, y:0.8*s, v:0.28 + i*0.05, ph:i*1.3}})), pg([30], [0, 4.5*s, -1.5*s], 'rgba(100,70,220,.25)', {an:{t:'pulse', a:0.12, v:2}})]; });

// ================= HE WHO WAITS BEHIND THE WALL =================
reg7('zalgo', 0.68, (g, e) => { const blk = 0x08080c, red = 0xff1a2a; return [
  ...[-1,1].map(sx => pb([0.5, 5.2, 0.5], [sx*0.7, 2.6, 0], blk, {rg:0.2, an:{t:'sway', a:0.02, v:1.2}})), pb([1.6, 4.6, 0.9], [0, 6.8, 0], blk, {rg:0.2}), pb([1.2, 1.6, 0.8], [0, 9.8, 0], blk), ...[-1,1].map(sx => pb([0.35, 7.0, 0.35], [sx*1.4, 7.0, 0.4], blk, {r:[-0.15,0,sx*0.18], an:{t:'sway', a:0.04, v:1.5}})), ...[-1,1].flatMap(sx => rg(5, i => pb([0.07, 1.9, 0.07], [sx*(1.9 + i*0.17), 3.2, 1.0 + i*0.08], blk, {r:[0.1,0,sx*(0.1 + i*0.08)]}))),
  // a face made of too many eyes
  ps([1.1, 12, 10], [0, 10.0, 0.2], 0x101018, {rg:0.1}), ...rg(9, i => ps([0.12 + (i%3)*0.05, 8, 6], [(i%3 - 1)*0.4, 10.4 - Math.floor(i/3)*0.4, 1.1], red, {...EM(red, 3.6), an:{t:'pulse', a:0.5, v:2 + i*0.3}})), ...rg(9, i => pg([0.9], [(i%3 - 1)*0.4, 10.4 - Math.floor(i/3)*0.4, 1.25], 'rgba(255,26,42,.85)', {an:{t:'pulse', a:0.4, v:3 + i*0.2}})), pb([0.9, 0.06, 0.1], [0, 9.55, 1.2], 0xf4f4f4), ...rg(7, i => pb([0.05, 0.22, 0.05], [-0.4 + i*0.13, 9.45, 1.2], 0xf4f4f4)),
  // static: tearing glitch cubes and reaching tendrils
  ...rg(14, i => pb([0.5 + (i%3)*0.35, 0.3 + (i%2)*0.5, 0.2], [Math.cos(i*0.9)*3.2, 4.0 + (i*0.55)%6, Math.sin(i*0.9)*1.6], i%3 ? 0x14141c : red, {...(i%3 ? {} : EM(red, 1.8)), an:{t:'glitch', a:1.2}})), ...rg(10, i => { const a = i*0.628; return M7tube([[Math.cos(a)*0.5, 6.0, Math.sin(a)*0.4], [Math.cos(a)*2.4, 7.0 + (i%3), Math.sin(a)*1.4], [Math.cos(a)*3.6, 5.0 + (i%4), Math.sin(a)*2.2 + 0.8]], 0.07, blk, {}); }),
  pk('plane', [14, 12], [0, 6, -3.0], 0x050508, {op:0.9, ds:1}), ...rg(8, i => pb([13, 0.06, 0.05], [0, 1.0 + i*1.5, -2.9], 0x7a0a14, {...EM(0xff1a2a, 1.4), an:{t:'glitch', a:0.8}})), pg([18], [0, 6, -1.0], 'rgba(255,20,40,.15)', {an:{t:'pulse', a:0.2, v:3}})]; });

// ================= HEALERS: four casts of the same small, kind, unsettling monster =================
function healerParts(key){ const V = {healVoid:{c:0xa98aff, e:0xe6d8ff, kind:'eye'}, healDeep:{c:0x3ab8a0, e:0xb8ff6a, kind:'priest'}, healEmber:{c:0xff8a3a, e:0xffe090, kind:'flame'}, healStar:{c:0xffe27a, e:0xffffff, kind:'seraph'}}[key] || {c:0xa98aff, e:0xffffff, kind:'eye'}; const c = V.c;
  const halo = pk('tor', [0.8, 0.06, PI*2, 4, 28], [0, 6.4, 0], 0xfff8d0, {...EM(0xfff0a0, 2.4), r:[PI/2,0,0], an:{t:'spin', ax:'z', v:1.2}}); const cross = [pb([0.12, 0.7, 0.12], [0, 4.6, 0.62], 0xffffff, EM(0xffffff, 2)), pb([0.7, 0.12, 0.12], [0, 4.6, 0.62], 0xffffff, EM(0xffffff, 2))];
  if (V.kind === 'eye') return [ps([1.3, 14, 10], [0, 3.4, 0], 0xf4f0ff, {rg:0.2, an:{t:'bob', a:0.3, v:2}}), ps([0.62, 12, 8], [0, 3.4, 1.0], c, {...EM(c, 1.4), an:{t:'bob', a:0.3, v:2}}), ps([0.28, 8, 6], [0, 3.4, 1.55], 0x0a0614, {an:{t:'bob', a:0.3, v:2}}), ...rg(6, i => pn([0.12, 1.8, 4], [Math.cos(i*1.05)*1.0, 2.4, Math.sin(i*1.05)*1.0], c, {r:[PI,0,0], op:0.9, an:{t:'sway', a:0.2, v:1.5, ph:i}})), halo, ...cross, pg([4.5], [0, 3.4, 0.4], 'rgba(200,170,255,.45)', {an:{t:'pulse', a:0.2, v:3}})];
  if (V.kind === 'priest') return [pn([1.5, 3.4, 8], [0, 1.9, 0], 0x14423e, {rg:0.6}), ps([0.7, 10, 8], [0, 4.2, 0], 0x14423e), ps([0.5, 8, 6], [0, 4.1, 0.35], 0x061a18), ...[-1,1].map(sx => ps([0.09, 6, 5], [sx*0.2, 4.15, 0.72], V.e, EM(V.e, 3))), ...rg(6, i => M7tube([[(i-2.5)*0.12, 3.9, 0.55], [(i-2.5)*0.2, 3.3, 0.75], [(i-2.5)*0.25, 2.7, 0.7]], 0.07, c, {})), pc([0.06, 0.06, 3.2], [1.1, 2.2, 0.5], 0x3a2a1a), ps([0.28, 10, 8], [1.1, 4.0, 0.5], V.e, EM(V.e, 2.4)), halo, pg([3.5], [1.1, 4.0, 0.5], 'rgba(160,255,150,.5)', {an:{t:'pulse', a:0.3, v:3}})];
  if (V.kind === 'flame') return [pb([1.5, 2.6, 1.1], [0, 1.6, 0], 0x6a2a14, {rg:0.8}), pn([0.9, 1.4, 8], [0, 3.6, 0], 0x6a2a14), ps([0.55, 10, 8], [0, 4.2, 0], 0x14080a), ...rg(9, i => pg([1.6], [(i-4)*0.12, 4.2, 0.3], 'rgba(255,130,40,.9)', {an:{t:'rise', v:0.9, h:1.6, o:0.9}})), ...[-1,1].map(sx => ps([0.1, 6, 5], [sx*0.2, 4.2, 0.5], V.e, EM(V.e, 3.4))), ...[-1,1].map(sx => ps([0.4, 10, 8], [sx*1.3, 2.4, 0.4], 0xff8a3a, {...EM(0xff6a10, 2), an:{t:'bob', a:0.2, v:2}})), halo, pg([3.2], [0, 2.8, 0.3], 'rgba(255,150,60,.4)', {an:{t:'pulse', a:0.2, v:4}})];
  return [ps([0.9, 12, 8], [0, 3.4, 0], 0xfff8e0, {rg:0.3, an:{t:'bob', a:0.3, v:2}}), pb([0.9, 1.7, 0.7], [0, 2.2, 0], 0xfff0c0, {an:{t:'bob', a:0.3, v:2}}), ...[-1,1].flatMap(sx => rg(4, i => pb([0.14, (2.2 - i*0.35), 0.05], [sx*(0.8 + i*0.4), 3.0 - i*0.12, -0.3], 0xffffff, {r:[0,0,-sx*(0.4 + i*0.25)], an:{t:'wing', a:0.18, v:3}}))), ...[-1,1].map(sx => ps([0.08, 6, 5], [sx*0.25, 3.5, 0.78], 0xffa020, EM(0xffa020, 3))), halo, pg([4.5], [0, 3.2, 0], 'rgba(255,240,180,.5)', {an:{t:'pulse', a:0.2, v:3}})]; }
reg7('healer', 0.95, (g, e) => healerParts(e.key));

// ================= registration into the enemy builder =================
const HOVER7 = {suntyrant:1.0, firebird:1.0, darklord:0.5, moonavatar:0.8, pcpsy:0.5, healer:0.7, zeusprime:0.5, sinicon:0.6, zalgo:0.0, arceus:0.0, giratina:0.0, dialga:0.0, palkia:0.0};
for (const k in A7) NEWART[k] = (g, e, m, dk) => { const an = []; ASM.build(A7[k](g, e), g, an); g.userData.anims = an; g.userData.is7 = true; g.userData.hover = HOVER7[k] || 0; };

/* ===== Essay Quest v7 — renderer extensions: post-processing, environment light, camera feel, effect state ===== */
const LIGHT7 = {zeusprime:0x9fd0ff, atlas:0x6ad8ff, trainer:0xff5a4a, mechashogun:0x40e0ff, vampire:0xff2040, horseman:0x80e8e0, kaiju:0x40d0ff, leviathan:0x60c0ff, pharaohprime:0xffc83a, dragonemp:0xff6a30,
  batgrin:0x7dff3a, suntyrant:0xff6a10, moonavatar:0x9fb8ff, madtitan:0xb04aff, darklord:0xff7a1a, sinicon:0xff2a10, firebird:0xff5a10, cthulhu:0x60ffb0, devourer:0x7a6aff, zalgo:0xff1a2a, healer:0xc0e0ff, arceus:0xffe9a0, giratina:0x9a40ff, dialga:0x4a90ff, palkia:0xff6ad0, giratinaclone:0x6a20c0};
const LIGHTCSS7 = {};
for (const k in LIGHT7){ const c = LIGHT7[k]; LIGHTCSS7[k] = `rgba(${c>>16&255},${c>>8&255},${c&255},.26)`; }

/* ---------- effect state: gameplay code pokes these, the loop decays them ---------- */
const FXS = {flash:0, flashCol:new THREE.Color(1,1,1), ca:0.0007, caBase:0.0007, glitch:0, vig:0.5, sat:1.1, tint:new THREE.Color(1,1,1), slow:1, slowUntil:0, fov:46, fovKick:0, camOff:new THREE.Vector3(), camVel:new THREE.Vector3(), warp:0};
function flashScreen(col, amt){ FXS.flashCol.set(col); FXS.flash = Math.max(FXS.flash, amt); }
function slowMo(scale, ms){ FXS.slow = scale; FXS.slowUntil = performance.now() + ms; }
function camKick(x, y, z){ FXS.camVel.x += x; FXS.camVel.y += y; FXS.camVel.z += z; }

/* ---------- post-processing: bloom, outlines, chromatic aberration, vignette, glitch, film grade ---------- */
let post = null, QUALITY = 'high';
const POST_VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
function postInit(){ post = null; if (QUALITY === 'low' || !R) return;
  try {
    const gl2 = R.capabilities.isWebGL2; const half = gl2 && (R.extensions.has('EXT_color_buffer_float') || R.extensions.has('EXT_color_buffer_half_float'));
    const mk = (w, h, depth) => { const t = new THREE.WebGLRenderTarget(w, h, {minFilter:THREE.LinearFilter, magFilter:THREE.LinearFilter, format:THREE.RGBAFormat, type: half ? THREE.HalfFloatType : THREE.UnsignedByteType, depthBuffer: !!depth, stencilBuffer:false}); if (depth){ t.depthTexture = new THREE.DepthTexture(w, h); t.depthTexture.type = THREE.UnsignedIntType; } return t; };
    post = {mk, on:true, half, quad:null, cam:new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), scene:new THREE.Scene(), w:0, h:0};
    const quadMat = (frag, uniforms) => new THREE.ShaderMaterial({vertexShader:POST_VS, fragmentShader:frag, uniforms, depthTest:false, depthWrite:false});
    post.mBright = quadMat('uniform sampler2D tColor; uniform float uThr; varying vec2 vUv; void main(){ vec3 c = texture2D(tColor, vUv).rgb; float l = max(c.r, max(c.g, c.b)); float k = smoothstep(uThr, uThr + 0.7, l); gl_FragColor = vec4(c*k, 1.0); }', {tColor:{value:null}, uThr:{value:post.half ? 1.0 : 0.9}});
    post.mBlur = quadMat('uniform sampler2D tColor; uniform vec2 uDir; varying vec2 vUv; void main(){ vec3 s = texture2D(tColor, vUv).rgb*0.227027; vec2 o1 = uDir*1.3846153846, o2 = uDir*3.2307692308; s += (texture2D(tColor, vUv + o1).rgb + texture2D(tColor, vUv - o1).rgb)*0.3162162162 + (texture2D(tColor, vUv + o2).rgb + texture2D(tColor, vUv - o2).rgb)*0.0702702703; gl_FragColor = vec4(s, 1.0); }', {tColor:{value:null}, uDir:{value:new THREE.Vector2()}});
    post.mFinal = new THREE.ShaderMaterial({vertexShader:POST_VS, depthTest:false, depthWrite:false, toneMapped:false, uniforms:{tColor:{value:null}, tBloom:{value:null}, tBloom2:{value:null}, tDepth:{value:null}, uRes:{value:new THREE.Vector2(1, 1)}, uNear:{value:0.1}, uFar:{value:200}, uBloom:{value:0.85}, uVig:{value:0.5}, uCA:{value:0.0007}, uFlash:{value:0}, uGlitch:{value:0}, uTime:{value:0}, uSat:{value:1.1}, uCon:{value:1.04}, uOutline:{value:1}, uGrain:{value:0.025}, uFlashCol:{value:new THREE.Color(1,1,1)}, uOutCol:{value:new THREE.Color(0x12082a)}, uTint:{value:new THREE.Color(1,1,1)}, uWarp:{value:0}},
      fragmentShader:`uniform sampler2D tColor, tBloom, tBloom2, tDepth; uniform vec2 uRes; uniform float uNear, uFar, uBloom, uVig, uCA, uFlash, uGlitch, uTime, uSat, uCon, uOutline, uGrain, uWarp; uniform vec3 uFlashCol, uOutCol, uTint; varying vec2 vUv;
        float lin(float d){ float z = d*2.0 - 1.0; return (2.0*uNear*uFar)/(uFar + uNear - z*(uFar - uNear)); }
        float rnd(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)))*43758.5453); }
        void main(){
          vec2 uv = vUv; vec2 px = 1.0/uRes;
          if (uWarp > 0.0){ vec2 q = uv - 0.5; float r = length(q); uv = 0.5 + q*(1.0 - uWarp*0.5*r*r*4.0); }
          if (uGlitch > 0.001){ float band = floor(uv.y*26.0 + floor(uTime*10.0)*3.0); float n = rnd(vec2(band, floor(uTime*10.0))); if (n > 1.0 - uGlitch*0.5) uv.x += (n - 0.5)*0.16*uGlitch; float b2 = floor(uv.y*90.0); if (rnd(vec2(b2, floor(uTime*20.0))) > 1.0 - uGlitch*0.12) uv.x += 0.02*uGlitch; }
          vec2 dir = uv - 0.5; float ca = uCA*(0.35 + dot(dir, dir)*3.0) + uGlitch*0.006;
          vec3 col = vec3(texture2D(tColor, uv + dir*ca).r, texture2D(tColor, uv).g, texture2D(tColor, uv - dir*ca).b);
          // soften jagged edges (a cheap luma-aware blur on contrasty pixels)
          vec3 n1 = texture2D(tColor, uv + vec2(px.x, 0.0)).rgb, n2 = texture2D(tColor, uv - vec2(px.x, 0.0)).rgb, n3 = texture2D(tColor, uv + vec2(0.0, px.y)).rgb, n4 = texture2D(tColor, uv - vec2(0.0, px.y)).rgb;
          float lc = dot(col, vec3(0.299, 0.587, 0.114)); float lmx = max(max(dot(n1, vec3(0.299,0.587,0.114)), dot(n2, vec3(0.299,0.587,0.114))), max(dot(n3, vec3(0.299,0.587,0.114)), dot(n4, vec3(0.299,0.587,0.114)))); float lmn = min(min(dot(n1, vec3(0.299,0.587,0.114)), dot(n2, vec3(0.299,0.587,0.114))), min(dot(n3, vec3(0.299,0.587,0.114)), dot(n4, vec3(0.299,0.587,0.114))));
          float ctr = max(lmx, lc) - min(lmn, lc); col = mix(col, (col*2.0 + n1 + n2 + n3 + n4)/6.0, smoothstep(0.08, 0.35, ctr)*0.65);
          // ink outlines from the depth buffer
          float d0 = lin(texture2D(tDepth, uv).r); float dl = lin(texture2D(tDepth, uv - vec2(px.x, 0.0)).r), dr = lin(texture2D(tDepth, uv + vec2(px.x, 0.0)).r), du = lin(texture2D(tDepth, uv + vec2(0.0, px.y)).r), dd = lin(texture2D(tDepth, uv - vec2(0.0, px.y)).r);
          float e = abs(d0 - dl) + abs(d0 - dr) + abs(d0 - du) + abs(d0 - dd); float th = d0*0.022 + 0.015; float edge = smoothstep(th, th*2.6, e) * (1.0 - smoothstep(60.0, 110.0, d0));
          col = mix(col, uOutCol, clamp(edge*0.78*uOutline, 0.0, 0.85));
          col += (texture2D(tBloom, uv).rgb*0.75 + texture2D(tBloom2, uv).rgb*0.95)*uBloom;
          col *= uTint;
          gl_FragColor = vec4(col, 1.0);
          #if defined( TONE_MAPPING )
            gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
          #endif
          float l = dot(gl_FragColor.rgb, vec3(0.2126, 0.7152, 0.0722)); gl_FragColor.rgb = mix(vec3(l), gl_FragColor.rgb, uSat); gl_FragColor.rgb = (gl_FragColor.rgb - 0.5)*uCon + 0.5;
          float v = smoothstep(0.95, 0.25, length((vUv - 0.5)*vec2(1.0, 0.82))); gl_FragColor.rgb *= mix(1.0 - uVig, 1.0, v);
          gl_FragColor.rgb += (rnd(vUv*uRes + uTime) - 0.5)*uGrain;
          gl_FragColor.rgb = mix(gl_FragColor.rgb, uFlashCol, uFlash);
        }`});
    post.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post.mBright); post.scene.add(post.quad); post.quad.frustumCulled = false; postResize();
  } catch (err){ console.warn('post-processing unavailable:', err); post = null; } }
function postResize(){ if (!post || !R) return; const s = new THREE.Vector2(); R.getDrawingBufferSize(s); const w = Math.max(2, s.x|0), h = Math.max(2, s.y|0); if (post.w === w && post.h === h) return; post.w = w; post.h = h;
  for (const k of ['rt','b1','b2','b3','b4']) if (post[k]) post[k].dispose();
  post.rt = post.mk(w, h, true); const hw = Math.max(2, w >> 1), hh = Math.max(2, h >> 1), qw = Math.max(2, w >> 2), qh = Math.max(2, h >> 2); post.b1 = post.mk(hw, hh); post.b2 = post.mk(hw, hh); post.b3 = post.mk(qw, qh); post.b4 = post.mk(qw, qh); post.mFinal.uniforms.uRes.value.set(w, h); }
function postRun(mat, src, dst, setup){ mat.uniforms.tColor.value = src.texture; if (setup) setup(mat.uniforms); post.quad.material = mat; R.setRenderTarget(dst); R.render(post.scene, post.cam); }
function renderFrame(){ if (!post || !post.on || mode === 'gallery'){ R.render(scene, cam); return; }
  postResize(); R.setRenderTarget(post.rt); R.render(scene, cam);
  postRun(post.mBright, post.rt, post.b1); postRun(post.mBlur, post.b1, post.b2, u => u.uDir.value.set(1/post.b1.width, 0)); postRun(post.mBlur, post.b2, post.b1, u => u.uDir.value.set(0, 1/post.b1.height));
  postRun(post.mBlur, post.b1, post.b3, u => u.uDir.value.set(1/post.b1.width*2, 0)); postRun(post.mBlur, post.b3, post.b4, u => u.uDir.value.set(1/post.b3.width, 0)); postRun(post.mBlur, post.b4, post.b3, u => u.uDir.value.set(0, 1/post.b3.height));
  const F = post.mFinal.uniforms; F.tBloom.value = post.b1.texture; F.tBloom2.value = post.b3.texture; F.tDepth.value = post.rt.depthTexture; F.uNear.value = cam.near; F.uFar.value = cam.far; F.uTime.value = t; F.uCA.value = FXS.ca; F.uFlash.value = FXS.flash; F.uFlashCol.value.copy(FXS.flashCol); F.uGlitch.value = FXS.glitch; F.uVig.value = FXS.vig; F.uSat.value = FXS.sat; F.uTint.value.copy(FXS.tint); F.uWarp.value = FXS.warp;
  postRun(post.mFinal, post.rt, null); }
function setQuality(q){ if (q === QUALITY) return; QUALITY = q; if (q === 'low'){ if (post){ for (const k of ['rt','b1','b2','b3','b4']) if (post[k]) post[k].dispose(); } post = null; R.setRenderTarget(null); } else postInit(); }

/* ---------- a procedural environment so metal and gloss catch light (painted on a canvas, no image files) ---------- */
let ENV = null;
function makeEnv(){ if (ENV || !R) return ENV; try { const pm = new THREE.PMREMGenerator(R); const sc = new THREE.Scene();
    const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, 'rgb(86,112,160)'); gr.addColorStop(0.46, 'rgb(190,182,166)'); gr.addColorStop(0.52, 'rgb(120,116,104)'); gr.addColorStop(1, 'rgb(44,48,38)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 128); g.fillStyle = 'rgba(0,0,0,0.42)'; g.fillRect(0, 0, 256, 128);
    const spot = (x, y, r, col) => { const rr = g.createRadialGradient(x, y, 0, x, y, r); rr.addColorStop(0, col); rr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rr; g.fillRect(0, 0, 256, 128); };
    spot(60, 34, 28, 'rgba(255,244,220,1)'); spot(190, 60, 34, 'rgba(120,150,255,.8)'); spot(128, 20, 40, 'rgba(160,190,255,.55)');
    const tx = new THREE.CanvasTexture(c); const sky = new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), new THREE.MeshBasicMaterial({map:tx, side:THREE.BackSide})); sc.add(sky);
    ENV = pm.fromScene(sc, 0.02).texture; sky.geometry.dispose(); sky.material.dispose(); } catch (err){ console.warn('env map failed', err); ENV = null; } return ENV; }

/* ---------- per-frame upkeep for the effect state (camera springs, flashes, glitch decay) ---------- */
let envFx = null;   // ambient particle systems of the current scene
const W7 = [];
function resetEnvFx(){ W7.length = 0; LPOOL = []; lpi = 0; for (let i=0;i<5;i++){ const l = new THREE.PointLight(0xffffff, 0, 14); l.userData.pool = 1; scene.add(l); LPOOL.push(l); } envFx = null; FXS.glitch = 0; FXS.flash = 0; FXS.fovKick = 0; FXS.warp = 0; FXS.tint.set(0xffffff); FXS.sat = 1.12; FXS.vig = 0.5; FXS.ca = FXS.caBase; FXS.camOff.set(0,0,0); FXS.camVel.set(0,0,0); }
function stepFx(dt0, dt){ const k = Math.pow(0.001, dt0); for (const f of W7) f(t, dt0);   // 0.001^dt: fast exponential decay
  FXS.flash *= Math.pow(0.0005, dt0); if (FXS.flash < 0.004) FXS.flash = 0; FXS.glitch *= Math.pow(0.06, dt0); if (FXS.glitch < 0.004) FXS.glitch = 0; FXS.ca += (FXS.caBase - FXS.ca)*Math.min(1, dt0*6);
  const a = FXS.camVel, o = FXS.camOff; o.addScaledVector(a, dt0); a.addScaledVector(o, -60*dt0).multiplyScalar(Math.pow(0.02, dt0)); if (!MOTION){ o.set(0,0,0); a.set(0,0,0); }
  FXS.fovKick *= Math.pow(0.004, dt0); const f = FXS.fov + FXS.fovKick; if (Math.abs(cam.fov - f) > 0.02 && mode !== 'gallery'){ cam.fov = f; cam.updateProjectionMatrix(); } }

/* ---------- hero fall / phoenix rebirth ---------- */
function downHero(hid){ const h = hpos(hid); if (!h || h.userData.down) return; const u = h.userData; u.down = true; u.busy = true;
  const y0 = h.position.y; burst(h, 0x8a8a9a, 14); shake = Math.max(shake, 0.3);
  tween(0.6, k => { const a = Math.min(1, k/0.7); h.rotation.z = a*1.45 - Math.sin(Math.min(1, k)*Math.PI)*0.08; h.position.y = y0 - a*0.3 + (k < 0.3 ? Math.sin(k/0.3*Math.PI)*0.6 : 0); }, () => { u.busy = false; }); }
function phoenixFx(hid){ const h = hpos(hid); if (!h) return; const u = h.userData; const gp = V3(h.position.x, 0, h.position.z), c = wpos(h, 1.2);
  flashScreen(0xffa040, 0.35); slowMo(0.45, 700); camKick(0, 0.2, -0.6);
  // rising firebird: two additive wings fanning out over a fire column
  const col = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 2.0, 1, 14, 1, true), new THREE.MeshBasicMaterial({color:0xff8a20, transparent:true, opacity:0.0, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide}));
  col.position.copy(gp); fxGroup.add(col);
  const wing = (sx) => { const g = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.4), new THREE.MeshBasicMaterial({color:0xffc040, transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide})); g.position.set(c.x, c.y, c.z); g.userData.sx = sx; fxGroup.add(g); return g; };
  const wl = wing(-1), wr = wing(1);
  ring(gp, 0xffb040, 0.5, 8, 0.8, 0.08, 0.6); setTimeout(() => ring(gp, 0xff6a20, 0.4, 5, 0.7, 0.1, 0.5), 150);
  flashLight(c, 0xff9a30, 12);
  tween(1.5, k => { const up = Math.min(1, k/0.6); col.scale.set(1 + k*0.4, 14*up, 1 + k*0.4); col.position.y = 7*up; col.material.opacity = 0.55*Math.sin(Math.min(1, k)*Math.PI);
      for (const w of [wl, wr]){ const fl = Math.sin(k*20)*0.35; w.position.set(c.x + w.userData.sx*(1.6 + k*1.2), c.y + k*2.5, c.z); w.rotation.set(0, Math.PI/2*0 , w.userData.sx*(0.6 + fl)); w.rotation.y = 0; w.scale.set(1 + k, 1 + k*0.6, 1); w.material.opacity = 0.35*Math.sin(Math.min(1, k)*Math.PI); }
      if (Math.random() < 0.7){ const s = sprite('rgba(255,170,50,1)', 0.6, V3(gp.x + (Math.random()-.5)*1.8, 0.3, gp.z + (Math.random()-.5)*1.2)); const v = 0.05 + Math.random()*0.08; tween(0.8, kk => { s.position.y += v; s.material.opacity = 1 - kk; }, () => fxGroup.remove(s)); } },
    () => { fxGroup.remove(col); fxGroup.remove(wl); fxGroup.remove(wr); }); }
function reviveHero(hid){ const h = hpos(hid); if (!h) return; const u = h.userData; const was = u.down; u.down = false; u.busy = true; phoenixFx(hid);
  const y0 = 0; h.rotation.z = was ? h.rotation.z : 0;
  tween(0.9, k => { h.rotation.z *= (1 - Math.min(1, k*2)); h.position.y = y0 + Math.sin(Math.min(1, k)*Math.PI)*1.2; }, () => { h.rotation.z = 0; h.position.y = 0; u.busy = false; }); }

/* ---------- generic boss attack effects, driven by D.ANIMS[name] = {fx, c, c2, n, ...} ---------- */
const hexcss = (c, a=1) => `rgba(${c>>16&255},${c>>8&255},${c&255},${a})`;
function attack7(id, hid, opts){ const A7d = DATA.ANIMS && DATA.ANIMS[opts.anim]; const f = foes[id]; if (!A7d || !f) return null;
  const h = hpos(hid), hp = h ? wpos(h) : V3(-4, 2, 1), gp = V3(hp.x, 0, hp.z), big = !!opts.charged, S = big ? 1.35 : 1;
  const c = A7d.c || 0xffffff, c2 = A7d.c2 || 0xffffff, n = A7d.n || 3; const sx = f.userData.tx !== undefined ? f.userData.tx : f.position.x, hx = h ? h.position.x : -4;
  const ht = f.userData.ht || 6; const from = wpos(f, Math.min(ht*0.55, 6)/Math.max(0.5, f.scale.y) * 0.9); const fp = V3(f.position.x, 0, f.position.z);
  const near = Math.max(2, sx - hx - 3); const lunge = (dur, dist, lift, after) => { let did = false; tween(dur, k => { const a = Math.sin(k*Math.PI); f.position.x = sx - a*dist; f.position.y = a*lift; if (!did && k > 0.5){ did = true; if (after) after(); } }, () => { f.position.x = sx; f.position.y = 0; }); };
  const hit = (t, k) => setTimeout(k, t); const sky = V3(hp.x + 1, 22, hp.z - 1);
  flashLight(from, c, 4*S); if (big) flashScreen(c, 0.12);
  switch (A7d.fx){
    case 'bolts': { for (let i=0;i<n;i++) hit(i*(A7d.chain ? 120 : 80), () => { const tg = A7d.chain && i ? V3(hp.x + (Math.random()-.5)*3, hp.y + Math.random()*2, hp.z + (Math.random()-.5)*2) : hp; lightning(A7d.chain && i ? hp : V3(from.x, from.y + (Math.random()-.5)*2, from.z), tg, c); if (i === n-1){ burstAt(hp, c, 14); camKick(0, 0, -0.3); } }); return 300 + n*90; }
    case 'beam': { const src = A7d.from === 'sky' ? V3(hp.x + 0.5, 24, hp.z) : from; const sp = sprite(hexcss(c), 0.4, src); tween(0.35, k => { sp.scale.setScalar(0.4 + k*5*S); sp.material.opacity = 1 - k*0.5; }, () => fxGroup.remove(sp));
      hit(300, () => { beam(src, hp, c, 0.55, (A7d.w || 0.5)*S); beam(src, hp, c2, 0.5, (A7d.w || 0.5)*0.4*S); ring(gp, c, 0.3, 4*S, 0.5, 0.08, 0.4); burstAt(hp, c2, 18); flashLight(hp, c, 10); shake = Math.max(shake, 0.7); camKick(0.1, 0.1, -0.5); slowMo(0.5, 220); }); return 900; }
    case 'volley': case 'meteors': { const m = A7d.fx === 'meteors'; for (let i=0;i<n;i++) hit(i*(m ? 140 : 90), () => { const tgt = V3(hp.x + (Math.random()-.5)*(n > 1 ? 3.2 : 0), m ? 0.6 : hp.y + (Math.random()-.5), hp.z + (Math.random()-.5)*(n > 1 ? 2.2 : 0)); const st = m ? V3(tgt.x + 5 + Math.random()*3, 18, tgt.z - 2) : V3(from.x, from.y + (Math.random()-.5)*2, from.z);
        projectile(st, tgt, orbMesh(hexcss(c), (A7d.big ? 2.2 : 0.9)*S), m ? 0.5 : 0.4, m ? 0 : 1.2, () => { burstAt(tgt, c, 10); shock(V3(tgt.x, 0, tgt.z), c, (A7d.big ? 1.8 : 0.8)*S); flashLight(tgt, c, 6); shake = Math.max(shake, 0.4); }, hexcss(c, .7)); }); return 500 + n*130; }
    case 'slam': { const lift = A7d.lift || 1.5; lunge(0.8, near, lift*1.4, () => { shock(gp, c, 1.6*S); ring(gp, 0xffffff, 0.2, 4*S, 0.35, 0.1, 0.2); for (let i=0;i<8;i++){ const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.25), M(c, {emissive:c, emissiveIntensity:0.4})); r.position.set(gp.x, 0.3, gp.z); fxGroup.add(r); const v = V3((Math.random()-.5)*6, 4+Math.random()*4, (Math.random()-.5)*4); tween(0.8, kk => { r.position.addScaledVector(v, 0.016); v.y -= 0.25; }, () => fxGroup.remove(r)); }
        if (A7d.quake) for (let i=0;i<4;i++) setTimeout(() => ring(fp.clone().lerp(gp, i/3), c, 0.3, 2.6 + i*0.5, 0.45, 0.08, 0.35), i*70); flashLight(hp, c, 9); shake = Math.max(shake, 0.9*S); camKick(0, -0.2, -0.6); slowMo(0.4, 200); }); return 800; }
    case 'slashes': { lunge(0.55, near*0.8, 0.4, () => { for (let i=0;i<n;i++) setTimeout(() => { arc(V3(hp.x + 0.5, hp.y + (Math.random()-.5)*(A7d.wide ? 2.2 : 1), hp.z + (Math.random()-.5)*0.6), i%2 ? c2 : c, {rz:(Math.random()-.5)*5, spin:i%2 ? 10 : -10, dur:0.2, r:A7d.wide ? 1.5 : 1.1}); burstAt(hp, c, 5); if (i === n-1) camKick(0.2, 0, -0.3); }, i*(n > 4 ? 55 : 90)); }); return 520 + n*60; }
    case 'wave': { for (let i=0;i<n;i++) hit(i*160, () => { const w = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.18, 6, 24, Math.PI), new THREE.MeshBasicMaterial({color:i%2 ? c2 : c, transparent:true, opacity:0.85, blending:THREE.AdditiveBlending, depthWrite:false})); const a = V3(from.x, 1.2, from.z); w.position.copy(a); w.rotation.set(0, -Math.PI/2, Math.PI/2); w.scale.setScalar(S); fxGroup.add(w); const b = V3(hp.x, 1.2, hp.z); tween(0.5, k => { w.position.copy(a.clone().lerp(b, k)); w.scale.set(S, S*(1 + k*0.8), S*(1 + k*0.5)); w.material.opacity = 0.85*(1 - k*0.4); }, () => { fxGroup.remove(w); if (i === n-1){ burstAt(hp, c, 14); shock(gp, c, 1.2); flashLight(hp, c, 6); shake = Math.max(shake, 0.5); } }); }); return 500 + n*160; }
    case 'tentacles': { const T = Math.max(4, n); for (let i=0;i<T;i++){ const a = i/T*Math.PI*2; const t = cyl(0.16, 0.4, 5, M(c, {emissive:c, emissiveIntensity:0.35}), 6); t.position.set(gp.x + Math.cos(a)*2.2, -2.5, gp.z + Math.sin(a)*1.6); fxGroup.add(t); const x0 = t.position.x, z0 = t.position.z; tween(1.0, k => { const u = Math.sin(Math.min(1, k*1.5)*Math.PI/2) * (k > 0.8 ? 1 - (k - 0.8)/0.2 : 1); t.position.y = -2.5 + u*4.4; t.position.x = x0 + (gp.x - x0)*0.6*k; t.position.z = z0 + (gp.z - z0)*0.6*k; t.rotation.z = Math.cos(a)*0.6*k; t.rotation.x = Math.sin(a)*0.6*k; }, () => fxGroup.remove(t)); }
      hit(520, () => { burstAt(hp, c, 14); shock(gp, c, 1.1); shake = Math.max(shake, 0.5); flashLight(hp, c, 6); }); return 900; }
    case 'swarm': { const N = Math.min(40, n); for (let i=0;i<N;i++){ const s = sprite(hexcss(i%3 ? c : c2, .95), 0.35 + Math.random()*0.25, from); const p0 = from.clone(), off = V3((Math.random()-.5)*5, Math.random()*4, (Math.random()-.5)*4), ph = Math.random()*6, dl = Math.random()*0.35;
        tween(0.35 + dl + 0.55, k => { const kk = Math.max(0, (k*(0.9 + dl) - dl)/0.9); const tt = Math.min(1, kk); const p = p0.clone().lerp(hp, tt); p.addScaledVector(off, Math.sin(tt*Math.PI)); p.y += Math.sin(ph + k*30)*0.25; s.position.copy(p); s.material.opacity = tt > 0.97 ? 0 : 0.95; }, () => fxGroup.remove(s)); }
      hit(650, () => { burstAt(hp, c, 14); flashLight(hp, c2, 5); shake = Math.max(shake, 0.4); }); return 1000; }
    case 'rift': { const r = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.08, 6, 28), new THREE.MeshBasicMaterial({color:c, transparent:true, opacity:0.9, blending:THREE.AdditiveBlending, depthWrite:false})); r.position.copy(hp); r.position.y += 0.3; r.rotation.y = Math.PI/2; fxGroup.add(r); const core = sprite(hexcss(0x000000, .9), 0.2, r.position);
      tween(0.9, k => { const g = Math.sin(Math.min(1, k*1.1)*Math.PI/2); r.scale.setScalar(g*(1.6 - Math.max(0, k - 0.7)*3.5)); r.rotation.x += 0.12; core.scale.setScalar(g*3.4); core.material.opacity = 0.9*(k < 0.7 ? 1 : 1 - (k - 0.7)/0.3); r.material.opacity = 0.9*(k < 0.7 ? 1 : 1 - (k - 0.7)/0.3); }, () => { fxGroup.remove(r); fxGroup.remove(core); });
      hit(600, () => { burstAt(hp, c, 18); shock(gp, c, 1.2); flashLight(hp, c, 8); shake = Math.max(shake, 0.55); FXS.ca = Math.max(FXS.ca, 0.006); }); return 950; }
    case 'nova': { const R0 = A7d.r || 7; const o = V3(fp.x, 1.5, fp.z); ring(V3(fp.x, 0, fp.z), c, 0.4, R0, 0.8, 0.1, 0.9); ring(V3(fp.x, 1.5, fp.z), c2, 0.4, R0*0.7, 0.6, 1.5, 0.5); const s = sprite(hexcss(c, .8), 1, o); tween(0.6, k => { s.scale.setScalar(2 + k*R0*2.2); s.material.opacity = 0.8*(1 - k); }, () => fxGroup.remove(s));
      flashScreen(c, 0.28); hit(450, () => { burstAt(hp, c, 14); flashLight(hp, c, 8); shake = Math.max(shake, 0.7); }); return 800; }
    case 'drain': { lunge(0.5, near*0.6, 0.4, () => { burstAt(hp, c, 10); for (let i=0;i<12;i++){ const s = sprite(hexcss(c), 0.5, hp); const p0 = hp.clone(), p1 = wpos(f); const off = V3(0, 1 + Math.random()*2, (Math.random()-.5)*2); tween(0.6 + i*0.04, kk => { const p = p0.clone().lerp(p1, kk); p.addScaledVector(off, Math.sin(kk*Math.PI)); s.position.copy(p); }, () => fxGroup.remove(s)); } }); return 760; }
    case 'chains': { const N = Math.max(3, n); for (let i=0;i<N;i++){ hit(i*60, () => { const dst = V3(hp.x + (Math.random()-.5)*2, hp.y + (Math.random()-.5)*2.2, hp.z + (Math.random()-.5)*1.4); const L = new THREE.Group(); const seg = 7; for (let j=0;j<seg;j++){ const l = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.05, 5, 8), new THREE.MeshBasicMaterial({color:j%2 ? c : c2})); l.rotation.y = j%2 ? 0 : Math.PI/2; L.add(l); } fxGroup.add(L); const a = V3(from.x, from.y, from.z + (Math.random()-.5)*2);
        tween(0.35, k => { for (let j=0;j<seg;j++) L.children[j].position.copy(a.clone().lerp(dst, Math.min(1, k)*(j/(seg-1)))); }, () => { burstAt(dst, c, 5); tween(0.35, kk => { L.children.forEach(l => { l.scale.setScalar(1 - kk); }); }, () => fxGroup.remove(L)); }); }); } hit(420, () => { flashLight(hp, c, 6); shake = Math.max(shake, 0.5); }); return 400 + N*70; }
    case 'glitch': { FXS.glitch = 1; flashScreen(c, 0.2); for (let i=0;i<8;i++) hit(i*60, () => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.4 + Math.random()*2, 0.1 + Math.random()*0.5, 0.1), new THREE.MeshBasicMaterial({color:i%2 ? c : 0xffffff, transparent:true, opacity:0.9})); b.position.set(hp.x + (Math.random()-.5)*4, hp.y + (Math.random()-.5)*3, hp.z + 0.5); fxGroup.add(b); tween(0.25, k => { b.material.opacity = 0.9*(1-k); }, () => fxGroup.remove(b)); }); hit(300, () => { burstAt(hp, c, 14); shake = Math.max(shake, 0.6); }); return 800; }
    case 'sun': { const s = sprite(hexcss(c, .95), 3, V3(hp.x - 1, 14, hp.z)); const p0 = s.position.clone(); const tg = V3(hp.x, 1, hp.z); flashScreen(c, 0.3);
      tween(0.9, k => { s.position.copy(p0.clone().lerp(tg, k*k)); s.scale.setScalar(3 + k*9); }, () => { fxGroup.remove(s); ring(gp, c, 0.4, 9, 0.8, 0.1, 0.8); burstAt(hp, c, 30); flashLight(hp, c, 14); flashScreen(0xffffff, 0.5); shake = Math.max(shake, 1.0); camKick(0, 0.2, -0.8); slowMo(0.35, 300); }); return 1100; }
    case 'snap': { flashScreen(c, 0.4); FXS.warp = 1; const sp = sprite(hexcss(c, .9), 8, wpos(h || f)); tween(0.7, k => { sp.scale.setScalar(8*(1 - k) + 0.2); sp.material.opacity = 0.9*(1 - k*0.3); }, () => fxGroup.remove(sp)); hit(450, () => { for (let i=0;i<24;i++){ const s = sprite(hexcss(c), 0.4, hp); const v = V3((Math.random()-.5)*3, Math.random()*2.5, (Math.random()-.5)*2); tween(1.1, kk => { s.position.addScaledVector(v, 0.02); s.material.opacity = 1 - kk; }, () => fxGroup.remove(s)); } shake = Math.max(shake, 0.8); }); return 900; }
    case 'roar': return foeMove(id, 'roar', opts.anim);
    case 'pulse': { for (let i=0;i<3;i++) hit(i*140, () => ring(V3(fp.x, 0, fp.z), c, 0.4, 6 + i*2, 0.6, 0.1, 0.4)); hit(300, () => { burstAt(hp, c, 12); flashLight(hp, c, 6); }); return 700; }
    case 'heal': case 'summon': return foeMove(id, A7d.fx, opts.anim);
  }
  return null; }

/* ---------- boss cutscenes: letterbox, title card, typed line, camera push-in; click to skip ---------- */
let cutTimer = null, cutEl = null;
function endCut(){ clearTimeout(cutTimer); cutTimer = null; if (cutEl){ const el = cutEl; cutEl = null; el.classList.add('out'); setTimeout(() => el.remove(), 500); } }
function cutscene(enemies, theme){ endCut(); const st = document.querySelector('.stage'); if (!st) return;
  const top = enemies.filter(e => (e.boss && !e.minion && !e.healer) || ((theme === 5 || theme === 6) && e.mini && !e.minion)); if (!top.length) return;
  const isFinal = top.some(e => e.key === 'primalArceus');
  const seq = top.slice(0, 2).map(e => { const kit = (DATA.BOSSKIT || {})[e.key]; const c = kit && kit.intro ? kit.intro : (DATA.CUTSCENES || {})[e.key]; return {e, title:c ? c[0] : String(e.name).toUpperCase(), line:c ? c[1] : '', tag:kit && kit.tag || ''}; });
  const badge = isFinal ? 'FINAL BOSS · 10★' : theme === 6 ? 'OUTERVERSAL · 10★' : theme === 5 ? 'PROMISED · 7★' : 'BOSS';
  const el = document.createElement('div'); el.id = 'cut'; el.className = 'cut t' + (theme === 6 ? '6' : theme === 5 ? '5' : '0'); el.innerHTML = '<i class="bar t"></i><i class="bar b"></i><div class="ct"><small></small><b></b><em></em><span>click to skip</span></div>'; st.appendChild(el); cutEl = el;
  const small = el.querySelector('small'), nm = el.querySelector('b'), ln = el.querySelector('em'); el.onclick = endCut;
  let i = 0; const show = () => { if (!cutEl) return; const s = seq[i]; small.textContent = badge + (s.tag ? ' · ' + s.tag.toUpperCase() : ''); nm.textContent = s.title; ln.textContent = ''; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
    if (theme === 6){ FXS.glitch = 1; FXS.ca = 0.006; flashScreen(0x601030, 0.25); } else if (theme === 5) flashScreen(0xffe27a, 0.2);
    if (i > 0 && s.e) { try { introFoe(s.e.id); } catch (_) {} }
    let k = 0; const txt = s.line; const typ = () => { if (!cutEl) return; k += 2; ln.textContent = txt.slice(0, k); if (k < txt.length) setTimeout(typ, 28); }; setTimeout(typ, 500);
    i++; cutTimer = setTimeout(() => { if (i < seq.length) show(); else endCut(); }, 1500 + Math.min(2200, txt.length*34)); };
  show(); }
function introFoe(id){ intro(id); }

/* ---------- themes 5 (Olympian coliseum, ★7) and 6 (the Void, ★10 and the final boss) ---------- */
const TH7 = {
  5:{p:{ground:0xb0a07c, ground2:0xcfc09a, hill:0x9a8a66, fog:0xe8b070}, sky:['#f0a050','#2f6ad0'], fog:0xe0a868, near:38, far:100, sun:0xffe0a0},
  6:{p:{ground:0x1a1226, ground2:0x2c1c40, hill:0x120a1e, fog:0x12061c}, sky:['#02000a','#34104a'], fog:0x12061c, near:20, far:60, sun:0xb078ff}};
function worldEx(theme){
  if (theme === 5){
    const mar = M(0xd8d0bc, {roughness:0.35, metalness:0.1}), gold = M(0xffd24a, {metalness:0.85, roughness:0.25, emissive:0x6a4a00, emissiveIntensity:0.3});
    for (let i=0;i<9;i++){ const a = -Math.PI*0.95 + i/8*Math.PI*0.9; const x = Math.cos(a + Math.PI/2)*20 - 2, z = -9 + Math.sin(a + Math.PI/2)*-7 - 6; const g = new THREE.Group();
      g.add(at(box(2.2, 0.5, 2.2, mar), 0, 0.25, 0)); const sh = cyl(0.8, 0.9, 9, mar, 12); sh.position.y = 5; g.add(sh); g.add(at(box(2.6, 0.5, 2.6, gold), 0, 9.7, 0)); g.add(at(box(3, 0.4, 3, mar), 0, 10.15, 0)); g.position.set(x, 0, z - 4); root.add(g); }
    root.add(at(box(40, 1, 3, mar), -2, 11, -16)); const arch = at(box(12, 4, 1.2, mar), -2, 13.5, -16); root.add(arch);
    const halo = new THREE.Mesh(new THREE.TorusGeometry(7, 0.22, 8, 64), new THREE.MeshBasicMaterial({color:0xffe27a})); halo.position.set(-2, 15, -22); root.add(halo); W7.push((t, dt) => { halo.rotation.z += dt*0.15; halo.rotation.y = Math.sin(t*0.4)*0.25; });
    for (let i=0;i<10;i++){ const c = glowSprite('rgba(255,236,200,.28)', 9 + (i%3)*3); c.position.set(-36 + i*8, 6 + (i%4)*4, -30 - (i%3)*8); c.scale.set(14 + (i%3)*5, 5, 1); fxGroup.add(c); const sp = 0.25 + (i%4)*0.1; W7.push((t, dt) => { c.position.x += dt*sp; if (c.position.x > 40) c.position.x = -40; }); }
    for (let i=0;i<34;i++){ const m = glowSprite('rgba(255,230,150,.85)', 0.28); m.position.set(-16 + Math.random()*32, Math.random()*9, -10 + Math.random()*10); fxGroup.add(m); const ph = Math.random()*6, sp = 0.3 + Math.random()*0.5; W7.push((t, dt) => { m.position.y += dt*sp; m.position.x += Math.sin(t + ph)*dt*0.4; if (m.position.y > 10) m.position.y = 0; }); }
    const beam = new THREE.Mesh(new THREE.PlaneGeometry(6, 24), new THREE.MeshBasicMaterial({color:0xfff0b0, transparent:true, opacity:0.1, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide})); beam.position.set(-6, 10, -8); beam.rotation.z = -0.35; root.add(beam); W7.push((t) => { beam.material.opacity = 0.08 + Math.sin(t*0.7)*0.03; });
  } else if (theme === 6){
    const geo = new THREE.BufferGeometry(); const N = 520, arr = new Float32Array(N*3); for (let i=0;i<N;i++){ const r = 40 + Math.random()*20, a = Math.random()*Math.PI*2, e = (Math.random()*0.9 - 0.1)*Math.PI/2; arr[i*3] = Math.cos(a)*Math.cos(e)*r; arr[i*3+1] = Math.sin(e)*r + 4; arr[i*3+2] = -Math.abs(Math.sin(a)*Math.cos(e)*r) - 8; }
    geo.setAttribute('position', new THREE.BufferAttribute(arr, 3)); const stars = new THREE.Points(geo, new THREE.PointsMaterial({color:0xcfd8ff, size:0.35, sizeAttenuation:true, fog:false})); root.add(stars);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(9, 48), new THREE.MeshBasicMaterial({color:0x000000, fog:false})); disc.position.set(-4, 17, -42); root.add(disc);
    const corona = new THREE.Mesh(new THREE.RingGeometry(9, 11.5, 64), new THREE.MeshBasicMaterial({color:0xb04aff, transparent:true, opacity:0.55, blending:THREE.AdditiveBlending, depthWrite:false, fog:false, side:THREE.DoubleSide})); corona.position.set(-4, 17, -42.1); root.add(corona);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(15, 0.15, 6, 80), new THREE.MeshBasicMaterial({color:0xff3a7a, transparent:true, opacity:0.6, fog:false})); ring2.position.set(-4, 17, -41); ring2.rotation.x = 1.2; root.add(ring2); W7.push((t, dt) => { corona.material.opacity = 0.45 + Math.sin(t*1.3)*0.15; ring2.rotation.z += dt*0.1; });
    const rock = M(0x2a1e3c, {flatShading:true, roughness:0.9, emissive:0x1a0a2a, emissiveIntensity:0.6});
    for (let i=0;i<16;i++){ const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8 + (i%5)*0.6, 0), rock); r.position.set(-26 + i*3.5, 3 + (i*37%11), -10 - (i%4)*5); r.castShadow = true; root.add(r); const ph = i*1.3; const y0 = r.position.y; W7.push((t, dt) => { r.position.y = y0 + Math.sin(t*0.5 + ph)*0.8; r.rotation.x += dt*0.1; r.rotation.y += dt*0.15; }); }
    for (let i=0;i<7;i++){ const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.7 + (i%2)*0.5), M(0xff2a6a, {emissive:0xff1a5a, emissiveIntensity:1.0})); c.position.set(-12 + i*4.2, 0.9, -5 - (i%3)*2.5); root.add(c); W7.push((t) => { c.rotation.y = t*0.6 + i; }); }
    for (let i=0;i<40;i++){ const m = glowSprite('rgba(180,100,255,.8)', 0.3); m.position.set(-16 + Math.random()*32, Math.random()*8, -8 + Math.random()*10); fxGroup.add(m); const ph = Math.random()*6, sp = 0.2 + Math.random()*0.4; W7.push((t, dt) => { m.position.y += dt*sp; m.position.x += Math.sin(t*0.7 + ph)*dt*0.3; if (m.position.y > 9) m.position.y = 0; }); }
    const pl = new THREE.PointLight(0xb04aff, 2.2, 36); pl.position.set(0, 7, -8); scene.add(pl); const pl2 = new THREE.PointLight(0xff2a6a, 1.4, 30); pl2.position.set(-9, 3, 3); scene.add(pl2); W7.push((t) => { pl.intensity = 2 + Math.sin(t*1.7)*0.5; pl2.intensity = 1.3 + Math.sin(t*2.3 + 1)*0.4; });
  } }

/* ---------- enemy move animations (opts.anim from the move list) ---------- */
function enemyAttack(id, hid='p', opts={}){ const an = opts.anim; if (!an || an==='basic' || !foes[id]) return enemyAttack0(id, hid, opts); { const d7 = attack7(id, hid, opts); if (d7 !== null) return d7; }
  const f = foes[id], h = hpos(hid); const hp = h ? wpos(h) : V3(-4, 2, 1); const from = wpos(f, 0.8); const gp = V3(hp.x, 0, hp.z); const big = !!opts.charged;
  const sx = f.userData.tx !== undefined ? f.userData.tx : f.position.x; const hx = h ? h.position.x : -4;
  const lunge = (dur, dist, lift=0, after) => { let did = false; tween(dur, k => { const a = Math.sin(k*Math.PI); f.position.x = sx - a*dist; f.position.y = a*lift; if (!did && k > 0.5){ did = true; if (after) after(); } }, () => { f.position.x = sx; f.position.y = 0; }); };
  const near = Math.max(2, sx - hx - 2.4); const S = big ? 1.4 : 1;
  if (big) flashLight(from, 0xff3030, 6);
  if (an==='multi'){ lunge(0.6, near, 0.3, () => { for (let i=0;i<3;i++) setTimeout(() => { arc(V3(hp.x + 0.6, hp.y + (i-1)*0.45, hp.z + (i-1)*0.3), i%2 ? 0xffd0d0 : 0xffffff, {rz:2.2 + i*0.7, spin:i%2 ? 9 : -9, dur:0.22}); burstAt(hp, 0xffffff, 5); }, i*85); }); return 640; }
  if (an==='smash'){ lunge(0.75, near, 3.2*S, () => { shock(gp, 0xffb050, 1.5*S); ring(gp, 0xffffff, 0.2, 3.5, 0.35, 0.1, 0.2); for (let i=0;i<10;i++){ const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28), M(0x6a5a4a)); r.position.set(gp.x, 0.3, gp.z); fxGroup.add(r); const v = V3((Math.random()-.5)*6, 4+Math.random()*4, (Math.random()-.5)*4); tween(0.8, kk => { r.position.addScaledVector(v, 0.016); v.y -= 0.25; }, () => fxGroup.remove(r)); } flashLight(hp, 0xffa040, 8); shake = Math.max(shake, 0.9); }); return 760; }
  if (an==='flame'){ projectile(from, hp, orbMesh('rgba(255,120,30,1)', 1.0), 0.4, 1.2, () => { if (h) flameBurst(h, 0xff6a20); ring(gp, 0xff7a20, 0.3, 3.2, 0.45, 0.08, 0.35); }, 'rgba(255,100,20,.8)'); return 560; }
  if (an==='bite'){ lunge(0.5, near, 0.6, () => { const c = V3(hp.x + 0.5, hp.y, hp.z + 0.3); arc(V3(c.x, c.y + 0.5, c.z), 0xffffff, {r:1.0, w:0.25, len:1, rz:Math.PI*1.05, spin:0, dur:0.25}); arc(V3(c.x, c.y - 0.5, c.z), 0xffffff, {r:1.0, w:0.25, len:1, rz:0.05, spin:0, dur:0.25}); setTimeout(() => burstAt(c, 0xff2040, 12), 120); }); return 520; }
  if (an==='poison'){ for (let i=0;i<(big?5:3);i++) setTimeout(() => projectile(from, V3(hp.x + (Math.random()-.5), hp.y + (Math.random()-.5)*0.6, hp.z), orbMesh('rgba(140,255,90,.95)', 0.7), 0.45, 1.8, () => { burstAt(hp, 0x9a4aff, 8); for (let j=0;j<5;j++){ const b = sprite('rgba(150,255,110,.8)', 0.4, V3(gp.x + (Math.random()-.5)*2, 0.3, gp.z + (Math.random()-.5)*1.5)); tween(1.0, k => { b.position.y += 0.025; b.material.opacity = 0.8*(1-k); }, () => fxGroup.remove(b)); } }, 'rgba(120,230,80,.6)'), i*90); return 650; }
  if (an==='flash'){ const s = sprite('rgba(255,255,240,1)', 1, hp); tween(0.45, k => { s.scale.setScalar(1 + k*9); s.material.opacity = 1 - k; }, () => fxGroup.remove(s)); flashLight(hp, 0xffffff, 10); line(from, hp, 0xffffe0, 0.2); return 420; }
  if (an==='web'){ projectile(from, hp, orbMesh('rgba(245,245,245,.95)', 0.6), 0.35, 0.8, () => { const g = new THREE.Group(); for (let i=0;i<6;i++){ const a = i/6*Math.PI; const l = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.04, 0.04), new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:0.85})); l.rotation.z = a; g.add(l); } for (let r=0.5;r<1.8;r+=0.5){ const t = new THREE.Mesh(new THREE.TorusGeometry(r, 0.025, 4, 6), new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:0.8})); g.add(t); } g.position.copy(hp); g.position.x += 0.6; g.rotation.y = Math.PI/2; fxGroup.add(g); tween(1.2, k => { g.children.forEach(c => c.material.opacity = 0.85*(1-k)); }, () => fxGroup.remove(g)); }, 'rgba(255,255,255,.4)'); return 520; }
  if (an==='quake'){ f.position.y = 0.8; setTimeout(() => { f.position.y = 0; const fp = V3(f.position.x, 0, f.position.z); for (let i=0;i<4;i++) setTimeout(() => ring(fp.clone().lerp(gp, i/3), 0xd9b070, 0.3, 2.4 + i*0.4, 0.45, 0.08, 0.35), i*70); setTimeout(() => { for (let i=0;i<7;i++){ const sp = cone(0.35, 1.6 + Math.random()*1.2, M(0x7a6a55), 5); sp.position.set(gp.x + (Math.random()-.5)*2.4, -1.5, gp.z + (Math.random()-.5)*1.8); fxGroup.add(sp); tween(0.7, k => { sp.position.y = -1.5 + Math.sin(k*Math.PI)*2.0; }, () => fxGroup.remove(sp)); } shake = Math.max(shake, 0.6*S); }, 260); }, 220); return 700; }
  if (an==='gust'){ for (let i=0;i<3;i++) setTimeout(() => { const tor = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.08, 4, 20), new THREE.MeshBasicMaterial({color:0xd8f4ff, transparent:true, opacity:0.75, blending:THREE.AdditiveBlending})); tor.position.copy(from); tor.rotation.y = Math.PI/2; fxGroup.add(tor); const a = from.clone(); tween(0.4, k => { tor.position.copy(a.clone().lerp(hp, k)); tor.scale.setScalar(1 + k*1.2); tor.material.opacity = 0.75*(1 - k*0.6); }, () => { fxGroup.remove(tor); burstAt(hp, 0xe0f8ff, 6); }); }, i*90); return 560; }
  if (an==='frost'){ for (let i=0;i<(big?9:6);i++) setTimeout(() => { const sh = cone(0.14, 0.9, new THREE.MeshStandardMaterial({color:0xcff4ff, emissive:0x60c8ff, emissiveIntensity:0.6, transparent:true, opacity:0.9}), 4); sh.userData.orient = false; const a = V3(from.x, from.y + (Math.random()-.5), from.z + (Math.random()-.5)), b = V3(hp.x + (Math.random()-.5)*0.6, hp.y + (Math.random()-.5)*0.8, hp.z); sh.position.copy(a); sh.lookAt(b); sh.rotateX(Math.PI/2); fxGroup.add(sh); tween(0.28, k => sh.position.copy(a.clone().lerp(b, k)), () => { fxGroup.remove(sh); burstAt(b, 0xcff4ff, 4); }); }, i*45); setTimeout(() => { ring(gp, 0x9fe8ff, 0.3, 3.4, 0.5, 0.08, 0.4); flashLight(hp, 0x9fe8ff, 5); }, 380); return 620; }
  if (an==='orb'){ projectile(from, hp, orbMesh('rgba(170,80,255,1)', 1.1), 0.6, 0.6, () => { const s = sprite('rgba(120,40,220,.9)', 5, hp); tween(0.4, k => { s.scale.setScalar(5*(1-k) + 0.1); s.material.opacity = 0.9; }, () => { fxGroup.remove(s); burstAt(hp, 0xc080ff, 14); }); ring(gp, 0xa050ff, 3.5, 0.4, 0.4, 0.08, 0.3); }, 'rgba(140,60,230,.6)'); return 760; }
  if (an==='meteor'){ const sky = V3(hp.x + 4, 16, hp.z - 1); projectile(sky, V3(hp.x, 0.6, hp.z), orbMesh('rgba(255,110,30,1)', 1.6*S), 0.55, 0, () => { if (h) flameBurst(h, 0xff5a10); shock(gp, 0xff6a20, 1.6*S); ring(gp, 0xffd060, 0.3, 5*S, 0.55, 0.1, 0.5); flashLight(hp, 0xff8020, 10); shake = Math.max(shake, 0.8); }, 'rgba(255,90,20,.85)'); return 760; }
  if (an==='beam'){ setTimeout(() => { beam(from, hp, big ? 0xffd040 : 0xff3a3a, 0.55, big ? 0.6 : 0.35); flashLight(hp, 0xff5040, 8); burstAt(hp, 0xffe0a0, 14); }, 150); const s = sprite('rgba(255,90,60,1)', 0.3, from); tween(0.18, k => s.scale.setScalar(0.3 + k*3), () => fxGroup.remove(s)); return 700; }
  if (an==='bolt'){ for (let i=0;i<3;i++) setTimeout(() => lightning(from, V3(hp.x, hp.y + (Math.random()-.5), hp.z), 0x9fe0ff), i*70); return 420; }
  if (an==='drain'){ lunge(0.5, near*0.6, 0.4, () => { burstAt(hp, 0xff2040, 10); for (let i=0;i<8;i++){ const s = sprite('rgba(255,40,80,1)', 0.55, hp); const p0 = hp.clone(), p1 = wpos(f); const off = V3(0, 1 + Math.random()*2, (Math.random()-.5)*2); tween(0.6 + i*0.05, kk => { const p = p0.clone().lerp(p1, kk); p.addScaledVector(off, Math.sin(kk*Math.PI)); s.position.copy(p); }, () => fxGroup.remove(s)); } }); return 720; }
  if (an==='grip'){ for (let i=0;i<6;i++){ const a = i/6*Math.PI*2; const t = cyl(0.12, 0.3, 4, M(0x5a2a6a, {emissive:0x3a0a4a, emissiveIntensity:0.5}), 6); t.position.set(gp.x + Math.cos(a)*1.6, -2, gp.z + Math.sin(a)*1.2); fxGroup.add(t); const x0 = t.position.x, z0 = t.position.z; tween(0.9, k => { const u = Math.sin(Math.min(1, k*1.6)*Math.PI/2); t.position.y = -2 + u*3.6; t.position.x = x0 + (gp.x - x0)*0.5*k; t.position.z = z0 + (gp.z - z0)*0.5*k; t.rotation.z = Math.cos(a)*0.5*k; t.rotation.x = Math.sin(a)*0.5*k; }, () => fxGroup.remove(t)); } setTimeout(() => { burstAt(hp, 0xc080ff, 12); shake = Math.max(shake, 0.4); }, 500); return 820; }
  if (an==='roar'){ return foeMove(id, 'roar'); }
  return enemyAttack0(id, hid, opts); }
/* moves that don't hit a hero: shields, heals, war cries, dodging, summons */
function foeMove(id, an, anim){ const f = foes[id]; if (!f) return 200; const fp = V3(f.position.x, 0, f.position.z), c = wpos(f); const AD = anim && DATA.ANIMS && DATA.ANIMS[anim]; if (AD && (an==='summon' || an==='heal' || an==='roar')){ const col = AD.c; ring(fp, col, 0.3, 4.5, 0.7, 0.08, 0.5); ring(V3(fp.x, 2.2, fp.z), AD.c2 || col, 0.4, 6, 0.5, 2.2, 0.3); flashLight(c, col, 7); flashScreen(col, 0.12); for (let i=0;i<14;i++){ const s = sprite(hexcss(col, .9), 0.5, V3(fp.x + (Math.random()-.5)*3, 0.3, fp.z + (Math.random()-.5)*2)); const v = 0.03 + Math.random()*0.06; tween(1.0, k => { s.position.y += v; s.material.opacity = 0.9*(1-k); }, () => fxGroup.remove(s)); } if (an==='summon') portal(fp, col); if (an==='roar'){ const b0 = f.userData.base || f.scale.x; tween(0.6, k => f.scale.setScalar(b0*(1 + Math.sin(k*Math.PI)*0.12)), () => f.scale.setScalar(b0)); shake = Math.max(shake, 0.5); } return 700; }
  if (an==='shield'){ const s = new THREE.Mesh(new THREE.SphereGeometry(3.4, 16, 10), new THREE.MeshBasicMaterial({color:0x7fd0ff, transparent:true, opacity:0.28, blending:THREE.AdditiveBlending, depthWrite:false})); s.position.copy(c); fxGroup.add(s); const hx = new THREE.Mesh(new THREE.SphereGeometry(3.45, 8, 6), new THREE.MeshBasicMaterial({color:0xbfe8ff, wireframe:true, transparent:true, opacity:0.6})); hx.position.copy(c); fxGroup.add(hx); tween(1.0, k => { const sc = k < 0.2 ? k/0.2 : 1; s.scale.setScalar(sc); hx.scale.setScalar(sc); hx.rotation.y += 0.03; s.material.opacity = 0.28*(1 - Math.max(0, k-0.6)/0.4); hx.material.opacity = 0.6*(1 - Math.max(0, k-0.6)/0.4); }, () => { fxGroup.remove(s); fxGroup.remove(hx); }); return 500; }
  if (an==='heal'){ ring(fp, 0x60ff90, 0.3, 3.4, 0.6, 0.08, 0.3); for (let i=0;i<16;i++){ const s = sprite('rgba(110,255,150,.9)', 0.45, V3(fp.x + (Math.random()-.5)*2.4, 0.3, fp.z + (Math.random()-.5)*1.6)); const v = 0.03 + Math.random()*0.04; tween(0.9, k => { s.position.y += v; s.material.opacity = 0.9*(1-k); }, () => fxGroup.remove(s)); } flashLight(c, 0x60ff90, 4); return 520; }
  if (an==='roar'){ const b0 = f.userData.base || f.scale.x; tween(0.6, k => f.scale.setScalar(b0*(1 + Math.sin(k*Math.PI)*0.18)), () => f.scale.setScalar(b0)); for (let i=0;i<3;i++) setTimeout(() => ring(V3(fp.x, 2.2, fp.z), 0xff4030, 0.4, 6, 0.5, 2.2, 0.25), i*120); flashLight(c, 0xff3020, 6); shake = Math.max(shake, 0.4); return 620; }
  if (an==='dodge'){ for (let i=0;i<4;i++){ const g = sprite('rgba(150,220,255,.45)', 3.4, c); const dx = (i%2 ? 1 : -1)*(1 + i*0.4); tween(0.6, k => { g.position.x = c.x + dx*k; g.material.opacity = 0.45*(1-k); }, () => fxGroup.remove(g)); } const p0 = f.position.x; tween(0.4, k => { f.position.x = p0 + Math.sin(k*Math.PI*2)*0.8; }, () => { f.position.x = p0; }); return 460; }
  if (an==='summon'){ portal(fp, 0xb050ff); beam(V3(fp.x - 2, 0, fp.z + 1), V3(fp.x - 2, 9, fp.z + 1), 0xb050ff, 0.7, 0.6); flashLight(c, 0xb050ff, 6); return 600; }
  if (an==='charge'){ for (let i=0;i<16;i++){ const a = i/16*Math.PI*2; const s = sprite('rgba(255,60,40,1)', 0.5, V3(c.x + Math.cos(a)*3, c.y + Math.sin(a)*2, c.z)); const p0 = s.position.clone(); tween(0.5, k => s.position.copy(p0.clone().lerp(c, k)), () => fxGroup.remove(s)); } flashLight(c, 0xff3030, 6); return 520; }
  return 200; }
function enemyAttack0(id, hid='p', opts={}){ const f = foes[id]; if (!f) return 300; const e = f.userData.e || {}; const h = hpos(hid); const K = e.key, A = e.art; const big = !!opts.charged;
  const sx = f.userData.tx !== undefined ? f.userData.tx : f.position.x, sz = f.userData.tz !== undefined ? f.userData.tz : f.position.z; const hp = h ? wpos(h) : V3(-4, 2, 1);
  const from = wpos(f, A==='eye' ? 1.2 : 0.8); const hx = h ? h.position.x : -4;
  const lunge = (dur, dist, lift=0, after) => { let did = false; tween(dur, k => { const a = Math.sin(k*Math.PI); f.position.x = sx - a*dist; f.position.y = a*lift; if (!did && k > 0.5){ did = true; if (after) after(); } }, () => { f.position.x = sx; f.position.y = 0; }); };
  if (big) flashLight(from, 0xff3030, 6);
  if (A==='god'){ const sky = V3(hp.x, 16, hp.z);
    if (K==='zeusGod' || K==='thorGod'){ f.position.y = 0.6; setTimeout(() => { f.position.y = 0; for (let i=0;i<(big?6:4);i++) setTimeout(() => lightning(V3(hp.x + (Math.random()-.5)*2, 16, hp.z + (Math.random()-.5)*2), V3(hp.x + (Math.random()-.5)*1.2, hp.y, hp.z), K==='zeusGod' ? 0xfff27a : 0x9fd8ff), i*70); ring(V3(hp.x, 0, hp.z), 0xbfe8ff, 0.3, 6, 0.5); flashLight(hp, 0xffffff, 8); shake = Math.max(shake, big ? 0.9 : 0.55); }, 200); return 640; }
    if (K==='poseidonGod'){ for (let i=0;i<10;i++) setTimeout(() => projectile(V3(from.x, 1 + Math.random()*2, from.z + (Math.random()-.5)*3), V3(hp.x, hp.y*0.6, hp.z + (Math.random()-.5)*2), orbMesh('rgba(90,220,230,.9)', 0.9), 0.4, 0.3, null, 'rgba(60,180,220,.5)'), i*35); setTimeout(() => { shock(V3(hp.x, 0, hp.z), 0x60e0e0, 1.3); shake = Math.max(shake, 0.6); }, 450); return 700; }
    if (K==='susanooGod'){ lunge(0.55, Math.max(2, sx - hx - 2.6), 0.8, () => { for (let i=0;i<3;i++) setTimeout(() => arc(V3(hp.x + 0.6, hp.y + (i-1)*0.5, hp.z), 0xc8c0ff, {rz:2.2 + i*0.5, spin:-10}), i*90); }); return 620; }
    if (K==='raGod'){ beam(V3(from.x, from.y + 2.5, from.z), hp, 0xffb030, big ? 0.7 : 0.45, 0.5); flashLight(hp, 0xffa020, 8); setTimeout(() => burstAt(hp, 0xffd060, 16), 250); return 600; }
    if (K==='sekhmetGod'){ lunge(0.6, Math.max(2, sx - hx - 2.4), 2.0, () => { for (let i=0;i<8;i++) setTimeout(() => projectile(V3(hp.x + 1.5, hp.y + 1, hp.z), V3(hp.x + (Math.random()-.5), hp.y + (Math.random()-.5), hp.z + (Math.random()-.5)), orbMesh('rgba(255,110,30,.9)', 0.7), 0.25, 0.4, null), i*30); shock(V3(hp.x, 0, hp.z), 0xff6020, 1.0); }); return 620; }
    if (K==='odinGod'){ projectile(V3(from.x - 1, from.y + 1.5, from.z), hp, orbMesh('rgba(190,230,255,.95)', 1.0), 0.3, 0.2, () => { burstAt(hp, 0xbfe8ff, 14); shock(V3(hp.x, 0, hp.z), 0xbfe8ff, 1.0); }, 'rgba(190,230,255,.6)'); for (let i=0;i<2;i++) setTimeout(() => projectile(V3(from.x, from.y + 3, from.z + (i ? 2 : -2)), hp, orbMesh('rgba(20,20,30,.95)', 0.6), 0.45, 1.5, null), 120 + i*80); return 600; }
    lunge(0.6, Math.max(2, sx - hx - 2.6), 0.5, () => { arc(V3(hp.x + 0.6, hp.y, hp.z), 0xff3020, {rz:2.6, spin:-9}); shock(V3(hp.x, 0, hp.z), 0xff4020, big ? 1.4 : 1.0); shake = Math.max(shake, 0.6); }); return 600; }
  if (A==='execut'){ lunge(0.6, Math.max(2, sx - hx - 2.8), 0.6, () => { arc(V3(hp.x + 0.6, hp.y, hp.z + 0.4), big ? 0xff3010 : 0xffb070, {rz:2.6, spin:-9}); shock(V3(hp.x, 0, hp.z), 0xff6a20, big ? 1.3 : 0.9); shake = Math.max(shake, big ? 0.8 : 0.45); }); return 560; }
  if (A==='bomber' || A==='balloon'){ const top = A==='balloon' ? V3(hp.x + 0.4, 9, hp.z) : from; projectile(top, V3(hp.x, 0.5, hp.z), orbMesh('rgba(30,30,36,.95)', 0.7), A==='balloon' ? 0.45 : 0.55, A==='balloon' ? 0 : 3, () => { burstAt(V3(hp.x, 1, hp.z), 0xffa030, 18); shock(V3(hp.x, 0, hp.z), 0xff8020, 1.0); flashLight(hp, 0xff9020); shake = Math.max(shake, 0.4); }, 'rgba(120,120,120,.5)'); return 560; }
  if (A==='horde'){ lunge(0.5, Math.max(2, sx - hx - 2.4), 0.3, () => { for (let i=0;i<3;i++) setTimeout(() => arc(V3(hp.x + 0.6, hp.y + (i-1)*0.4, hp.z + (i-1)*0.4), 0xffffff, {rz:2.2 + i*0.3, spin:-8}), i*80); }); return 520; }
  if (A==='furnace'){ for (let i=0;i<3;i++) setTimeout(() => projectile(V3(from.x, from.y + 1.5, from.z), hp, orbMesh('rgba(255,120,30,.95)', 0.8), 0.45, 1.5 + i*0.5, () => burstAt(hp, 0xff6a10, 8), 'rgba(255,90,20,.6)'), i*110); return 600; }
  if (A==='rider'){ lunge(0.55, Math.max(2, sx - hx - 2.2), 2.4, () => { shock(V3(hp.x, 0, hp.z), 0xcab89a, 1.0); burstAt(V3(hp.x + 0.6, hp.y, hp.z), 0xffffff, 10); shake = Math.max(shake, 0.4); }); return 520; }
  if (A==='cart'){ for (let i=0;i<3;i++) setTimeout(() => lightning(V3(from.x, from.y + 2.5, from.z), V3(hp.x, hp.y + (Math.random()-.5), hp.z), 0x80e8ff), i*70); flashLight(hp, 0x80e8ff); return 420; }
  if (A==='ram'){ lunge(0.5, Math.max(2, sx - hx - 3.4), 0, () => { shock(V3(hp.x, 0, hp.z), 0xd8a020, big ? 1.4 : 1.0); burstAt(V3(hp.x + 0.6, hp.y, hp.z), 0xffd060, 14); shake = Math.max(shake, big ? 0.8 : 0.5); }); return 520; }
  if (K==='watcher' || (A==='eye' && K!=='shadow')){ beam(from, hp, 0xff2020, 0.45, big ? 0.45 : 0.22); flashLight(hp, 0xff2020); return 380; }
  if (K==='shadow'){ for (let i=0;i<8;i++){ setTimeout(() => projectile(from, hp, orbMesh('rgba(110,40,200,.9)', 0.9), 0.35, (Math.random()-.5)*3, null, 'rgba(60,20,120,.6)'), i*40); } return 450; }
  if (K==='prospero' || A==='mage'){ f.position.y = 0.5; setTimeout(() => { f.position.y = 0; lightning(V3(hp.x, 14, hp.z), hp, 0xc8a0ff); ring(V3(hp.x, 0, hp.z), 0xc8a0ff, 0.3, 5, 0.5); }, 200); return 420; }
  if (K==='wyrm'){ const head = V3(f.position.x - 2.0, 4.6, f.position.z + 0.5); for (let i=0;i<22;i++) setTimeout(() => projectile(head, V3(hp.x + (Math.random()-.5)*1.2, hp.y + (Math.random()-.5)*1.2, hp.z), orbMesh('rgba(170,230,255,.9)', 0.6), 0.35, 0, null), i*18); return 600; }
  if (K==='oBrien'){ lunge(0.4, 1.0, 0.4, () => { for (let i=0;i<3;i++) setTimeout(() => lightning(V3(from.x - 1, from.y, from.z + 0.5), V3(hp.x, hp.y + (Math.random()-.5), hp.z), 0xff4040), i*90); }); return 450; }
  if (K==='arielStorm'){ const tor = new THREE.Group(); for (let i=0;i<5;i++){ const r = new THREE.Mesh(new THREE.TorusGeometry(0.4 + i*0.25, 0.05, 4, 20), new THREE.MeshBasicMaterial({color:0xbff8ff, transparent:true, opacity:0.7, blending:THREE.AdditiveBlending})); r.rotation.x = Math.PI/2; r.position.y = i*0.6; tor.add(r); } tor.position.set(from.x, 0, from.z); fxGroup.add(tor);
    const a0 = tor.position.clone(), a1 = V3(hp.x, 0, hp.z); tween(0.5, k => { tor.position.copy(a0.clone().lerp(a1, k)); tor.rotation.y += 0.4; }, () => { fxGroup.remove(tor); lightning(V3(hp.x, 12, hp.z), hp, 0xbff8ff); }); return 600; }
  if (K==='fogcat'){ lunge(0.55, Math.max(2, sx - hx - 2.2), 2.2, () => { for (let i=0;i<8;i++){ const s = sprite('rgba(240,220,110,.5)', 2, V3(hp.x + (Math.random()-.5)*2, 1 + Math.random()*2, hp.z)); tween(0.8, k => { s.material.opacity = 0.5*(1-k); s.scale.setScalar(2 + k*2); }, () => fxGroup.remove(s)); } }); return 520; }
  if (K==='hollowKing'){ for (let i=0;i<14;i++) setTimeout(() => projectile(from, V3(hp.x, hp.y, hp.z), orbMesh('rgba(200,150,60,.85)', 0.35), 0.45, Math.sin(i)*2, null), i*25); return 520; }
  if (K==='winterOwl' || A==='bird'){ lunge(0.5, Math.max(2, sx - hx - 2), 1.5, () => { if (K==='winterOwl') for (let i=0;i<10;i++) projectile(from, V3(hp.x + (Math.random()-.5), hp.y + (Math.random()-.5), hp.z), orbMesh('rgba(255,255,255,.95)', 0.3), 0.3, 0.5, null); }); return 450; }
  if (K==='caliban' || K==='troll' || A==='brute' || A==='yeti'){ lunge(0.6, Math.max(2, sx - hx - 2.6), 1.6, () => { shock(V3(hp.x, 0, hp.z), K==='troll' ? 0xbfefff : 0xffc080, big ? 1.3 : 0.8); shake = Math.max(shake, big ? 0.7 : 0.35); }); return 520; }
  if (K==='captain' || A==='knight'){ lunge(0.45, Math.max(2, sx - hx - 2.4), 0, () => { arc(V3(hp.x + 0.6, hp.y, hp.z + 0.4), 0xff6060, {rz:2.4, spin:-7}); }); return 420; }
  if (A==='spider'){ projectile(from, hp, orbMesh('rgba(240,240,240,.9)', 0.6), 0.3, 0.6, () => burstAt(hp, 0xffffff, 10)); return 400; }
  if (A==='jelly' || A==='drone' || A==='puffer' && false){ lightning(from, hp, A==='jelly' ? 0x9fd8ff : 0xff4040); return 380; }
  if (A==='djinn'){ for (let i=0;i<6;i++) setTimeout(() => projectile(from, hp, orbMesh(e.key==='icewraith' ? 'rgba(220,240,255,.9)' : e.key==='stormdjinn' ? 'rgba(120,180,255,.9)' : 'rgba(255,190,110,.9)', 0.6), 0.35, Math.sin(i)*1.5, null), i*50); return 480; }
  if (A==='kraken' || A==='hydra'){ lunge(0.6, 1.5, 0, () => { shock(V3(hp.x, 0, hp.z), A==='kraken' ? 0x60a0ff : 0x60ff90, 1.1); if (A==='hydra') for (let i=0;i<3;i++) setTimeout(() => projectile(from, hp, orbMesh('rgba(140,255,120,.9)', 0.7), 0.3, 0.5, null), i*80); shake = Math.max(shake, 0.5); }); return 600; }
  if (A==='serpent' || A==='scorpion' || A==='rat' || A==='fox' || A==='bear' || A==='horse' || A==='mammoth' || A==='hound3' || A==='sphinx'){ lunge(0.45, Math.max(2, sx - hx - 2.4), A==='fox' ? 1.0 : 0.2, () => { burstAt(V3(hp.x + 0.6, hp.y, hp.z), A==='hound3' ? 0xff6020 : 0xffffff, 10); if (A==='mammoth' || A==='sphinx') shock(V3(hp.x, 0, hp.z), 0xcab89a, 0.8); }); return 450; }
  if (A==='bat' || A==='harpy'){ lunge(0.5, Math.max(2, sx - hx - 2), 1.4, () => arc(V3(hp.x + 0.6, hp.y, hp.z), 0xffffff, {rz:2.3, spin:-7})); return 450; }
  if (A==='treant' || A==='giant' || A==='colossus' || A==='cyclops'){ lunge(0.6, Math.max(2, sx - hx - 2.6), A==='giant' ? 0.8 : 0.3, () => { shock(V3(hp.x, 0, hp.z), A==='treant' ? 0x80c050 : A==='colossus' ? 0xff3030 : 0xbfefff, 1.0); shake = Math.max(shake, 0.45); }); return 520; }
  if (A==='wisp'){ const col = e.color || '#80e0ff'; projectile(from, hp, orbMesh(col, 0.6), 0.35, 0.8, () => burstAt(hp, 0xffffff, 8), col); return 420; }
  if (A==='slime'){ lunge(0.5, Math.max(2, sx - hx - 2.2), 1.8, () => {}); return 450; }
  if (A==='golem'){ f.position.y = 0.6; setTimeout(() => { f.position.y = 0; shock(V3(f.position.x, 0, f.position.z), 0xd9b070, 1.1); shake = Math.max(shake, 0.3); }, 220); return 420; }
  if (['boar','wolf','cat','crab'].includes(A)){ lunge(0.42, Math.max(2, sx - hx - 2.3), 0.2, () => burstAt(V3(hp.x + 0.6, 0.4, hp.z), 0xcab89a, 8, true)); return 400; }
  lunge(0.38, Math.max(1.6, sx - hx - 2.4), 0, () => arc(V3(hp.x + 0.6, hp.y, hp.z + 0.4), big ? 0xff4040 : 0xffffff, {rz:2.3, spin:-7})); return 380;
}
function openChest(){ if (!chestObj) return; const d = chestObj.userData; tween(0.8, k => { d.lid.rotation.x = -k*1.9; d.glow.scale.setScalar(0.1 + k*6); }); burst(chestObj, 0xffe080, 26, true); }
const refCam = new THREE.PerspectiveCamera(46, 16/9, 0.1, 200);
/* a steady anchor for the HP plates: the model's resting slot and height, seen from where the camera settles (so attacks and shakes never move them) */
function screenPos(id){ const o = (id==='p' || (typeof id==='string' && heroes[id])) ? (heroes[id] || hero) : foes[id]; if (!o || !cam) return null; const u = o.userData;
  if (u.ht === undefined){ const bb = new THREE.Box3().setFromObject(o); u.ht = Math.min(15, Math.max(3, bb.max.y - bb.min.y)); }
  const home = u.home || (u.tx !== undefined ? V3(u.tx, 0, u.tz) : o.position);
  refCam.fov = cam.fov; refCam.aspect = cam.aspect; refCam.updateProjectionMatrix(); refCam.position.copy(camGoal || cam.position); refCam.lookAt(camLook || camBase || V3(0, 1.5, 0)); refCam.updateMatrixWorld();
  const v = V3(home.x, u.ht*(o.scale ? 1 : 1) + 0.5, home.z); v.project(refCam); return {x:(v.x+1)/2*100, y:(1-v.y)/2*100}; }
function updateHero(P){ if (!hero) return; const pos = hero.position.clone(), rot = hero.rotation.y, sitting = hero.userData.sitting, home = hero.userData.home; scene.remove(hero); hero = GEAR3D.buildHero(P, P.look || {}); hero.position.copy(pos); hero.rotation.y = rot; hero.userData.home = home; if (sitting) sit(hero); scene.add(hero); heroes.p = hero; }
/* the moment you equip something great */
function equipFx(rar){ const h = hero; if (!h || rar < 3) return; const c = h.position; const col = rar === 4 ? 0xff3a5a : 0xffd060;
  beam(V3(c.x, 0, c.z), V3(c.x, 14, c.z), col, 0.9, 0.8); ring(V3(c.x, 0, c.z), col, 0.4, 6, 0.9, 0.08, 0.3); flashLight(V3(c.x, 2.5, c.z), col, 5);
  for (let i=0;i<36;i++){ const a = i*0.5; const s = sprite(rgbaS(col, 1), 0.5, V3(c.x + Math.cos(a)*2, 0.2, c.z + Math.sin(a)*2)); tween(1.2, k => { const r = 2 - k*1.4; s.position.set(c.x + Math.cos(a + k*6)*r, 0.2 + k*6 + i*0.03, c.z + Math.sin(a + k*6)*r); s.material.opacity = 1 - k; }, () => fxGroup.remove(s)); }
  if (rar === 4){ for (let i=0;i<4;i++) setTimeout(() => lightning(V3(c.x + (Math.random()-.5)*6, 10, c.z), V3(c.x, 1.5, c.z), 0xff3a5a), i*160); shake = 0.6; } }
const rgbaS = (n, a) => `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`;

/* ---------- gallery (design sheets) ---------- */
function gallery(kind, list, cols){ mode = 'gallery'; clearScene(); camGoal = null; scene.background = gradientBG('#3a3266', '#141128'); scene.fog = null;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x50406a, 0.95)); const sun = new THREE.DirectionalLight(0xfff2dd, 1.0); sun.position.set(-6, 12, 14); scene.add(sun); const rim = new THREE.DirectionalLight(0x9fb8ff, 0.6); rim.position.set(8, 6, -10); scene.add(rim);
  const objs = list.map(x => kind==='armour' ? GEAR3D.buildHero(x) : kind==='weapon' ? GEAR3D.weapon(x) : (() => { const g = buildEnemy(x); if (!g.userData.v8) enemyDeco(g, x); if (x.boss || x.mini) bossDeco(g, x); return g; })());
  const rows = Math.ceil(objs.length / cols), SX = kind==='enemy' ? 4.6 : kind==='armour' ? 5.2 : 4.6, SY = kind==='weapon' ? 5.0 : kind==='armour' ? 6.2 : 5.6;
  objs.forEach((o, i) => { const c = i % cols, r = Math.floor(i / cols);
    if (kind==='weapon'){ const w = list[i]; o.scale.setScalar(w.arch==='fist' ? 1.25 : 0.82); if (w.myth==='dragon_scroll') o.rotation.set(0, 0.35, 0); else if (w.arch==='ranged') o.rotation.y = Math.PI/2 + 0.25; else o.rotation.set(0, 0.5, w.arch==='fist' ? 0 : -0.35); const bb0 = new THREE.Box3().setFromObject(o); const hh = bb0.max.y - bb0.min.y; if (hh > 3.6) o.scale.multiplyScalar(3.6/hh); }
    if (kind==='armour'){ o.rotation.y = 0.45; o.scale.multiplyScalar(1.25); }
    if (kind==='enemy'){ o.rotation.y = ['wyrm','boar','wolf','cat','crab'].includes(list[i].art) ? 0.6 : list[i].art==='eye' ? 0 : -0.5; const bb = new THREE.Box3().setFromObject(o); const h = bb.max.y - bb.min.y; o.scale.multiplyScalar(Math.min(1.6, (list[i].boss ? 4.4 : list[i].mini ? 3.9 : 3.3) / Math.max(0.1, h))); }
    scene.add(o); const bb = new THREE.Box3().setFromObject(o); const cx = (bb.min.x + bb.max.x)/2, cy = (bb.min.y + bb.max.y)/2;
    o.position.x += (c - (cols-1)/2)*SX - cx; o.position.y += -r*SY - cy; });
  const W2 = cols*SX, H2 = rows*SY; cam.fov = 20; cam.updateProjectionMatrix(); const d = Math.max(H2/2/Math.tan(10*Math.PI/180), W2/2/(Math.tan(10*Math.PI/180)*cam.aspect)) * 1.04 + 4;
  cam.position.set(0, -(rows-1)*SY/2 + 1.0, d); camBase = V3(0, -(rows-1)*SY/2 + 0.2, 0); cam.lookAt(camBase); R.render(scene, cam);
  return objs.map(o => { const bb = new THREE.Box3().setFromObject(o); const v = V3((bb.min.x+bb.max.x)/2, bb.min.y - 0.15, 0); v.project(cam); return {x:(v.x+1)/2*100, y:(1-v.y)/2*100}; }); }
/* ---------- loop ---------- */
function loop(){
  requestAnimationFrame(loop); if (!scene || !R) return; const dt0 = Math.min(0.05, clock.getDelta()); if (FXS.slow !== 1 && performance.now() > FXS.slowUntil) FXS.slow = 1; const dt = dt0*FXS.slow; t += dt; stepFx(dt0, dt);
  for (let i = anims.length-1; i >= 0; i--){ const a = anims[i]; a.t += dt; const k = Math.min(1, a.t/a.dur); a.fn(k); if (k >= 1){ anims.splice(i,1); if (a.done) a.done(); } }
  for (const id in heroes){ const h = heroes[id]; if (!h.userData.sitting && !h.userData.busy && !h.userData.down){ const p = h.userData.parts; p.body.position.y = Math.sin(t*3 + h.position.x)*0.06; } GEAR3D.animate(h, t, dt); if (h.userData.shield) h.userData.shield[1].rotation.y += dt*0.6; }
  for (const id in foes){ const f = foes[id], u = f.userData; const ph = t*2.2 + (+id)*0.7; const e = u.e || {};
    if (u.tx !== undefined && !u.dying){ f.position.x += (u.tx - f.position.x) * 0.06; if (u.tz !== undefined) f.position.z += (u.tz - f.position.z) * 0.06; }
    if (u.squish){ u.squish.scale.y = 0.75 + Math.sin(ph*1.5)*0.06; u.squish.scale.x = 1 - Math.sin(ph*1.5)*0.04; }
    if (u.wings) u.wings.forEach((wg, k) => wg.rotation.z = (k ? -1 : 1) * Math.sin(ph*3)*0.5);
    if (u.spin) u.spin.rotation.y += dt*1.5;
    if (u.anims) ASM.tick(u.anims, t, dt);
    if (u.J) KIT.tick(u.J, t + (+id)*0.37);
    if (u.iris){ u.iris.position.x = Math.sin(t*0.8)*0.35; }
    if (u.aura) u.aura.material.opacity = 0.7 + Math.sin(ph*2)*0.3;
    if (u.ring) u.ring.rotation.z += dt*0.8;
    if (u.bossLight) u.bossLight.intensity = 1.8 + Math.sin(t*6)*0.6;
    if (u.debris) u.debris.forEach((d, k) => { const a = t*0.9 + k*0.785; d.position.set(Math.cos(a)*3.8, 2 + Math.sin(a*1.7)*1.5 + k*0.2, -1.5 - Math.abs(Math.sin(a))*2); d.rotation.x += dt; });
    if (u.books) u.books.forEach((b, k) => { const a = t*1.2 + k*2.09; b.position.set(Math.cos(a)*2.4, 4.5 + Math.sin(t*2 + k)*0.5, Math.sin(a)*1.6); b.rotation.y = -a; });
    if (u.rings) u.rings.forEach((r, k) => { r.rotation.z += dt*(2 + k); r.material.opacity = 0.4 + Math.sin(t*4 + k)*0.2; });
    if (u.fog) u.fog.forEach((s, k) => { const a = t*0.5 + k; s.position.set(Math.cos(a)*2.5, 1.2 + Math.sin(a*1.3)*0.6, Math.sin(a)*1.5); });
    if (u.snow) u.snow.forEach((s, k) => { const kk = (t*0.3 + k*0.1) % 1; s.position.set(Math.sin(k*2.1)*2.5, 6 - kk*6, Math.cos(k*1.7)*1.5); });
    if (u.tendrils) u.tendrils.forEach((tn, k) => { tn.rotation.z = Math.sin(t*2 + k)*0.5; tn.rotation.x = Math.cos(t*1.6 + k)*0.4; });
    if (u.necks) u.necks.forEach((nk, k) => { nk.rotation.x = 0.2 + Math.sin(t*2 + k)*0.15; });
    if (u.tent) u.tent.forEach((t2, k) => { t2.rotation.x = (t2.userData.rx0 = t2.userData.rx0 != null ? t2.userData.rx0 : t2.rotation.x) + Math.sin(t*2.5 + k)*0.2; });
    if (u.snakes) u.snakes.forEach((s2, k) => { s2.rotation.y = Math.sin(t*4 + k)*0.6; });
    if (u.coils) u.coils.forEach((s2, k) => { s2.position.x += Math.sin(t*2 + k*0.9)*0.004; });
    if (u.mist) u.mist.material.opacity = 0.5 + Math.sin(t*3)*0.3;
    if (u.handGlow) u.handGlow.material.opacity = 0.6 + Math.sin(t*5)*0.4;
    // status visuals driven by the enemy's live state
    if (e.charging){ if (!u.charge){ u.charge = glowSprite('rgba(255,40,40,.7)', 3); u.charge.position.y = 3; f.add(u.charge); } u.charge.scale.setScalar(3 + Math.sin(t*12)*0.8); f.position.x += Math.sin(t*60)*0.03; } else if (u.charge){ f.remove(u.charge); u.charge = null; }
    if (e.status && e.status.burn > 0){ if (!u.flames){ u.flames = []; for (let i=0;i<5;i++){ const s = glowSprite('rgba(255,120,30,.9)', 0.9); f.add(s); u.flames.push(s); } } u.flames.forEach((s, k) => { const kk = (t*1.4 + k*0.2) % 1; s.position.set(Math.sin(k*2.3)*1.0, 1 + kk*4, Math.cos(k*1.9)*0.6); s.material.opacity = 1 - kk; }); } else if (u.flames){ u.flames.forEach(s => f.remove(s)); u.flames = null; }
    if (e.status && e.status.stun){ if (!u.stars){ u.stars = []; for (let i=0;i<3;i++){ const s = glowSprite('rgba(255,230,80,1)', 0.7); f.add(s); u.stars.push(s); } } const top = (new THREE.Box3().setFromObject(f).max.y - f.position.y) / f.scale.y; u.stars.forEach((s, k) => { const a = t*4 + k*2.09; s.position.set(Math.cos(a)*1.0, top + 0.4, Math.sin(a)*1.0); }); } else if (u.stars){ u.stars.forEach(s => f.remove(s)); u.stars = null; }
    if (e.exposed){ if (!u.expo){ u.expo = glowSprite('rgba(80,255,140,.6)', 5); u.expo.position.y = 3; f.add(u.expo); } } else if (u.expo){ f.remove(u.expo); u.expo = null; }
    if (!u.dying) f.position.y = (u.hover ? u.hover + Math.sin(ph)*0.22 : e.art==='wisp' || e.art==='eye' ? 0.6 + Math.sin(ph)*0.25 : Math.max(0, f.position.y > 0.05 ? f.position.y : Math.sin(ph)*0.04));
  }
  fxGroup.children.forEach(s => { if (s.userData.float !== undefined) s.position.y = 2 + Math.sin(t + s.userData.float)*1.2; if (s.userData.ember){ s.position.y += dt*1.2; if (s.position.y > 7) s.position.y = 0; } });
  if (lights.fire){ const u = lights.fire.userData; u.pl.intensity = 2.3 + Math.sin(t*13)*0.3 + Math.sin(t*7)*0.2; u.flames.forEach((f, i) => { f.scale.y = 1 + Math.sin(t*10 + i)*0.15; f.rotation.y = t*(i+1); }); }
  if (lights.ring) lights.ring.rotation.z += dt*0.6; if (lights.sea) lights.sea.position.y = 0.05 + Math.sin(t)*0.05;
  if (camGoal && t > introUntil){ const kc = 1 - Math.exp(-4*Math.min(0.1, dt)); cam.position.lerp(camGoal, kc); camBase.lerp(camLook, kc); }
  if (camBase){ const s = MOTION ? shake : 0; shake *= 0.9; const off = V3((Math.random()-.5)*s, (Math.random()-.5)*s, 0); cam.position.add(FXS.camOff); cam.lookAt(camBase.clone().add(off)); }
  renderFrame(); cam.position.sub(FXS.camOff);
}
return {downHero, reviveHero, endCut, dbg:{env:v => { scene.environment = v ? ENV : null; }, post:v => { if (post) post.on = v; else if (v) postInit(); }, q:setQuality, get state(){ return post; }, get R(){ return R; }, get scene(){ return scene; }, get envTex(){ return ENV; }}, flashScreen, slowMo, camKick, FXS, victory, gallery, setMotion: v => { MOTION = v; }, init, setScene, setEnemies, setHeroes, heroAttack, heroAct, enemyAttack, foeMove, hitEnemy, hitHero, healFx, killEnemy, openChest, screenPos, updateHero, equipFx, fx, frame, resize, get ready(){ return !!R; }, get heroIds(){ return heroOrder.slice(); }};
})();
