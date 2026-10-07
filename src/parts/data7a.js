/* ===== Essay Quest v7 data (A): rarities, abilities, boons, consumables, elements ===== */
(() => {
const D = DATA;
// ---- two new rarities above Mythical ----
D.RAR.push({n:'Promised',    c:'#ff8ad8', m:1.55},    // 7★ dungeons: meme-tier gear of the world's most famous leaders
           {n:'Outerversal', c:'#7df9ff', m:1.5});   // 10★ dungeons: gear from beyond every universe
// ---- new abilities (positive) and downsides (the downsides sit in an item's `abil` list so an item can carry several) ----
Object.assign(D.ABIL_TEXT, {
  amp:'+{v}% to ALL damage you deal', critdmg:'Critical hits deal +{v}% more damage', vengeance:'+{v}% damage for every 10% of your HP that is missing',
  expose:'{v}% chance for your hits to leave the target Exposed (+30% damage taken)', poison:'{v}% chance to poison on hit', weaken:'{v}% chance for your hits to Weaken the target (−30% damage)',
  bulwark:'While you stand, the whole party takes {v}% less damage', warcry:'While you stand, the whole party deals +{v}% damage', mend:'Heal every ally {v}% max HP at the end of each round',
  taunt:'Enemies are {v}% more likely to target you', lastStand:'Once per battle, survive a killing blow at 1 HP', energize:'+{v} energy at the start of every round',
  bleed:'DOWNSIDE: lose {v}% max HP at the end of every round (it never kills you)', tired:'DOWNSIDE: −{v} energy at the start of every round', shortsight:'DOWNSIDE: −{v}% accuracy on every move',
  bloodprice:'DOWNSIDE: Heavy and Special moves cost {v}% of your max HP'});
// ---- consumables: the tonics now last longer ----
Object.assign(D.CONSUMABLES.str, {d:'+40% damage for 4 turns'});
Object.assign(D.CONSUMABLES.iron, {d:'Take 45% less damage for 4 turns'});
Object.assign(D.CONSUMABLES.smoke, {d:'Dodge the next 4 attacks'});
// ---- new boons: [id, name, slots, wisdom cost, text] ----
D.BOONS.push(
  ['focusward','Focused Guard',2,110,'While you are Focusing you take 50% less damage'],
  ['bloodpact','Blood Pact',2,130,'Heal 8% max HP every time you finish off an enemy'],
  ['combo','Combo Artist',2,140,'Every consecutive attack adds +8% damage (up to +40%); guarding or using an item resets it'],
  ['steady','Steady Aim',1,70,'+10% accuracy on every move'],
  ['calm','Calm Mind',2,120,'Burn and poison deal half damage to you'],
  ['tonic','Tonic Master',1,90,'Strength Tonic, Iron-Skin and Smoke Bomb last 2 turns longer'],
  ['bulwarkb','Shield-Bearer',2,150,'While you stand, allies take 8% less damage'],
  ['inspireb','Banner-Bearer',2,150,'While you stand, the whole party deals +8% damage'],
  ['medicb','Field Medic',2,160,'At the end of every round, heal each ally for 2% max HP'],
  ['bloodlust','Bloodlust',2,170,'+4% damage for every enemy slain this fight (up to +20%)'],
  ['scribe','Scribe',1,60,'+10 Ink from every quest you pass'],
  ['windfall','Windfall',1,80,'+25% Ink from every fight'],
  ['endurance','Endurance',2,180,'Heavy and Special moves give back 10 energy']);
// ---- elements: used to colour every attack button ----
D.ELEMENTS = {
  phys:{n:'Physical', i:'⚔', c:'#c9c9d8'}, fire:{n:'Fire', i:'🔥', c:'#ff8a3c'}, ice:{n:'Frost', i:'❄', c:'#5cc8ff'}, thunder:{n:'Lightning', i:'⚡', c:'#ffe14d'},
  water:{n:'Water', i:'🌊', c:'#3aa0ff'}, nature:{n:'Nature', i:'🍃', c:'#6fdc6a'}, poison:{n:'Venom', i:'☠', c:'#b46cff'}, dark:{n:'Shadow', i:'🌑', c:'#8a6ae0'},
  holy:{n:'Holy', i:'✨', c:'#fff0a0'}, wind:{n:'Wind', i:'🌀', c:'#9fe8d8'}, blood:{n:'Blood', i:'🩸', c:'#ff4060'}, arcane:{n:'Arcane', i:'🔮', c:'#c08aff'},
  moon:{n:'Lunar', i:'🌙', c:'#cdd8ff'}, cosmic:{n:'Cosmic', i:'🌌', c:'#7df9ff'}, meme:{n:'Promised', i:'👑', c:'#ff8ad8'}, earth:{n:'Earth', i:'⛰', c:'#d1a15a'}};
// weapon fx keys (the `fx` field of legendary gear) -> element
D.FX_ELEMENT = {thunder:'thunder', fire:'fire', dragonfire:'fire', forge:'fire', sun:'fire', blood:'blood', lion:'phys', bronze:'phys', barbs:'phys', gorgon:'nature', holy:'holy', rune:'arcane', divine:'holy',
  wave:'water', moon:'moon', soul:'dark', underworld:'dark', raven:'dark', life:'nature', time:'arcane', wind:'wind'};
// keyword rules, checked in order against weapon + move names
D.EL_WORDS = [[/frost|ice\b|icy|glacier|rime|snow|blizzard|aurora|polar|winter|owl|forty winters|freez|chill|nova/i, 'ice'], [/thunder|lightning|bolt|storm|spark|static|volt|zeus|mjölnir|mjolnir|thunderclap/i, 'thunder'],
  [/flame|fire|ember|inferno|blaze|burn|sun|scorch|magma|dragon|meteor|firebomb|phoenix|solar|rocket|missile/i, 'fire'], [/tide|wave|harpoon|trident|sea|coral|kraken|leviathan|neptune|ocean|riptide|drown|anchor|rain|abyss/i, 'water'],
  [/venom|poison|toxic|serpent|slime|bog|viper|cobra|spore|plague|laughing gas/i, 'poison'], [/shadow|death|grave|soul|reap|scythe|hollow|night|dark|void|thanatos|hades|hel\b|doom|curse/i, 'dark'],
  [/holy|light|blessed|sacred|excalibur|angel|aegis|divine|emancipat|liberty|glory/i, 'holy'], [/wind|gale|feather|hermes|gust|tornado|storm-?wing|cyclone/i, 'wind'],
  [/blood|vampir|crimson|gore|bloodlust|rip and tear|bite/i, 'blood'], [/moon|lunar|crescent|khonsu|silver/i, 'moon'], [/leaf|vine|forest|nature|thorn|root|bramble|wild|life/i, 'nature'],
  [/arcane|rune|mage|spell|star|cosmic|galaxy|time|eldritch|sorcer|eye of/i, 'arcane'], [/earth|quake|stone|rock|mountain|mammoth|boulder|titan|avalanche|stomp/i, 'earth']];
D.WORLD_ELEMENT = [null, 'water', 'fire', 'ice'];   // common-tier gear takes the colour of its land
})();
