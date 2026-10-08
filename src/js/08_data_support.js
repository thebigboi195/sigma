
/* ===== Essay Quest v7 data (S): support gear — Mana Tomes, Frost Grimoires, Warding Psalters, War Lyres and healer vestments, from Common to Outerversal ===== */
(() => {
const D = DATA, PI = Math.PI;
Object.assign(D.ARCHMOVES, {
  tome:    {t2:['Glyph Barrage','multi',3,0.4,90], t3:['Mana Lance',45,95,1.8,{}], t4:['Restoring Verse','Read a healing verse: the whole party heals 25% and is cleansed of every ailment',[['heal','party',0.25],['cleanse']],100]},
  grimoire:{t2:['Rime Pages','area',0,0.5,85], t3:['Ice Shard',45,95,1.9,{slow:2}], t4:['Frozen Chapter','40% to every enemy, and each one is frozen solid for 1 turn',[['all',0.4],['status','freeze',100,'all',1]],85]},
  psalter: {t2:['Smiting Chant','multi',3,0.4,90], t3:['Holy Verse',45,95,1.8,{}], t4:['Bulwark Hymn','The party takes 30% less damage for 2 rounds and gains 20 energy',[['aegis',0.3,2],['energy',20]],100]},
  lyre:    {t2:['Discordant Chord','area',0,0.5,85], t3:['Piercing Note',45,95,1.8,{pierce:true}], t4:['Rally Song','The party deals +25% damage for 3 rounds and gains 15 energy',[['rally',0.25,3],['energy',15]],100]}});
Object.assign(D.BASICMOVE, {tome:'Page Strike', grimoire:'Frost Page', psalter:'Chant', lyre:'Pluck'});
D.SUPPORT_ARCHS = ['tome', 'grimoire', 'psalter', 'lyre'];
D.SUPPORT_NAMES = {tome:'Mana Tome', grimoire:'Frost Grimoire', psalter:'Warding Psalter', lyre:'War Lyre'};
D.SUPPORT_TYPE = {tome:'psychic', grimoire:'ice', psalter:'fairy', lyre:'normal'};
const PFX = ['Worn', 'Fine', 'Runed', 'Radiant', 'Ancient'], WLD = [' of the Green Vale', ' of the Storm Coast', ' of the Hollow Wastes', ' of the Frozen North'];
D.supportName = (arch, rar, w) => `${PFX[Math.min(4, rar)]} ${D.SUPPORT_NAMES[arch]}${WLD[w || 0]}`;
D.VESTMENT_NAMES = ['Acolyte’s Smock', 'Healer’s Habit', 'Cleric’s Vestments', 'Archbishop’s Raiment', 'Seraph’s Vestments'];
// abilities by rarity (index 0..4); mythical ones carry a downside, as all strong gear does
D.supportAbil = (arch, rar) => { const r = Math.min(4, rar); const T = {
  tome:    [[], [['mend', 1]], [['mend', 2], ['energize', 3]], [['mend', 3], ['energize', 5], ['bulwark', 4]], [['mend', 5], ['energize', 7], ['bulwark', 6], ['fragile', 6]]],
  grimoire:[[], [['expose', 4]], [['expose', 8], ['weaken', 6]], [['expose', 14], ['weaken', 14]], [['expose', 22], ['weaken', 22], ['energize', 4], ['clumsy', 6]]],
  psalter: [[], [['ward', 2]], [['ward', 4], ['bulwark', 2]], [['ward', 6], ['bulwark', 5], ['mend', 2]], [['ward', 9], ['bulwark', 8], ['mend', 4], ['tired', 4]]],
  lyre:    [[], [['warcry', 2]], [['warcry', 3], ['amp', 3]], [['warcry', 5], ['amp', 5], ['energize', 3]], [['warcry', 8], ['amp', 8], ['energize', 5], ['fragile', 6]]]}; return T[arch][r].map(x => x.slice()); };
D.vestmentAbil = rar => { const r = Math.min(4, rar); return [[], [], [['mend', 2]], [['mend', 3], ['energize', 4], ['ward', 6]], [['mend', 5], ['energize', 6], ['ward', 10], ['bulwark', 5], ['phoenix', 30], ['fragile', 8]]][r].map(x => x.slice()); };

// ---- legendary support gear for the top two tiers ----
const M = (k, d, p, c, o) => Object.assign({k, d, p, c}, o || {});
const bx = (d, p, c, o) => M('box', d, p, c, o), cy = (d, p, c, o) => M('cyl', d, p, c, o), sp = (d, p, c, o) => M('sph', d, p, c, o), gl = (d, p, c, o) => M('glow', d, p, c, o), oc = (d, p, c, o) => M('oct', d, p, c, o), to = (d, p, c, o) => M('tor', d, p, c, o), cn = (d, p, c, o) => M('cone', d, p, c, o);
const GOLD = 0xe3b53a;
const book = (cover, page, glow, runes) => [bx([1.1, 1.5, 0.28], [0, 2.0, 0], cover, {rg:0.5}), bx([0.98, 1.38, 0.22], [0.04, 2.0, 0], page, {rg:0.8}), bx([0.12, 1.5, 0.32], [-0.55, 2.0, 0], cover, {mt:0.3}), ...[[-0.5, 2.7], [0.5, 2.7], [-0.5, 1.3], [0.5, 1.3]].map(([x, y]) => bx([0.2, 0.2, 0.34], [x, y, 0], GOLD, {mt:0.9, rg:0.25})),
  oc([0.28], [0, 2.0, 0.17], glow, {e:glow, ei:2.2, s:[1, 1, 0.5], an:{t:'pulse', a:0.2, v:3}}), gl([2.4], [0, 2.0, 0.2], runes, {an:{t:'pulse', a:0.2, v:2}}), cy([0.07, 0.07, 2.6], [0, 0.4, 0], 0x6a4422)];
const W = [], A = [];
// [key, name, kind, arch|role, rarity, origin, lore, abilities (+downsides), down, fx, spec]
W.push(['meditations_tome', 'Meditations of the Emperor', 'weapon', 'tome', 5, 'Rome (parody)', 'A philosopher-emperor’s private notes, written on campaign: be calm, be fair, endure. Reading from it, somehow, helps.',
  [['mend', 11], ['energize', 12], ['bulwark', 10], ['shortsight', 10]], null, 'holy', {b:'parts', hold:'staff', tip:3.0, mod:0.9, parts:book(0x6a1a2a, 0xf4ead0, 0xffe27a, 'rgba(255,226,122,.7)')}]);
W.push(['winter_campaign_atlas', 'Winter Campaign Atlas', 'weapon', 'grimoire', 5, 'Grande Armée (parody)', 'Every page is a map of a march that went on too long. The ink is frost. Anyone who reads it feels very, very cold.',
  [['expose', 30], ['weaken', 28], ['energize', 8], ['clumsy', 12]], null, 'ice', {b:'parts', hold:'staff', tip:3.0, mod:0.9, parts:book(0x1c3a6a, 0xe8f4ff, 0x9fe8ff, 'rgba(159,232,255,.7)')}]);
W.push(['hymnal_of_peace', 'Hymnal of Quiet Resistance', 'weapon', 'psalter', 5, 'Salt March (parody)', 'A hymnal for people who will not raise a hand and will not move either. Surprisingly hard to hit through.',
  [['ward', 14], ['bulwark', 14], ['mend', 6], ['tired', 6]], null, 'holy', {b:'parts', hold:'staff', tip:3.0, mod:0.9, parts:book(0xe8e0c8, 0xfffbe8, 0xffffff, 'rgba(255,255,255,.7)')}]);
W.push(['fiddle_while_burning', 'Fiddle-Lyre of the Burning City', 'weapon', 'lyre', 5, 'Rome (parody)', 'Played with great feeling while everything burns. The crowd goes wild; the crowd is on fire.',
  [['warcry', 12], ['amp', 12], ['energize', 8], ['selfburn', 8]], null, 'fire', {b:'parts', hold:'staff', tip:3.0, mod:0.9, parts:[cy([0.06, 0.06, 2.8], [0, 1.4, 0], 0x6a4422), to([0.65, 0.07], [0, 3.0, 0], GOLD, {mt:0.9, r:[0, PI/2, 0]}), bx([0.07, 0.7, 0.07], [0, 3.0, 0], GOLD, {mt:0.9}), ...[-0.3, -0.1, 0.1, 0.3].map(x => bx([0.02, 1.2, 0.02], [x, 3.0, 0], 0xffe27a)), gl([2.2], [0, 3.0, 0], 'rgba(255,120,30,.8)', {an:{t:'pulse', a:0.3, v:5}})]}]);
W.push(['vishanti_tome', 'Tome of the Three Vishanti', 'weapon', 'tome', 6, 'Beyond the mystic arts', 'A book that is also a door that is also three gods’ homework. It heals what is broken and un-breaks what is dead.',
  [['mend', 18], ['energize', 16], ['bulwark', 16], ['warcry', 8], ['bloodprice', 6], ['shortsight', 12]], null, 'holy', {b:'parts', hold:'staff', tip:3.2, mod:0.8, parts:[...book(0x2a1a5a, 0xdfe6ff, 0x7df9ff, 'rgba(125,249,255,.8)'), ...[0, 1, 2].map(i => to([0.9 + i*0.3, 0.035], [0, 2.0, 0.1], 0x7df9ff, {e:0x7df9ff, ei:1.6, an:{t:'spin', ax:'z', v:0.6 - i*0.5}}))]}]);
W.push(['eternal_winter_codex', 'Codex of the Eternal Winter', 'weapon', 'grimoire', 6, 'Beyond the cold', 'Its last page is blank and absolutely zero degrees. Open it and the room remembers it was once a star.',
  [['expose', 44], ['weaken', 40], ['energize', 12], ['amp', 10], ['clumsy', 18], ['tired', 8]], null, 'ice', {b:'parts', hold:'staff', tip:3.2, mod:0.8, parts:[...book(0x0a2a4a, 0xdff6ff, 0xbfefff, 'rgba(191,239,255,.8)'), ...[0, 1, 2, 3, 4, 5].map(i => oc([0.14], [Math.cos(i*1.05)*1.2, 2.0 + Math.sin(i*1.05)*1.2, 0.1], 0xdff6ff, {e:0xbfefff, ei:1.5, an:{t:'bob', a:0.15, v:2 + i*0.3}}))]}]);
W.push(['lantern_oath', 'Oath of the Emerald Corps', 'weapon', 'psalter', 6, 'Beyond fear', 'In brightest day, in blackest night, no foe shall hurt a friend of mine. (The foes were not consulted.)',
  [['ward', 22], ['bulwark', 22], ['mend', 10], ['taunt', 120], ['tired', 10], ['clumsy', 14]], null, 'holy', {b:'parts', hold:'staff', tip:3.2, mod:0.8, parts:[...book(0x0a5a2a, 0xe8ffe8, 0x4aff7a, 'rgba(74,255,122,.8)'), to([1.05, 0.06], [0, 2.0, 0.1], 0x4aff7a, {e:0x4aff7a, ei:2, an:{t:'spin', ax:'z', v:0.8}})]}]);
W.push(['orpheus_beyond', 'Lyre of Orpheus-Beyond', 'weapon', 'lyre', 6, 'Beyond the underworld', 'He charmed Hades with it once. This one charms the part of the universe that decides who stays dead.',
  [['warcry', 16], ['amp', 16], ['energize', 12], ['mend', 8], ['bloodprice', 6], ['fragile', 14]], null, 'holy', {b:'parts', hold:'staff', tip:3.2, mod:0.8, parts:[cy([0.06, 0.06, 2.8], [0, 1.4, 0], 0xdfe6ff), to([0.7, 0.07], [0, 3.1, 0], 0x7df9ff, {e:0x7df9ff, ei:1.6, r:[0, PI/2, 0]}), ...[-0.35, -0.12, 0.12, 0.35].map(x => bx([0.02, 1.3, 0.02], [x, 3.1, 0], 0xffffff, {e:0x9fe8ff, ei:1.2})), gl([3.0], [0, 3.1, 0], 'rgba(125,249,255,.8)', {an:{t:'pulse', a:0.3, v:4}})]}]);
const vest = (c, t, cape, o) => Object.assign({c, t, cape, head:'circlet', noCape:o && o.noCape ? 1 : 0, mod:0.9}, o || {});
A.push(['homespun_shawl', 'Homespun Shawl of Peace', 'armour', 'vestment', 5, 'Salt March (parody)', 'Hand-spun, hand-woven, impossible to argue with. It asks nothing of you and makes everyone near it a little braver.',
  [['mend', 14], ['bulwark', 12], ['energize', 10], ['ward', 14], ['regen', 4], ['fragile', 22], ['clumsy', 10]], null, 'holy', vest(0xf4efe0, 0xc8b88a, 0xe8e0c8)]);
A.push(['sari_of_mercy', 'Blue-Bordered Sari of Mercy', 'armour', 'vestment', 5, 'Calcutta (parody)', 'White cloth and a blue border. It heals and heals and heals, and the one wearing it forgets to look after themselves.',
  [['mend', 16], ['energize', 12], ['ward', 10], ['phoenix', 60], ['regen', 5], ['fragile', 26], ['tired', 6]], null, 'holy', vest(0xffffff, 0x2a6ac8, 0xdfeaff)]);
A.push(['cosmic_healer_vestments', 'Vestments of the Cosmic Healer', 'armour', 'vestment', 6, 'Beyond the mystic arts', 'Robes stitched from a thousand surgeries on a thousand dying suns. The wearer can fix almost anything but themselves.',
  [['mend', 22], ['energize', 18], ['bulwark', 14], ['phoenix', 100], ['warcry', 8], ['regen', 6], ['maxhp', 24], ['fragile', 30], ['tired', 8]], null, 'holy', vest(0x2a1a5a, 0x7df9ff, 0xff4a8a, {noCape:0})]);
A.push(['lantern_bearer_mantle', 'Mantle of the Lantern-Bearer', 'armour', 'vestment', 6, 'Beyond fear', 'It glows when the room is frightened. Everyone in the room is therefore very, very well protected.',
  [['ward', 24], ['bulwark', 20], ['mend', 12], ['taunt', 140], ['phoenix', 80], ['thorns', 14], ['clumsy', 20], ['tired', 9]], null, 'holy', vest(0x0a4a24, 0x4aff7a, 0x0a2a14)]);
Object.assign(D.SIGS, {
  meditations_tome:['Stoic Calm', 'A reading of calm: the party heals 30%, is cleansed, and takes 20% less damage for 2 rounds', [['heal', 'party', 0.3], ['cleanse'], ['aegis', 0.2, 2]]],
  winter_campaign_atlas:['Retreat from the Cold', '50% to every enemy: they freeze solid for a turn and are weakened for 2', [['all', 0.5], ['status', 'freeze', 100, 'all', 1], ['weak', 2, 'all']]],
  hymnal_of_peace:['Peaceful Resistance', 'The party takes 40% less damage for 2 rounds, heals 12% and gains 30 energy', [['aegis', 0.4, 2], ['heal', 'party', 0.12], ['energy', 30]]],
  fiddle_while_burning:['Fiddle While It Burns', '80% to every enemy and everything burns; the party deals +30% damage for 3 rounds', [['all', 0.8], ['burn', 'all'], ['rally', 0.3, 3]]],
  vishanti_tome:['Mystic Restoration', 'Every fallen ally returns at 60% HP, the party heals 40%, is cleansed and gains 30 energy', [['revive', 0.6, 'all'], ['heal', 'party', 0.4], ['cleanse'], ['energy', 30]]],
  eternal_winter_codex:['Absolute Zero', '100% to every enemy: they freeze for a turn and take +40% damage for 3 rounds', [['all', 1.0], ['status', 'freeze', 100, 'all', 1], ['vuln', 3, 'all', 0.4]]],
  lantern_oath:['Constructs of Will', 'The party takes 50% less damage for 3 rounds, dodges the next 2 attacks and gains 40 energy', [['aegis', 0.5, 3], ['smoke', 2, 'party'], ['energy', 40]]],
  orpheus_beyond:['Song Beyond Death', 'Every fallen ally returns at 50% HP, the party deals +40% damage for 3 rounds and heals 25%', [['revive', 0.5, 'all'], ['rally', 0.4, 3], ['heal', 'party', 0.25]]]});
Object.assign(D.MYTHT1, {});
Object.assign(D.ITEM_TYPES, {meditations_tome:['psychic'], winter_campaign_atlas:['ice'], hymnal_of_peace:['fairy'], fiddle_while_burning:['fire'], homespun_shawl:['fairy', 'normal'], sari_of_mercy:['fairy', 'psychic'],
  vishanti_tome:['cosmic', 'psychic'], eternal_winter_codex:['cosmic', 'ice'], lantern_oath:['cosmic', 'fairy'], orpheus_beyond:['cosmic', 'fairy'], cosmic_healer_vestments:['cosmic', 'fairy'], lantern_bearer_mantle:['cosmic', 'steel']});
D.LEGENDS.push(...W, ...A);
D.LEGENDS3.push(...W, ...A);
})();
