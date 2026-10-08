
/* ===== Essay Quest v3 — procedural music + sound effects (WebAudio) ===== */
const SND = (() => {
let MV = 0.55, SV = 0.8; let ac = null, master = null, musicBus = null, sfxBus = null, cur = null, timer = null, step = 0, nextT = 0, muted = false, noiseBuf = null;
try { muted = localStorage.getItem('eq_mute') === '1'; } catch(e){}
const mtof = m => 440 * Math.pow(2, (m - 69)/12);
function ensure(){
  if (ac) { if (ac.state === 'suspended') ac.resume(); return true; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
  ac = new AC(); master = ac.createGain(); master.gain.value = muted ? 0 : 0.5; master.connect(ac.destination);
  musicBus = ac.createGain(); musicBus.gain.value = MV; musicBus.connect(master); sfxBus = ac.createGain(); sfxBus.gain.value = SV; sfxBus.connect(master);
  noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); const d = noiseBuf.getChannelData(0); for (let i=0;i<d.length;i++) d[i] = Math.random()*2-1;
  return true;
}
function env(g, t, a, peak, d, sus=0.0001){ g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(Math.max(0.0001, sus), t + a + d); }
function osc(type, f, t, dur, vol, bus, opts={}){ const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (opts.to) o.frequency.exponentialRampToValueAtTime(opts.to, t + dur);
  if (opts.detune) o.detune.value = opts.detune; let node = o;
  if (opts.lp){ const f2 = ac.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = opts.lp; f2.Q.value = opts.q || 0.7; o.connect(f2); node = f2; }
  node.connect(g); g.connect(bus || musicBus); env(g, t, opts.a || 0.005, vol, dur); o.start(t); o.stop(t + dur + 0.05); }
function noise(t, dur, vol, type, freq, bus){ const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = noiseBuf; f.type = type; f.frequency.value = freq; s.connect(f); f.connect(g); g.connect(bus || musicBus); env(g, t, 0.002, vol, dur); s.start(t, Math.random()*0.5); s.stop(t + dur + 0.05); }
const kick = (t, v=0.9) => osc('sine', 150, t, 0.28, v, musicBus, {to:40});
const snare = (t, v=0.35) => { noise(t, 0.16, v, 'bandpass', 1800); osc('triangle', 190, t, 0.08, v*0.5); };
const hat = (t, v=0.12) => noise(t, 0.04, v, 'highpass', 7000);
const tom = (t, f, v=0.5) => osc('sine', f, t, 0.3, v, musicBus, {to:f*0.5});
// chord helper: root midi + quality
const CH = (r, q) => q==='m' ? [r, r+3, r+7] : q==='d' ? [r, r+3, r+6] : [r, r+4, r+7];
const TRACKS = {
  title:{bpm:112, prog:[[60,''],[67,''],[69,'m'],[65,'']], drums:'light', arp:'up', lead:[72,74,76,79, 77,76,74,72, 76,74,72,71, 72,0,0,0]},
  map:{bpm:104, prog:[[62,''],[69,''],[71,'m'],[67,'']], drums:'light', arp:'up'},
  camp:{bpm:70, prog:[[57,'m'],[53,''],[60,''],[55,'']], drums:'none', arp:'pluck', crackle:true},
  quest:{bpm:84, prog:[[57,'m'],[60,''],[55,''],[62,'m']], drums:'soft', arp:'pluck'},
  battle:{bpm:142, prog:[[50,'m'],[46,''],[48,''],[45,'']], drums:'drive', arp:'fast', bass:'eighths'},
  boss:{bpm:152, prog:[[48,'m'],[49,''],[48,'m'],[46,'']], drums:'heavy', arp:'fast', bass:'eighths', choir:true, lead:[72,0,75,0, 74,0,71,0, 72,0,79,78, 75,0,74,0]}};
function playStep(tr, s, t){
  const bar = Math.floor(s/16) % tr.prog.length, st = s % 16; const [root, q] = tr.prog[bar]; const ch = CH(root, q); const sp = 60/tr.bpm/4;
  if (st === 0){ ch.forEach((n, i) => osc('sawtooth', mtof(n), t, sp*16, tr.choir ? 0.05 : 0.03, musicBus, {lp: tr.choir ? 1400 : 900, a: 0.25, detune: i*6-6})); if (tr.choir) ch.forEach(n => osc('sawtooth', mtof(n+12), t, sp*16, 0.025, musicBus, {lp:2200, a:0.4, detune:8})); }
  if (tr.bass === 'eighths'){ if (st % 2 === 0) osc('square', mtof(root-12), t, sp*1.6, 0.12, musicBus, {lp:600}); }
  else if (st % 8 === 0) osc('triangle', mtof(root-12), t, sp*7, 0.18);
  const arpN = [...ch, ch[0]+12];
  if (tr.arp === 'up' && st % 2 === 0) osc('triangle', mtof(arpN[(st/2)%4] + 12), t, sp*1.8, 0.06);
  if (tr.arp === 'fast') osc('square', mtof(arpN[st%4] + 12), t, sp*0.9, 0.035, musicBus, {lp:2400});
  if (tr.arp === 'pluck' && st % 2 === 0){ const n = arpN[[0,1,2,3,2,1,0,1][(st/2)%8]] + 12; osc('triangle', mtof(n), t, sp*5, 0.08); osc('sine', mtof(n+12), t, sp*3, 0.02); }
  if (tr.lead){ const n = tr.lead[st]; if (n && bar % 2 === 1) osc(tr.choir ? 'sawtooth' : 'square', mtof(n), t, sp*1.8, tr.choir ? 0.05 : 0.04, musicBus, {lp: 2600}); }
  const d = tr.drums;
  if (d === 'light'){ if (st % 8 === 0) kick(t, 0.5); if (st % 4 === 2) hat(t, 0.06); if (st === 12) snare(t, 0.15); }
  if (d === 'soft'){ if (st === 0) kick(t, 0.35); if (st % 4 === 2) hat(t, 0.04); }
  if (d === 'drive'){ if (st % 4 === 0) kick(t); if (st % 8 === 4) snare(t); if (st % 2 === 1) hat(t); if (st === 14 && bar === 3) snare(t, 0.3); }
  if (d === 'heavy'){ if (st % 4 === 0 || st === 10) kick(t, 1); if (st % 8 === 4) snare(t, 0.45); hat(t, 0.08); if (bar === 3 && st >= 12) tom(t, 120 - (st-12)*15); }
  if (tr.crackle && Math.random() < 0.35) noise(t, 0.02, 0.05 + Math.random()*0.05, 'highpass', 3000);
}
function music(name){
  if (!ensure()) return; if (cur === name) return; cur = name; const tr = TRACKS[name];
  clearInterval(timer); if (!tr) return; step = 0; nextT = ac.currentTime + 0.1;
  const fade = musicBus.gain; fade.cancelScheduledValues(ac.currentTime); fade.setValueAtTime(0.0001, ac.currentTime); fade.linearRampToValueAtTime(MV, ac.currentTime + 0.8);
  timer = setInterval(() => { const sp = 60/tr.bpm/4; while (nextT < ac.currentTime + 0.15){ playStep(tr, step, nextT); nextT += sp; step++; } }, 30);
}
function sfx(k){
  if (!ensure()) return; const t = ac.currentTime + 0.01; const B = sfxBus;
  if (k==='hit'){ noise(t, 0.08, 0.5, 'lowpass', 1200, B); osc('square', 180, t, 0.08, 0.15, B, {to:90}); }
  if (k==='crit'){ noise(t, 0.14, 0.6, 'lowpass', 2400, B); osc('square', 520, t, 0.18, 0.2, B, {to:180}); osc('triangle', 1040, t+0.05, 0.15, 0.15, B); }
  if (k==='hurt'){ osc('sawtooth', 220, t, 0.2, 0.2, B, {to:80, lp:900}); noise(t, 0.1, 0.3, 'lowpass', 600, B); }
  if (k==='heal'){ [72,76,79,84].forEach((n,i) => osc('sine', mtof(n), t + i*0.06, 0.25, 0.12, B)); }
  if (k==='pass'){ [76,79,84].forEach((n,i) => osc('triangle', mtof(n), t + i*0.08, 0.3, 0.16, B)); }
  if (k==='perfect'){ [72,76,79,84,88].forEach((n,i) => osc('triangle', mtof(n), t + i*0.07, 0.4, 0.16, B)); noise(t+0.3, 0.3, 0.1, 'highpass', 8000, B); }
  if (k==='fail'){ osc('square', 196, t, 0.18, 0.1, B, {lp:800}); osc('square', 147, t + 0.16, 0.3, 0.1, B, {lp:800}); }
  if (k==='coin'){ osc('square', 988, t, 0.06, 0.08, B); osc('square', 1319, t + 0.06, 0.18, 0.08, B); }
  if (k==='chest'){ [60,64,67,72,76,79].forEach((n,i) => osc('triangle', mtof(n), t + i*0.07, 0.35, 0.13, B)); }
  if (k==='click'){ osc('triangle', 880, t, 0.04, 0.05, B); }
  if (k==='skill'){ osc('sawtooth', 300, t, 0.3, 0.12, B, {to:900, lp:3000}); noise(t, 0.3, 0.2, 'bandpass', 2500, B); }
  if (k==='dodge'){ noise(t, 0.15, 0.2, 'highpass', 3000, B); }
  if (k==='boss'){ osc('sawtooth', 55, t, 1.6, 0.3, B, {lp:400}); osc('sawtooth', 58, t, 1.6, 0.25, B, {lp:400}); kick(t); }
  if (k==='win'){ music(null); [67,72,76,79,84].forEach((n,i) => osc('square', mtof(n), t + i*0.11, i===4 ? 0.7 : 0.14, 0.12, B, {lp:3000})); cur = null; }
  if (k==='lose'){ music(null); [67,63,60,55].forEach((n,i) => osc('triangle', mtof(n), t + i*0.25, 0.4, 0.15, B)); cur = null; }
  if (k==='level'){ [60,67,72,76,79,84].forEach((n,i) => osc('square', mtof(n), t + i*0.05, 0.2, 0.08, B, {lp:4000})); }
}
function stop(){ clearInterval(timer); cur = null; }
function toggle(){ muted = !muted; try { localStorage.setItem('eq_mute', muted ? '1' : '0'); } catch(e){} if (master) master.gain.value = muted ? 0 : 0.5; return muted; }
function setVol(m, s, mute){ muted = !!mute; if (master) master.gain.value = muted ? 0 : 0.5; MV = m; SV = s; if (musicBus) musicBus.gain.value = m; if (sfxBus) sfxBus.gain.value = s; }
return {setVol, music: n => { if (n === null){ clearInterval(timer); cur = null; return; } music(n); }, sfx, stop, toggle, get muted(){ return muted; }, ensure};
})();
