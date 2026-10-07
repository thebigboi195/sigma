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
function resetEnvFx(){ envFx = null; FXS.glitch = 0; FXS.flash = 0; FXS.fovKick = 0; FXS.warp = 0; FXS.tint.set(0xffffff); FXS.sat = 1.1; FXS.vig = 0.5; FXS.ca = FXS.caBase; FXS.camOff.set(0,0,0); FXS.camVel.set(0,0,0); }
function stepFx(dt0, dt){ const k = Math.pow(0.001, dt0);   // 0.001^dt: fast exponential decay
  FXS.flash *= Math.pow(0.0005, dt0); if (FXS.flash < 0.004) FXS.flash = 0; FXS.glitch *= Math.pow(0.06, dt0); if (FXS.glitch < 0.004) FXS.glitch = 0; FXS.ca += (FXS.caBase - FXS.ca)*Math.min(1, dt0*6);
  const a = FXS.camVel, o = FXS.camOff; o.addScaledVector(a, dt0); a.addScaledVector(o, -60*dt0).multiplyScalar(Math.pow(0.02, dt0)); if (!MOTION){ o.set(0,0,0); a.set(0,0,0); }
  FXS.fovKick *= Math.pow(0.004, dt0); const f = FXS.fov + FXS.fovKick; if (Math.abs(cam.fov - f) > 0.02 && mode !== 'gallery'){ cam.fov = f; cam.updateProjectionMatrix(); } }
