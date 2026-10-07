/* ===== Essay Quest v7 — renderer extensions: post-processing, environment light, camera feel, effect state ===== */
const LIGHT7 = {zeusprime:0x9fd0ff, atlas:0x6ad8ff, trainer:0xff5a4a, mechashogun:0x40e0ff, vampire:0xff2040, horseman:0x80e8e0, kaiju:0x40d0ff, leviathan:0x60c0ff, pharaohprime:0xffc83a, dragonemp:0xff6a30,
  batgrin:0x7dff3a, suntyrant:0xff6a10, moonavatar:0x9fb8ff, madtitan:0xb04aff, darklord:0xff7a1a, sinicon:0xff2a10, firebird:0xff5a10, cthulhu:0x60ffb0, devourer:0x7a6aff, zalgo:0xff1a2a, healer:0xc0e0ff};
const LIGHTCSS7 = {};
for (const k in LIGHT7){ const c = LIGHT7[k]; LIGHTCSS7[k] = `rgba(${c>>16&255},${c>>8&255},${c&255},.26)`; }

/* ---------- effect state: gameplay code pokes these, the loop decays them ---------- */
const FXS = {flash:0, flashCol:new THREE.Color(1,1,1), ca:0.0007, caBase:0.0007, glitch:0, vig:0.5, sat:1.1, tint:new THREE.Color(1,1,1), slow:1, slowUntil:0, fov:38, fovKick:0, camOff:new THREE.Vector3(), camVel:new THREE.Vector3(), warp:0};
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
    post.mFinal = new THREE.ShaderMaterial({vertexShader:POST_VS, depthTest:false, depthWrite:false, toneMapped:true, uniforms:{tColor:{value:null}, tBloom:{value:null}, tBloom2:{value:null}, tDepth:{value:null}, uRes:{value:new THREE.Vector2(1, 1)}, uNear:{value:0.1}, uFar:{value:200}, uBloom:{value:0.85}, uVig:{value:0.5}, uCA:{value:0.0007}, uFlash:{value:0}, uGlitch:{value:0}, uTime:{value:0}, uSat:{value:1.1}, uCon:{value:1.04}, uOutline:{value:1}, uGrain:{value:0.025}, uFlashCol:{value:new THREE.Color(1,1,1)}, uOutCol:{value:new THREE.Color(0x12082a)}, uTint:{value:new THREE.Color(1,1,1)}, uWarp:{value:0}},
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
    const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, 'rgb(86,112,160)'); gr.addColorStop(0.46, 'rgb(190,182,166)'); gr.addColorStop(0.52, 'rgb(120,116,104)'); gr.addColorStop(1, 'rgb(44,48,38)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 128);
    const spot = (x, y, r, col) => { const rr = g.createRadialGradient(x, y, 0, x, y, r); rr.addColorStop(0, col); rr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rr; g.fillRect(0, 0, 256, 128); };
    spot(60, 34, 28, 'rgba(255,244,220,1)'); spot(190, 60, 34, 'rgba(120,150,255,.8)'); spot(128, 20, 40, 'rgba(160,190,255,.55)');
    const tx = new THREE.CanvasTexture(c); const sky = new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), new THREE.MeshBasicMaterial({map:tx, side:THREE.BackSide})); sc.add(sky);
    ENV = pm.fromScene(sc, 0.02).texture; sky.geometry.dispose(); sky.material.dispose(); } catch (err){ console.warn('env map failed', err); ENV = null; } return ENV; }

/* ---------- per-frame upkeep for the effect state (camera springs, flashes, glitch decay) ---------- */
let envFx = null;   // ambient particle systems of the current scene
function resetEnvFx(){ envFx = null; FXS.glitch = 0; FXS.flash = 0; FXS.fovKick = 0; FXS.warp = 0; FXS.tint.set(0xffffff); FXS.sat = 1.28; FXS.vig = 0.5; FXS.ca = FXS.caBase; FXS.camOff.set(0,0,0); FXS.camVel.set(0,0,0); }
function stepFx(dt0, dt){ const k = Math.pow(0.001, dt0);   // 0.001^dt: fast exponential decay
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
  const outerSet = DATA.OUTER_BOSSES || []; const isFinal = theme === 6 && top.length === 1 && enemies.length === 3 && !outerSet.includes(top[0].key);
  const seq = top.slice(0, 2).map(e => { const kit = (DATA.BOSSKIT || {})[e.key]; const c = isFinal ? DATA.FINAL_CUT : kit && kit.intro ? kit.intro : (DATA.CUTSCENES || {})[e.key]; return {e, title:c ? c[0] : String(e.name).toUpperCase(), line:c ? c[1] : '', tag:kit && kit.tag || ''}; });
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
