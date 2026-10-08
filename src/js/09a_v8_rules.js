/* ===== Essay Quest v8 rules (A): seven rarities, the two stat systems, gear stat tables, monster base stats =====
   Battle stats (Pokémon-style, used in every fight): HP, Attack, Defense, Sp. Atk, Sp. Def, Speed.
     Physical moves use Attack vs the target's Defense; special moves use Sp. Atk vs the target's Sp. Def.
     Speed sets turn order; Speed that comes from gear also gives dodge (0.33% a point, at most 40%).
   Requirement stats (spent from level-ups, only decide what you can equip): STR, AGI, INT, FOR, WPN.
   Gear no longer levels up, and its requirements never change. */
(() => {
const D = DATA;
D.RAR.splice(0, D.RAR.length,
  {n:'Common',      c:'#c9ced6', m:1.00},
  {n:'Uncommon',    c:'#5fd16b', m:1.04},
  {n:'Rare',        c:'#4aa3ff', m:1.08},
  {n:'Epic',        c:'#b06cff', m:1.16},
  {n:'Legendary',   c:'#ffb52e', m:1.25},
  {n:'Mythical',    c:'#ff4d6d', m:1.38},
  {n:'Outerversal', c:'#7df9ff', m:1.50});
D.R = {C:0, U:1, R:2, E:3, L:4, M:5, O:6};
D.OLDR = [0, 0, 1, 2, 3, 4, 6];   // new rarity -> the old visual tier the weapon models were drawn for
D.ELEMENTS.meme = {n:'Mythical', i:'👑', c:'#ff4d6d'};
// old legend tiers: 3 Legendary, 4 Mythical, 5 Promised (now Mythical), 6 Outerversal
const seen = new Set(); for (const x of D.LEGENDS){ if (seen.has(x)) continue; seen.add(x); x[4] = [0, 2, 3, 4, 5, 5, 6][x[4]]; }

/* ---------- the two stat systems ---------- */
D.REQ_STATS = ['STR', 'AGI', 'INT', 'FOR', 'WPN'];
D.REQ_INFO = {STR:['Strength', 'Heavy weapons, swords, spears and plate armour'], AGI:['Agility', 'Fists, bows, katanas, thrown weapons and leather armour'],
  INT:['Intelligence', 'Staves, tomes, lyres, robes and vestments'], FOR:['Fortitude', 'Every armour piece, and the strongest weapons'], WPN:['Weapon', 'Every weapon needs Weapon skill']};
D.BSTATS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
D.BSTAT_INFO = {hp:['HP', 'Health'], atk:['Attack', 'Power of physical moves'], def:['Defense', 'Cuts physical damage taken'], spa:['Sp. Atk', 'Power of special moves'],
  spd:['Sp. Def', 'Cuts special damage taken'], spe:['Speed', 'Acts earlier. Speed from gear also gives 0.33% dodge per point (max 40%)']};
D.DODGE_PER_SPE = 0.0033; D.DODGE_CAP = 0.40;
// the hero is a Pokémon with flat base stats; gear does the rest
D.HERO_BASE = {hp:60, atk:50, def:50, spa:50, spd:50, spe:50};
D.pkStat = (b, L, hp) => hp ? Math.floor(2*b*L/100) + L + 10 : Math.floor(2*b*L/100) + 5;

/* ---------- gear battle stats by rarity (C U R E L M O) ---------- */
D.ARM_BS = [{hp:40, def:10, spd:9, spe:4}, {hp:70, def:18, spd:15, spe:7}, {hp:110, def:29, spd:24, spe:11}, {hp:165, def:45, spd:38, spe:16},
            {hp:290, def:75, spd:66, spe:24}, {hp:400, def:105, spd:92, spe:32}, {hp:560, def:145, spd:128, spe:44}];
D.ROLE_BS = {plate:{hp:1.1, def:1.25, spd:0.85, spe:0.5}, leather:{hp:0.95, def:0.9, spd:0.9, spe:1.6}, robe:{hp:0.9, def:0.7, spd:1.35, spe:0.9}, vestment:{hp:0.9, def:0.75, spd:1.3, spe:0.9}};
D.WPN_POW = [22, 36, 52, 74, 110, 145, 190];
D.CASTER = ['staff', 'tome', 'grimoire', 'psalter', 'lyre'];
D.ARCH_SPE = {fist:0.18, ranged:0.12, katana:0.15, thrown:0.15, lyre:0.12, heavy:-0.06, scythe:0, blade:0.05, pole:0.03, staff:0.04, tome:0, grimoire:0, psalter:0};
D.ARCH_POW = {fist:0.92, blade:1, pole:1, ranged:0.95, heavy:1.1, scythe:1.02, katana:1, staff:1, thrown:0.94, tome:0.92, grimoire:0.96, psalter:0.88, lyre:0.88};

/* ---------- requirements: fixed per item, set by rarity (primary, secondary, tertiary) ---------- */
D.REQ_RAR = [[4, 0, 0], [10, 4, 0], [18, 10, 0], [30, 16, 0], [46, 30, 0], [60, 38, 16], [72, 50, 30]];
D.ARCH_REQ = {blade:'STR', pole:'STR', heavy:'STR', scythe:'STR', fist:'AGI', ranged:'AGI', katana:'AGI', thrown:'AGI', staff:'INT', tome:'INT', grimoire:'INT', psalter:'INT', lyre:'INT'};
D.ROLE_REQ = {plate:['FOR', 'STR', 'INT'], leather:['AGI', 'FOR', 'STR'], robe:['INT', 'FOR', 'AGI'], vestment:['INT', 'FOR', 'AGI']};
D.reqFor = it => { const [a, b, c] = D.REQ_RAR[Math.max(0, Math.min(6, it.rar || 0))]; const q = {};
  if (it.kind === 'weapon'){ if (it.ti === -1) return {}; q.WPN = a; if (b) q[D.ARCH_REQ[it.arch] || 'STR'] = b; if (c) q.FOR = c; }
  else if (it.kind === 'armour'){ if (it.starter) return {}; const [p, s, t] = D.ROLE_REQ[it.role] || D.ROLE_REQ.robe; q[p] = a; if (b) q[s] = b; if (c) q[t] = c; }
  return q; };
/* stat points from levels: tuned so a planner can wear one Legendary piece at about round 11 (20 rounds), 14 (30) and 20 (50) */
D.SP_BY_LEN = {20:4, 30:3, 50:2}; D.SP_START = 6;

/* ---------- monster base stats [hp, atk, def, spa, spd, spe] by body type (art) ---------- */
D.ART_BS = {
  slime:[70,45,55,60,70,30], goblin:[55,70,45,40,45,85], boar:[80,85,70,30,45,55], knight:[75,80,100,40,70,45], inquisitor:[90,60,75,105,95,60], eye:[95,40,70,115,105,55],
  crab:[60,85,110,40,60,40], wisp:[50,35,45,95,80,95], ghoul:[75,80,60,55,55,55], bird:[60,75,50,65,55,105], brute:[100,105,80,40,55,45], mage:[75,45,60,110,95,70],
  scarecrow:[70,70,65,75,70,55], wolf:[70,90,60,45,55,95], cat:[75,85,60,75,65,100], golem:[100,85,120,35,65,25], yeti:[100,100,75,55,65,55], wyrm:[110,105,90,105,90,80],
  rat:[45,70,40,35,40,100], drone:[55,50,75,85,75,80], bat:[50,65,45,55,50,105], treant:[105,80,90,70,85,30], harpy:[65,75,55,80,65,100], beastman:[85,95,75,50,65,70],
  cyclops:[110,110,80,45,60,40], spider:[60,80,60,55,65,85], skeleton:[60,80,70,40,55,65], gorgon:[85,65,75,105,85,70], hound3:[105,105,80,85,75,85], colossus:[130,110,120,70,90,30],
  hydra:[120,100,90,100,90,60], jelly:[70,45,55,95,90,55], serpent:[80,90,65,75,70,85], horse:[75,90,65,70,65,100], djinn:[70,55,60,105,85,85], puffer:[70,70,85,55,70,45],
  kraken:[130,105,85,90,90,55], mummy:[80,80,85,60,80,40], scorpion:[70,90,95,40,60,70], beetle:[60,75,90,40,60,60], sphinx:[110,90,95,105,105,70], fox:[60,70,55,80,75,105],
  mammoth:[125,110,95,40,70,40], bear:[110,110,85,40,65,55], giant:[130,115,95,55,75,40], bomber:[65,55,70,95,65,60], horde:[90,80,60,45,50,55], rider:[80,100,70,40,55,95],
  execut:[110,115,100,50,75,55], balloon:[80,45,60,100,75,45], cart:[75,60,85,95,75,70], ram:[105,115,110,30,60,40], furnace:[100,65,100,105,85,35], god:[120,115,100,115,100,100],
  // ★7 Promised, ★10 Outerversal, the final pair and their kin
  zeusprime:[120,110,95,130,100,105], atlas:[150,130,130,60,100,40], trainer:[100,100,90,100,90,90], mechashogun:[115,125,120,70,90,85], vampire:[110,100,85,115,100,110],
  horseman:[120,120,90,110,90,90], kaiju:[150,130,115,90,90,50], leviathan:[140,110,100,120,110,70], pharaohprime:[120,90,100,125,115,70], dragonemp:[125,125,100,125,100,100],
  pcdrake:[80,85,75,100,80,95], pcturtle:[85,80,105,85,100,70], pctoad:[85,80,85,100,100,70], pcmouse:[60,90,55,90,70,120], pcgiant:[130,100,75,65,105,40], pcpsy:[70,50,50,130,90,115],
  wraithrider:[85,105,70,80,70,100], lizard:[90,95,80,60,70,75], angler:[70,70,70,85,85,60], dragonling:[80,90,75,90,75,85],
  batgrin:[140,135,110,120,110,120], suntyrant:[150,145,125,135,115,115], moonavatar:[140,135,110,125,120,115], madtitan:[160,150,135,110,120,90], darklord:[145,110,115,150,135,100],
  sinicon:[145,130,115,140,120,105], firebird:[135,120,105,155,120,120], cthulhu:[165,135,125,140,135,70], devourer:[175,140,135,145,135,70], zalgo:[150,130,120,150,130,110],
  healer:[80,40,70,90,110,60], arceus:[150,140,130,140,130,130], giratina:[170,130,120,130,120,100], dialga:[130,120,130,150,110,100], palkia:[125,130,110,150,120,110], giratinaclone:[110,110,95,110,95,90],
  // v8: Japan and Greece
  oni:[115,120,85,45,65,55], kappa:[75,85,85,65,85,70], tengu:[70,85,60,95,75,110], kitsune:[70,60,65,115,100,115], tanuki:[80,75,75,75,75,70], yurei:[60,40,50,110,100,90],
  kama:[60,95,55,50,55,125], orochi:[150,125,100,120,100,70], ryu:[125,115,95,125,105,100], gashadokuro:[140,125,100,60,70,45], centaur:[90,105,75,70,70,100],
  griffin:[95,105,80,70,75,105], chimera:[115,110,90,110,80,85], lion:[100,115,90,45,70,95], typhon:[175,145,125,145,125,85], automaton:[95,95,115,55,80,55]};
// a trait nudges a body: swift +Speed, brute +Attack, shield +Defense, burn +Sp. Atk, healer +Sp. Def, vampiric +HP
D.TRAIT_BS = {swift:[0,0,0,0,0,25], brute:[0,20,5,0,0,-10], shield:[0,0,25,0,10,-10], burn:[0,-5,0,20,0,0], healer:[10,-10,0,5,20,0], vampiric:[15,5,0,0,0,0], split:[15,0,0,0,10,0], boss:[15,10,10,10,10,0]};
D.foeBase = e => { const b = (D.ART_BS[e.art] || [80, 80, 75, 75, 75, 70]).slice(); const t = D.TRAIT_BS[e.trait]; if (t) for (let i = 0; i < 6; i++) b[i] = Math.max(20, b[i] + t[i]); return b; };

/* ---------- move power and category ----------
   Hero moves: Basic 50 power, Area 35 to every foe, Multi n×25-30, Heavy 85-110, Specials as their ops say (×50).
   A weapon's moves are physical, unless the weapon is a caster (staff, tome, grimoire, psalter, lyre) or it carries more Sp. Atk than Attack. */
D.BASEPOW = 50;
D.SPECIAL_MOVES = new Set(['firebrand', 'flash', 'hex', 'frost', 'beam', 'spark', 'bomb', 'gust', 'sandstorm', 'mend', 'web', 'ooze']);
D.SPECIAL_ANIMS = new Set(['flame', 'flash', 'orb', 'frost', 'beam', 'bolt', 'meteor', 'gust', 'poison', 'drain', 'quake', 'bolts', 'wave', 'meteors', 'rift', 'nova', 'rain', 'glitch', 'sun', 'curse', 'web']);
D.moveCat = (mv, e) => { if (!mv) return 'phys'; if (mv.cat) return mv.cat; if (mv.id && D.SPECIAL_MOVES.has(mv.id)) return 'spec'; if (mv.id === 'strike' || mv.id === 'lunge' || mv.id === 'quick' || mv.id === 'smash' || mv.id === 'cleave' || mv.id === 'horde' || mv.id === 'lash' || mv.id === 'drain' || mv.id === 'venom' || mv.id === 'rockfall') return 'phys';
  if (mv.anim && D.SPECIAL_ANIMS.has(mv.anim)) return 'spec'; const b = e ? D.foeBase(e) : null; return b && b[3] > b[1] ? 'spec' : 'phys'; };
})();
