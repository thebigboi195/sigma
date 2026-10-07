/* ===== Essay Quest v7 data (B): ★7 Promised gear (famous leaders) and ★10 Outerversal gear (beyond every universe) =====
   Every item is spec-driven: `spec` is a parts list (see ASM) so every set looks different. Weapons are built along +Y from the grip;
   armour parts are given per body area (head / body / armL / armR / back / legs), in the same space the rest of the hero uses.
   Items are deliberately MID-MAXED: huge strengths with real downsides. Names are homages / parodies of public-domain history, folklore and pop myth. */
(() => {
const D = DATA, PI = Math.PI;
const M = (k, d, p, c, o) => Object.assign({k, d, p, c}, o || {});
const bx = (d, p, c, o) => M('box', d, p, c, o), cy = (d, p, c, o) => M('cyl', d, p, c, o), cn = (d, p, c, o) => M('cone', d, p, c, o), sp = (d, p, c, o) => M('sph', d, p, c, o), to = (d, p, c, o) => M('tor', d, p, c, o),
      oc = (d, p, c, o) => M('oct', d, p, c, o), gl = (d, p, c, o) => M('glow', d, p, c, o), pl = (d, p, c, o) => M('plane', d, p, c, o);
const met = (c, o) => Object.assign({mt:0.85, rg:0.25, c}, o || {}), emi = (e, i) => ({e, ei:i || 1.2});
const GOLD = 0xe3b53a, SILV = 0xdfe6ee, STEEL = 0x9aa6b5, WOOD = 0x6a4422, RED = 0xc4161c, BLUE = 0x1c3f7a, WHITE = 0xf4f1e8, BLACK = 0x15151a;
const ring = (n, f) => Array.from({length:n}, (_, i) => f(i, n));
const E = (o, e, i) => Object.assign(o, {e, ei:i || 1.2});
const W = [], A = [];   // weapons, armour

/* ================= ★7 PROMISED: world leaders ================= */
// [key, name, kind, arch|role, rarity, origin, lore, abilities (+downsides), down (single legacy slot), fx, spec]
// ---- 1. Supreme Leader (a loving parody): TANK ----
W.push(['rocket_pointer','Great Pointer of the Glorious Missile','weapon','staff',5,'Hermit Kingdom (parody)','A ceremonial pointer, a model rocket and an unreasonable amount of confidence. Fire it and the whole room applauds, because it is mandatory.',
  [['burn',65],['chain',55],['quake',45],['amp',22],['selfburn',12],['shortsight',10]], null, 'fire',
  {b:'parts', hold:'staff', tip:5.4, mod:0.9, parts:[cy([0.07,0.08,4.8],[0,1.0,0],0x1b1b1f,{mt:0.6}), cy([0.1,0.1,0.55],[0,-0.25,0],0x8a1a22), to([0.13,0.035],[0,0.5,0],GOLD,met(GOLD,{r:[PI/2,0,0]})), to([0.13,0.035],[0,1.6,0],GOLD,met(GOLD,{r:[PI/2,0,0]})),
    cy([0.32,0.32,1.7],[0,3.95,0],0xececf0,{mt:0.5,rg:0.3}), cn([0.32,0.8,14],[0,5.2,0],0xd81f2a), cy([0.33,0.33,0.12],[0,3.4,0],0xd81f2a), cy([0.33,0.33,0.12],[0,4.5,0],0xd81f2a),
    ...ring(3,(i)=>bx([0.06,0.8,0.55],[Math.cos(i*2.094)*0.45,3.3,Math.sin(i*2.094)*0.45],0xd81f2a,{r:[0,-i*2.094,0]})),
    oc([0.12],[0,4.0,0.33],0xffd54a,{e:0xffd54a,ei:1.2,s:[1,1,0.4]}), gl([1.8],[0,2.9,0],'rgba(255,140,30,.9)',{an:{t:'pulse',a:0.25,v:7}}), gl([0.9],[0,2.6,0],'rgba(255,240,170,.95)',{an:{t:'pulse',a:0.3,v:11}}),
    ...ring(4,(i)=>gl([0.7],[(i%2?0.15:-0.15),2.4,0],'rgba(180,180,190,.6)',{an:{t:'rise',v:0.7,h:2.2,o:0.6}}))]}]);
A.push(['supreme_beard_plate','Supreme Beard Plate','armour','plate',5,'Hermit Kingdom (parody)','Forged in the Great Forge, polished by the Great Polisher. The beard alone turns arrows; the confidence turns everything else.',
  [['ward',40],['thorns',48],['taunt',240],['bulwark',12],['lastStand',1],['regen',3],['clumsy',22],['tired',5],['slowskill',1]], null, 'bronze',
  {c:0x4b5443,t:0xd4af37,cape:0x7a1220,head:'custom',mod:1.4,big:1,parts:{
    head:[ // swept hair, mao-style cap, shades, and THE BEARD
      bx([1.5,0.5,1.5],[0,0.7,-0.02],0x0e0e10), bx([1.2,0.12,0.5],[0,0.42,0.55],0x0e0e10), cy([0.78,0.78,0.5],[0,0.78,0],0x4b5443,{rg:0.7}), cy([0.9,0.9,0.12],[0,0.55,0.1],0x3a4234,{s:[1,1,1.15]}), oc([0.14],[0,0.72,0.78],0xd81f2a,{e:0xd81f2a,ei:1.4,s:[1,1,0.5]}),
      bx([1.1,0.22,0.1],[0,0.1,0.72],0x050505,met(0x050505,{mt:0.5})),
      ...ring(14,(i,n)=>sp([0.34+((i*7)%5)*0.03,10,8],[Math.sin(i*1.9)*0.7,-0.55-(i%4)*0.28,0.5+((i%3)*0.12)],0x0a0a0c,{rg:0.95})), sp([0.6,10,8],[0,-0.9,0.45],0x111114,{rg:0.95,s:[1.25,1.3,0.8]}), sp([0.35,8,6],[0,-0.1,0.78],0x3a2a22)],
    body:[ // medals, sash, epaulettes, buckle
      bx([2.1,0.28,1.05],[0,2.15,0],0x1a1a1a), oc([0.26],[0,2.15,0.58],GOLD,{e:GOLD,ei:0.7,s:[1,1,0.4]}), bx([0.3,2.2,0.08],[0.5,3.05,0.53],0xb01a2a,{r:[0,0,0.6]}),
      ...ring(7,(i)=>cy([0.13,0.13,0.05],[-0.75+(i%4)*0.26,3.6-Math.floor(i/4)*0.3,0.55],GOLD,Object.assign(met(GOLD),{r:[PI/2,0,0]}))), ...ring(7,(i)=>bx([0.07,0.22,0.03],[-0.75+(i%4)*0.26,3.78-Math.floor(i/4)*0.3,0.54],[0xc4161c,0x1c3f7a,0xf4f4f4][i%3])),
      bx([2.3,0.5,1.25],[0,4.0,-0.02],0x4b5443,{mt:0.5}), ...[-1,1].flatMap(sx=>[bx([1.1,0.18,1.15],[sx*1.4,4.12,0],GOLD,met(GOLD)), ...ring(6,(i)=>cy([0.03,0.03,0.5],[sx*(0.95+i*0.2),3.82,0.5],GOLD,met(GOLD)))])],
    back:[ pl([2.2,3.2],[0,2.6,-0.62],0x8a1226,{ds:1,r:[0,PI,0]}), oc([0.5],[0,3.0,-0.66],GOLD,{e:GOLD,ei:0.5,s:[1,1,0.15]}) ]}}]);

// ---- 2. The Great Emancipator: SUPPORT ----
W.push(['rail_splitter_axe','Honest Rail-Splitter’s Axe','weapon','heavy',5,'American (folk)','Split a thousand rails and never told a lie about the length of one. The axe is honest too: it hits exactly as hard as it says it does.',
  [['double',40],['stun',32],['lifesteal',28],['amp',30],['execute',70],['clumsy',12],['slowskill',1]], null, 'holy',
  {b:'parts', hold:'heavy', tip:2.6, parts:[cy([0.085,0.1,3.0],[0,0.9,0],0x7a4e2a,{rg:0.85}), ...ring(3,(i)=>to([0.11,0.025],[0,-0.1+i*0.28,0],[RED,WHITE,BLUE][i],{r:[PI/2,0,0]})), cy([0.18,0.2,0.4],[0,2.15,0],0x9b9b9f,met(0x5b5b60)),
    bx([0.18,1.1,0.5],[0.2,2.35,0],0xaab4c2,met(0xaab4c2,{mt:0.9})), bx([0.12,1.05,0.5],[0.5,2.35,0],0xf2f6fb,met(0xf2f6fb,{e:0x9ab8ff,ei:0.25})), cn([0.32,0.5,4],[0.72,2.35,0],0xf2f6fb,{r:[0,0,-PI/2],s:[1,1,0.3]}), oc([0.12],[0.22,2.35,0.27],GOLD,{e:GOLD,ei:1,s:[1,1,0.3]}),
    cn([0.12,0.5,4],[-0.18,2.35,0],0x7a7a80,{r:[0,0,PI/2]}), gl([1.4],[0.5,2.35,0],'rgba(255,240,180,.55)',{an:{t:'pulse',a:0.15,v:3}})]}]);
A.push(['emancipator_frock','Frock Coat of the Great Emancipator','armour','robe',5,'American (folk)','A black coat, a tall hat and a stubbornly kind heart. Every ally who stands behind it feels a little taller.',
  [['regen',6],['mend',9],['bulwark',14],['warcry',11],['phoenix',45],['maxhp',22],['fragile',15]], null, 'holy',
  {c:0x1d1d26,t:0xc9a227,cape:0x5a5a64,head:'custom',noCape:1,mod:0.85,parts:{
    head:[cy([0.64,0.64,1.8,16],[0,1.55,0],0x0e0e12,{rg:0.4}), cy([1.1,1.1,0.1,20],[0,0.66,0],0x0e0e12), cy([0.66,0.66,0.2,16],[0,0.95,0],0x7a1f1f), bx([1.45,0.5,1.45],[0,0.45,-0.05],0x1a120c), bx([0.3,1.0,0.3],[0,-0.55,0.52],0x14100c), bx([0.9,0.2,0.3],[0,-0.28,0.58],0x14100c),
      ...ring(5,(i)=>cn([0.1,0.55,4],[-0.35+i*0.18,-0.75,0.5],0x14100c,{r:[PI,0,0]}))],
    body:[bx([1.1,2.0,0.1],[0,3.0,0.52],0xf3f0e6), bx([0.5,0.22,0.1],[0,3.85,0.58],0x0f0f12), bx([0.12,0.12,0.12],[0,3.85,0.62],0x0f0f12,{r:[0,0,PI/4]}), ...ring(2,(i)=>cy([0.07,0.07,0.04],[0,3.3-i*0.45,0.6],GOLD,Object.assign(met(GOLD),{r:[PI/2,0,0]}))),
      ...ring(7,(i)=>sp([0.05,6,5],[-0.45+i*0.075,3.1-Math.sin(i/6*PI)*0.35,0.62],GOLD,met(GOLD))), sp([0.1,8,6],[-0.45,3.05,0.62],GOLD,met(GOLD)), bx([2.4,0.5,1.25],[0,4.0,-0.02],0x5a5a64,{rg:0.95}), oc([0.09],[0.62,3.7,0.58],0x2a6bd8,{e:0x2a6bd8,ei:1}),
      bx([2.0,1.9,0.12],[0,0.7,0.42],0x1d1d26), ...[-1,1].map(sx=>bx([0.9,2.2,0.1],[sx*0.55,0.9,-0.5],0x1d1d26,{r:[0.08,0,0],ds:1}))],
    armL:[bx([1.0,0.3,1.0],[0,-1.75,0],0xf3f0e6)], armR:[bx([1.0,0.3,1.0],[0,-1.75,0],0xf3f0e6)], back:[]}}]);

// ---- 3. The Rough Rider: bruiser ----
W.push(['big_stick','The Big Stick (Speak Softly)','weapon','heavy',5,'American (folk)','Speak softly, they said. This is the other half of the sentence. Each swing is a speech.',
  [['stun',48],['quake',55],['amp',36],['crit',32],['clumsy',10],['bloodprice',4]], null, 'lion',
  {b:'parts', hold:'heavy', tip:3.0, parts:[cy([0.4,0.12,3.3,10],[0,1.3,0],0x7b5230,{rg:0.95,fl:1}), ...ring(5,(i)=>to([0.3-i*0.04,0.04],[0,0.7+i*0.55,0],0x5a3a1c,{r:[PI/2,0,0],fl:1})), cy([0.15,0.15,0.5],[0,-0.3,0],0x3a2414), bx([0.8,0.1,0.8],[0,2.4,0],GOLD,met(GOLD,{r:[0,0.8,0]})),
    ...ring(6,(i)=>cn([0.07,0.3,5],[Math.cos(i*1.05)*0.4,2.7+((i*3)%3)*0.2,Math.sin(i*1.05)*0.4],0xcfcfd2,{r:[Math.sin(i*1.05)*1.3,0,-Math.cos(i*1.05)*1.3],mt:0.8})), gl([1.3],[0,2.8,0],'rgba(255,200,90,.5)',{an:{t:'pulse',a:0.2,v:4}}), sp([0.22,10,8],[0,3.0,0],0x3a2414)]}]);
A.push(['rough_rider_coat','Rough Rider Fatigues','armour','leather',5,'American (folk)','Khaki, spectacles and a charge up the hill that nobody asked for. The fatigues hit back harder the more they are hurt.',
  [['evasion',30],['counter',65],['vengeance',9],['critdmg',45],['regen',3],['fragile',26],['tired',4]], null, 'bronze',
  {c:0xa38b5a,t:0x8a1f1f,cape:0x5a4a2a,head:'custom',noCape:1,parts:{
    head:[cy([1.45,1.45,0.08,22],[0,0.62,0],0x8a6c3a,{rg:0.9}), cy([0.68,0.76,0.62,16],[0,0.95,0],0x8a6c3a,{rg:0.9}), cy([0.77,0.77,0.14,16],[0,0.72,0],0x3a2a14), bx([0.9,0.28,0.2],[0,-0.2,0.7],0x5a3a1c),
      ...[-1,1].flatMap(sx=>[to([0.18,0.025],[sx*0.3,0.12,0.74],0x222222,{mt:0.8}), cn([0.14,0.35,4],[sx*0.62,-0.3,0.66],0x5a3a1c,{r:[0,0,sx*1.2]})]), bx([0.18,0.04,0.04],[0,0.12,0.74],0x222222)],
    body:[bx([2.4,0.5,1.25],[0,4.0,-0.02],0xa38b5a), bx([0.7,0.55,0.15],[0,3.95,0.56],0xb02a2a,{r:[0.2,0,0]}), ...ring(8,(i)=>cy([0.12,0.12,0.5,8],[-0.8+i*0.23,3.0-i*0.06,0.58],0xd9b25a,Object.assign(met(0xd9b25a),{r:[0,0,0.12]}))),
      bx([0.2,2.3,0.08],[-0.15,3.0,0.55],0x4a3418,{r:[0,0,0.9]}), cy([0.33,0.33,0.18],[-0.9,2.0,0.6],0x4a6b32,{r:[PI/2,0,0.2]}), bx([2.12,0.28,1.06],[0,2.15,0],0x4a3418)],
    armL:[], armR:[]}}]);

// ---- 4. The Founding General: skirmisher support ----
W.push(['liberty_hatchet','Cherry-Tree Hatchet of Liberty','weapon','thrown',5,'American (folk)','He could not tell a lie, so the hatchet cannot miss. It always comes home, still faintly smelling of cherry blossom.',
  [['crit',42],['multishot',1],['chain',62],['double',42],['amp',24],['shortsight',8]], null, 'wind',
  {b:'parts', hold:'thrown', tip:1.6, spin:1, parts:[cy([0.06,0.07,1.9],[0,0.55,0],0x8a5a2e), cy([0.09,0.09,0.4],[0,-0.4,0],0x2a4a8a), bx([0.18,0.6,0.5],[0.12,1.4,0],0xaab4c2,met(0xaab4c2)), bx([0.1,0.9,0.4],[0.33,1.38,0],0xf2f6fb,met(0xf2f6fb,{e:0xaad0ff,ei:0.3})), oc([0.1],[0.12,1.4,0.27],0xff4a6a,{e:0xff4a6a,ei:1.4,s:[1,1,0.4]}),
    ...ring(3,(i)=>sp([0.08,6,5],[0.05+i*0.02,1.7+i*0.1,0.25-i*0.18],0xd81f4a,{e:0x801030,ei:0.5})), gl([1.0],[0.3,1.4,0],'rgba(255,170,190,.5)',{an:{t:'pulse',a:0.2,v:3}})]}]);
A.push(['continental_greatcoat','Continental Greatcoat','armour','leather',5,'American (folk)','Blue wool, buff facings and a very good wig. Crossing a river in winter is, apparently, a hobby.',
  [['evasion',18],['ward',20],['mend',6],['energize',6],['warcry',9],['bleed',4],['shortsight',10]], null, 'wind',
  {c:0x1c3f7a,t:0xf3ecd2,cape:0x1c3f7a,head:'custom',parts:{
    head:[...ring(12,(i)=>sp([0.34,8,6],[Math.cos(i*0.55+0.4)*0.72,0.05+Math.floor(i/6)*0.5,-0.15+Math.sin(i*0.55+0.4)*0.35],0xf6f6f8,{rg:1})), sp([0.5,8,6],[0,0.75,-0.1],0xf6f6f8,{rg:1}), ...[-1,1].flatMap(sx=>ring(3,(i)=>sp([0.2,6,5],[sx*0.78,-0.15-i*0.25,0.05],0xf6f6f8,{rg:1}))),
      bx([1.9,0.14,1.9],[0,0.95,0],BLACK,{r:[0.05,0.78,0]}), bx([1.9,0.14,1.9],[0,0.95,0],BLACK,{r:[0.05,-0.78,0]}), cy([0.62,0.72,0.35],[0,1.18,0],BLACK), to([0.98,0.03],[0,0.99,0],0xe8d9a0,{r:[PI/2,0,0.05]}), oc([0.1],[0,1.05,0.75],0xffffff,{s:[1,1,0.4]})],
    body:[bx([0.14,2.3,0.06],[-0.28,3.05,0.55],0xf6f6f8,{r:[0,0,0.55]}), bx([0.14,2.3,0.06],[0.28,3.05,0.55],0xf6f6f8,{r:[0,0,-0.55]}), ...ring(6,(i)=>cy([0.06,0.06,0.04],[(i%2?0.35:-0.35),3.6-Math.floor(i/2)*0.5,0.6],GOLD,Object.assign(met(GOLD),{r:[PI/2,0,0]}))),
      ...[-1,1].map(sx=>bx([1.05,0.2,1.15],[sx*1.4,4.1,0],GOLD,met(GOLD))), bx([2.14,0.26,1.08],[0,2.15,0],0xf6f6f8), bx([0.7,2.0,0.1],[0.2,0.8,0.45],0xf3ecd2)],
    armL:[bx([1.0,0.35,1.0],[0,-1.7,0],0xf3ecd2)], armR:[bx([1.0,0.35,1.0],[0,-1.7,0],0xf3ecd2)]}}]);

// ---- 5. The Little Corporal: glass cannon ----
W.push(['austerlitz_sabre','Sabre of Austerlitz','weapon','blade',5,'French (folk)','Short man, long sabre, very large ambitions. Every swing starts with the words “and then, by sunrise…”',
  [['crit',58],['double',48],['execute',95],['chain',55],['amp',26],['bloodprice',4]], null, 'bronze',
  {b:'sword', curve:1, L:2.7, wd:0.3, guard:'cross', metal:0xe9eef6, edge:0xffffff, accent:GOLD, rune:0x4a7aff, extra:[to([0.4,0.04,PI,5,14],[0.1,0.1,0],GOLD,met(GOLD,{r:[0,0,PI]})), sp([0.17,8,6],[0,-0.5,0],GOLD,met(GOLD)), cn([0.06,0.3,4],[0,-0.7,0],GOLD,met(GOLD,{r:[PI,0,0]})), ...ring(4,(i)=>cn([0.04,0.25,4],[Math.cos(i*1.57)*0.12,-0.58,Math.sin(i*1.57)*0.12],GOLD,met(GOLD,{r:[PI,0,0]}))),
    ...ring(3,(i)=>sp([0.07,6,5],[0.3,0.2-i*0.2,0],0xd81f2a,{e:0x801010,ei:0.6})), gl([1.2],[0.2,1.6,0],'rgba(120,160,255,.45)',{an:{t:'pulse',a:0.2,v:3}})]}]);
A.push(['grande_armee_coat','Bicorne Coat of the Little Corporal','armour','leather',5,'French (folk)','The hat does most of the fighting. The coat just makes sure the hat stays looking magnificent.',
  [['critdmg',60],['amp',36],['vengeance',12],['evasion',16],['maxhp',30],['fragile',22]], null, 'bronze',
  {c:0x1c2d5a,t:0xffd700,cape:0x8a1226,head:'custom',mod:0.8,parts:{
    head:[bx([2.7,0.22,0.95],[0,0.82,0],BLACK,{rg:0.6}), bx([2.5,0.5,0.8],[0,0.68,0],BLACK,{rg:0.6}), cn([0.5,0.45,4],[-1.3,0.8,0],BLACK,{r:[0,0,PI/2]}), cn([0.5,0.45,4],[1.3,0.8,0],BLACK,{r:[0,0,-PI/2]}), oc([0.12],[0,1.0,0.5],0xd81f2a,{s:[1,1,0.5]}), oc([0.18],[0,0.9,0.5],0xffffff,{s:[1,1,0.3]}), oc([0.24],[0,0.83,0.5],0x1c3f7a,{s:[1,1,0.2]}),
      bx([0.7,0.25,0.1],[0.15,0.45,0.68],0x3a2412,{r:[0,0,-0.4]}), gl([0.8],[0,1.1,0],'rgba(255,215,0,.35)')],
    body:[bx([0.9,1.9,0.1],[0,3.0,0.52],WHITE), ...ring(2,(i)=>bx([0.55,1.9,0.12],[(i?0.65:-0.65),3.05,0.5],0x1c2d5a,{r:[0,0,(i?-0.1:0.1)]})), ...ring(6,(i)=>cy([0.07,0.07,0.04],[(i%2?0.2:-0.2),3.7-Math.floor(i/2)*0.45,0.6],GOLD,Object.assign(met(GOLD),{r:[PI/2,0,0]}))),
      bx([0.3,2.2,0.07],[0.1,3.0,0.58],0xc4161c,{r:[0,0,0.8]}), bx([0.3,2.2,0.07],[0.1,3.0,0.59],0x1c3f7a,{r:[0,0,0.8],p:[0.25,3.0,0.59]}), oc([0.2],[-0.55,3.5,0.58],0xe8e8f0,{e:0x8888aa,ei:0.5,s:[1,1,0.3]}),
      ...[-1,1].flatMap(sx=>[bx([1.15,0.2,1.15],[sx*1.4,4.12,0],GOLD,met(GOLD)), ...ring(5,(i)=>cy([0.03,0.03,0.55],[sx*(0.95+i*0.2),3.82,0.5],GOLD,met(GOLD)))]), bx([2.15,0.3,1.06],[0,2.15,0],0xfaf7ec)],
    back:[]}}]);

// ---- 6. The Great Khan: ranged skirmisher ----
W.push(['horde_bow','Composite Bow of the Horde','weapon','ranged',5,'Steppe (folk)','Horn, sinew and wood, strung on a hundred horseback victories. Arrows leave it like a thundercloud.',
  [['crit',62],['multishot',1],['chain',58],['double',36],['expose',32],['shortsight',12],['tired',3]], null, 'wind',
  {b:'bow', deco:'sun', metal:0x6a3d1f, edge:0xe9d9a8, accent:0xd9a441, rune:0xd9a441, tall:1, extra:[...ring(4,(i)=>cy([0.045,0.03,0.6],[0.05+i*0.04,1.0+i*0.22,0.3],0xf2ead0,{r:[0.4,0,0.1],rg:0.8})), cn([0.18,0.7,6],[0,1.4,0.15],0xf6f6f2,{rg:1,r:[0.3,0,0]}), cn([0.18,0.7,6],[0,-1.4,0.15],0xf6f6f2,{rg:1,r:[PI-0.3,0,0]}), gl([1.2],[0,0,0.2],'rgba(255,220,120,.35)',{an:{t:'pulse',a:0.2,v:3}})]}]);
A.push(['khan_lamellar','Lamellar of the Steppe Khan','armour','leather',5,'Steppe (folk)','Lacquered plates, fur and a very fast horse that you do not currently see. It does not need to be visible to be there.',
  [['evasion',26],['counter',42],['energize',8],['critdmg',36],['amp',16],['maxhp',25],['tired',6]], null, 'wind',
  {c:0x6a3d1f,t:0xd9a441,cape:0x7a1f12,head:'custom',lamellar:1,parts:{
    head:[cn([0.74,1.4,12],[0,1.35,0],0xa81f2a,{rg:0.7}), cy([0.88,0.8,0.5],[0,0.7,0],0xe9ddc4,{rg:1,fl:1}), sp([0.16,8,6],[0,2.1,0],0xd9a441,met(0xd9a441)), ...[-1,1].flatMap(sx=>[bx([0.16,1.4,0.16],[sx*0.75,-0.55,0.1],0x15110e,{r:[0,0,sx*0.05]}), sp([0.17,6,5],[sx*0.76,-1.3,0.1],0xd9a441,met(0xd9a441)), cn([0.07,0.65,4],[sx*0.45,-0.28,0.7],0x15110e,{r:[0,0,sx*2.0]})]), bx([0.9,0.1,0.1],[0,-0.2,0.7],0x15110e)],
    body:[...ring(5,(i)=>sp([0.34,8,6],[Math.cos(i*0.9+3.3)*1.1,4.0,Math.sin(i*0.9+3.3)*0.5],0xe9ddc4,{rg:1,fl:1})), bx([2.2,0.3,1.1],[0,2.15,0],0x2a1a10), oc([0.2],[0,2.15,0.58],0xd9a441,{e:0xd9a441,ei:0.6,s:[1,1,0.3]})],
    back:[cy([0.05,0.05,3.8],[0.9,3.2,-0.9],0x5a3a1c), sp([0.2,8,6],[0.9,5.15,-0.9],0xd9a441,met(0xd9a441)), ...ring(7,(i)=>cn([0.1,1.3,5],[0.9+(i-3)*0.1,4.55,-0.9],0xe9ddc4,{rg:1,r:[PI,0,(i-3)*0.12],an:{t:'sway',a:0.05,v:2}})), pl([1.1,0.9],[0.45,5.2,-0.9],0x2a6fd8,{ds:1})]}}]);

// ---- 7. The Queen of the Nile: healer ----
W.push(['asp_scepter','Asp-Scepter of the Nile Queen','weapon','staff',5,'Egyptian (folk)','The cobra is very fond of its owner. Everyone else is advised to keep their distance and to leave a tip.',
  [['poison',72],['lifesteal',36],['weaken',40],['amp',10],['bloodprice',3],['shortsight',8]], null, 'life',
  {b:'parts', hold:'staff', tip:4.9, mod:0.7, parts:[cy([0.075,0.09,4.2],[0,0.9,0],GOLD,met(GOLD)), ...ring(5,(i)=>to([0.11,0.03],[0,-0.6+i*0.9,0],i%2?0x1aa3a3:0xc4161c,{r:[PI/2,0,0]})), cy([0.4,0.15,0.5,10],[0,3.1,0],0x1aa3a3,met(0x1aa3a3,{mt:0.5})),
    M('tube',[0.14,6],[0,0,0],0x1f8f4a,{pts:[[0,3.2,0],[0.4,3.7,0.1],[-0.1,4.2,0.1],[0.2,4.7,0.05],[0,5.0,0.25]],seg:20,mt:0.4,rg:0.4}), sp([0.22,10,8],[0,5.0,0.3],0x1f8f4a,{mt:0.4}), pl([0.9,0.7],[0,4.85,0.25],0x2fb860,{ds:1,s:[1,1,1]}), sp([0.05,6,5],[0.1,5.08,0.48],0xff3030,{e:0xff3030,ei:2}), sp([0.05,6,5],[-0.1,5.08,0.48],0xff3030,{e:0xff3030,ei:2}),
    cn([0.05,0.2,4],[0,4.85,0.5],0xff3050,{r:[1.57,0,0]}), gl([1.5],[0,4.6,0.2],'rgba(80,255,150,.6)',{an:{t:'pulse',a:0.2,v:3}}), ...ring(5,(i)=>gl([0.45],[0.1,2.8,0],'rgba(120,255,170,.9)',{an:{t:'rise',v:0.5,h:2.6,o:0.8}}))]}]);
A.push(['asp_gown','Gown of the Last Pharaoh-Queen','armour','robe',5,'Egyptian (folk)','Linen as fine as river mist, gold as heavy as an empire. It heals the whole court and then asks for a boat.',
  [['regen',9],['mend',13],['evasion',20],['bulwark',9],['energize',11],['phoenix',60],['maxhp',25],['fragile',18],['bleed',3]], null, 'life',
  {c:0xf2ead3,t:0x1aa3a3,cape:0xe9d27a,head:'custom',noCape:1,mod:0.85,parts:{
    head:[bx([1.55,0.9,1.4],[0,0.2,-0.3],0x0c0c10,{rg:0.4}), bx([1.5,0.35,0.15],[0,0.62,0.7],0x0c0c10), ...[-1,1].flatMap(sx=>[bx([0.2,0.9,0.5],[sx*0.8,-0.3,0.2],0x0c0c10), bx([0.4,0.1,0.06],[sx*0.3,0.12,0.7],0x0c0c10)]),
      cy([0.55,0.7,0.35,14],[0,0.88,0],GOLD,met(GOLD)), sp([0.55,12,8,0,PI*2,0,PI/2],[0,1.1,0],0xe8c53a,met(0xe8c53a)), sp([0.32,10,8],[0,1.65,0.05],0xd81f2a,{e:0xd81f2a,ei:1.1}), M('tube',[0.09,6],[0,0,0],GOLD,Object.assign(met(GOLD),{pts:[[0,0.9,0.6],[0.12,1.15,0.7],[-0.1,1.4,0.72],[0,1.65,0.7]],seg:12})), cn([0.12,0.3,5],[0,1.95,0.68],0x2fb860,{e:0x2fb860,ei:0.6}), ...[-1,1].map(sx=>sp([0.07,6,5],[sx*0.25,0.07,0.74],0x0c0c10))],
    body:[to([1.2,0.28,PI,6,24],[0,3.95,0.2],GOLD,met(GOLD,{r:[PI/2.4,0,PI]})), to([1.0,0.16,PI,6,24],[0,3.85,0.25],0x1aa3a3,{r:[PI/2.4,0,PI],mt:0.4}), to([0.8,0.12,PI,6,24],[0,3.75,0.3],0xc4161c,{r:[PI/2.4,0,PI]}), bx([1.7,0.18,0.12],[0,3.0,0.54],GOLD,met(GOLD)), bx([1.1,0.9,0.1],[0,2.6,0.54],0x1aa3a3,{op:0.85}),
      ...ring(9,(i)=>bx([0.05,1.9,0.04],[-0.9+i*0.225,0.95,0.6],0xe4dcc2)), M('tube',[0.1,6],[0,0,0],0x1f8f4a,{pts:[[-1.0,2.3,0.6],[-0.4,2.1,0.7],[0.4,2.35,0.7],[1.0,2.15,0.6]],seg:18,mt:0.4}), sp([0.16,8,6],[1.0,2.15,0.6],0x1f8f4a,{mt:0.4}), bx([2.4,0.5,1.25],[0,4.0,-0.02],0xf2ead3)],
    armL:[...ring(2,(i)=>cy([0.52,0.52,0.14],[0,-0.35-i*0.3,0],GOLD,met(GOLD))), bx([1.0,0.2,1.0],[0,-1.75,0],GOLD,met(GOLD))], armR:[...ring(2,(i)=>cy([0.52,0.52,0.14],[0,-0.35-i*0.3,0],GOLD,met(GOLD))), bx([1.0,0.2,1.0],[0,-1.75,0],GOLD,met(GOLD))],
    back:[ ...ring(2,(i)=>{ const sx=i?1:-1; return bx([0.2,2.6,0.05],[sx*0.9,3.2,-0.7],0xe9d27a,{r:[0.2,0,sx*0.35],mt:0.6,an:{t:'wing',a:0.1,v:2}}); }) ]}}]);

// ---- 8. The Dictator of Rome: commander tank ----
W.push(['gladius_ides','Gladius of the Ides','weapon','blade',5,'Roman (folk)','Short, straight and well-travelled. The twenty-third time it is drawn, someone says: “you too?”',
  [['execute',120],['crit',46],['lifesteal',26],['double',32],['expose',42],['amp',20],['bloodprice',5]], null, 'blood',
  {b:'sword', L:2.0, wd:0.34, guard:'disc', metal:0xe6ebf2, edge:0xffffff, accent:0xc4161c, rune:0xff3a3a, extra:[...ring(6,(i)=>bx([0.05,0.18,0.04],[-0.08+((i%3)*0.08),0.8+i*0.28,0.08],0xb01020,{e:0x801010,ei:0.8,r:[0,0,0.5]})), cy([0.12,0.12,0.5],[0,-0.55,0],0xc4161c), sp([0.13,8,6],[0,-0.85,0],GOLD,met(GOLD)),
    ...ring(7,(i)=>bx([0.12,0.05,0.03],[0.22,0.55+i*0.3,0.1],0x3fae4a,{r:[0,0,0.5]})), gl([1.0],[0,1.4,0],'rgba(255,60,60,.4)',{an:{t:'pulse',a:0.25,v:3.5}})]}]);
A.push(['laurel_cuirass','Laurel Cuirass of the Dictator','armour','plate',5,'Roman (folk)','Gold sculpted abs, a laurel crown and twenty-three tiny holes in the back that nobody mentions at parties.',
  [['ward',30],['thorns',32],['regen',4],['warcry',16],['bulwark',10],['taunt',130],['slowskill',1],['fragile',12],['bleed',3]], null, 'bronze',
  {c:0xcaa24a,t:0x8a1717,cape:0x6a1a8a,head:'custom',big:1,mod:1.15,parts:{
    head:[bx([1.45,0.4,1.45],[0,0.72,0],0x3a2a1a), to([0.72,0.07,PI*1.5,6,20],[0,0.62,0],0x4a8a3a,{r:[PI/2,0,0.5]}), ...ring(14,(i)=>bx([0.26,0.06,0.14],[Math.cos(0.3+i*0.31)*0.76,0.64+(i%2)*0.04,Math.sin(0.3+i*0.31)*0.76],0x3fae4a,{r:[0.3,-0.3-i*0.31,0.4]})), bx([0.9,0.1,0.08],[0,0.35,0.7],0x3a2a1a)],
    body:[bx([1.9,2.0,0.18],[0,3.1,0.5],0xcaa24a,met(0xcaa24a,{mt:0.8})), ...ring(3,(i)=>bx([0.9,0.06,0.04],[0,2.55+i*0.36,0.6],0x9a7a2a)), bx([0.06,1.7,0.04],[0,3.1,0.61],0x9a7a2a), oc([0.2],[0,3.9,0.6],0xc4161c,{e:0xc4161c,ei:0.8,s:[1,1,0.3]}), ...ring(2,(i)=>cy([0.16,0.16,0.04],[i?0.4:-0.4,3.45,0.6],0x9a7a2a,{r:[PI/2,0,0]})),
      ...ring(9,(i)=>bx([0.22,0.9,0.1],[-0.9+i*0.225,1.55,0.52],0x8a1717,{r:[0.12,0,0]})), ...ring(9,(i)=>bx([0.22,0.1,0.11],[-0.9+i*0.225,1.12,0.55],0xcaa24a,met(0xcaa24a))),
      ...[-1,1].map(sx=>sp([0.62,10,8],[sx*1.35,4.0,0],0xcaa24a,met(0xcaa24a,{s:[1,0.6,1]}))), bx([2.2,0.26,1.1],[0,2.2,0],0x3a2a1a)],
    back:[...ring(9,(i)=>bx([0.07,0.22,0.03],[-0.8+(i%5)*0.4,3.8-Math.floor(i/5)*0.5,-0.58],0xff2a2a,{e:0xff1010,ei:1.3,r:[0,0,0.6]}))]}}]);

// ---- 9. The Bulldog: defensive support ----
W.push(['finest_hour_tommy','Tommy-Gun of the Finest Hour','weapon','ranged',5,'British (folk)','Chambered in a calm voice and a very large cigar. It never retreats, and it hands out courage in sevens.',
  [['multishot',1],['double',52],['chain',42],['crit',36],['warcry',12],['amp',20],['shortsight',15],['selfburn',6]], null, 'fire',
  {b:'parts', hold:'gun', tip:1.9, parts:[bx([0.28,0.34,1.5],[0,0.9,0],0x2a2a30,met(0x2a2a30,{mt:0.7})), cy([0.1,0.1,1.7,10],[0,1.95,0],0x15151a,Object.assign(met(0x15151a),{r:[0,0,0]})), ...ring(6,(i)=>to([0.12,0.025],[0,1.4+i*0.18,0],0x3a3a42,{r:[PI/2,0,0],mt:0.8})), cy([0.5,0.5,0.4],[0,0.75,-0.15],0x4a4a52,met(0x4a4a52,{mt:0.75,r:[0,0,PI/2]})),
    ...ring(10,(i)=>bx([0.06,0.06,0.08],[Math.cos(i*0.63)*0.5,0.75+Math.sin(i*0.63)*0.5*0.0,Math.sin(i*0.63)*0.5-0.15],0xd9b25a)), bx([0.3,0.3,0.95],[0,-0.1,-0.45],0x7a4e2a,{r:[-0.5,0,0]}), bx([0.2,0.6,0.28],[0,0.45,0.35],0x7a4e2a,{r:[0.2,0,0]}), bx([0.28,0.4,0.8],[0,0.85,0.55],0x7a4e2a),
    gl([0.9],[0,2.9,0],'rgba(255,220,120,.9)',{an:{t:'pulse',a:0.5,v:14}}), cy([0.07,0.08,0.7],[0.35,0.5,0.15],0x6a3a1a,{r:[0.2,0,0.9]}), gl([0.35],[0.65,0.7,0.2],'rgba(255,100,20,.95)',{an:{t:'pulse',a:0.3,v:5}})]}]);
A.push(['bulldog_siren_suit','Bulldog’s Siren Suit','armour','robe',5,'British (folk)','Pinstripes, a polka-dot bow tie and a face like a locked door. “We shall never surrender” is stitched in the lining.',
  [['regen',7],['ward',28],['bulwark',16],['mend',6],['lastStand',1],['energize',5],['tired',6],['clumsy',15],['slowskill',1]], null, 'bronze',
  {c:0x2b3a55,t:0xd9d9d9,cape:0x1a2540,head:'custom',noCape:1,mod:1.1,parts:{
    head:[cy([0.55,0.75,0.65,18],[0,1.0,0],BLACK,{rg:0.3}), cy([1.0,1.0,0.1,22],[0,0.68,0],BLACK,{rg:0.3}), to([0.68,0.04],[0,0.88,0],0x2a2a30,{r:[PI/2,0,0]}), ...ring(6,(i)=>sp([0.34,8,6],[-0.6+i*0.24,-0.35-Math.sin(i/5*PI)*0.1,0.56],0xd8b7a6,{rg:0.8})), cy([0.07,0.07,0.8,8],[0.3,-0.25,0.85],0x6a3a1a,{r:[1.4,0,0.2]}), gl([0.35],[0.34,-0.25,1.3],'rgba(255,100,20,.95)',{an:{t:'pulse',a:0.3,v:5}}), ...ring(3,(i)=>gl([0.3],[0.34,-0.2,1.4],'rgba(210,210,215,.5)',{an:{t:'rise',v:0.5,h:1.1,o:0.5}})), bx([1.2,0.12,0.1],[0,0.18,0.72],0x1a1a20)],
    body:[...ring(11,(i)=>bx([0.035,2.0,0.04],[-0.9+i*0.18,3.0,0.52],0xb9c4d6)), bx([1.0,1.8,0.1],[0,3.0,0.55],0xe9d9a0), bx([0.45,0.2,0.1],[0,3.85,0.6],0x1a3a8a), ...ring(3,(i)=>sp([0.03,5,4],[-0.12+i*0.12,3.85,0.66],0xffffff)), M('tube',[0.025,5],[0,0,0],GOLD,Object.assign(met(GOLD),{pts:[[-0.3,3.2,0.62],[0,3.0,0.68],[0.4,3.25,0.62]],seg:10})), oc([0.1],[-0.6,3.5,0.6],0xc4161c,{s:[1,1,0.4],e:0xc4161c,ei:0.7}), oc([0.1],[-0.6,3.5,0.61],0x1a3a8a,{s:[0.6,0.6,0.4]}), bx([2.4,0.5,1.25],[0,4.0,-0.02],0x2b3a55,{rg:0.9}), cy([1.0,1.4,2.2,6],[0,1.15,0],0x2b3a55,{r:[0,PI/6,0],s:[1,1,0.7]})],
    armL:[], armR:[]}}]);

// ---- 10. The Conqueror: bruiser ----
W.push(['sarissa_conqueror','Sarissa of the Conqueror','weapon','pole',5,'Macedonian (folk)','Six metres of cornel wood and the idea that you can simply keep walking east. The tip arrives a long time before the rest of him.',
  [['pierce',0],['execute',85],['quake',38],['crit',36],['amp',30],['chain',46],['clumsy',12],['slowskill',1]], null, 'bronze',
  {b:'spear', head:'leaf', L:6.2, metal:0xcaa24a, edge:0xfff2c0, accent:0x7a1226, rune:0xffe080, wood:0x6a4422, extra:[...ring(16,(i)=>bx([0.035,0.5,0.03],[Math.cos(i*0.3927)*0.22,4.7,Math.sin(i*0.3927)*0.22],GOLD,Object.assign(met(GOLD),{e:GOLD,ei:0.6,r:[0,0,0]}))), oc([0.2],[0,4.7,0.12],0xffd54a,{e:0xffd54a,ei:1.5,s:[1,1,0.3]}), pl([0.8,0.5],[0.45,4.2,0],0x7a1226,{ds:1,an:{t:'sway',a:0.12,v:2.5}}), cn([0.1,0.6,6],[0,-1.7,0],0x888890,met(0x888890,{r:[PI,0,0]})), ...ring(5,(i)=>to([0.09,0.03],[0,3.0+i*0.35,0],0x7a1226,{r:[PI/2,0,0]}))]}]);
A.push(['macedonian_phalanx_plate','Plate of the Macedonian Phalanx','armour','plate',5,'Macedonian (folk)','Bronze, a crimson plume and a shield with a sunburst. It was made for someone who stood at the front of every picture.',
  [['ward',26],['thorns',26],['amp',20],['critdmg',30],['vengeance',10],['regen',3],['fragile',15],['tired',5]], null, 'sun',
  {c:0xb98b2a,t:0xd81f2a,cape:0xa51d2d,head:'custom',big:1,mod:1.1,parts:{
    head:[cy([0.82,0.82,1.2,18],[0,0.2,0],0xb98b2a,met(0xb98b2a)), bx([0.2,0.8,0.12],[0,-0.05,0.8],0x6a4a14), bx([0.9,0.12,0.12],[0,0.12,0.8],0x6a4a14), bx([0.9,0.1,0.06],[0,0.05,0.78],0x1a1a1a), bx([0.12,0.3,1.7],[0,1.05,0],0xd81f2a,{rg:0.9}), ...ring(9,(i)=>bx([0.1,0.5,0.1],[0,1.05,-0.8+i*0.19],0xd81f2a,{rg:0.9,an:{t:'sway',a:0.05,v:2.2}})), bx([0.5,0.35,0.5],[0,0.8,0],0xb98b2a,met(0xb98b2a))],
    body:[bx([1.9,2.0,0.18],[0,3.1,0.5],0xb98b2a,met(0xb98b2a)), ...ring(3,(i)=>bx([0.9,0.06,0.04],[0,2.55+i*0.36,0.6],0x7a5a14)), ...ring(9,(i)=>bx([0.22,0.85,0.1],[-0.9+i*0.225,1.55,0.52],0xd81f2a)), ...[-1,1].map(sx=>sp([0.62,10,8],[sx*1.35,4.0,0],0xb98b2a,met(0xb98b2a,{s:[1,0.6,1]}))), bx([2.2,0.28,1.1],[0,2.2,0],0x3a2a1a)],
    armL:[cy([1.25,1.25,0.15,28],[-0.55,-1.4,0.4],0xb98b2a,met(0xb98b2a,{r:[0,PI/2,0],rg:0.3})), ...ring(16,(i)=>bx([0.08,0.5,0.06],[-0.7,-1.4+Math.sin(i*0.3927)*0.55,0.4+Math.cos(i*0.3927)*0.55],0xffd54a,{e:0xffd54a,ei:0.7,r:[-i*0.3927,0,0]})), oc([0.2],[-0.7,-1.4,0.4],0xffd54a,{e:0xffd54a,ei:1.2})],
    armR:[], back:[]}}]);

/* ================= ★10 OUTERVERSAL ================= */
// ---- 1. The Grinning Bat-King ----
W.push(['barbed_crowbar','Barbed Crowbar of One Bad Day','weapon','heavy',6,'Dark Multiverse (homage)','Every universe has one terrible day. This is the tool that turns it into a lifestyle. It giggles when it connects.',
  [['amp',42],['double',62],['crit',46],['chain',80],['quake',62],['stun',42],['poison',60],['bloodprice',8],['shortsight',15]], null, 'dark',
  {b:'parts', hold:'heavy', tip:3.3, parts:[bx([0.17,3.6,0.17],[0,1.25,0],0x2a1a3a,met(0x2a1a3a,{mt:0.9})), M('tor',[0.45,0.1,PI*1.1,6,16],[0.15,3.15,0],0x2a1a3a,met(0x2a1a3a,{mt:0.9,r:[0,0,-0.4]})), cn([0.12,0.5,5],[0.62,2.85,0],0x7dff3a,{e:0x7dff3a,ei:1.5,r:[0,0,2.8]}),
    ...ring(14,(i)=>cn([0.04,0.3,4],[Math.cos(i*1.1)*0.17,0.1+i*0.22,Math.sin(i*1.1)*0.17],0xc8c8d8,{r:[Math.sin(i*1.1)*1.2,0,-Math.cos(i*1.1)*1.2],mt:0.9})), M('tube',[0.03,5],[0,0,0],0x9a9aa8,Object.assign(met(0x9a9aa8),{pts:[[0.1,0.1,0.1],[-0.1,0.7,-0.1],[0.1,1.3,0.1],[-0.1,1.9,-0.1],[0.1,2.5,0.1]],seg:24})),
    ...ring(7,(i)=>bx([0.07,0.09,0.03],[-0.16,0.5+i*0.3,0.1],0x7dff3a,{e:0x7dff3a,ei:1.6})), ...ring(4,(i)=>gl([0.5],[0.1,3.0,0],'rgba(125,255,58,.9)',{an:{t:'rise',v:0.4,h:-1.8,o:0.9}})), gl([1.6],[0.3,3.0,0],'rgba(125,255,58,.45)',{an:{t:'pulse',a:0.3,v:5}})]}]);
A.push(['cowl_grinning_bat','Cowl of the Grinning Bat-King','armour','robe',6,'Dark Multiverse (homage)','He is not angry. He is delighted. Six chained nightmares trail the cloak, and each one is smiling too.',
  [['amp',48],['expose',62],['poison',62],['weaken',52],['critdmg',85],['evasion',26],['vengeance',16],['bleed',6],['maxhp',40],['fragile',26],['tired',8]], null, 'dark',
  {c:0x1a1426,t:0x7dff3a,cape:0x3a1d5a,head:'custom',mod:0.62,parts:{
    head:[bx([1.45,0.8,1.4],[0,0.5,-0.05],0x120d1c), cn([0.28,1.1,4],[-0.5,1.3,0],0x120d1c,{r:[0,0,0.15]}), cn([0.28,1.1,4],[0.5,1.3,0],0x120d1c,{r:[0,0,-0.15]}), bx([1.4,0.5,0.1],[0,0.28,0.72],0x120d1c),
      ...ring(2,(i)=>bx([0.5,0.14,0.06],[(i?0.3:-0.3),0.18,0.76],0x7dff3a,{e:0x7dff3a,ei:2.4,r:[0,0,(i?0.25:-0.25)]})), bx([1.36,0.34,0.08],[0,-0.28,0.7],0x1a0a14), ...ring(11,(i)=>bx([0.09,0.2,0.04],[-0.55+i*0.11,-0.2+Math.cos((i-5)/5*1.1)*0.1-0.08,0.75],0xf4f1e8,{e:0xaaffaa,ei:0.3})), ...ring(11,(i)=>bx([0.09,0.2,0.04],[-0.55+i*0.11,-0.43+Math.cos((i-5)/5*1.1)*0.1*-1+0.08,0.75],0xf4f1e8,{e:0xaaffaa,ei:0.3})),
      bx([1.5,0.05,0.06],[0,-0.31,0.78],0x7dff3a,{e:0x7dff3a,ei:2}), gl([1.4],[0,-0.3,0.9],'rgba(125,255,58,.5)',{an:{t:'pulse',a:0.2,v:3}})],
    body:[bx([2.4,0.9,1.3],[0,4.1,-0.02],0x120d1c), ...ring(6,(i)=>cn([0.14,0.7,5],[-1.0+i*0.4,4.65,-0.1],0x120d1c,{r:[0,0,(i-2.5)*0.12]})), ...ring(5,(i)=>cy([0.09,0.09,0.4,6],[-0.7+i*0.35,2.2,0.58],0x7dff3a,{e:0x7dff3a,ei:1.4,r:[0,0,PI/2]})), bx([2.2,0.3,1.1],[0,2.15,0],0x120d1c),
      M('tube',[0.08,6],[0,0,0],0x9a9aa8,Object.assign(met(0x9a9aa8),{pts:[[-1.0,4.1,0.4],[-0.2,3.2,0.62],[0.5,2.5,0.62],[1.0,2.3,0.4]],seg:18})), M('tube',[0.08,6],[0,0,0],0x9a9aa8,Object.assign(met(0x9a9aa8),{pts:[[1.0,4.1,0.4],[0.2,3.2,0.62],[-0.5,2.5,0.62],[-1.0,2.3,0.4]],seg:18})),
      ...ring(10,(i)=>cn([0.07,0.3,4],[-0.8+(i%5)*0.4,3.9-Math.floor(i/5)*0.9,0.64],0xc8c8d8,{r:[1.57,0,0],mt:0.9}))],
    back:[ ...ring(6,(i)=>{ const a = -1.1 + i*0.44; return M('tube',[0.05,5],[0,0,0],0x9a9aa8,Object.assign(met(0x9a9aa8),{pts:[[Math.sin(a)*0.5,3.6,-0.7],[Math.sin(a)*1.4,3.0,-1.5],[Math.sin(a)*2.0,1.8,-2.0],[Math.sin(a)*2.3,0.6,-2.3]],seg:14,an:{t:'sway',a:0.05,v:1.6}})); }),
      ...ring(6,(i)=>{ const a = -1.1 + i*0.44; return M('cone',[0.28,0.6,4],[Math.sin(a)*2.3,0.5,-2.3],0x7dff3a,{e:0x7dff3a,ei:1.2,r:[PI,0,0],an:{t:'bob',a:0.2,v:2}}); }), gl([5],[0,2.6,-0.9],'rgba(125,255,58,.18)')]}}]);

// ---- 2. The Prime Sun-Lord ----
W.push(['fists_last_sun','Fists of the Last Sun','weapon','fist',6,'Last Sun (homage)','The last son of a dead star punched a sun so hard that a new one came out the other side. These are the fists.',
  [['amp',52],['double',72],['chain',92],['burn',82],['quake',62],['lifesteal',36],['crit',42],['selfburn',15],['bloodprice',6]], null, 'sun',
  {b:'gaunt', metal:0xd8a824, edge:0xfff0b0, accent:0xc4161c, rune:0xff7a1a, flame:0xff8a1a, extra:[bx([1.15,0.3,1.05],[0,0.5,0],0xc4161c,{rg:0.5}), oc([0.3],[0,0.1,0.55],0xffd24a,{e:0xffd24a,ei:1.7,s:[1,1,0.35]}), oc([0.14],[0,0.1,0.6],0xc4161c,{e:0xff2a1a,ei:1.2,s:[1,1,0.35]}), gl([2.2],[0,-0.1,0.3],'rgba(255,170,40,.6)',{an:{t:'pulse',a:0.3,v:5}}),
    ...ring(6,(i)=>cn([0.12,0.5,4],[Math.cos(i*1.05)*0.7,0.1,Math.sin(i*1.05)*0.7],0xffd24a,{e:0xff9a1a,ei:1.4,r:[Math.sin(i*1.05)*1.5,0,-Math.cos(i*1.05)*1.5]}))]}]);
A.push(['primal_steel_armour','Primal Steel Armour of the Sun-Lord','armour','plate',6,'Last Sun (homage)','Plate that drank a thousand years of sunlight. Nothing can hurt it, and the wearer is deeply, deeply tired of that.',
  [['ward',58],['thorns',62],['regen',10],['mend',10],['bulwark',22],['taunt',320],['lastStand',1],['phoenix',100],['slowskill',1],['clumsy',32],['tired',10],['shortsight',16]], null, 'sun',
  {c:0x20222b,t:0xffc83a,cape:0xc4161c,head:'custom',big:1,mod:1.6,parts:{
    head:[...ring(9,(i)=>cn([0.22,1.25,4],[(i-4)*0.19,0.95,-0.1+Math.sin(i*0.9)*0.1],0x0c0c10,{r:[0.1,0,-(i-4)*0.3]})), bx([1.5,0.55,1.5],[0,0.65,-0.05],0x0c0c10), ...ring(2,(i)=>bx([0.36,0.1,0.06],[(i?0.3:-0.3),0.08,0.72],0xff2a1a,{e:0xff1010,ei:3})), ...ring(2,(i)=>gl([0.9],[(i?0.3:-0.3),0.08,0.8],'rgba(255,40,30,.9)')), cn([0.2,0.6,4],[0,-0.55,0.55],0x20222b,{r:[PI,0,0]})],
    body:[bx([2.2,0.4,1.3],[0,3.95,-0.02],0x20222b,met(0x20222b)), M('prism',[0.9,0.9,0.1,4],[0,3.2,0.58],0xffc83a,met(0xffc83a,{r:[PI/2,0,PI/4],e:0xffa010,ei:0.7,s:[1.2,1,1.3]})), M('prism',[0.55,0.55,0.12,4],[0,3.2,0.6],0xc4161c,{r:[PI/2,0,PI/4],e:0xff1010,ei:1.4,s:[1.2,1,1.3]}), ...ring(5,(i)=>bx([0.36,0.14,0.1],[-0.76+i*0.38,2.5,0.55],0xffc83a,met(0xffc83a))),
      ...[-1,1].flatMap(sx=>[sp([0.82,10,8],[sx*1.4,4.05,0],0x20222b,met(0x20222b,{s:[1,0.65,1.1]})), ...ring(4,(i)=>cn([0.15,0.9,5],[sx*(1.15+i*0.25),4.5+(i%2)*0.2,-0.2+i*0.2],0xffc83a,met(0xffc83a,{r:[0,0,-sx*(0.3+i*0.2)]})))]), bx([2.2,0.3,1.1],[0,2.15,0],0xffc83a,met(0xffc83a))],
    back:[ M('ring',[1.6,2.1,48],[0,3.7,-1.1],0xffc83a,{ds:1,e:0xffa010,ei:1.2,bs:1,add:1,an:{t:'spin',ax:'z',v:0.6}}), gl([6],[0,3.2,-1.0],'rgba(255,170,40,.35)',{an:{t:'pulse',a:0.2,v:2.5}}), ...ring(10,(i)=>gl([0.4],[(i%5-2)*0.5,1.5,-0.6],'rgba(255,200,80,.9)',{an:{t:'rise',v:0.4,h:4,o:0.8}}))]}}]);

// ---- 3. The Crescent Crusader ----
W.push(['crescent_chain_sickles','Crescent Chain-Sickles of Khonshu','weapon','thrown',6,'Lunar Avatar (homage)','Moon-silver on a chain of night. The ancient moon god lends them out; what he asks in return is not written down.',
  [['crit',72],['multishot',1],['double',72],['chain',84],['lifesteal',32],['execute',100],['amp',36],['shortsight',12],['tired',6]], null, 'moon',
  {b:'parts', hold:'thrown', tip:1.6, spin:1, parts:[cy([0.07,0.08,1.0],[0,0.0,0],0x1a1a24,{mt:0.5}), to([0.9,0.12,PI*1.25,6,24],[0.45,1.1,0],0xe9eefc,met(0xe9eefc,{mt:0.9,e:0xaabaff,ei:0.6,r:[0,0,PI*0.62]})), to([0.9,0.03,PI*1.25,4,24],[0.45,1.1,0],0xffffff,{e:0xffffff,ei:2,r:[0,0,PI*0.62],bs:0}), bx([0.5,0.1,0.18],[0,0.55,0],0xc0cbff,met(0xc0cbff)),
    ...ring(6,(i)=>to([0.12,0.035],[Math.sin(i)*0.05,-0.6-i*0.22,0],0xaab4d0,{mt:0.9,r:[0,i%2?PI/2:0,0]})), gl([2.0],[0.45,1.1,0],'rgba(190,210,255,.55)',{an:{t:'pulse',a:0.2,v:3}})]}]);
A.push(['crescent_crusader_mantle','Mantle of the Crescent Crusader','armour','leather',6,'Lunar Avatar (homage)','White wraps that glow like a half-remembered dream. Whoever wears it is never quite where the blow lands.',
  [['evasion',46],['counter',82],['critdmg',92],['amp',32],['vengeance',26],['regen',6],['lastStand',1],['fragile',36],['maxhp',26],['bleed',5]], null, 'moon',
  {c:0xf0f2fa,t:0xb8c4ff,cape:0xe8ecff,head:'custom',mod:0.9,parts:{
    head:[sp([0.86,14,10,0,PI*2,0,PI*0.62],[0,0.2,-0.05],0xf0f2fa,{rg:0.8,s:[1,1.1,1.05]}), bx([1.3,0.3,0.12],[0,0.5,0.7],0xf0f2fa), ...ring(2,(i)=>cn([0.1,0.9,5],[(i?0.75:-0.75),0.95,0],0xb8c4ff,{e:0x8090ff,ei:0.8,r:[0,0,(i?-0.7:0.7)]})), M('tor',[0.22,0.05,PI*1.4,6,16],[0,0.62,0.78],0xe9eefc,met(0xe9eefc,{e:0xaabaff,ei:1.4,r:[0,0,1.2]})),
      ...ring(2,(i)=>bx([0.28,0.08,0.05],[(i?0.28:-0.28),0.0,0.7],0x6aa6ff,{e:0x6aa6ff,ei:3})), ...ring(2,(i)=>gl([0.55],[(i?0.28:-0.28),0.0,0.78],'rgba(120,170,255,.9)')), bx([1.3,0.5,0.1],[0,-0.4,0.68],0xf0f2fa,{op:0.9})],
    body:[...ring(11,(i)=>bx([2.08,0.14,1.08],[0,2.2+i*0.17,0],i%2?0xf0f2fa:0xdfe3f2,{r:[0,0,(i%3-1)*0.04]})), ...ring(3,(i)=>bx([0.18,1.1,0.04],[-0.6+i*0.5,1.5,0.56],0xf0f2fa,{r:[0,0,(i-1)*0.2]})), M('tor',[0.3,0.05,PI*1.4,6,16],[0,2.15,0.6],0xe9eefc,met(0xe9eefc,{e:0xaabaff,ei:1.4,r:[0,0,1.2]})),
      ...ring(5,(i)=>M('tor',[0.14,0.03,PI*1.3,5,10],[-0.8+i*0.4,3.1,0.6],0xc0cbff,met(0xc0cbff,{r:[0,0,0.8],e:0x8090ff,ei:0.6}))), ...[-1,1].map(sx=>sp([0.62,10,8],[sx*1.35,4.0,0],0xdfe3f2,{s:[1,0.6,1]}))],
    back:[ M('ring',[1.5,1.7,48],[0,3.4,-1.1],0xe9eefc,{ds:1,e:0xaabaff,ei:1.5,bs:1,add:1,an:{t:'spin',ax:'z',v:0.4}}), sp([1.0,16,12],[0,3.4,-1.15],0xf4f6ff,{e:0xcdd8ff,ei:0.8,op:0.4,an:{t:'pulse',a:0.05,v:2}}), ...ring(5,(i)=>bx([0.35,3.0+((i*3)%3)*0.4,0.04],[-0.9+i*0.45,1.6,-0.7],0xf0f2fa,{ds:1,an:{t:'sway',a:0.12,v:2+i*0.2},r:[0.1,0,(i-2)*0.06]}))]}}]);

// ---- 4. The Mad Titan ----
W.push(['hollow_gauntlet','Gauntlet of the Six Hollow Stones','weapon','fist',6,'Mad Titan (homage)','Six stones, one finger-snap and a very tidy plan. The stones are hollow replicas, which is somehow worse.',
  [['amp',72],['quake',92],['chain',100],['stun',50],['burn',62],['poison',62],['expose',62],['crit',36],['bloodprice',10],['selfburn',8]], null, 'arcane',
  {b:'gaunt', metal:0xd8a824, edge:0xfff2c0, accent:0x4b2a7a, rune:0xb06cff, flame:0xb06cff, extra:[...ring(6,(i)=>{ const cols=[0x2a8aff,0xff2a3a,0xb04aff,0xff9a1a,0x3adb5a,0xffe14a]; return oc([0.16],[Math.cos(i*1.047)*0.55,0.1,Math.sin(i*1.047)*0.55+0.2],cols[i],{e:cols[i],ei:2.2,an:{t:'orbit',R:0.0,v:1,y:0.0}}); }),
    ...ring(6,(i)=>{ const cols=['rgba(60,140,255,.9)','rgba(255,50,60,.9)','rgba(176,74,255,.9)','rgba(255,154,26,.9)','rgba(58,219,90,.9)','rgba(255,225,74,.9)']; return gl([0.7],[(i-2.5)*0.22,0.2,0.62],cols[i],{an:{t:'pulse',a:0.3,v:4+i}}); }), ...ring(6,(i)=>{ const cols=[0x2a8aff,0xff2a3a,0xb04aff,0xff9a1a,0x3adb5a,0xffe14a]; return oc([0.13],[(i-2.5)*0.22,0.2,0.6],cols[i],{e:cols[i],ei:2.5}); }), bx([1.1,0.18,1.0],[0,0.95,0],0x4b2a7a,met(0x4b2a7a))]}]);
A.push(['titan_battle_plate','Battle Plate of the Mad Titan','armour','plate',6,'Mad Titan (homage)','Purple steel, gold trim and a calm, reasonable voice that says “fine, I’ll do it myself”. It makes the party hit like a planet.',
  [['ward',42],['thorns',52],['amp',36],['warcry',22],['bulwark',16],['regen',6],['taunt',150],['fragile',22],['slowskill',1],['tired',7]], null, 'arcane',
  {c:0x4b2a7a,t:0xffd04a,cape:0x2a1650,head:'custom',big:1,mod:1.25,parts:{
    head:[bx([1.55,1.35,1.5],[0,0.15,0],0x4b2a7a,met(0x4b2a7a,{mt:0.7})), bx([1.6,0.3,1.55],[0,0.72,0],0xffd04a,met(0xffd04a)), bx([0.3,0.5,0.12],[0,0.5,0.8],0xffd04a,met(0xffd04a)), ...ring(4,(i)=>bx([0.06,0.7,0.04],[-0.5+i*0.33,-0.4,0.78],0x2a1650)), ...ring(2,(i)=>bx([0.12,1.0,0.06],[(i?0.52:-0.52),-0.2,0.7],0xff8ad8,{r:[0,0,(i?0.1:-0.1)]})), ...ring(2,(i)=>bx([0.3,0.08,0.05],[(i?0.3:-0.3),0.08,0.78],0xff3a3a,{e:0xff3a3a,ei:2.4}))],
    body:[bx([2.2,0.4,1.3],[0,3.95,-0.02],0x4b2a7a,met(0x4b2a7a)), bx([1.8,0.2,0.1],[0,3.5,0.58],0xffd04a,met(0xffd04a)), ...ring(6,(i)=>oc([0.12],[-0.75+i*0.3,3.0,0.6],[0x2a8aff,0xff2a3a,0xb04aff,0xff9a1a,0x3adb5a,0xffe14a][i],{e:[0x2a8aff,0xff2a3a,0xb04aff,0xff9a1a,0x3adb5a,0xffe14a][i],ei:2})),
      ...[-1,1].flatMap(sx=>[sp([0.92,12,8],[sx*1.45,4.05,0],0x4b2a7a,met(0x4b2a7a,{s:[1,0.7,1.1]})), ...ring(4,(i)=>cn([0.17,1.0,5],[sx*(1.2+i*0.28),4.55+(i%2)*0.15,-0.2+i*0.2],0xffd04a,met(0xffd04a,{r:[0,0,-sx*(0.3+i*0.2)]})))]), bx([2.25,0.36,1.15],[0,2.15,0],0xffd04a,met(0xffd04a)), bx([1.6,0.8,0.14],[0,1.5,0.5],0x4b2a7a,met(0x4b2a7a))],
    back:[ ...ring(6,(i)=>oc([0.2],[Math.cos(i*1.047)*0.8,3.6+Math.sin(i*1.047)*0.0,-1.0],[0x2a8aff,0xff2a3a,0xb04aff,0xff9a1a,0x3adb5a,0xffe14a][i],{e:[0x2a8aff,0xff2a3a,0xb04aff,0xff9a1a,0x3adb5a,0xffe14a][i],ei:2.4,an:{t:'orbit',R:1.5,Rz:0.8,y:0.5,v:0.8,ph:i*1.047}})), gl([5],[0,3.4,-1],'rgba(176,74,255,.25)',{an:{t:'pulse',a:0.2,v:2}})]}}]);

// ---- 5. The Sorcerer Supreme ----
W.push(['eye_all_seeing','Eye of the All-Seeing','weapon','staff',6,'Sorcerer Supreme (homage)','A green eye in a golden clasp that has seen every timeline and is still, politely, waiting for you to finish your sentence.',
  [['amp',22],['chain',72],['expose',82],['weaken',82],['crit',52],['lifesteal',30],['bloodprice',5],['shortsight',10]], null, 'arcane',
  {b:'parts', hold:'staff', tip:4.9, mod:0.66, parts:[cy([0.07,0.09,4.2],[0,0.9,0],0x2a1a10,{rg:0.8}), ...ring(4,(i)=>to([0.11,0.03],[0,-0.4+i*1.0,0],GOLD,met(GOLD,{r:[PI/2,0,0]}))), to([0.5,0.08,PI*2,6,28],[0,3.7,0],GOLD,met(GOLD)), ...ring(4,(i)=>cn([0.1,0.5,4],[Math.cos(i*1.57)*0.5,3.7+Math.sin(i*1.57)*0.5,0],GOLD,met(GOLD,{r:[0,0,i*1.57-PI/2]}))),
    sp([0.34,16,12],[0,3.7,0.0],0xf4f1e8,{rg:0.15,e:0x99ffbb,ei:0.4}), sp([0.17,12,10],[0,3.7,0.24],0x2fe86a,{e:0x2fe86a,ei:2.4}), sp([0.08,8,6],[0,3.7,0.38],0x041a0c), to([0.65,0.03,PI*2,4,32],[0,3.7,0],0xffd04a,{e:0xffd04a,ei:1.4,r:[0.5,0.5,0],an:{t:'spin',ax:'z',v:1.4}}), to([0.8,0.02,PI*2,4,32],[0,3.7,0],0x7dffb4,{e:0x7dffb4,ei:1.4,r:[1.2,-0.4,0],an:{t:'spin',ax:'z',v:-1.0}}),
    gl([2.4],[0,3.7,0.1],'rgba(60,255,130,.6)',{an:{t:'pulse',a:0.25,v:3}})]}]);
A.push(['eldritch_cloak','Cloak of the Sorcerer Supreme','armour','robe',6,'Sorcerer Supreme (homage)','A sentient scarlet cloak with a very high collar and strong opinions. It shields the party, heals the party and corrects the party’s posture.',
  [['mend',16],['regen',8],['bulwark',26],['warcry',26],['energize',16],['evasion',26],['phoenix',100],['lastStand',1],['maxhp',40],['fragile',30],['bloodprice',4]], null, 'arcane',
  {c:0x1e3b8a,t:0xffc83a,cape:0xd82a2a,head:'custom',noCape:1,mod:0.7,parts:{
    head:[bx([1.45,0.45,1.45],[0,0.72,-0.02],0x1a120c), bx([0.36,0.3,0.08],[-0.65,0.5,0.7],0xcfcfd8), bx([0.36,0.3,0.08],[0.65,0.5,0.7],0xcfcfd8), cn([0.2,0.4,4],[0,-0.55,0.55],0x1a120c,{r:[PI,0,0]}), bx([0.5,0.14,0.1],[0,-0.3,0.7],0x1a120c)],
    body:[ ...ring(2,(i)=>bx([0.9,1.8,0.3],[(i?0.85:-0.85),4.3,-0.1],0xd82a2a,{r:[0,(i?-0.5:0.5),(i?-0.35:0.35)],ds:1,an:{t:'sway',a:0.03,v:1.5}})), bx([2.5,0.5,0.9],[0,4.1,-0.45],0xd82a2a,{an:{t:'sway',a:0.02,v:1.3}}), bx([1.8,2.2,0.12],[0,3.0,0.5],0x1e3b8a), bx([2.2,0.35,1.1],[0,2.15,0],0x7a5a14,met(0x7a5a14)),
      to([0.28,0.08],[0,3.35,0.62],GOLD,met(GOLD,{e:0xffc83a,ei:0.6})), sp([0.19,12,10],[0,3.35,0.7],0xf4f1e8,{e:0x99ffbb,ei:0.4}), sp([0.1,10,8],[0,3.35,0.84],0x2fe86a,{e:0x2fe86a,ei:2.4}), sp([0.04,6,5],[0,3.35,0.92],0x041a0c), cy([1.0,1.5,2.0,8],[0,1.15,0],0x1e3b8a,{r:[0,PI/8,0],s:[1,1,0.7]}), ...ring(2,(i)=>bx([0.9,1.8,0.1],[(i?0.55:-0.55),1.0,0.42],0xd82a2a,{op:1,r:[0.05,0,0]}))],
    armL:[ to([0.75,0.025,PI*2,4,32],[0,-2.3,0],GOLD,{e:0xffc83a,ei:1.8,r:[PI/2,0,0],an:{t:'spin',ax:'z',v:1.5}}), to([0.55,0.025,PI*2,4,32],[0,-2.3,0],0xffe28a,{e:0xffe28a,ei:1.8,r:[PI/2,0,0],an:{t:'spin',ax:'z',v:-2}}), gl([1.4],[0,-2.3,0],'rgba(255,190,60,.7)',{an:{t:'pulse',a:0.3,v:4}})],
    armR:[ to([0.75,0.025,PI*2,4,32],[0,-2.3,0],GOLD,{e:0xffc83a,ei:1.8,r:[PI/2,0,0],an:{t:'spin',ax:'z',v:-1.5}}), gl([1.4],[0,-2.3,0],'rgba(255,190,60,.7)',{an:{t:'pulse',a:0.3,v:4}})],
    back:[ to([2.2,0.05,PI*2,4,40],[0,3.6,-1.4],0xffc83a,{e:0xff9a1a,ei:1.6,an:{t:'spin',ax:'z',v:0.5}}), to([1.6,0.04,PI*2,4,40],[0,3.6,-1.4],0xffe28a,{e:0xffe28a,ei:1.6,an:{t:'spin',ax:'z',v:-0.8}}), ...ring(8,(i)=>bx([0.3,0.06,0.04],[Math.cos(i*0.785)*1.9,3.6+Math.sin(i*0.785)*1.9,-1.4],0xffc83a,{e:0xff9a1a,ei:1.8,r:[0,0,i*0.785+PI/2]}))]}}]);

// ---- 6. The Hell-Walker ----
W.push(['crucible_blade','The Crucible Blade','weapon','blade',6,'Hell-Walker (homage)','A sword that only exists when you are angry enough. It does not cut: it tears. Glory is optional but encouraged.',
  [['amp',62],['execute',140],['double',82],['crit',56],['lifesteal',56],['quake',52],['chain',62],['bloodprice',8],['selfburn',12]], null, 'blood',
  {b:'parts', hold:'blade', tip:3.4, parts:[cy([0.08,0.09,0.7],[0,0,0],0x1a1a1e,met(0x1a1a1e)), bx([0.8,0.16,0.3],[0,0.4,0],0x4a7a3a,met(0x4a7a3a)), sp([0.14,8,6],[0,-0.4,0],0xe9e9e0), bx([0.42,3.0,0.2],[0,2.0,0],0x2a2a30,met(0x2a2a30,{mt:0.9})), cn([0.22,0.5,4],[0,3.75,0],0x2a2a30,met(0x2a2a30,{s:[1,1,0.45],r:[0,PI/4,0]})), bx([0.1,3.1,0.22],[0,2.0,0.0],0x9dff5a,{e:0x9dff5a,ei:2.2}),
    ...ring(7,(i)=>cn([0.1,0.4,4],[(i%2?0.26:-0.26),1.0+i*0.4,0],0x2a2a30,met(0x2a2a30,{r:[0,0,(i%2?-1.2:1.2)]}))), ...ring(4,(i)=>gl([0.6],[0,1.2+i*0.7,0.15],'rgba(157,255,90,.8)',{an:{t:'pulse',a:0.3,v:6+i}})), gl([2],[0,2.4,0],'rgba(157,255,90,.35)',{an:{t:'pulse',a:0.2,v:4}})]}]);
A.push(['praetor_suit','Praetor Suit of the Hell-Walker','armour','plate',6,'Hell-Walker (homage)','Green power armour with a thousand scorch marks and a very loud engine. It has never once been taken off in anger, because it was always on.',
  [['ward',42],['thorns',72],['regen',12],['amp',42],['vengeance',32],['critdmg',60],['taunt',100],['tired',10],['clumsy',30],['shortsight',20]], null, 'blood',
  {c:0x4a7a3a,t:0xff6a1a,cape:0x1a1a1e,head:'custom',noCape:1,big:1,mod:1.3,parts:{
    head:[sp([0.86,16,12],[0,0.18,0],0x4a7a3a,met(0x4a7a3a,{mt:0.6})), bx([1.2,0.5,0.2],[0,0.15,0.66],0x0a1a0a,{rg:0.1,mt:0.9}), bx([1.0,0.2,0.1],[0,0.15,0.77],0x9dff5a,{e:0x9dff5a,ei:2.2}), bx([0.35,0.7,0.28],[0,-0.45,0.62],0x2a2a30,met(0x2a2a30)), ...ring(3,(i)=>bx([0.55,0.06,0.04],[0,-0.28-i*0.16,0.78],0x15151a)), gl([1.3],[0,0.15,0.8],'rgba(157,255,90,.4)')],
    body:[bx([2.3,2.1,1.2],[0,3.0,0],0x4a7a3a,met(0x4a7a3a,{mt:0.6})), bx([1.5,0.9,0.14],[0,3.4,0.6],0x2a2a30,met(0x2a2a30)), ...ring(4,(i)=>bx([0.9,0.06,0.04],[0,2.9+i*0.2,0.69],0xff6a1a,{e:0xff6a1a,ei:1.4})), ...[-1,1].flatMap(sx=>[sp([0.95,12,8],[sx*1.5,4.0,0],0x4a7a3a,met(0x4a7a3a,{s:[1,0.75,1.15]})), ...ring(3,(i)=>cn([0.16,0.9,5],[sx*(1.3+i*0.3),4.55,-0.1+i*0.25],0x15151a,met(0x15151a,{r:[0,0,-sx*(0.3+i*0.25)]})))]),
      bx([2.25,0.4,1.15],[0,2.1,0],0x2a2a30,met(0x2a2a30)), ...ring(4,(i)=>sp([0.12,6,5],[-0.8+i*0.5,2.1,0.62],0xe9e9e0))],
    armL:[bx([1.1,0.7,1.1],[0,-1.3,0],0x4a7a3a,met(0x4a7a3a)), bx([0.6,0.35,0.1],[0,-1.3,0.56],0xff6a1a,{e:0xff6a1a,ei:1.8})], armR:[bx([1.1,0.7,1.1],[0,-1.3,0],0x4a7a3a,met(0x4a7a3a))],
    back:[bx([1.3,1.9,0.5],[0,3.1,-0.9],0x2a2a30,met(0x2a2a30)), ...ring(2,(i)=>cy([0.2,0.28,0.9],[(i?0.4:-0.4),3.1,-1.3],0x15151a,Object.assign(met(0x15151a),{r:[PI/2,0,0]}))), ...ring(2,(i)=>gl([1.1],[(i?0.4:-0.4),3.1,-1.8],'rgba(255,110,30,.9)',{an:{t:'pulse',a:0.3,v:8}}))],
    legs:[]}}]);

// ---- 7. The Hungering Firebird ----
W.push(['phoenix_talon','Talon of the Phoenix Force','weapon','katana',6,'Cosmic Firebird (homage)','A feather-bright katana that is always, quietly, on fire. When its wielder falls it rings once and the room remembers fire.',
  [['burn',100],['crit',58],['double',62],['chain',72],['amp',46],['lifesteal',26],['selfburn',15],['bloodprice',8]], null, 'fire',
  {b:'katana', L:3.1, metal:0xff5a1a, edge:0xfff0a0, tsuba:0xffcf4a, wrap:0x5a0a2a, rune:0xff7a1a, flame:0xff5a20, extra:[...ring(2,(i)=>cn([0.1,0.9,4],[(i?0.5:-0.5),0.4,0],0xff8a1a,{e:0xff5a10,ei:1.4,r:[0,0,(i?-1.1:1.1)]})), ...ring(6,(i)=>gl([0.6],[-0.15,0.7+i*0.5,0],'rgba(255,100,30,.85)',{an:{t:'rise',v:0.7,h:1.6,o:0.8}})), gl([2.4],[-0.2,2.2,0],'rgba(255,100,30,.4)',{an:{t:'pulse',a:0.25,v:4}}),
    M('tube',[0.05,5],[0,0,0],0xffd24a,{e:0xffd24a,ei:1.5,pts:[[0.05,0.5,0.1],[0.3,0.9,0.2],[0.0,1.5,0.2],[-0.2,2.1,0.15]],seg:14,an:{t:'sway',a:0.08,v:3}})]}]);
A.push(['mantle_dark_phoenix','Mantle of the Dark Phoenix','armour','robe',6,'Cosmic Firebird (homage)','It rises from every fall, and each time it is a little hungrier. The wings are fire; the grin is entirely optional.',
  [['phoenix',100],['regen',10],['mend',8],['amp',52],['critdmg',72],['evasion',20],['vengeance',20],['warcry',15],['bleed',8],['maxhp',36],['fragile',22],['selfburn',15]], null, 'fire',
  {c:0x5a0a2a,t:0xff7a1a,cape:0x3a0418,head:'custom',noCape:1,mod:0.75,parts:{
    head:[...ring(9,(i)=>gl([0.9],[(i-4)*0.18,0.8+Math.cos((i-4)*0.4)*0.2,-0.05],'rgba(255,110,30,.95)',{an:{t:'rise',v:0.9,h:1.2,o:0.9}})), ...ring(3,(i)=>cn([0.16,1.0,4],[(i-1)*0.4,1.0+(i===1?0.3:0),-0.1],0xff5a10,{e:0xff5a10,ei:1.6,r:[0,0,(i-1)*-0.25],an:{t:'sway',a:0.12,v:5}})), ...ring(2,(i)=>bx([0.3,0.08,0.05],[(i?0.3:-0.3),0.08,0.74],0xffd24a,{e:0xffb020,ei:3})), bx([1.45,0.3,1.45],[0,0.7,-0.04],0x2a0a14)],
    body:[bx([2.3,2.1,1.1],[0,3.0,0],0x5a0a2a,{rg:0.4}), ...ring(2,(i)=>cn([0.5,1.4,4],[(i?0.55:-0.55),3.5,0.6],0xffcf4a,{e:0xff9a1a,ei:0.9,s:[1,1,0.2],r:[0,0,(i?-0.8:0.8)]})), cn([0.4,0.9,4],[0,2.5,0.62],0xffcf4a,{e:0xff9a1a,ei:0.9,s:[1,1,0.2],r:[PI,0,0]}), bx([2.4,0.8,1.25],[0,4.1,-0.02],0x2a0a14), cy([1.0,1.5,2.2,8],[0,1.15,0],0x5a0a2a,{r:[0,PI/8,0],s:[1,1,0.7]}), ...ring(6,(i)=>gl([0.8],[(i-2.5)*0.35,0.2,0],'rgba(255,100,30,.9)',{an:{t:'rise',v:0.8,h:2.0,o:0.9}}))],
    armL:[...ring(3,(i)=>gl([0.9],[0,-1.8,0],'rgba(255,110,30,.9)',{an:{t:'rise',v:0.9,h:1.4,o:0.9}}))], armR:[...ring(3,(i)=>gl([0.9],[0,-1.8,0],'rgba(255,110,30,.9)',{an:{t:'rise',v:0.9,h:1.4,o:0.9}}))],
    back:[ ...[-1,1].flatMap(sx=>ring(6,(i)=>cn([0.22-i*0.015,2.6-i*0.2,4],[sx*(0.7+i*0.55),3.9+(i%2)*0.2-i*0.18,-0.95],[0xff5a10,0xff7a20,0xffa020,0xffc83a,0xffe28a,0xffffff][i],{e:[0xff3a00,0xff5a10,0xff8a10,0xffa020,0xffc83a,0xffe28a][i],ei:1.5,s:[1,1,0.25],r:[0,0,-sx*(1.2+i*0.12)],an:{t:'wing',a:0.18,v:2.4}}))), gl([7],[0,3.8,-1.0],'rgba(255,90,20,.3)',{an:{t:'pulse',a:0.2,v:2.5}})]}}]);

// ---- 8. The Dreamer of the Drowned City ----
W.push(['trident_dreamer','Trident of the Deep Dreamer','weapon','pole',6,'Elder Deep (homage)','It was sleeping at the bottom of something older than the sea. When it opens its eye, you will find that the water was never the point.',
  [['pierce',0],['quake',82],['chain',92],['poison',72],['weaken',72],['stun',52],['amp',42],['bloodprice',10],['slowskill',1]], null, 'wave',
  {b:'parts', hold:'pole', tip:5.4, parts:[cy([0.08,0.1,4.8],[0,1.1,0],0x1e4a44,{rg:0.4,mt:0.3}), M('tube',[0.12,6],[0,0,0],0x2a6a5a,{pts:[[0.15,-1.2,0],[-0.2,-0.2,0.1],[0.2,0.8,-0.1],[-0.2,1.8,0.1],[0.15,2.8,0]],seg:30,rg:0.3}), ...ring(5,(i)=>sp([0.07,6,5],[0.2*(i%2?1:-1),-0.6+i*0.8,0.1],0xb8ff6a,{e:0xb8ff6a,ei:1.6})),
    bx([1.0,0.14,0.14],[0,3.4,0],0x2a6a5a,{rg:0.3}), ...ring(3,(i)=>cn([0.13,1.1,5],[(i-1)*0.5,4.1+(i===1?0.3:-0.1),0],0xb8ff6a,{e:0x6aff9a,ei:1.2,r:[0,0,-(i-1)*0.12]})), sp([0.3,12,10],[0,3.55,0.1],0xf4f1e8,{e:0xb8ff6a,ei:0.3}), sp([0.15,10,8],[0,3.55,0.32],0x9aff6a,{e:0x9aff6a,ei:2.4}), sp([0.07,8,6],[0,3.55,0.44],0x06140a),
    ...ring(6,(i)=>sp([0.1,8,6],[Math.cos(i*1.05)*0.45,3.0,Math.sin(i*1.05)*0.45],0xb8ff6a,{e:0xb8ff6a,ei:1.6,an:{t:'orbit',R:0.0,v:1.2,y:0.2,ph:i}})), gl([2.4],[0,3.8,0.1],'rgba(110,255,170,.5)',{an:{t:'pulse',a:0.3,v:3}})]}]);
A.push(['shroud_starspawn','Shroud of the Star-Spawn','armour','robe',6,'Elder Deep (homage)','Something is moving in the hood. Several somethings. They have names, but the names are a colour you cannot see.',
  [['evasion',36],['counter',72],['amp',40],['weaken',62],['regen',8],['bulwark',12],['energize',10],['lastStand',1],['maxhp',44],['fragile',34],['shortsight',25]], null, 'wave',
  {c:0x14423e,t:0xb8ff6a,cape:0x0c2a28,head:'custom',noCape:1,mod:0.8,parts:{
    head:[sp([0.9,14,10,0,PI*2,0,PI*0.7],[0,0.2,-0.05],0x14423e,{rg:0.5,s:[1,1.1,1.1]}), ...ring(8,(i)=>sp([0.07,6,5],[(i-3.5)*0.15,0.5+(i%2)*0.12,0.7],0xb8ff6a,{e:0xb8ff6a,ei:2.4,an:{t:'pulse',a:0.4,v:2+i}})), ...ring(2,(i)=>cn([0.18,1.1,5],[(i?0.65:-0.65),0.85,0],0x0c2a28,{r:[0,0,(i?-0.8:0.8)]})),
      ...ring(7,(i)=>M('tube',[0.09,6],[0,0,0],0x1a5a50,{pts:[[(i-3)*0.14,-0.2,0.6],[(i-3)*0.2,-0.8,0.8],[(i-3)*0.3+0.1,-1.4,0.6],[(i-3)*0.35,-2.0,0.9]],seg:14,rg:0.35,an:{t:'sway',a:0.05,v:1.6+i*0.2}})), bx([0.6,0.12,0.1],[0,-0.1,0.7],0x050f0e)],
    body:[bx([2.2,2.2,1.1],[0,3.0,0],0x14423e,{rg:0.45}), ...ring(10,(i)=>sp([0.2,6,5],[-0.8+(i%5)*0.4,3.7-Math.floor(i/5)*0.7,0.55],0x1a6a60,{rg:0.3,s:[1,0.5,1]})), ...ring(6,(i)=>sp([0.07,6,5],[-0.7+i*0.28,3.2+(i%2)*0.5,0.66],0xb8ff6a,{e:0xb8ff6a,ei:2.4})), cy([1.0,1.6,2.2,7],[0,1.15,0],0x14423e,{r:[0,PI/7,0],s:[1,1,0.7],rg:0.4}),
      ...ring(6,(i)=>M('tube',[0.1,6],[0,0,0],0x1a5a50,{pts:[[(i-2.5)*0.3,2.1,0.5],[(i-2.5)*0.4,1.2,0.9],[(i-2.5)*0.5+0.1,0.5,0.7],[(i-2.5)*0.55,-0.2,1.0]],seg:14,rg:0.35,an:{t:'sway',a:0.06,v:1.4+i*0.15}}))],
    back:[ ...[-1,1].flatMap(sx=>[...ring(3,(i)=>bx([0.12,2.8-i*0.5,0.06],[sx*(0.9+i*0.55),3.6+(i===1?0.3:0),-0.8],0x0c2a28,{r:[0,0,-sx*(0.6+i*0.3)]})), pl([2.2,2.6],[sx*1.8,3.4,-0.85],0x1a5a50,{ds:1,op:0.8,r:[0,0,-sx*0.35],an:{t:'wing',a:0.15,v:1.8}}), sp([0.16,8,6],[sx*1.8,3.5,-0.82],0xb8ff6a,{e:0xb8ff6a,ei:2.4})]), gl([6],[0,3,-1],'rgba(110,255,170,.2)',{an:{t:'pulse',a:0.2,v:2}})]}}]);

// ---- 9. The Devourer of Worlds ----
W.push(['hunger_maul','Maul of Endless Hunger','weapon','heavy',6,'World-Eater (homage)','The head is a small, bored planet. The teeth are the continents that disagreed with it. It has not eaten since breakfast.',
  [['amp',62],['quake',100],['stun',56],['lifesteal',62],['execute',120],['double',52],['expose',72],['bloodprice',12],['selfburn',10]], null, 'dark',
  {b:'parts', hold:'heavy', tip:3.3, parts:[cy([0.1,0.12,3.4],[0,0.9,0],0x3a2a5a,met(0x3a2a5a)), ...ring(4,(i)=>to([0.15,0.04],[0,-0.3+i*0.7,0],0xffd04a,met(0xffd04a,{r:[PI/2,0,0]}))), sp([0.95,16,12],[0,3.0,0],0x4b2a7a,met(0x4b2a7a,{mt:0.7,e:0x5a2a9a,ei:0.5})), sp([0.5,12,10],[0,3.0,0.55],0x1a0a2a,{e:0x7a2aff,ei:0.8}),
    ...ring(14,(i)=>cn([0.1,0.42,4],[Math.cos(i*0.4488)*0.62,3.0+Math.sin(i*0.4488)*0.62,0.7],0xf4f1e8,{r:[1.2,0,i*0.4488-PI/2]})), ...ring(14,(i)=>cn([0.09,0.36,4],[Math.cos(i*0.4488+0.22)*0.42,3.0+Math.sin(i*0.4488+0.22)*0.42,0.74],0xf4f1e8,{r:[1.2,0,i*0.4488+0.22+PI/2]})),
    ...ring(5,(i)=>cn([0.2,1.0,5],[Math.cos(i*1.26)*0.95,3.0+Math.sin(i*1.26)*0.95,-0.1],0xffd04a,met(0xffd04a,{r:[0,0,i*1.26-PI/2]}))), to([1.3,0.03,PI*2,4,40],[0,3.0,0],0x7dd8ff,{e:0x7dd8ff,ei:1.6,r:[1.2,0.4,0],an:{t:'spin',ax:'z',v:0.8}}), ...ring(3,(i)=>sp([0.12,8,6],[0,3.0,0],0x7dd8ff,{e:0x7dd8ff,ei:1.8,an:{t:'orbit',R:1.5,Rz:1.2,y:0.4,v:1.0,ph:i*2.1}})), gl([3.0],[0,3.0,0.4],'rgba(150,80,255,.45)',{an:{t:'pulse',a:0.2,v:3}})]}]);
A.push(['devourer_regalia','Regalia of the Devourer of Worlds','armour','plate',6,'World-Eater (homage)','Crown, collar and an appetite the size of a galaxy. It stands in front of everyone and says: “eat me first.” The planet does.',
  [['ward',62],['thorns',80],['regen',12],['bulwark',26],['taunt',420],['lastStand',1],['amp',26],['mend',8],['slowskill',1],['clumsy',42],['tired',12],['shortsight',20]], null, 'dark',
  {c:0x6a2fb0,t:0xffd54a,cape:0x2b9ad8,head:'custom',big:1,mod:1.75,parts:{
    head:[bx([1.55,1.5,1.5],[0,0.2,0],0x6a2fb0,met(0x6a2fb0,{mt:0.7})), bx([1.3,0.5,0.2],[0,0.1,0.72],0x2a1450,met(0x2a1450)), ...ring(2,(i)=>bx([0.3,0.08,0.05],[(i?0.3:-0.3),0.12,0.84],0x7dd8ff,{e:0x7dd8ff,ei:3})), bx([1.7,0.3,1.7],[0,0.98,0],0xffd54a,met(0xffd54a)),
      ...[-1,1].flatMap(sx=>[bx([0.5,2.6,0.4],[sx*1.2,1.7,-0.1],0x6a2fb0,met(0x6a2fb0,{r:[0,0,-sx*0.35]})), bx([0.3,2.2,0.3],[sx*1.55,2.0,-0.1],0xffd54a,met(0xffd54a,{r:[0,0,-sx*0.5]})), cn([0.25,0.9,4],[sx*1.9,3.2,-0.1],0xffd54a,met(0xffd54a,{r:[0,0,-sx*0.5]}))]), bx([0.4,1.4,0.35],[0,1.9,-0.1],0x6a2fb0,met(0x6a2fb0)), sp([0.2,10,8],[0,2.7,-0.1],0x7dd8ff,{e:0x7dd8ff,ei:2.2})],
    body:[bx([2.3,2.1,1.2],[0,3.0,0],0x6a2fb0,met(0x6a2fb0,{mt:0.65})), bx([2.5,0.5,1.3],[0,4.05,-0.02],0xffd54a,met(0xffd54a)), ...ring(5,(i)=>bx([1.7,0.07,0.05],[0,2.5+i*0.3,0.62],0x2a1450)), to([0.36,0.08],[0,3.3,0.64],0xffd54a,met(0xffd54a)), sp([0.2,10,8],[0,3.3,0.7],0x7dd8ff,{e:0x7dd8ff,ei:2.4}),
      ...[-1,1].flatMap(sx=>[sp([1.0,12,8],[sx*1.5,4.1,0],0x6a2fb0,met(0x6a2fb0,{s:[1,0.75,1.1]})), ...ring(4,(i)=>bx([0.35,1.5+i*0.4,0.12],[sx*(1.5+i*0.18),4.9+i*0.2,-0.1],0xffd54a,met(0xffd54a,{r:[0,0,-sx*(0.25+i*0.18)]})))]), bx([2.3,0.4,1.2],[0,2.1,0],0xffd54a,met(0xffd54a))],
    back:[ gl([8],[0,3.4,-1.2],'rgba(80,60,200,.3)',{an:{t:'pulse',a:0.15,v:2}}), to([2.4,0.05,PI*2,4,48],[0,3.4,-1.4],0x7dd8ff,{e:0x7dd8ff,ei:1.5,r:[0.3,0.2,0],an:{t:'spin',ax:'z',v:0.3}}), ...ring(5,(i)=>sp([0.2+i*0.04,10,8],[0,3.4,-1.4],[0xff9a3a,0x3a9aff,0x9aff5a,0xff5a9a,0xe8e8f0][i],{e:[0xff9a3a,0x3a9aff,0x9aff5a,0xff5a9a,0xe8e8f0][i],ei:0.8,an:{t:'orbit',R:2.2+i*0.12,Rz:1.2,y:0.8,v:0.6+i*0.15,ph:i*1.3}}))]}}]);

// ---- 10. Silent Instinct ----
W.push(['ki_gauntlets','Gauntlets of Silent Instinct','weapon','fist',6,'Silent Instinct (homage)','Wraps of silver and calm. The fists move before the fighter decides to, and they are almost never wrong.',
  [['double',100],['chain',100],['amp',56],['crit',66],['quake',72],['stun',46],['bloodprice',10],['tired',10]], null, 'wind',
  {b:'gaunt', metal:0xe3ebff, edge:0xffffff, accent:0x273a8a, rune:0xcfe6ff, flame:0xcfe6ff, extra:[...ring(2,(i)=>to([0.62+i*0.12,0.03,PI*2,4,28],[0,0.4,0],0xcfe6ff,{e:0xcfe6ff,ei:1.5,r:[PI/2,0,0],an:{t:'spin',ax:'z',v:1.5+i}})), gl([2.4],[0,0.2,0.3],'rgba(207,230,255,.6)',{an:{t:'pulse',a:0.3,v:6}}), ...ring(6,(i)=>gl([0.5],[(i-2.5)*0.2,0.0,0.5],'rgba(220,235,255,.9)',{an:{t:'rise',v:0.9,h:1.3,o:0.9}}))]}]);
A.push(['silver_instinct_gi','Gi of Silent Instinct','armour','leather',6,'Silent Instinct (homage)','A plain blue gi and a mind so calm it has stopped being a mind. Blows arrive and find only the afterimage.',
  [['evasion',55],['counter',100],['critdmg',100],['amp',45],['energize',20],['regen',6],['vengeance',30],['maxhp',50],['fragile',40],['shortsight',15]], null, 'wind',
  {c:0x273a8a,t:0xd9e6ff,cape:0xcfe6ff,head:'custom',noCape:1,mod:0.7,parts:{
    head:[ ...ring(11,(i)=>cn([0.2,1.3-Math.abs(i-5)*0.08,4],[(i-5)*0.14,0.95,-0.05+Math.sin(i*0.7)*0.08],0xe3ebff,{e:0xcfe6ff,ei:0.8,r:[0.15,0,-(i-5)*0.24],an:{t:'sway',a:0.04,v:3}})), bx([1.45,0.4,1.45],[0,0.7,-0.02],0xe3ebff,{e:0xcfe6ff,ei:0.5}), ...ring(2,(i)=>bx([0.3,0.08,0.05],[(i?0.3:-0.3),0.08,0.74],0xe3ebff,{e:0xcfe6ff,ei:3})), ...ring(2,(i)=>gl([0.7],[(i?0.3:-0.3),0.08,0.8],'rgba(207,230,255,.9)')), gl([2.6],[0,0.4,-0.2],'rgba(207,230,255,.5)',{an:{t:'pulse',a:0.2,v:4}})],
    body:[bx([2.2,2.1,1.1],[0,3.0,0],0x273a8a,{rg:0.6}), bx([0.5,2.0,0.1],[-0.25,3.2,0.56],0xf4f6ff,{r:[0,0,-0.35]}), bx([0.5,2.0,0.1],[0.25,3.2,0.56],0xf4f6ff,{r:[0,0,0.35]}), bx([2.2,0.38,1.12],[0,2.2,0],0xf4f6ff), bx([0.3,1.0,0.08],[0.4,1.6,0.55],0xf4f6ff,{r:[0,0,-0.1]}), bx([2.4,0.5,1.25],[0,4.0,-0.02],0x273a8a)],
    armL:[bx([1.02,0.4,1.02],[0,-1.7,0],0xd9e6ff,{e:0xcfe6ff,ei:0.4})], armR:[bx([1.02,0.4,1.02],[0,-1.7,0],0xd9e6ff,{e:0xcfe6ff,ei:0.4})],
    back:[ gl([8],[0,3.4,-0.6],'rgba(207,230,255,.45)',{an:{t:'pulse',a:0.2,v:5}}), ...ring(12,(i)=>gl([0.5],[(i%6-2.5)*0.55,0.6,-0.4],'rgba(220,235,255,.9)',{an:{t:'rise',v:0.7+(i%3)*0.2,h:5.5,o:0.9}})), ...ring(2,(i)=>M('ring',[1.9+i*0.4,2.05+i*0.4,40],[0,3.4,-0.8],0xe3ebff,{ds:1,e:0xcfe6ff,ei:1.2,bs:1,add:1,an:{t:'spin',ax:'z',v:i?-0.5:0.6}}))]}}]);

// Balance pass: the raw numbers above describe the fantasy; this table tames the stacking ones so the tiers stay a few steps apart
const SCALE = {amp:0.55, critdmg:0.6, vengeance:0.6, warcry:0.5, bulwark:0.55, mend:0.65, energize:0.6, ward:0.85, thorns:0.8, chain:0.75, double:0.75, quake:0.8, lifesteal:0.8, crit:0.85, execute:0.8, burn:0.85};
for (const it of W.concat(A)){ const f = it[4] >= 6 ? 0.62 : 1; it[7] = it[7].map(([id, v]) => [id, SCALE[id] ? Math.max(1, Math.round(v*SCALE[id]*f)) : v]); }
D.LEGENDS3 = W.concat(A);
D.LEGENDS.push(...D.LEGENDS3);
})();
