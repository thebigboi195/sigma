/* ===== Essay Quest v7 data (F): the final boss pair — Primal Arceus and Giratina (Origin Forme) — and the gods they call ===== */
(() => {
const D = DATA;
Object.assign(D.ENEMIES, {primalArceus:['Primal Arceus','arceus','#f4f0e0','boss'], giratina:['Giratina','giratina','#2a2030','boss'], dialga:['Dialga','dialga','#4a7ad0','shield'], palkia:['Palkia','palkia','#c088d8','swift'], giratinaClone:['Shadow of Giratina','giratinaclone','#2a2030','swift']});
Object.assign(D.ANIMS, {
  arjudg:{fx:'nova', c:0xffe9a0, c2:0xffffff, r:10}, arspeed:{fx:'slashes', c:0xffffff, c2:0xffe9a0, n:6, wide:1}, arrecov:{fx:'heal', c:0x7dffb4}, arperish:{fx:'snap', c:0x9a60ff}, arbeam:{fx:'beam', c:0xfff2c0, c2:0xffffff, w:1.2, from:'sky'},
  arcall:{fx:'summon', c:0x9fe8ff}, arwheel:{fx:'pulse', c:0xffe27a}, girshadow:{fx:'rift', c:0x9a40ff}, girclaw:{fx:'slashes', c:0xff3040, c2:0x6a20c0, n:4, wide:1}, girforce:{fx:'slam', c:0x6a20c0, lift:2.6, quake:1},
  girclone:{fx:'summon', c:0x6a20c0}, girdestiny:{fx:'chains', c:0x8a30d0, c2:0xff3040, n:6}, girhex:{fx:'wave', c:0xff3040, c2:0x6a20c0, n:3}, girtail:{fx:'slashes', c:0xffb030, n:2},
  dtime:{fx:'wave', c:0x4a90ff, c2:0xffffff, n:3}, dflash:{fx:'beam', c:0xb8c4d8, c2:0xffffff, w:0.8}, pspace:{fx:'rift', c:0xff6ad0}, phydro:{fx:'wave', c:0x40a0ff, c2:0xffffff, n:4}});
const sm = (keys, n, hp, atk, o) => Object.assign({keys, n, hp, atk}, o || {});
const MV = (id, n, acc, cd, anim, ops, o) => Object.assign({id, n, k:'script', acc, cd, anim, ops}, o || {});
Object.assign(D.BOSSKIT, {
  // Multitype: Primal Arceus becomes a new type every round, so no one weapon stays good for long.
  primalArceus:{hp:1, atk:1, rot:true, tag:'The Original One', intro:['PRIMAL ARCEUS','“Before the first word, before the first world: I was. You are my footnote.”'], moves:[
    MV('arjudge','Judgment',90,0,'arjudg',[['all',0.78],['stall1','weak',35,2]],{w:3}), MV('arspeed','Extreme Speed',95,0,'arspeed',[['hits',5,0.42]],{w:3}),
    MV('arrecover','Recover',100,4,'arrecov',[['heal',0.1],['cleanseSelf']],{w:2,heal:1}), MV('arperish','Perish Song',100,5,'arperish',[['snap',0.38],['stall',55,2]],{w:2.4,pending:1}),
    MV('arbeam','Hyper Beam',85,3,'arbeam',[['hit',2.6],['st','vuln',70,2]],{w:2.4,pending:1}), MV('arwheel','Cross Wheel',100,5,'arwheel',[['buff','empower',3],['barrier',0.05],['msg','The Cross Wheel spins faster: Primal Arceus gathers the power of every type!']],{w:2}),
    MV('arcall','Call of Space and Time',100,99,'arcall',[['summon',sm(['dialga','palkia'],2,0.09,0.42,{mini:true,all:true})],['msg','Primal Arceus tears the sky open: DIALGA and PALKIA answer the call, lords of time and space!']],{once:true,w:9,after:2})]},
  // Giratina (Origin Forme): shadow clones with 5% of its HP, Shadow Force, Destiny Bond
  giratina:{hp:1, atk:1, tag:'Renegade of the Distortion World', intro:['GIRATINA','“The Distortion World does not forgive. It devours.”'], moves:[
    MV('girclaw','Shadow Claw',95,0,'girclaw',[['hits',4,0.5]],{w:3}), MV('girforce','Shadow Force',100,3,'girforce',[['hit',3.0]],{w:2.8,pending:1}),
    MV('girtail','Dragon Tail',90,0,'girtail',[['hit',1.3],['st','slow',50,2]],{w:2}), MV('girhex','Hex',90,2,'girhex',[['all',0.62],['stall1','poison',60,3],['stall1','weak',45,2]],{w:2.4}),
    MV('girdestiny','Destiny Bond',100,5,'girdestiny',[['guard'],['reflect',0.4,2],['msg','Giratina binds its fate to yours: damage you deal is thrown back at you!']],{w:2}),
    MV('girclones','Shadow Clones',100,4,'girclone',[['summon',sm(['giratinaClone'],3,0.05,0.34,{name:'Shadow of Giratina'})],['msg','Giratina splits into shadows: each clone has 5% of its health. Cut them down before they pile on!']],{w:4}),
    MV('girpull','Distortion World',90,4,'girshadow',[['all',0.55],['stall',50,2],['drainE',30]],{w:2})]}});
Object.assign(D.MINIONKIT, {
  dialga:[MV('dt1','Roar of Time',90,0,'dtime',[['all',0.55],['stall1','slow',55,2]],{w:2.4}), MV('dt2','Flash Cannon',95,0,'dflash',[['hit',1.4],['st','vuln',35,2]],{w:3}), MV('dt3','Time Warp',100,4,'arrecov',[['healAllies',0.08],['buffAllies','empower',2]],{w:2})],
  palkia:[MV('pk1','Spacial Rend',90,0,'pspace',[['hit',1.7],['st','blind',50,2]],{w:3}), MV('pk2','Hydro Pump',90,0,'phydro',[['hits',3,0.5]],{w:3}), MV('pk3','Aura Sphere',100,3,'arperish',[['snap',0.2]],{w:1.8})],
  giratinaClone:[MV('gc1','Shadow Claw',95,0,'girclaw',[['hit',0.9],['st','weak',35,2]],{w:3}), MV('gc2','Phantom Force',90,3,'girforce',[['hit',1.5]],{w:2})]});
Object.assign(D.GOD_TEXT, {primalArceus:'The original one: changes type every round, calls Dialga and Palkia', giratina:'Renegade of the Distortion World: Shadow Force and clones with 5% health'});
D.FINAL_PAIR = ['primalArceus', 'giratina'];
D.FINAL_CUT = ['PRIMAL ARCEUS & GIRATINA', '“Two origins. One door. Neither of us will be the one to open it for you.”'];
})();
