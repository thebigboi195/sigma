# Essay Quest Online — v7 "Promised & Outerversal"

Source lives in `src/` (`src/app.html` plus `src/parts/*.js`); run `node build.js` to produce the single-file `index.html`.

## New content
- **★7 "Promised" dungeons** — two-boss duos that summon allies (Prime Zeus + Atlas, Red the trainer + all six beasts at miniboss strength, Mecha Musashi, Count Midnight, Pale Horseman, Gorath, Matriarch, Ramses Prime, Ryuga). 100% Mythical/Legendary-or-better drop.
- **★10 "Outerversal" dungeons** — a single colossal boss each (10 designs) with multi-hit moves, every negative status and 2 healer monsters; void/"overversal horror" theme.
- **Final boss (quick mode, level 30)** — 10★ strength with healers and a huge reward (plus Hall of Legends bonus stat points).
- **20 meme/homage gear pieces**: 10 Promised world-leader sets (Supreme Beard armour, Lincoln, Teddy Roosevelt, Washington, Napoleon, Genghis, Cleopatra, Caesar, Churchill, Alexander) and 10 Outerversal sets (Grinning Bat-King, Prime Sun-Lord, Crescent Crusader, Mad Titan, Sorcerer Supreme, Hell-Walker, Dark Phoenix, Elder God, Devourer, Silent Instinct). All "mid-maxed": big downsides, big upsides. (Names are parody/homage, not trademarks.)
- 13 new boons (e.g. Focus Ward: take 50% less damage while focusing, costs 2 points).
- Drops: Mythical/Legendary 30% in ★6, 100% in ★7.
- Iron-Skin & Strength Tonic last 4 turns, Smoke Bomb dodges 4 attacks.
- Attack buttons coloured by element (frost = blue, etc.); word bank words can be crossed out.

## Admin
- 👥 Players tab: skip a turn, sit a player out, kick (two-click confirm), skip all waiting. Kicked players can rejoin with the party code. AFK players are auto-acted after two missed rounds.

## Graphics & feel
- Post-processing (bloom, ink outlines, chromatic aberration, vignette, grain, glitch), image-based lighting, themes for the Olympian coliseum (★7) and the Void (★10).
- ~40 new detailed boss/minion/healer models built with the part-list builder (`src/parts/asm.js`), data-driven attack FX (88 attack animations), camera kicks, slow-mo.
- Boss cutscenes (letterbox, title card, typed line; click to skip) for bosses, ★7 and ★10 and the final boss.

## Bug fixes
- Final blow no longer skips straight to the victory jump: attacks and death animations play.
- Phoenix revival rewritten (fall animation, fire column, rise); fixed runtime light creation that caused hitches.
- Fixed double tone-mapping that washed out the scene.

## v7.1
- **Type system**: Pokémon chart (18 types) plus **Cosmic** (only super effective against Cosmic; everything else hits Cosmic for half). Armour gives you 1–2 types; mobs use their own type(s) to attack you, so a water move hits a fire-armoured hero for double. Your weapon's type decides your own matchups (+15% when it matches your armour). Immunities are 0.25× so nothing is unwinnable. Every mob and boss has types (shown as icons above its HP bar); Outerversal gear is Cosmic and only drops from ★10.
- **Final boss reworked**: Primal Arceus (changes type every round via Multitype; Judgment, Extreme Speed, Perish Song, Hyper Beam, Recover; summons Dialga and Palkia) and Giratina Origin Forme (Shadow Claw, Shadow Force, Hex, Destiny Bond, Shadow Clones with 5% of its HP).
- **Trinkets**: fixed Promised/Outerversal trinket rarities producing NaN (infinite) HP; per-trinket and total caps for every trinket effect.
- **Fixes**: no free strikes before anyone chooses a move; HP plates are docked at the top (enemies) and bottom (party) of the stage instead of following models; wider FOV, higher camera and wider monster spacing; time-based camera easing.
- **Balance**: ★7 and ★10 and the final are much harder (re-simulated); Outerversal gear toned down.
