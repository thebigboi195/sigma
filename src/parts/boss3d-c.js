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
