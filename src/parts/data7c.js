/* ===== Essay Quest v7 data (C): signature moves of the new gear, the ★7 / ★10 bosses, their minions, healers and attack animations ===== */
(() => {
const D = DATA;
// ---------------- signature moves ----------------
Object.assign(D.SIGS, {
  rocket_pointer:['Glorious Launch','The missile flies (210%), then the fallout rains down: 70% to every enemy and they all burn',[['hit',2.1],['all',0.7],['burn','all']]],
  rail_splitter_axe:['Emancipation Cleave','A 220% cleave that sets the party free: everyone is cleansed and healed 14%',[['hit',2.2],['cleanse'],['heal','party',0.14]]],
  big_stick:['Bully Pulpit','A 200% blow (50% stun) and a rousing speech: the party deals +25% damage for 3 rounds',[['hit',2.0,{stun:50}],['rally',0.25,3]]],
  liberty_hatchet:['Cannot Tell a Lie','Five unerring bounces (70% each) and the whole party gains 30 energy',[['multi',5,0.7,{spread:true}],['energy',30]]],
  austerlitz_sabre:['Grande Charge','Five slashes (90% each) across the field; the party deals +30% damage for 3 rounds',[['multi',5,0.9,{spread:true}],['rally',0.3,3]]],
  horde_bow:['Rain of the Horde','Eight arrows (55% each) fall like a storm and every enemy deals 30% less for 2 rounds',[['multi',8,0.55],['weak',2,'all']]],
  asp_scepter:['Venomous Kiss','A 150% strike that poisons and weakens; the party heals 22% and is cleansed',[['hit',1.5],['status','poison',100,'one',4],['weak',2,'one'],['heal','party',0.22],['cleanse']]],
  gladius_ides:['Et Tu?','Three piercing stabs (120% each) and the victim is Exposed (+40% damage taken) for 3 rounds',[['multi',3,1.2,{pierce:true}],['vuln',3,'one',0.4]]],
  finest_hour_tommy:['We Shall Fight on the Beaches','Ten shots (40% each) and the party takes 25% less damage for 2 rounds',[['multi',10,0.4],['aegis',0.25,2]]],
  sarissa_conqueror:['Gordian Cut','Six piercing thrusts (90% each) spread across the foes; every enemy takes +30% damage for 3 rounds',[['multi',6,0.9,{spread:true,pierce:true}],['vuln',3,'all',0.3]]],
  barbed_crowbar:['Laughing Gas','A hysterical 120% to every enemy; they are poisoned, blinded and weakened',[['all',1.2],['status','poison',100,'all',3],['status','blind',100,'all',2],['weak',2,'all']]],
  fists_last_sun:['Heat-Vision Barrage','Twin solar beams: 200% to every enemy and everything burns',[['all',2.0],['burn','all']]],
  crescent_chain_sickles:['Khonshu’s Judgement','Twelve silver hits (55% each) spread across the foes, and you heal 15% of your HP',[['multi',12,0.55,{spread:true}],['heal','self',0.15]]],
  hollow_gauntlet:['Half the Universe','The snap: every enemy loses 50% of its current HP (12% of max HP for bosses)',[['judgeall',0.5,0.12]]],
  eye_all_seeing:['Time Loop','Rewind: every fallen ally returns at 60% HP, the party heals 30%, is cleansed and gains 40 energy',[['revive',0.6,'all'],['heal','party',0.3],['cleanse'],['energy',40]]],
  crucible_blade:['Rip and Tear','Ten savage hits (60% each); you drink 50% of the damage as health',[['multi',10,0.6],['steal',0.5]]],
  phoenix_talon:['Phoenix Rebirth','160% to every enemy and they burn; every fallen ally rises at 50% and the party heals 25%',[['all',1.6],['burn','all'],['revive',0.5,'all'],['heal','party',0.25]]],
  trident_dreamer:['Call of R’lyeh','Nine tentacle strikes (70% each) across the foes; all enemies are Weakened, Exposed and Blinded for 3 rounds',[['multi',9,0.7,{spread:true}],['weak',3,'all'],['vuln',3,'all',0.3],['status','blind',100,'all',3]]],
  hunger_maul:['Devour the World','240% to every enemy, 40% stun each, and you drink 40% of the damage',[['all',2.4],['stun',40,'all'],['steal',0.4]]],
  ki_gauntlets:['Wave of Final Light','One piercing, guaranteed-crit blow (450%) and every other enemy takes 150%',[['hit',2.25,{pierce:true,crit:true}],['others',1.5]]]});
Object.assign(D.MYTHT1, {rocket_pointer:['Pointer Jab','burn'], rail_splitter_axe:['Rail Chop','stun'], big_stick:['Gentle Reminder','stun'], liberty_hatchet:['Hatchet Toss','crit'], austerlitz_sabre:['Imperial Slash','crit'],
  horde_bow:['Mounted Shot','crit'], asp_scepter:['Asp Nip','poison'], gladius_ides:['Quick Stab','pierce'], finest_hour_tommy:['Burst Fire','energy'], sarissa_conqueror:['Phalanx Thrust','pierce'],
  barbed_crowbar:['Barbed Tap','poison'], fists_last_sun:['Solar Jab','burn'], crescent_chain_sickles:['Moon Flick','blind'], hollow_gauntlet:['Stone Flick','stun'], eye_all_seeing:['Eye Beam','blind'],
  crucible_blade:['Glory Slash','steal'], phoenix_talon:['Ember Draw','burn'], trident_dreamer:['Tentacle Lash','slow'], hunger_maul:['Hungry Bump','steal'], ki_gauntlets:['Silent Jab','crit']});
Object.assign(D.SIGX, {
  rocket_pointer:{acc:90, down:[['teamhurt',0.06]], note:'The fallout singes the whole party (6% HP each)'}, rail_splitter_axe:{acc:100, down:[['selfstatus','weak',1]], note:'Even honest men get tired: you are weakened for a round'},
  big_stick:{acc:90, down:[['exhaust']], note:'Leaves you with no energy'}, liberty_hatchet:{acc:100, down:[['selfstatus','blind',1]], note:'The cherry blossom gets in your eyes'},
  austerlitz_sabre:{acc:90, down:[['selfhurt',0.06]], note:'Glory costs 6% HP'}, horde_bow:{acc:85, down:[['selfstatus','slow',1]], note:'You gallop in circles: slowed'}, asp_scepter:{acc:100, down:[['selfhurt',0.05]], note:'The asp bites its owner (5% HP)'},
  gladius_ides:{acc:95, down:[['teamhurt',0.04]], note:'Somebody always takes it personally (4% party HP)'}, finest_hour_tommy:{acc:85, down:[['exhaust']], note:'Empties the drum and your energy'},
  sarissa_conqueror:{acc:90, down:[['recharge']], note:'Hard to recover a six-metre spear: you lose your next turn'},
  barbed_crowbar:{acc:85, down:[['selfstatus','poison',2]], note:'The gas gets you too'}, fists_last_sun:{acc:85, down:[['teamhurt',0.08],['exhaust']], note:'The beams scorch the party (8% HP) and drain you'},
  crescent_chain_sickles:{acc:90, down:[['selfstatus','vuln',2]], note:'Khonshu takes his cut: you take 25% more for 2 rounds'}, hollow_gauntlet:{acc:80, down:[['teamhurt',0.1],['recharge']], note:'Half of everything: 10% party HP and your next turn'},
  eye_all_seeing:{acc:100, down:[['recharge'],['exhaust']], note:'Rewinding costs your next turn and all your energy'}, crucible_blade:{acc:90, down:[['selfhurt',0.08]], note:'Rage costs 8% HP'},
  phoenix_talon:{acc:85, down:[['selfhurt',0.2],['recharge']], note:'Rebirth costs 20% HP and your next turn'}, trident_dreamer:{acc:85, down:[['selfstatus','blind',2]], note:'You see too much: blinded'},
  hunger_maul:{acc:80, down:[['exhaust'],['recharge']], note:'The hunger takes your energy and your next turn'}, ki_gauntlets:{acc:75, down:[['recharge'],['exhaust']], note:'Perfect form costs your next turn and all your energy'}});

// ---------------- enemies: ★7 duos, their minions, ★10 horrors and their healers ----------------
Object.assign(D.ENEMIES, {
  zeusPrime:['Prime Zeus, Storm-Father','zeusprime','#e9e4ff','boss'], atlasPrime:['Atlas Prime, Bearer of the World','atlas','#8a7a6a','boss'],
  redTrainer:['Red, the Mountain Champion','trainer','#d8302a','boss'], mechaMusashi:['Prime Musashi, the Mecha Shogun','mechashogun','#b0b8c8','boss'],
  countMidnight:['Count Midnight, Vampire Prime','vampire','#3a1840','boss'], paleHorseman:['The Pale Horseman','horseman','#d8d4c0','boss'],
  gorath:['Gorath, the City-Eater','kaiju','#3a5a4a','boss'], matriarch:['Matriarch Leviathan','leviathan','#1a4a6a','boss'],
  ramsesPrime:['Ramses Prime, the Undying','pharaohprime','#e0b83a','boss'], ryuga:['Ryuga, the Dragon Emperor','dragonemp','#c01820','boss'],
  thunderEagle:['Thunder Eagle','bird','#ffe27a','swift'], pcDrake:['Cinder-Tail Drake','pcdrake','#ff7a30','burn'], pcTurtle:['Tidal Bulwark Turtle','pcturtle','#3a8ac8','shield'], pcToad:['Leaf-Bloom Toad','pctoad','#4ac060','vampiric'],
  pcMouse:['Voltaic Mouse','pcmouse','#ffd830','swift'], pcGiant:['Slumbering Behemoth','pcgiant','#5a8a9a','brute'], pcPsy:['Mind-Whisker Cat','pcpsy','#c07ae0','healer'],
  batFlock:['Midnight Bat','bat','#3a2a5a','vampiric'], wraithRider:['Wraith Rider','wraithrider','#9ad8d0','vampiric'], kaijuSpawn:['Kaiju Spawn','lizard','#4a7a5a','brute'], anglerFry:['Lantern Fry','angler','#2a6a8a','burn'],
  mummyGuard:['Royal Guard Mummy','mummy','#d8ccb0','shield'], dragonling:['Storm Dragonling','dragonling','#d83a30','burn'], rockGolem:['Titan-Stone Golem','golem','#8a7a6a','shield'], shogunDrone:['Shogun Drone','drone','#aab0b8','burn'],
  batGrin:['The Grin Beneath','batgrin','#2a1c40','boss'], sunTyrant:['Prime Sun-Tyrant','suntyrant','#c8a020','boss'], hollowMoon:['Khonshu’s Hollow Avatar','moonavatar','#d8e0ff','boss'],
  madTitanE:['Thanatos-Prime, the Mad Titan','madtitan','#5a2a8a','boss'], dormuun:['Dormuun, Lord of the Dark Dimension','darklord','#e8601a','boss'], sinIcon:['The Sin-Icon, Gatekeeper of the Pit','sinicon','#8a1a1a','boss'],
  firebird:['The Hungering Firebird','firebird','#e83a1a','boss'], dreamerRlyeh:['Ulthar-Rhel, the Dreamer of the Drowned City','cthulhu','#1a5a50','boss'], devourer:['The Devourer of Worlds','devourer','#6a2fb0','boss'],
  zalgo:['He Who Waits Behind the Wall','zalgo','#101018','boss'],
  healVoid:['Void Nurse','healer','#a98aff','healer'], healDeep:['Deep Acolyte','healer','#3ab8a0','healer'], healEmber:['Ember Priest','healer','#ff8a3a','healer'], healStar:['Star Herald','healer','#ffe27a','healer']});

// ---------------- attack animations: data for the generic effect engine in the renderer ----------------
// fx: bolts | beam | volley | slam | slashes | wave | meteors | tentacles | swarm | rift | nova | drain | rain | chains | glitch | sun | roar | summon | heal | pulse | snap
const A = D.ANIMS = {
  zvolley:{fx:'bolts', c:0xfff27a, n:5}, zchain:{fx:'bolts', c:0x9fd8ff, n:3, chain:1}, zjudge:{fx:'beam', c:0xffffff, c2:0x9fd8ff, from:'sky', w:0.8}, zaegis:{fx:'nova', c:0xfff0b0, r:6}, zsummon:{fx:'summon', c:0xfff27a},
  pcgo:{fx:'summon', c:0xff5a5a, n:6}, pcquick:{fx:'slashes', c:0xffffff, n:2}, pcheal:{fx:'heal', c:0x7dffb4}, pcgaze:{fx:'rift', c:0xff4a4a},
  vdrain:{fx:'drain', c:0xff2040}, vbats:{fx:'swarm', c:0x2a1a3a, c2:0xff2040, n:22}, vwed:{fx:'slam', c:0xff2040, lift:1.2}, vmist:{fx:'pulse', c:0x9a60c0}, vgaze:{fx:'rift', c:0xff2040},
  hreap:{fx:'slashes', c:0xa0e8d8, n:3, wide:1}, hharvest:{fx:'slam', c:0xa0e8d8}, hwither:{fx:'swarm', c:0x6a8a6a, c2:0xd8d4c0, n:18}, hcharge:{fx:'slashes', c:0xd8d4c0, n:2}, htoll:{fx:'wave', c:0xa0e8d8, n:3},
  ktail:{fx:'slam', c:0xd0c090, lift:0.4, wide:1}, kbreath:{fx:'beam', c:0x60d8ff, c2:0xffffff, w:0.9}, kstomp:{fx:'slam', c:0xd0c090, lift:2.5, quake:1}, kroar:{fx:'roar', c:0xff6030},
  lcrush:{fx:'tentacles', c:0x2aa0c0}, lmael:{fx:'wave', c:0x40a0ff, n:4}, llantern:{fx:'rift', c:0xfff080}, lrip:{fx:'slashes', c:0x40a0ff, n:3, wide:1},
  rlocust:{fx:'swarm', c:0x8a8a3a, c2:0xe0b83a, n:26}, rcurse:{fx:'rift', c:0x40ffa0}, rdisk:{fx:'beam', c:0xffd040, c2:0xffffff, from:'sky', w:0.7}, rsand:{fx:'wave', c:0xe0b070, n:3},
  ybreath:{fx:'beam', c:0xff7a30, c2:0xffe0a0, w:0.8}, ypearl:{fx:'bolts', c:0xc8b0ff, n:4}, ycoil:{fx:'tentacles', c:0xd83a30}, yclaw:{fx:'slashes', c:0xffd040, n:4},
  astomp:{fx:'slam', c:0xc8b090, lift:2.8, quake:1}, atoss:{fx:'meteors', c:0xffa050, n:1, big:1}, aconst:{fx:'beam', c:0xb8d8ff, c2:0xffffff, w:0.5, from:'sky'}, aweight:{fx:'pulse', c:0x806040},
  miaido:{fx:'slashes', c:0xd8f0ff, n:2}, mmissile:{fx:'meteors', c:0xff8a40, n:5}, mwave:{fx:'beam', c:0x80e0ff, c2:0xffffff, w:0.5}, moverclock:{fx:'roar', c:0x80e0ff},
  // ★10
  bgrin:{fx:'chains', c:0x7dff3a, n:5}, bgas:{fx:'swarm', c:0x7dff3a, c2:0x2a1c40, n:30}, bswarm:{fx:'swarm', c:0x2a1c40, c2:0x7dff3a, n:30}, bbad:{fx:'slam', c:0x7dff3a, lift:2, quake:1}, bcrow:{fx:'slashes', c:0x7dff3a, n:3},
  sheat:{fx:'beam', c:0xff3a2a, c2:0xffe0a0, w:1.0}, sspeed:{fx:'slashes', c:0xffd24a, n:6, wide:1}, ssun:{fx:'sun', c:0xffc83a}, skneel:{fx:'pulse', c:0xffc83a},
  mreap:{fx:'slashes', c:0xcdd8ff, n:4}, mmad:{fx:'wave', c:0x8ab0ff, n:3}, meclipse:{fx:'nova', c:0x101030, r:12}, mgaze:{fx:'rift', c:0xcdd8ff},
  tgem:{fx:'volley', c:0xb04aff, n:6, multi:1}, tsnap:{fx:'snap', c:0xffd04a}, tslam:{fx:'slam', c:0xb04aff, lift:2.4, quake:1}, tinf:{fx:'rift', c:0xffd04a},
  dflame:{fx:'wave', c:0xff7a1a, n:4}, drewind:{fx:'heal', c:0xffd04a}, dtear:{fx:'rift', c:0xff7a1a}, dmindless:{fx:'summon', c:0xff7a1a},
  irocket:{fx:'meteors', c:0xff8a40, n:5}, ihell:{fx:'wave', c:0xff3a1a, n:4}, iimp:{fx:'summon', c:0xff3a1a}, igore:{fx:'chains', c:0xe8e0d0, n:4},
  fnova:{fx:'nova', c:0xff6a1a, r:9}, ftalon:{fx:'slashes', c:0xffa020, n:5}, fsoul:{fx:'beam', c:0xffd24a, c2:0xffffff, w:0.5}, fchicks:{fx:'summon', c:0xffa020},
  cmad:{fx:'rift', c:0xb8ff6a}, ctent:{fx:'tentacles', c:0x1a8a70, n:8}, csunk:{fx:'wave', c:0x2a6a6a, n:4}, ccall:{fx:'summon', c:0x2aa090},
  wfist:{fx:'slam', c:0xb090ff, lift:3, quake:1}, whunger:{fx:'drain', c:0xb090ff}, wsweep:{fx:'wave', c:0x7dd8ff, n:4}, wstar:{fx:'meteors', c:0x7dd8ff, n:6}, wherald:{fx:'summon', c:0xffe27a},
  zerror:{fx:'glitch', c:0xff2040}, zhands:{fx:'chains', c:0x303040, c2:0xff2040, n:7}, zhere:{fx:'rift', c:0xff2040}, zdelete:{fx:'snap', c:0xff2040}, zcorrupt:{fx:'heal', c:0xff2040}, zsum:{fx:'summon', c:0xff2040},
  hmend:{fx:'heal', c:0x7dffb4}};

// ---------------- boss kits ----------------
// move: {id, n:name, acc, cd, anim, w:weight, ops:[...]}. ops: hit|hits n|all|allhits n|rand n|st status chance turns (on last hit target) |stall|drainE|heal|healAllies|leech|buff|enrage|summon|guard|reflect|barrier|purge|exec|msg
const sm = (keys, n, hp, atk, o) => Object.assign({keys, n, hp, atk}, o || {});
const MV = (id, n, acc, cd, anim, ops, o) => Object.assign({id, n, k:'script', acc, cd, anim, ops}, o || {});
const K = D.BOSSKIT = {
  // ===== ★7 Promised duos (each fight is two bosses that can call allies) =====
  zeusPrime:{hp:1, atk:1, tag:'Storm-Father', intro:['PRIME ZEUS','“Mortals. You walked into my house. Now walk out of the sky.”'], moves:[
    MV('zvolley','Thunder Volley',90,0,'zvolley',[['hits',4,0.5],['st','freeze',20,1]]), MV('zchain','Chain Lightning',85,2,'zchain',[['all',0.55],['stall1','slow',40,2]]),
    MV('zjudge','Olympian Judgement',85,3,'zjudge',[['hit',1.9],['st','blind',60,2]],{w:2.5}), MV('zaegis','Aegis Storm',100,4,'zaegis',[['guard'],['reflect',0.25,2],['msg','A storm of lightning wraps Zeus: attacks against him are partly reflected!']]),
    MV('zsummon','Call the Eagles',100,5,'zsummon',[['summon',sm(['thunderEagle'],2,0.07,0.32,{name:'Thunder Eagle'})]],{w:2.5})]},
  atlasPrime:{hp:1.15, atk:0.9, tag:'Bearer of the World', intro:['ATLAS PRIME','“I have carried the sky for a thousand years. I will drop it on you.”'], moves:[
    MV('astomp','World-Shaking Stomp',80,2,'astomp',[['all',0.8],['stall1','freeze',30,1]]), MV('atoss','Planet Toss',75,3,'atoss',[['hit',2.2],['st','vuln',60,2]],{w:2}), MV('apillar','Pillar of Stone',100,4,'aweight',[['guard'],['barrier',0.12],['msg','Atlas braces: a shell of stone absorbs damage!']]),
    MV('aweight','Crushing Weight',90,2,'aweight',[['hit',1.3],['st','slow',100,2],['st','weak',60,2]]), MV('aconst','Constellation Beam',90,2,'aconst',[['all',0.6],['stall1','vuln',45,2]]),
    MV('asum','Earthen Summons',100,5,'zsummon',[['summon',sm(['rockGolem'],2,0.09,0.34,{name:'Stone Golem'})]],{w:2.4})]},
  redTrainer:{hp:0.8, atk:0.9, tag:'Mountain Champion', intro:['RED','“…”   (The champion tips his cap. Six orbs rise from his belt.)'], moves:[
    MV('pcgo','Go, all of you!',100,99,'pcgo',[['summon',sm(['pcDrake','pcTurtle','pcToad','pcMouse','pcGiant','pcPsy'],6,0.13,0.5,{mini:true,all:true})],['msg','Red throws every ball at once: SIX beasts burst out, each as strong as a mini-boss!']],{once:true,w:9,first:true}),
    MV('pcquick','Quick Command',90,0,'pcquick',[['hits',2,0.7]]), MV('pcgaze','Champion’s Gaze',90,2,'pcgaze',[['hit',1.2],['st','weak',60,2]]),
    MV('pcheal','Full Restore',100,4,'pcheal',[['healAllies',0.25],['msg','Red uses a Full Restore on his team!']],{w:2}), MV('pcpot','Hyper Potion',100,5,'pcheal',[['heal',0.12],['msg','Red drinks a Hyper Potion.']]),
    MV('pcrally','Rally the Team',100,4,'moverclock',[['buffAllies','empower',3],['msg','“Together.” Every beast is empowered!']])]},
  mechaMusashi:{hp:1.1, atk:1.05, tag:'Mecha Shogun', intro:['PRIME MUSASHI','“Honour is a sword. Draw yours, or I will draw mine.”'], moves:[
    MV('miaido','Twin-Blade Iaido',92,0,'miaido',[['hits',2,1.0],['st','weak',35,2]]), MV('mmissile','Missile Barrage',85,2,'mmissile',[['all',0.5],['stall1','burn',55,3]]), MV('mwave','Mecha Slash Wave',88,2,'mwave',[['hit',1.7,{pierce:1}]],{w:2.2}),
    MV('moverclock','Overclock',100,5,'moverclock',[['buff','empower',3],['enrage',0.1],['msg','Musashi’s reactor roars: Overclock!']]), MV('msum','Drone Deployment',100,5,'zsummon',[['summon',sm(['shogunDrone'],3,0.05,0.25,{name:'Shogun Drone'})]],{w:2.4})]},
  countMidnight:{hp:1, atk:1, tag:'Vampire Prime', intro:['COUNT MIDNIGHT','“Welcome. You are just in time for dinner. You are dinner.”'], moves:[
    MV('vdrain','Blood Drain',90,0,'vdrain',[['hit',1.3],['leech',0.8]]), MV('vbats','Bat Swarm',85,2,'vbats',[['all',0.45],['stall1','blind',45,2]]), MV('vwed','Crimson Wedding',85,3,'vwed',[['exec',2.2],['heal',0.15]],{w:2.2}),
    MV('vmist','Mist Form',100,4,'vmist',[['dodge',0.3],['msg','Count Midnight dissolves into mist: he is hard to hit!']]), MV('vgaze','Hypnotic Gaze',85,2,'vgaze',[['hit',0.9],['drainE',40],['st','slow',70,2]]),
    MV('vsum','Bat Flock',100,5,'zsummon',[['summon',sm(['batFlock'],2,0.06,0.28,{name:'Midnight Bat'})]],{w:2.4})]},
  paleHorseman:{hp:1.1, atk:1, tag:'Prime Death', intro:['THE PALE HORSEMAN','“Hear that? That is not thunder. That is hooves.”'], moves:[
    MV('hreap','Reaping Sweep',88,2,'hreap',[['all',0.6],['stall1','weak',40,2]]), MV('hharvest','Harvest',85,0,'hharvest',[['exec',1.6]],{w:2.2}), MV('hwither','Wither',85,3,'hwither',[['all',0.35],['stall1','poison',65,3],['stall1','weak',50,2]]),
    MV('hcharge','Spectral Charge',90,0,'hcharge',[['hits',2,0.9]]), MV('htoll','Toll the Bell',80,3,'htoll',[['all',0.4],['stall1','freeze',25,1]]), MV('hsum','Wraith Riders',100,5,'zsummon',[['summon',sm(['wraithRider'],2,0.07,0.3,{name:'Wraith Rider'})]],{w:2.4})]},
  gorath:{hp:1.2, atk:1.05, tag:'City-Eater', intro:['GORATH','(The ground stops being solid. Something enormous is breathing.)'], moves:[
    MV('ktail','Tail Swipe',85,0,'ktail',[['all',0.7]]), MV('kbreath','Atomic Breath',80,3,'kbreath',[['all',1.1],['stall1','burn',80,3]],{w:2.5}), MV('kstomp','Titan Stomp',85,2,'kstomp',[['hit',1.7],['st','freeze',40,1]]),
    MV('kroar','Roar of Ruin',100,4,'kroar',[['stall1','weak',70,2],['buff','empower',3],['msg','Gorath roars: everyone shakes and he grows angrier!']]), MV('ksum','Kaiju Spawn',100,5,'zsummon',[['summon',sm(['kaijuSpawn'],2,0.08,0.3,{name:'Kaiju Spawn'})]],{w:2.3})]},
  matriarch:{hp:1.1, atk:1, tag:'Mother of Tides', intro:['MATRIARCH LEVIATHAN','(The sea goes quiet. A lantern opens in the dark.)'], moves:[
    MV('lcrush','Tidal Crush',85,0,'lcrush',[['hit',1.7],['st','slow',50,2]]), MV('lmael','Maelstrom',80,3,'lmael',[['all',0.6],['stall1','slow',70,2]]), MV('llantern','Lantern Hypnosis',85,3,'llantern',[['all',0.35],['stall1','blind',80,2],['drainE',30]]),
    MV('lrip','Riptide',88,0,'lrip',[['hits',3,0.55]]), MV('lsum','Call the Brood',100,5,'zsummon',[['summon',sm(['anglerFry'],2,0.07,0.28,{name:'Lantern Fry'})]],{w:2.4}), MV('lregen','Abyssal Calm',100,5,'pcheal',[['heal',0.08],['msg','The Matriarch sinks into the dark and mends.']])]},
  ramsesPrime:{hp:1, atk:1, tag:'The Undying', intro:['RAMSES PRIME','“I have been dead for four thousand years. It has not improved my mood.”'], moves:[
    MV('rlocust','Plague of Locusts',85,2,'rlocust',[['all',0.5],['stall1','poison',60,3]]), MV('rcurse','Curse of the Tomb',85,3,'rcurse',[['hit',1.3],['st','vuln',75,3],['st','weak',60,2]]), MV('rdisk','Sun-Disk Beam',85,2,'rdisk',[['hit',1.9],['st','burn',70,3]],{w:2.2}),
    MV('rsand','Sandstorm',75,3,'rsand',[['all',0.5],['stall1','blind',70,2]]), MV('rrise','Rise Again',100,5,'pcheal',[['reviveAlly',0.5],['heal',0.1],['msg','“Death is a door, and I have the key.”']]),
    MV('rsum','Royal Guard',100,5,'zsummon',[['summon',sm(['mummyGuard'],2,0.08,0.3,{name:'Royal Guard'})]],{w:2.4})]},
  ryuga:{hp:1.1, atk:1.05, tag:'Dragon Emperor', intro:['RYUGA','“Kneel, little ones. The sky has an emperor, and he has just woken up.”'], moves:[
    MV('ybreath','Dragon Breath',85,2,'ybreath',[['all',0.9],['stall1','burn',60,3]],{w:2.2}), MV('ypearl','Thunder Pearl',85,2,'ypearl',[['hit',1.6],['st','freeze',50,1]]), MV('ycoil','Coil Crush',85,3,'ycoil',[['hit',1.4],['st','recharge',45,1]]),
    MV('yclaw','Gale Claws',90,0,'yclaw',[['hits',4,0.45]]), MV('yrain','Heaven’s Rain',100,5,'pcheal',[['heal',0.08],['cleanseSelf'],['msg','Ryuga bathes in storm rain: he heals and sheds every curse.']]),
    MV('ysum','Dragonlings',100,5,'zsummon',[['summon',sm(['dragonling'],2,0.07,0.3,{name:'Storm Dragonling'})]],{w:2.4})]},

  // ===== ★10 Outerversal horrors (single boss: insane HP, multi-hits, every negative status, calls two healers) =====
  batGrin:{hp:1, atk:1, healers:'healVoid', tag:'Bat-King of the Dark Multiverse', intro:['THE GRIN BENEATH','“Why so… correct? Let me fix that. Let me fix ALL of you.”'], moves:[
    MV('bgrin','Barbed Chains',88,0,'bgrin',[['hits',5,0.45],['st','poison',50,3]]), MV('bgas','Laughing Gas',85,2,'bgas',[['all',0.4],['stall',70,3]],{w:2.4}), MV('bswarm','Nightmare Swarm',85,3,'bswarm',[['all',0.7],['stall1','vuln',60,3]]),
    MV('bbad','One Bad Day',85,4,'bbad',[['hit',2.4],['stall',100,2]],{w:2.2,pending:1}), MV('bcrow','Crowbar Frenzy',90,0,'bcrow',[['rand',4,0.55]]), MV('bheal','Call the Nurses',100,5,'zsummon',[['healers']],{w:3,heal:1})]},
  sunTyrant:{hp:1, atk:1.08, healers:'healStar', tag:'Fallen Sun-God', intro:['PRIME SUN-TYRANT','“I was the hope of a world. Hope burns. Look how brightly.”'], moves:[
    MV('sheat','Heat-Vision Sweep',85,2,'sheat',[['all',1.0],['stall1','burn',85,3]],{w:2.2}), MV('sspeed','Hyper-Speed Barrage',90,0,'sspeed',[['rand',6,0.4]]), MV('ssun','Sun-Eater',80,4,'ssun',[['hit',2.2],['leech',0.7],['drainE',50]],{pending:1}),
    MV('skneel','Kneel',90,3,'skneel',[['all',0.4],['stall1','freeze',50,1],['stall1','weak',60,2]]), MV('sheal','Call the Heralds',100,5,'zsummon',[['healers']],{w:3,heal:1})]},
  hollowMoon:{hp:1, atk:1, healers:'healDeep', tag:'The Moon That Watches', intro:['KHONSHU’S HOLLOW AVATAR','“The moon was never a rock. The moon was always an eye.”'], moves:[
    MV('mreap','Crescent Reap',88,0,'mreap',[['hits',4,0.6],['st','weak',40,2]]), MV('mmad','Tidal Madness',85,2,'mmad',[['all',0.55],['stall1','blind',65,2],['stall1','slow',50,2]]), MV('meclipse','Total Eclipse',80,4,'meclipse',[['all',0.8],['stall',55,2],['drainE',45]],{w:2.2,pending:1}),
    MV('mgaze','Hollow Gaze',90,2,'mgaze',[['hit',1.8],['st','vuln',80,3]]), MV('mheal','Call the Acolytes',100,5,'zsummon',[['healers']],{w:3,heal:1})]},
  madTitanE:{hp:1.05, atk:1.1, healers:'healVoid', tag:'The Reasonable Monster', intro:['THANATOS-PRIME','“It is a simple equation. Half of you must go. I am so sorry. I am not sorry.”'], moves:[
    MV('tgem','Gem Barrage',88,0,'tgem',[['gems']],{w:2.2}), MV('tslam','Titan Slam',85,2,'tslam',[['hit',2.0],['st','vuln',70,3]]), MV('tinf','Reality Bend',85,3,'tinf',[['all',0.55],['stall',50,2]]),
    MV('tsnap','The Snap',100,6,'tsnap',[['snap',0.4]],{w:3,pending:1}), MV('theal','Call the Heralds',100,5,'zsummon',[['healers']],{w:3,heal:1})]},
  dormuun:{hp:1, atk:1.05, healers:'healEmber', tag:'The Dark Dimension', intro:['DORMUUN','“I have bargained with every universe. Today, I collect.”'], moves:[
    MV('dflame','Mystic Flames',85,2,'dflame',[['all',0.9],['stall1','burn',80,3]]), MV('dtear','Dimension Tear',85,3,'dtear',[['hit',2.0],['st','recharge',70,1],['st','blind',70,2]],{w:2.2}), MV('drewind','Rewind the Hour',100,5,'drewind',[['heal',0.12],['cleanseSelf'],['msg','Time folds: Dormuun is whole again.']]),
    MV('dmulti','Hundred Hands',90,0,'dflame',[['rand',5,0.5]]), MV('dmind','Call the Mindless Ones',100,5,'zsummon',[['healers']],{w:3,heal:1})]},
  sinIcon:{hp:1.1, atk:1.05, healers:'healEmber', tag:'Gatekeeper of the Pit', intro:['THE SIN-ICON','(A skull of iron opens. Something inside has been waiting since the world was built.)'], moves:[
    MV('irocket','Rocket Barrage',85,0,'irocket',[['rand',5,0.55],['st','burn',50,3]],{w:2.2}), MV('ihell','Hellfire Wave',85,2,'ihell',[['all',0.9],['stall1','burn',80,3]]), MV('igore','Gore Nest',88,2,'igore',[['hits',3,0.7],['st','weak',60,2]]),
    MV('ishout','Skull Shout',90,3,'ihell',[['all',0.4],['stall1','freeze',40,1],['stall1','blind',60,2]]), MV('iheal','Call the Imps',100,5,'zsummon',[['healers']],{w:3,heal:1})]},
  firebird:{hp:1, atk:1.1, healers:'healEmber', tag:'The Hunger Between Stars', intro:['THE HUNGERING FIREBIRD','“I was a gift to a mortal. She is gone. Now I am just… hungry.”'], moves:[
    MV('fnova','Cosmic Inferno',82,2,'fnova',[['all',1.0],['stall1','burn',90,3],['stall1','blind',60,2]],{w:2.2}), MV('ftalon','Talon Storm',90,0,'ftalon',[['hits',5,0.5],['st','vuln',50,2]]), MV('fsoul','Soul Immolation',85,3,'fsoul',[['exec',2.4],['st','burn',100,3]]),
    MV('frise','Rise From the Ashes',100,6,'drewind',[['heal',0.1],['cleanseSelf'],['enrage',0.08],['msg','The Firebird rises from its own ash, hotter than before!']],{w:2}), MV('fheal','Call the Ember-Chicks',100,5,'zsummon',[['healers']],{w:3,heal:1})]},
  dreamerRlyeh:{hp:1.05, atk:1, healers:'healDeep', tag:'Dreamer of the Drowned City', intro:['ULTHAR-RHEL','“Ph’nglui… you do not need the rest. You are already dreaming it.”'], moves:[
    MV('cmad','Madness Gaze',85,2,'cmad',[['all',0.5],['stall',45,3]],{w:2.2}), MV('ctent','Tentacle Flurry',90,0,'ctent',[['rand',8,0.32]]), MV('csunk','Sunken Dream',85,3,'csunk',[['all',0.5],['drainE',60],['stall1','slow',80,2]]),
    MV('closs','Sanity Loss',90,3,'cmad',[['all',0.3],['stall1','weak',100,3],['stall1','blind',70,2]]), MV('ccall','Call of the Deep',100,5,'zsummon',[['healers']],{w:3,heal:1})]},
  devourer:{hp:1.2, atk:1.12, healers:'healStar', tag:'The Hunger That Ends Skies', intro:['THE DEVOURER OF WORLDS','“I have eaten forty thousand suns and every one of them screamed. Scream for me.”'], moves:[
    MV('wfist','Planet-Crack Fist',80,2,'wfist',[['hit',2.6],['st','freeze',50,1]]), MV('whunger','Hunger',85,3,'whunger',[['hit',1.6],['leech',1.0],['drainE',40]]), MV('wsweep','Cosmic Sweep',85,2,'wsweep',[['all',1.1],['stall1','vuln',55,2]],{w:2.2}),
    MV('wstar','Starfall',88,0,'wstar',[['rand',5,0.6]]), MV('wherald','Call the Heralds',100,5,'zsummon',[['healers']],{w:3,heal:1})]},
  zalgo:{hp:1.1, atk:1.1, healers:'healVoid', tag:'Behind the Wall', intro:['HE WHO WAITS BEHIND THE WALL','(The screen flickers. Something looks back through it.)'], moves:[
    MV('zerror','Reality Error',85,2,'zerror',[['all',0.8],['stall',55,3]],{w:2.2}), MV('zhands','Static Hands',90,0,'zhands',[['rand',7,0.38],['st','vuln',40,2]]), MV('zhere','He Is Here',85,3,'zhere',[['exec',2.6],['st','recharge',100,1]]),
    MV('zcorrupt','Corrupt Save',100,5,'zcorrupt',[['heal',0.12],['cleanseSelf'],['msg','The save file reloads: Zalgo is whole again.']]), MV('zdelete','DELETE',80,5,'zdelete',[['hit',3.0],['stall',100,2]],{pending:1,w:2}), MV('zsum','Open the Wall',100,5,'zsum',[['healers']],{w:3,heal:1})]}};


// healers: two of these stand behind every ★10 horror; kill them first or the boss keeps mending
D.HEALERKIT = {moves:[MV('hmend','Soothing Light',100,0,'hmend',[['healBoss',0.02]],{w:4}), MV('hbar','Warding Chant',100,4,'hmend',[['barrierBoss',0.015]],{w:2}), MV('hsmite','Smite',90,0,'pcquick',[['hit',1.0]],{w:1.2})]};
// extra moves the quick-mode final boss gets on top of its own set (it is a ★10-class fight)
D.FINALKIT = [MV('fjudge','Final Judgement',85,3,'fnova',[['all',0.9],['stall',60,2]],{w:2.4}), MV('fstorm','Examination Storm',90,0,'ftalon',[['rand',6,0.42],['st','vuln',40,2]]), MV('fcall','Call the Proctors',100,5,'zsummon',[['healers']],{w:3,heal:1}),
  MV('fexam','The Last Question',85,4,'tsnap',[['snap',0.3],['stall',45,2]],{w:2,pending:1})];
// the six beasts of Red, and a few small movesets for other summons
D.MINIONKIT = {
  pcDrake:[MV('pd1','Ember Tail',95,0,'ybreath',[['hit',1.0],['st','burn',50,3]]), MV('pd2','Flare Wing',85,2,'ypearl',[['all',0.45],['stall1','burn',40,2]])],
  pcTurtle:[MV('pt1','Shell Bash',95,0,'kstomp',[['hit',1.0]]), MV('pt2','Hydro Bulwark',100,3,'aweight',[['guard'],['barrier',0.04]])],
  pcToad:[MV('pf1','Vine Whip',95,0,'rlocust',[['hit',0.9],['st','poison',55,3]]), MV('pf2','Leech Bloom',90,2,'vdrain',[['hit',0.8],['leech',0.7]])],
  pcMouse:[MV('pm1','Thunder Jolt',95,0,'zvolley',[['hits',2,0.55],['st','freeze',20,1]]), MV('pm2','Static Field',85,2,'zchain',[['all',0.4],['stall1','slow',40,2]])],
  pcGiant:[MV('pg1','Body Slam',90,0,'astomp',[['hit',1.4]]), MV('pg2','Rest',100,4,'pcheal',[['heal',0.2]])],
  pcPsy:[MV('pp1','Psybeam',95,0,'pcgaze',[['hit',0.9],['st','blind',45,1]]), MV('pp2','Calm Mind',100,3,'pcheal',[['healAllies',0.12]])]};

// ---------------- dungeon layouts ----------------
D.PROMISED_DUOS = [   // ★7: two bosses each
  {name:'Titans of Olympus', keys:['zeusPrime','atlasPrime'], theme:'olympus'}, {name:'The Champion’s Summit', keys:['redTrainer','mechaMusashi'], theme:'summit'}, {name:'The Midnight Court', keys:['countMidnight','paleHorseman'], theme:'midnight'},
  {name:'Tyrants of Land and Sea', keys:['gorath','matriarch'], theme:'tyrants'}, {name:'Dynasty of Gods', keys:['ramsesPrime','ryuga'], theme:'dynasty'}];
D.OUTER_BOSSES = ['batGrin','sunTyrant','hollowMoon','madTitanE','dormuun','sinIcon','firebird','dreamerRlyeh','devourer','zalgo'];
D.HEALER_NAMES = {healVoid:'Void Nurse', healDeep:'Deep Acolyte', healEmber:'Ember Priest', healStar:'Star Herald'};
Object.assign(D.GOD_TEXT, {zeusPrime:'Storm-father with a lightning crown: eagles and chain lightning', atlasPrime:'Holds up the sky: stone shells, planet tosses', redTrainer:'Summons all six beasts at once',
  mechaMusashi:'Twin blades, missiles and drones', countMidnight:'Drains, mists and bat swarms', paleHorseman:'Reaping sweeps and wraith riders', gorath:'Atomic breath and titan stomps', matriarch:'Tides, lanterns and a hungry brood',
  ramsesPrime:'Plagues, curses and royal guards', ryuga:'Dragon breath, thunder pearls and dragonlings'});
})();
