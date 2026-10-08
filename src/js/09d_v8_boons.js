/* ===== Essay Quest v8 data (D): boons doubled (33 → 66), retuned for the Pokémon-style stats.
   The two loot boons — Double Loot and Lucky Find — now cost a fortune in Wisdom. [id, name, slots, wisdom cost, text] ===== */
(() => {
const D = DATA, B = D.BOONS;
const set = (id, f) => { const b = B.find(x => x[0] === id); if (b) f(b); };
set('trained', b => { b[4] = '+3 to every requirement stat (STR, AGI, INT, FOR, WPN)'; });
set('hunter', b => { b[1] = 'Double Loot'; b[2] = 3; b[3] = 1400; b[4] = 'Every chest holds twice as many items'; });
set('lucky', b => { b[1] = 'Lucky Find'; b[2] = 3; b[3] = 1600; b[4] = 'Doubles your chance of Legendary, Mythical and Outerversal drops'; });
set('dance', b => { b[4] = '+8% dodge (the 40% dodge cap still applies)'; });
B.push(
  ['mighty', 'Mighty', 1, 90, '+10% Attack'],
  ['arcane', 'Arcane Mind', 1, 90, '+10% Sp. Atk'],
  ['stoneskin', 'Stoneskin', 1, 90, '+10% Defense'],
  ['spiritward', 'Spirit Ward', 1, 90, '+10% Sp. Def'],
  ['swiftfoot', 'Swift Feet', 1, 80, '+10% Speed'],
  ['evasive', 'Evasive', 1, 100, '+4% dodge (the 40% cap still applies)'],
  ['titanblood', 'Titan Blood', 2, 190, '+18% max HP'],
  ['glasscannon', 'Glass Cannon', 2, 170, '+20% Attack and Sp. Atk, −15% Defense and Sp. Def'],
  ['keen', 'Keen Eye', 1, 110, '+6% critical-hit chance'],
  ['critmaster', 'Brutal Critic', 2, 210, 'Critical hits deal ×2 instead of ×1.5'],
  ['stab', 'Type Adept', 2, 230, 'Same-type moves deal ×1.7 instead of ×1.5'],
  ['supereff', 'Weakness Hunter', 2, 200, 'Super-effective hits deal 25% more'],
  ['hardened', 'Hardened', 2, 200, 'Super-effective hits on you deal 25% less'],
  ['firstaid', 'First Aid', 1, 90, 'Heal 10% max HP after every fight'],
  ['regenb', 'Regeneration', 2, 180, 'Heal 3% max HP at the end of every round'],
  ['opener', 'Opening Gambit', 1, 100, 'Your first move in every fight deals +30% damage'],
  ['finisher', 'Giant Slayer', 2, 220, '+20% damage to bosses and mini-bosses'],
  ['purity', 'Purity', 1, 120, 'You cannot be poisoned'],
  ['fireproof', 'Fireproof', 1, 120, 'You cannot be burned'],
  ['clearsight', 'Clear Sight', 1, 100, 'You cannot be blinded'],
  ['unshaken', 'Unshaken', 2, 180, 'You cannot be slowed or frozen'],
  ['energyb', 'Energy Well', 1, 120, '+5 energy at the start of every round'],
  ['surge', 'Power Surge', 1, 110, 'Heavy moves cost 10 less energy'],
  ['momentum', 'Momentum', 1, 120, '+5% Speed every round of a fight (up to +25%)'],
  ['guardian', 'Guardian', 2, 190, 'While you Guard, your weakest ally also takes 25% less damage'],
  ['healtouch', 'Healing Touch', 2, 160, 'Potions you drink also heal your weakest ally for 15%'],
  ['inkrich', 'Ink Hoarder', 1, 80, '+40% Ink from fights'],
  ['studious', 'Studious', 2, 200, '+20% XP from quests'],
  ['seeker', 'Seeker of Wisdom', 2, 220, '+25% Wisdom from every source'],
  ['haggler', 'Haggler', 1, 90, 'Shop prices are 20% lower'],
  ['pockets', 'Deep Pockets', 1, 110, 'Carry 2 more of each consumable'],
  ['lastbreath', 'Last Breath', 2, 160, 'When you fall, you strike every enemy with a 100-power blow'],
  ['riposte', 'Riposte', 2, 170, '15% chance to counter-attack whenever you are hit']);
})();
