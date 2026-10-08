

CORE.setEXP([[[9,48],[9,65],[15,86],[19,104],[24,123],[27,141],[32,157],[37,177],[45,207],[52,232],[63,258],[73,283],[84,306],[92,330],[99,355],[110,396],[120,440],[131,470],[145,501],[159,537],[181,581],[198,615],[215,650],[236,692],[257,730],[282,766],[307,804],[329,840],[352,884],[382,919]],[[397,917],[418,937],[438,957],[460,978],[486,1001],[513,1019],[542,1040],[571,1066],[603,1087],[634,1114],[678,1153],[711,1178],[751,1210],[786,1236],[827,1265],[866,1292],[909,1327],[954,1359],[999,1394],[1045,1428],[1120,1477],[1172,1515],[1217,1549],[1275,1592],[1330,1629],[1396,1676],[1461,1712],[1525,1756],[1580,1807],[1665,1843]],[[1674,1821],[1725,1843],[1779,1871],[1840,1893],[1903,1917],[1975,1943],[2041,1968],[2099,1998],[2173,2025],[2248,2056],[2351,2096],[2440,2121],[2507,2143],[2591,2186],[2665,2221],[2761,2247],[2846,2291],[2941,2325],[3041,2362],[3135,2404],[3270,2448],[3373,2488],[3496,2540],[3619,2578],[3730,2624],[3849,2674],[3975,2709],[4105,2753],[4239,2797],[4367,2844]],[[4355,2804],[4463,2830],[4555,2857],[4668,2880],[4773,2907],[4867,2936],[4978,2962],[5086,2996],[5204,3024],[5335,3056],[5512,3093],[5637,3128],[5751,3156],[5890,3183],[6017,3215],[6160,3252],[6302,3287],[6453,3323],[6604,3359],[6751,3401],[6972,3439],[7136,3485],[7304,3536],[7487,3576],[7659,3628],[7819,3664],[8017,3708],[8215,3761],[8386,3805],[8581,3850]]]);
/* ===== Essay Quest v7 — ASM: build detailed models from compact part lists =====
   A part is a plain object: {k:'box|cyl|cone|sph|tor|oct|ico|glow|plane|ring|lathe|tube', d:[dims], p:[x,y,z], r:[rx,ry,rz], s:[sx,sy,sz], c:colour,
   e:emissive colour, ei:emissive intensity, mt:metalness, rg:roughness, op:opacity, fl:flat shading, ds:double side, mir:true (also build the mirrored copy at -x),
   an:{t:'spin|orbit|bob|pulse|wing|sway|flicker|hover', ...}, g:[child parts]}.  Used for the Promised / Outerversal gear, the new bosses and their minions. */
const ASM = (() => {
const SPRC = {};
function glowTex(color){ if (SPRC[color]) return SPRC[color]; const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const r = g.createRadialGradient(32,32,1,32,32,32); r.addColorStop(0,'rgba(255,255,255,1)'); r.addColorStop(0.3, color); r.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0,0,64,64); const tx = new THREE.CanvasTexture(c); SPRC[color] = tx; return tx; }
const css = (n, a=0.9) => typeof n === 'string' ? n : `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`;
const MATS = {};
function mat(p){ const key = [p.c, p.e, p.ei, p.mt, p.rg, p.op, p.fl, p.ds, p.bs, p.add].join('|'); if (MATS[key]) return MATS[key];
  const o = {color: p.c != null ? p.c : 0x888888, roughness: p.rg != null ? p.rg : 0.55, metalness: p.mt != null ? p.mt : 0.08};
  if (p.e != null){ o.emissive = p.e; o.emissiveIntensity = p.ei != null ? p.ei : 1; } if (p.op != null && p.op < 1){ o.transparent = true; o.opacity = p.op; } if (p.fl) o.flatShading = true; if (p.ds) o.side = THREE.DoubleSide;
  const m = p.bs ? new THREE.MeshBasicMaterial({color:o.color, transparent:!!o.transparent, opacity:o.opacity != null ? o.opacity : 1, side:o.side, blending: p.add ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: !p.add}) : new THREE.MeshStandardMaterial(o); return (MATS[key] = m); }
function geo(p){ const d = p.d || [1]; switch (p.k){
  case 'box': return new THREE.BoxGeometry(d[0], d[1], d[2]);
  case 'cyl': return new THREE.CylinderGeometry(d[0], d[1], d[2], d[3] || 14, 1, !!d[4]);
  case 'cone': return new THREE.ConeGeometry(d[0], d[1], d[2] || 10);
  case 'sph': return new THREE.SphereGeometry(d[0], d[1] || 14, d[2] || 10, 0, d[3] != null ? d[3] : Math.PI*2, 0, d[4] != null ? d[4] : Math.PI);
  case 'tor': return new THREE.TorusGeometry(d[0], d[1], d[3] || 6, d[4] || 24, d[2] != null ? d[2] : Math.PI*2);
  case 'oct': return new THREE.OctahedronGeometry(d[0], d[1] || 0);
  case 'ico': return new THREE.IcosahedronGeometry(d[0], d[1] || 0);
  case 'dod': return new THREE.DodecahedronGeometry(d[0], d[1] || 0);
  case 'plane': return new THREE.PlaneGeometry(d[0], d[1]);
  case 'ring': return new THREE.RingGeometry(d[0], d[1], d[2] || 32, 1, 0, d[3] != null ? d[3] : Math.PI*2);
  case 'lathe': { const pts = []; for (let i = 0; i < d.length; i += 2) pts.push(new THREE.Vector2(d[i], d[i+1])); return new THREE.LatheGeometry(pts, p.seg || 14); }
  case 'tube': { const pts = (p.pts || []).map(q => new THREE.Vector3(q[0], q[1], q[2])); return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), p.seg || 16, d[0] || 0.1, d[1] || 6, false); }
  case 'prism': return new THREE.CylinderGeometry(d[0], d[1] != null ? d[1] : d[0], d[2], d[3] || 6);
  } return new THREE.BoxGeometry(0.2, 0.2, 0.2); }
function one(p, parent, anims, sx=1){ let o;
  if (p.k === 'glow'){ const sp = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(css(p.c != null ? p.c : 0xffffff, p.a != null ? p.a : 0.9)), blending:THREE.AdditiveBlending, transparent:true, depthWrite:false, opacity: p.op != null ? p.op : 1})); const z = (p.d && p.d[0]) || 1; sp.scale.set(z, z, z); o = sp; }
  else if (p.k === 'grp'){ o = new THREE.Group(); }
  else { o = new THREE.Mesh(geo(p), mat(p)); o.castShadow = !p.nos && !(p.op != null && p.op < 0.5); }
  const P = p.p || [0,0,0]; o.position.set(P[0]*sx, P[1], P[2]); if (p.r) o.rotation.set(p.r[0], p.r[1]*sx, p.r[2]*sx); if (p.s) o.scale.set(p.s[0], p.s[1], p.s[2]); if (p.q) o.quaternion.set(p.q[0], p.q[1], p.q[2], p.q[3]);
  if (p.an){ const a = Object.assign({ph: Math.random()*6.28}, p.an); a.base = {p: o.position.clone(), r: o.rotation.clone(), s: o.scale.clone()}; a.sx = sx; o.userData.an = a; anims.push(o); }
  if (p.name) o.name = p.name; if (p.tip) o.userData.tipHere = true;
  parent.add(o); if (p.g) for (const c of p.g) add(c, o, anims, sx); return o; }
function add(p, parent, anims, sx=1){ const a = one(p, parent, anims, sx); if (p.mir){ one(Object.assign({}, p, {mir:false}), parent, anims, -sx); } return a; }
function build(parts, parent, anims){ anims = anims || []; for (const p of parts) add(p, parent, anims, 1); return anims; }
/* per-frame motion for animated parts */
function tick(anims, t, dt){ if (!anims) return; for (const o of anims){ const a = o.userData.an; if (!a) continue; const b = a.base, w = t*(a.v || 1) + a.ph;
  switch (a.t){
    case 'spin': { const ax = a.ax || 'y'; o.rotation[ax] = b.r[ax] + t*(a.v || 1)*(a.sx || 1) + a.ph; break; }
    case 'orbit': { const R = a.R || 2, ph = w; o.position.set(b.p.x + Math.cos(ph)*R, b.p.y + (a.y != null ? Math.sin(ph*(a.f || 1.3))*a.y : 0), b.p.z + Math.sin(ph)*(a.Rz != null ? a.Rz : R)); if (a.face) o.rotation.y = -ph; break; }
    case 'bob': o.position.y = b.p.y + Math.sin(w)*(a.a || 0.2); break;
    case 'hover': o.position.y = b.p.y + Math.sin(w)*(a.a || 0.2); o.rotation.y = b.r.y + Math.sin(w*0.5)*0.15; break;
    case 'pulse': { const k = 1 + Math.sin(w)*(a.a || 0.1); o.scale.set(b.s.x*k, b.s.y*k, b.s.z*k); break; }
    case 'wing': o.rotation.z = b.r.z + Math.sin(w)*(a.a || 0.4)*(a.sx || 1); break;
    case 'wingx': o.rotation.x = b.r.x + Math.sin(w)*(a.a || 0.4); break;
    case 'sway': o.rotation.z = b.r.z + Math.sin(w)*(a.a || 0.1); o.rotation.x = b.r.x + Math.cos(w*0.8)*(a.a || 0.1)*0.6; break;
    case 'flicker': if (o.material && o.material.opacity != null) o.material.opacity = (a.lo != null ? a.lo : 0.4) + (0.6 - (a.lo != null ? a.lo : 0.4)*0.0)*(0.5 + 0.5*Math.sin(w*3 + Math.sin(w*7))); break;
    case 'rise': { const k = (t*(a.v || 0.5) + a.ph) % 1; o.position.y = b.p.y + k*(a.h || 3); if (o.material) o.material.opacity = Math.sin(k*Math.PI)*(a.o != null ? a.o : 0.9); break; }
    case 'drift': { o.position.x = b.p.x + Math.sin(w)*(a.a || 0.3); o.position.z = b.p.z + Math.cos(w*0.8)*(a.a || 0.3); break; }
    case 'glitch': { if (Math.random() < 0.04){ o.position.x = b.p.x + (Math.random()-.5)*(a.a || 0.6); o.position.y = b.p.y + (Math.random()-.5)*(a.a || 0.3); } else { o.position.x += (b.p.x - o.position.x)*0.3; o.position.y += (b.p.y - o.position.y)*0.3; } break; }
  } } }
return {build, add, tick, glowTex, css};
})();
