
/* ===== Essay Quest v7 data (E): the type chart (Pokémon rules + the new Cosmic type) and how gear and monsters get their types ===== */
(() => {
const D = DATA;
D.TYPES = ['normal','fire','water','electric','grass','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy','cosmic'];
D.TYPE_INFO = {normal:['Normal','◯','#a8a878'], fire:['Fire','🔥','#f08030'], water:['Water','💧','#6890f0'], electric:['Electric','⚡','#f8d030'], grass:['Grass','🍃','#78c850'], ice:['Ice','❄','#98d8d8'],
  fighting:['Fighting','✊','#c03028'], poison:['Poison','☠','#a040a0'], ground:['Ground','⛰','#e0c068'], flying:['Flying','🪽','#a890f0'], psychic:['Psychic','🔮','#f85888'], bug:['Bug','🐛','#a8b820'],
  rock:['Rock','🪨','#b8a038'], ghost:['Ghost','👻','#705898'], dragon:['Dragon','🐉','#7038f8'], dark:['Dark','🌑','#705848'], steel:['Steel','⚙','#b8b8d0'], fairy:['Fairy','✨','#ee99ac'], cosmic:['Cosmic','🌌','#7df9ff']};
// attacker -> [super effective, not very effective, immune]
const C = {normal:[[],['rock','steel'],['ghost']], fire:[['grass','ice','bug','steel'],['fire','water','rock','dragon'],[]], water:[['fire','ground','rock'],['water','grass','dragon'],[]],
  electric:[['water','flying'],['electric','grass','dragon'],['ground']], grass:[['water','ground','rock'],['fire','grass','poison','flying','bug','dragon','steel'],[]], ice:[['grass','ground','flying','dragon'],['fire','water','ice','steel'],[]],
  fighting:[['normal','ice','rock','dark','steel'],['poison','flying','psychic','bug','fairy'],['ghost']], poison:[['grass','fairy'],['poison','ground','rock','ghost'],['steel']], ground:[['fire','electric','poison','rock','steel'],['grass','bug'],['flying']],
  flying:[['grass','fighting','bug'],['electric','rock','steel'],[]], psychic:[['fighting','poison'],['psychic','steel'],['dark']], bug:[['grass','psychic','dark'],['fire','fighting','poison','flying','ghost','steel','fairy'],[]],
  rock:[['fire','ice','flying','bug'],['fighting','ground','steel'],[]], ghost:[['psychic','ghost'],['dark'],['normal']], dragon:[['dragon'],['steel'],['fairy']], dark:[['psychic','ghost'],['fighting','dark','fairy'],[]],
  steel:[['ice','rock','fairy'],['fire','water','electric','steel'],[]], fairy:[['fighting','dragon','dark'],['fire','poison','steel'],[]], cosmic:[['cosmic'],[],[]]};
const one = (a, d) => { if (d === 'cosmic') return a === 'cosmic' ? 2 : 0.5; const c = C[a]; if (!c) return 1; return c[0].includes(d) ? 2 : c[1].includes(d) ? 0.5 : c[2].includes(d) ? 0.25 : 1; };   // "immune" is 0.25 here so nothing ever becomes unwinnable
D.typeMul = (atk, defs) => { if (!atk || !defs || !defs.length) return 1; let m = 1; for (const d of defs) m *= one(atk, d); return Math.max(0.25, Math.min(4, m)); };

// ---- who gets which type ----
const RULES = [['dragon','dragon|drake|wyrm|wyvern|hydra|fafnir|smaug|draconic|ryuga'], ['ghost','ghost|spirit|wraith|shade|phantom|spectre|specter|soul|haunt|death|reaper|undead|skeleton|tomb|grave|bone|anubis|underworld|hel\\b|horseman|mummy|lich|banshee'],
  ['fire','flame|fire|ember|inferno|blaze|burn|\\bsun\\b|scorch|magma|phoenix|solar|forge|furnace|cinder|lava|volcan|surtr|ra\\b'], ['water','tide|wave|\\bsea\\b|coral|kraken|ocean|trident|harpoon|poseidon|neptune|river|drown|leviathan|\\brain|pearl|siren|abyss|angler|jelly|puffer|crab|shark'],
  ['ice','frozen|frost|\\bice\\b|snow|winter|glacier|freez|\\bcold|rime|aurora|blizzard|yeti|icicle|avalanche|ymir|fenrir'], ['electric','thunder|lightning|storm|spark|volt|zeus|\\bbolt|\\bthor\\b|shock|static|tesla|susanoo'],
  ['poison','venom|poison|toxic|plague|serpent|viper|snake|spider|hemlock|cobra|\\bbile|\\booze|slime|apophis'], ['psychic','\\bmind|psychic|thought|dream|oracle|\\beye|vision|wisdom|seer|mystic|sphinx|brain|telescreen|watcher|prospero|odin'],
  ['dark','shadow|\\bdark|night|\\bvoid|black|raven|crow|\\bmoon|vampire|curse|grim|midnight|bat\\b|hollow|fog|sycorax|o.brien|police'], ['fairy','fairy|\\bfae\\b|\\bstar\\b|charm|holy|angel|divine|unicorn|rainbow|sacred|saint|halo|\\blight|isis|herald|ariel'],
  ['grass','\\bleaf|forest|\\bvine|\\broot|thorn|\\boak|\\bgreen|nature|\\bwood|bloom|moss|druid|bramble|treant|plant|\\bivy|sprout|fungus|mushroom'], ['ground','\\bearth|\\bsand|\\bdust|desert|quake|\\bclay|\\bmud|scarab|pharaoh|colossus|dune'],
  ['rock','\\brock|boulder|crag|granite|obsidian|cliff|pillar|golem|troll|atlas|gargoyle'], ['flying','\\bwing|feather|\\bwind|gust|eagle|hawk|\\bsky|cloud|\\bbird|falcon|\\bowl|harpy|djinn|raven'], ['bug','\\bbug|insect|beetle|locust|\\bant\\b|\\bmoth|swarm|\\bhive|wasp|\\bbee\\b|\\bweb\\b'],
  ['steel','steel|\\biron|plate|armou?r|metal|mecha|\\bblade|sword|knight|chain|gauntlet|shogun|musashi|sabre|gladius|hatchet|\\baxe|helm|shield|spear|lance'], ['fighting','\\bfist|punch|champion|warrior|gladiator|brawl|knuckle|martial|monk|spartan|titan|hammer|\\bclub|maul|\\bmace|\\bwar\\b|\\bares\\b|enforcer|guard\\b|brute|ogre|goblin|orc|bandit']]
  .map(([t, r]) => [t, new RegExp(r, 'i')]);
const classify = (text, n) => { const out = []; for (const [t, re] of RULES){ if (re.test(text)){ out.push(t); if (out.length >= n) break; } } return out; };
const WORLD_T = ['grass','water','ground','ice'];
D.ITEM_TYPES = {   // explicit types for the v7 gear (Promised = world-leader meme gear, Outerversal = cosmic)
  supreme_beard_plate:['steel','fighting'], rocket_pointer:['fire'], emancipator_frock:['fighting','fairy'], rail_splitter_axe:['fighting'], rough_rider_coat:['fighting','ground'], big_stick:['fighting'],
  continental_greatcoat:['steel','flying'], liberty_hatchet:['steel'], grande_armee_coat:['steel','dark'], austerlitz_sabre:['steel'], khan_lamellar:['fighting','flying'], horde_bow:['flying'],
  asp_gown:['poison','psychic'], asp_scepter:['poison'], laurel_cuirass:['steel','fighting'], gladius_ides:['steel'], bulldog_siren_suit:['dark','fighting'], finest_hour_tommy:['steel'],
  macedonian_phalanx_plate:['steel','fighting'], sarissa_conqueror:['steel'],
  cowl_grinning_bat:['cosmic','dark'], barbed_crowbar:['cosmic'], primal_steel_armour:['cosmic','steel'], fists_last_sun:['cosmic'], crescent_crusader_mantle:['cosmic','ghost'], crescent_chain_sickles:['cosmic'],
  titan_battle_plate:['cosmic','fighting'], hollow_gauntlet:['cosmic'], eldritch_cloak:['cosmic','psychic'], eye_all_seeing:['cosmic'], praetor_suit:['cosmic','fire'], crucible_blade:['cosmic'],
  mantle_dark_phoenix:['cosmic','psychic'], phoenix_talon:['cosmic'], shroud_starspawn:['cosmic','water'], trident_dreamer:['cosmic'], devourer_regalia:['cosmic','dark'], hunger_maul:['cosmic'],
  silver_instinct_gi:['cosmic','psychic'], ki_gauntlets:['cosmic']};
D.itemTypes = it => { if (!it) return ['normal']; if (it.types && it.types.length) return it.types;
  const ik = it.myth || it.special; let t = ik && D.ITEM_TYPES[ik]; if (!t && it.support && it.arch) t = [D.SUPPORT_TYPE[it.arch]]; if (!t && it.role === 'vestment') t = ['fairy']; if (!t){ const txt = `${it.name || ''} ${it.lore || ''} ${it.special || ''} ${it.arch || ''} ${it.type || ''}`; t = classify(txt, it.kind === 'armour' ? 2 : 1);
    if (!t.length) t = [it.kind === 'armour' ? WORLD_T[it.world || 0] : 'normal']; }
  if (t.includes('cosmic') && !(it.rar >= 6) && !(ik && D.ITEM_TYPES[ik])) t = t.filter(x => x !== 'cosmic'); it.types = t; return t; };
D.ENEMY_TYPES = {zeusPrime:['electric'], atlasPrime:['ground','rock'], redTrainer:['normal'], mechaMusashi:['steel'], countMidnight:['dark','flying'], paleHorseman:['ghost'], gorath:['dragon','ground'], matriarch:['water','dragon'], ramsesPrime:['ground','psychic'], ryuga:['dragon','fire'],
  thunderEagle:['electric','flying'], pcDrake:['fire','flying'], pcTurtle:['water'], pcToad:['grass','poison'], pcMouse:['electric'], pcGiant:['normal'], pcPsy:['psychic'], batFlock:['dark','flying'], wraithRider:['ghost'], kaijuSpawn:['dragon'], anglerFry:['water'], mummyGuard:['ghost','ground'], dragonling:['dragon'], rockGolem:['rock','ground'], shogunDrone:['steel'],
  batGrin:['cosmic'], sunTyrant:['cosmic'], hollowMoon:['cosmic'], madTitanE:['cosmic'], dormuun:['cosmic'], sinIcon:['cosmic'], firebird:['cosmic'], dreamerRlyeh:['cosmic'], devourer:['cosmic'], zalgo:['cosmic'],
  healVoid:['ghost'], healDeep:['water'], healEmber:['fire'], healStar:['fairy'],
  primalArceus:['normal'], giratina:['ghost','dragon'], giratinaClone:['ghost','dragon'], dialga:['steel','dragon'], palkia:['water','dragon'],
  zeusGod:['electric'], aresGod:['fighting'], poseidonGod:['water'], susanooGod:['electric','dragon'], raGod:['fire','psychic'], sekhmetGod:['fire','fighting'], odinGod:['psychic','steel'], thorGod:['electric','fighting']};

Object.assign(D.ENEMY_TYPES, {   // hand-checked: each type follows the myth, the way a Pokémon's would
  goblin:['dark'], boar:['normal','ground'], enforcer:['dark'], crab:['water','steel'], sprite:['electric','fairy'], drowned:['water','ghost'], gull:['water','flying'], caliban:['dark','fighting'], scarecrow:['ghost','grass'], husk:['ghost'],
  hound:['fire','dark'], shadow:['ghost','dark'], wolf:['ice','dark'], yeti:['ice','fighting'], troll:['rock','ice'], pwisp:['ghost','fairy'], pirate:['dark','water'], iboar:['ground'], arielStorm:['electric','flying'], bandit:['dark','fighting'],
  hollowKing:['ghost','dark'], iwisp:['ice','ghost'], sgoblin:['ice','dark'], wyrm:['dragon','dark'], spy:['dark'], drone:['steel','electric'], hatemob:['fighting','dark'], bee:['bug','flying'], satyr:['grass','fairy'], cyclopsY:['rock','fighting'],
  spider:['bug','poison'], bat:['dark','flying'], minotaur:['fighting'], medusa:['poison','rock'], cerberus:['dark','fire'], polyphemus:['ground','fighting'], colossus:['steel','psychic'], hydra:['water','poison'], siren:['water','fairy'],
  sharkman:['water','dark'], barnacle:['rock','water'], ghostsailor:['ghost','water'], kelpie:['water','fairy'], coralcrab:['water','rock'], puffer:['water','poison'], drownknight:['water','ghost'], seaserpent:['water','dragon'], scylla:['water','poison'],
  sirenqueen:['water','fairy'], stephano:['dark','fighting'], sycorax:['dark','water'], scorpion:['bug','poison'], jackal:['dark'], sandwurm:['ground','dragon'], ushabti:['ground','ghost'], stuffedman:['ghost'], crocman:['water','ground'], magus:['psychic'],
  anubisE:['ghost','dark'], setE:['ground','dark'], apophis:['poison','dark'], pharaoh:['ground','ghost'], draugr:['ghost','ice'], icespider:['bug','ice'], frostbat:['ice','flying'], mammoth:['ice','ground'], raven:['dark','flying'],
  polarbear:['ice'], giantling:['ice','fighting'], snowserpent:['ice','dragon'], fallenvalk:['flying','fighting'], frozentreant:['ice','grass'], skoll:['dark','fire'], hrungnir:['rock','fighting'], brynhildr:['fighting','flying'], fenrir:['dark','ice'],
  ymir:['ice','rock'], bomber:['steel','fire'], horde:['ghost','ground'], hogrider:['fighting'], balloon:['flying','fire'], sparkcart:['electric','steel'], tideram:['water','steel'], brineExec:['water','dark'], furnace:['fire','steel'],
  sandhorde:['ground','ghost'], sandram:['ground','steel'], sunExec:['fire','dark'], frostballoon:['ice','flying'], frostbomber:['ice','steel'], frostExec:['ice','dark'], aresGod:['fighting','fire'], mummy:['ghost','ground']});
// ---- move types: a move gets its type from its name (Frost Nova = ice, Slash = normal), else from an imbued legendary weapon, else from its weapon style ----
D.MOVE_HARD = {'Frozen Chapter':'ice', 'Rime Pages':'ice', 'Ice Shard':'ice', 'Frost Page':'ice', 'Frost Nova':'ice', 'Poison Arrow':'poison', 'Earthquake':'ground', 'Soul Harvest':'ghost', 'Pressure Point':'fighting', 'Focus Strike':'fighting'};
D.MOVE_SOFT = {'Page Strike':'psychic', 'Glyph Barrage':'psychic', 'Mana Lance':'psychic', 'Chant':'fairy', 'Smiting Chant':'fairy', 'Holy Verse':'fairy', 'Jab':'fighting', 'Flurry':'fighting', 'Haymaker':'fighting', 'Reap Strike':'dark', 'Reap':'dark', 'Execution':'dark', 'Arcane Bolt':'psychic', 'Arcane Storm':'psychic', 'Arcane Lance':'psychic'};
D.GENERIC_MOVES = new Set(['Slash','Cleave','Heavy Slash','Blade Dance','Thrust','Sweep','Impale','Phalanx','Quick Shot','Volley','Aimed Shot','Bash','Shockwave','Crushing Blow','Draw Cut','Thousand Cuts','Iaido','Toss','Ricochet','Pinning Throw','Smoke Bomb']);
// v8: a plain weapon's four moves cover more than one type, so no foe is ever a wall (Slash is Normal, but Cleave and Heavy Slash are Steel)
D.ARCH_TY = {fist:['fighting','dark','fighting'], blade:['normal','steel','steel'], pole:['normal','flying','steel'], ranged:['normal','flying','steel'], heavy:['normal','ground','rock'], scythe:['dark','ghost','dark'],
  katana:['steel','normal','steel'], staff:['psychic','fire','psychic'], thrown:['steel','flying','normal']};
D.moveTypeOf = (m, w) => { if (!m) return 'normal'; if (D.MOVE_HARD[m.n]) return D.MOVE_HARD[m.n];
  if (w && D.ARCH_TY[w.arch] && m.slot != null && m.slot < 3 && (D.GENERIC_MOVES.has(m.n) || D.MOVE_SOFT[m.n] || m.fx === 'basic') && !(w.rar >= 4 && D.itemTypes(w)[0] !== 'normal')) return D.ARCH_TY[w.arch][m.slot];
  const wt = w ? D.itemTypes(w)[0] : 'normal', imbued = w && w.rar >= 4 && wt !== 'normal';
  if (D.GENERIC_MOVES.has(m.n) || D.MOVE_SOFT[m.n]) return imbued ? wt : (D.MOVE_SOFT[m.n] || 'normal');   // a legendary weapon's own element flows through its plain moves
  const byName = classify(m.n, 1)[0]; if (byName) return byName; if (imbued) return wt;
  const byDesc = (m.slot === 3 || m.fx === 'myth1') && m.d ? classify(m.d, 1)[0] : null; return byDesc || 'normal'; };
D.enemyTypes = (key, name, art) => D.ENEMY_TYPES[key] || (() => { const t = classify(`${name || (D.ENEMIES[key] || [])[0] || ''} ${art || (D.ENEMIES[key] || [])[1] || ''} ${key}`, 2); return t.length ? t : ['normal']; })();
})();
