/* ===== Essay Quest v8 data (C): two new lands — Yamato (Japan) and Hellas (Greece) — with their monsters, bosses and loot ===== */
(() => {
const D = DATA, W = D.WORLDS, E = D.ENEMIES;
Object.assign(E, {
  // Yamato
  kappa:['Kappa', 'kappa', '#5a9a5a', 'swift'], redoni:['Red Oni', 'oni', '#c03a2a', 'brute'], aooni:['Blue Oni', 'oni', '#3a5ac0', 'shield'], tengu:['Karasu-Tengu', 'tengu', '#2a2a3a', 'swift'],
  wildfox:['Wild Kitsune', 'kitsune', '#f0a040', 'burn'], tanuki:['Tanuki Trickster', 'tanuki', '#8a6a4a', 'healer'], yurei:['Yūrei', 'yurei', '#e8f0f4', 'vampiric'], kamaitachi:['Kamaitachi', 'kama', '#c8b090', 'swift'],
  bakeneko:['Bakeneko', 'cat', '#e8e0d0', 'burn'], jorogumo:['Jorōgumo', 'spider', '#3a2a4a', 'vampiric'], bonesoldier:['Bone Ashigaru', 'skeleton', '#e8e0c8', 'shield'], nurikabe:['Nurikabe', 'golem', '#a8a090', 'shield'],
  gashadokuro:['Gashadokuro', 'gashadokuro', '#f0e8d0', 'boss'], tamamo:['Tamamo-no-Mae', 'kitsune', '#fff0c0', 'boss'], shuten:['Shuten-dōji, the Oni King', 'oni', '#a01818', 'boss'], spiderqueen:['The Jorōgumo Queen', 'spider', '#5a1a5a', 'boss'],
  orochi:['Yamata no Orochi', 'orochi', '#8a2a2a', 'boss'], ryujin:['Ryūjin, the Dragon King', 'ryu', '#2a8a9a', 'boss'],
  amaterasuGod:['Amaterasu, the Sun Goddess', 'god', '#fff0c0', 'boss'],
  // Hellas
  centaur:['Centaur Archer', 'centaur', '#8a5a3a', 'swift'], griffin:['Griffin', 'griffin', '#c8a050', 'swift'], spartoi:['Spartoi Hoplite', 'skeleton', '#d8c8a0', 'shield'], stymph:['Stymphalian Bird', 'bird', '#a0705a', 'burn'],
  cyclopsmith:['Cyclops Smith', 'cyclops', '#9a8a7a', 'brute'], nemeancub:['Nemean Lion', 'lion', '#d8a040', 'brute'], automaton:['Bronze Automaton', 'automaton', '#c88a3a', 'shield'], gorgonsis:['Gorgon Sister', 'gorgon', '#4a7a4a', 'vampiric'],
  chimerawhelp:['Chimera Whelp', 'chimera', '#c06a3a', 'burn'], erymanth:['Erymanthian Boar', 'boar', '#6a4a3a', 'brute'], maenad:['Maenad of Dionysus', 'harpy', '#8a3a6a', 'healer'], shade:['Shade of Tartarus', 'yurei', '#4a5a6a', 'vampiric'],
  talos:['Talos, the Bronze Giant', 'automaton', '#d89a3a', 'boss'],
  typhon:['Typhon, Father of Monsters', 'typhon', '#5a3a2a', 'boss'], chimeraking:['The Chimera', 'chimera', '#a04a2a', 'boss'],
  hadesGod:['Hades, Lord of the Dead', 'god', '#2a2a3a', 'boss']});
Object.assign(D.ENEMY_TYPES, {
  kappa:['water', 'fighting'], redoni:['fighting', 'fire'], aooni:['fighting', 'ice'], tengu:['flying', 'dark'], wildfox:['fire', 'psychic'], tanuki:['normal', 'grass'], yurei:['ghost'], kamaitachi:['flying', 'normal'],
  bakeneko:['ghost', 'fire'], jorogumo:['bug', 'dark'], bonesoldier:['ghost', 'steel'], nurikabe:['rock'], gashadokuro:['ghost', 'rock'], tamamo:['fire', 'psychic'], shuten:['fighting', 'dark'], spiderqueen:['bug', 'poison'],
  orochi:['dragon', 'poison'], ryujin:['dragon', 'water'], amaterasuGod:['fire', 'fairy'],
  centaur:['fighting', 'ground'], griffin:['flying', 'normal'], spartoi:['ghost', 'steel'], stymph:['flying', 'steel'], cyclopsmith:['rock', 'fire'], nemeancub:['normal', 'fighting'], automaton:['steel'], gorgonsis:['poison', 'rock'],
  chimerawhelp:['fire', 'poison'], erymanth:['ground'], maenad:['grass', 'fairy'], shade:['ghost', 'dark'], talos:['steel', 'fire'], typhon:['dragon', 'flying'], chimeraking:['fire', 'dragon'], hadesGod:['ghost', 'dark']});
D.GOD_TEXT = Object.assign(D.GOD_TEXT || {}, {amaterasuGod:'Her light drove the darkness from the cave of the world', hadesGod:'Every soul that ever lived is his to command'});
// signature moves for the new bosses: [name, kind, accuracy]
D.BOSSMOVES2 = {orochi:['Eight-Fold Venom', 'plague', 70], ryujin:['Tide-Jewel Deluge', 'aoe', 70], typhon:['Storm of Typhon', 'aoe', 65], chimeraking:['Triple Breath', 'burnall', 70],
  gashadokuro:['Bone Avalanche', 'aoe', 70], tamamo:['Killing Stone', 'curse', 85], shuten:['Sake Frenzy', 'frenzy', 100], spiderqueen:['Silken Drain', 'drain', 85], talos:['Molten Ichor', 'burnall', 70],
  amaterasuGod:['Heaven’s Light', 'burnall', 70], hadesGod:['Toll of the Dead', 'drain', 85], minotaur:['Labyrinth Charge', 'execute', 60], medusa:['Petrifying Gaze', 'grip', 80], cerberus:['Three-Headed Fury', 'flurry', 85]};

W.push(
 {name:'Yamato', essay:'common', sub:'The Land of the Rising Sun · Japan', boss:'Yamata no Orochi', country:'Japan', flag:'🇯🇵',
  pal:{sky:['#f6a8bc', '#ffe8ee'], far:'#8a9ab8', mid:'#4f7f52', ground:'#86b56e', ground2:'#5e8c4c', accent:'#c02020'},
  dungeons:['Bamboo Grove', 'Sakura Shrine', 'Misty Mountain Pass', 'Onsen Caverns', 'Castle of the Oni'],
  types:[['Katana', 'katana', ['Bamboo Bokken', 'Ashigaru Katana', 'Tamahagane Katana', 'Moonlit Uchigatana', 'Muramasa’s Hunger']],
         ['Naginata', 'pole', ['Practice Naginata', 'Sōhei Naginata', 'Crescent Naginata', 'Tomoe’s Naginata', 'Storm-Reaper Naginata']],
         ['Yumi', 'ranged', ['Bamboo Yumi', 'Daikyū', 'Lacquered Yumi', 'Tsukuyomi’s Bow', 'Heaven-Piercer Yumi']],
         ['Kanabō', 'heavy', ['Oak Club', 'Iron-Studded Kanabō', 'Oni Kanabō', 'Shuten-dōji’s Kanabō', 'Earthquake Kanabō']],
         ['Shuriken', 'thrown', ['Iron Shuriken', 'Shinobi Shuriken', 'Crescent Shuriken', 'Fūma Windmill Shuriken', 'Kamaitachi Blades']]],
  armour:[['Ashigaru Dō', 'Hunter’s Furs', 'Shrine Robes'], ['Ashigaru Dō', 'Hunter’s Furs', 'Shrine Robes'], ['Bloodmoon Warplate', 'Windrunner Coat', 'Ember Sage Robe'], ['Oni-Kabuto Ō-yoroi', 'Kitsune Shrine Robes', 'Kitsune Shrine Robes'], ['Susanoo Storm-God Armour', 'Raijin Thunder-Drum Harness', 'Raijin Thunder-Drum Harness']],
  enemies:['kappa', 'redoni', 'aooni', 'tengu', 'wildfox', 'tanuki', 'yurei', 'kamaitachi', 'bakeneko', 'jorogumo', 'bonesoldier', 'nurikabe'],
  mini:['gashadokuro', 'tamamo', 'shuten', 'spiderqueen'], bossKey:'orochi', bossKeys:['orochi', 'ryujin'], gods:['susanooGod', 'amaterasuGod'], origins:['Japanese', 'Chinese', 'Original (anime style)']},
 {name:'Hellas', essay:'moda', sub:'The Land of Heroes · Greece', boss:'Typhon, Father of Monsters', country:'Greece', flag:'🇬🇷',
  pal:{sky:['#4fa6ee', '#e8f6ff'], far:'#c8d8e8', mid:'#8aa868', ground:'#e6dcc0', ground2:'#c8b890', accent:'#2a6ab0'},
  dungeons:['Olive Groves', 'Marble Agora', 'Labyrinth of Knossos', 'Cave of the Cyclops', 'Temple of Olympus'],
  types:[['Xiphos', 'blade', ['Bronze Xiphos', 'Hoplite Xiphos', 'Spartan Kopis', 'Perseus’ Harpe', 'Blade of Kronos']],
         ['Dory', 'pole', ['Ash Dory', 'Hoplite Dory', 'Myrmidon Spear', 'Spear of Achilles', 'Doru of Ares']],
         ['Toxon', 'ranged', ['Shepherd’s Bow', 'Cretan Toxon', 'Artemis’ Recurve', 'Bow of Heracles', 'Apollo’s Sunbow']],
         ['Club', 'heavy', ['Olive Club', 'Bronze Mace', 'Titan-Bone Club', 'Club of Heracles', 'Labrys of Minos']],
         ['Caestus', 'fist', ['Leather Caestus', 'Boxer’s Caestus', 'Pankration Gauntlets', 'Fists of Polydeuces', 'Gauntlets of the Titanomachy']]],
  armour:[['Hoplite Bronze', 'Scout Jerkin', 'Acolyte Robe'], ['Hoplite Bronze', 'Scout Jerkin', 'Scholar’s Vestments'], ['Sunforged Aegis', 'Windrunner Coat', 'Arcanist Regalia'], ['Aegis of Achilles', 'Nemean Lionhide', 'Nemean Lionhide'], ['Helm of Hades', 'Regalia of Zeus', 'Regalia of Zeus']],
  enemies:['centaur', 'griffin', 'spartoi', 'stymph', 'satyr', 'cyclopsmith', 'nemeancub', 'automaton', 'gorgonsis', 'chimerawhelp', 'erymanth', 'maenad', 'shade', 'harpy'],
  mini:['minotaur', 'medusa', 'cerberus', 'talos'], bossKey:'typhon', bossKeys:['typhon', 'hydra', 'chimeraking'], gods:['zeusGod', 'hadesGod'], origins:['Greek']});
// country flavour for the older lands, and which myths their legendary weapons come from
Object.assign(W[0], {country:'Britain & Ireland', flag:'🏰', origins:['Arthurian', 'Irish', 'British', 'French', 'Slavic', 'Original (anime style)']});
Object.assign(W[1], {country:'The Storm Coast', flag:'🌊', origins:['Hindu', 'Chinese', 'Arabian', 'Mesopotamian', 'Original (anime style)']});
Object.assign(W[2], {country:'Egypt', flag:'🏜', origins:['Egyptian', 'Mesopotamian', 'Arabian']});
Object.assign(W[3], {country:'Iceland & Norway', flag:'❄', origins:['Norse', 'Slavic']});
W[1].gods = ['poseidonGod', 'zeusGod'];   // Susanoo has gone home to Yamato
})();
