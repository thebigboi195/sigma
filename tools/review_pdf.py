#!/usr/bin/env python3
"""Builds the design-review PDF from rendered sheets: python3 tools/review_pdf.py <scratch dir> <out.pdf>
Expects <dir>/ui/*.png, <dir>/seq/f*.png, <dir>/scary/b*.png, <dir>/maps/maps_sheet.png, <dir>/catalog/{a,m,w}-*.png"""
import sys, glob, os, textwrap
from PIL import Image, ImageDraw, ImageFont
D, OUT = sys.argv[1], sys.argv[2]
W, H = 1600, 1000
F = lambda s, b=False: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf' % ('-Bold' if b else ''), s)
BG, GOLD, INK, MUTED = (22, 18, 40), (255, 207, 58), (240, 236, 255), (170, 160, 210)
pages = []
def page(): im = Image.new('RGB', (W, H), BG); return im, ImageDraw.Draw(im)
def title_bar(d, t, sub=''):
    d.text((40, 24), t, font=F(34, True), fill=GOLD)
    if sub: d.text((40, 70), sub, font=F(18), fill=MUTED)
def img_page(path, t, sub=''):
    im, d = page(); title_bar(d, t, sub); src = Image.open(path).convert('RGB'); top = 105; src.thumbnail((W - 60, H - top - 20)); im.paste(src, ((W - src.width)//2, top)); pages.append(im)
def grid_page(paths, t, sub='', cols=2, caps=None):
    im, d = page(); title_bar(d, t, sub); top = 105; rows = (len(paths) + cols - 1)//cols; cw, ch = (W - 40)//cols, (H - top - 10)//rows
    for i, p in enumerate(paths):
        src = Image.open(p).convert('RGB'); src.thumbnail((cw - 16, ch - (34 if caps else 12))); x = 20 + (i % cols)*cw + (cw - src.width)//2; y = top + (i//cols)*ch
        im.paste(src, (x, y));
        if caps: d.text((x, y + src.height + 4), caps[i], font=F(16), fill=INK)
    pages.append(im)
def text_page(t, paras):
    im, d = page(); title_bar(d, t); y = 100
    for p in paras:
        bold = p.startswith('#'); p = p.lstrip('# ')
        for line in textwrap.wrap(p, 120 if not bold else 90) or ['']:
            d.text((50, y), line, font=F(20 if bold else 17, bold), fill=GOLD if bold else INK); y += 30 if bold else 25
        y += 8
    pages.append(im)
# ---- cover + summary
text_page('Essay Quest Online · v8 overhaul — design review', [
  '# What changed',
  'Battle stats are now Pokémon-style: HP, Attack, Defense, Sp. Atk, Sp. Def and Speed. Physical moves use Attack vs Defense; special moves use Sp. Atk vs Sp. Def only. The Pokémon damage formula, STAB ×1.5, the full type chart and ×1.5 crits are used. Speed sets turn order, and Speed from gear gives 0.33% dodge per point (max 40%).',
  'Requirement stats STR, AGI, INT, FOR and WPN only decide what you can equip. Requirements are fixed per item and never rise. You get 4 / 3 / 2 points a level in 20 / 30 / 50-round runs, so a planner can wear a Legendary piece at about round 11 / 14 / 20. Example: Armour of the Black Swordsman = 320 HP, 90 Def, 70 Sp. Def, 30 Speed; the Dragon Slayer sword = 110 Attack, 0 Sp. Atk.',
  'Seven rarities: Common, Uncommon, Rare, Epic, Legendary, Mythical, Outerversal. 70 armour designs: 15 base designs worn at Common/Uncommon/Rare, 15 Epic, 13 Legendary + 12 Mythical myth designs, 15 Outerversal.',
  'Loot: Legendary only from ★6 (40%), ★7 (70%), mini-bosses (30%) and main bosses (55%). Mythical only from ★7 (25%) and main bosses (12%). Outerversal only from ★10 (50%). Each land drops its own myths.',
  'Two new countries: Yamato (Japan) and Hellas (Greece), each with 12+ monsters, 4 mini-bosses, bosses, gods and five battle maps.',
  'Boons doubled from 33 to 66. Double Loot (1,400 Wisdom) and Lucky Find (1,600 Wisdom) now cost a fortune; 6 boon slots.',
  'Run lengths 20, 30 and 50 rounds. Heroes gain about two levels a round (round 25 is around level 50); quests give twice the XP.',
  'Balance (simulated with the real game code, 500+ runs each): Hard 30 rounds is won about 25% of the time solo and about 50% with one support player.',
  '# Visuals and UI',
  'Heroes are blocky Minecraft-style with pixel textures and a character customiser. Monsters are smooth, multi-jointed models (necks weave, tails swish, wings beat). Bosses fight in a dark, blood-lit arena with spiked crowns, burning eyes, smoke and embers.',
  'The battlefield fills the screen. Controls are one slim strip of four move bars at the bottom (type, physical/special, power, accuracy, energy, effectiveness). Small nameplates; hover your own for both stat systems (others show only HP, the host sees all). Compact party chat and a small activity feed. Full-screen button.'])
ui = sorted(glob.glob(os.path.join(D, 'ui', '*.png')))
cap = {'01-home': 'Home: full-screen layout', '02-customiser': 'Character customiser', '03-lobby': 'Lobby: 20 / 30 / 50 rounds, 6 lands', '04-camp-gear': 'Camp · gear: both stat systems', '05-camp-stats': 'Camp · spend requirement points',
       '06-camp-boons': 'Camp · 66 boons, 6 slots', '07-camp-shop': 'Camp · potion seller', '08-hud-stats': 'HUD stats on hover', '09-map-vote': 'Path vote', '11-chest': 'Chest'}
for i in range(0, len(ui), 4):
    ch = ui[i:i + 4]; grid_page(ch, 'UI changes', 'Every screen floats over the 3D battlefield', 2, [cap.get(os.path.basename(p)[:-4], os.path.basename(p)) for p in ch])
seq = sorted(glob.glob(os.path.join(D, 'seq', 'f*.png')))
if seq:
    pick = seq[::max(1, len(seq)//12)][:12]
    for i in range(0, len(pick), 4): grid_page(pick[i:i + 4], 'Battle sequence · 3 players vs a Yamato boss (round 10)', 'Frames from an automated 3-player game, in order', 2, ['Frame %d' % (i + k + 1) for k in range(len(pick[i:i + 4]))])
for p in sorted(glob.glob(os.path.join(D, 'scary', 'b*.png'))): img_page(p, 'Boss arenas', 'Bosses turn the battlefield dark and blood-lit')
mp = os.path.join(D, 'maps', 'maps_sheet.png')
if os.path.exists(mp): img_page(mp, 'New maps · Yamato (top five) and Hellas (bottom five)', 'Bamboo grove, sakura shrine, Mt Fuji pass, onsen caves, oni castle · olive groves, agora, labyrinth, Cyclops forge, Olympian temple')
C = os.path.join(D, 'catalog')
for p in sorted(glob.glob(os.path.join(C, 'a-*.png')), key=lambda x: ['a-base-0', 'a-base-1', 'a-base-2', 'a-epic', 'a-legend', 'a-myth', 'a-outer'].index(os.path.basename(x)[:-4])): img_page(p, 'Armour', '70 designs in all')
for p in sorted(glob.glob(os.path.join(C, 'm-*.png'))): img_page(p, 'Monsters', 'Every monster, mini-boss and boss')
for p in sorted(glob.glob(os.path.join(C, 'w-*.png'))): img_page(p, 'Weapons', 'Every land weapon (Common to Epic) and every named relic')
pages[0].save(OUT, save_all=True, append_images=pages[1:], resolution=110)
print(OUT, len(pages), 'pages')
