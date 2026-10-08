
S = fresh();
function boot(){ if (typeof THREE === 'undefined'){ $('panel').innerHTML = '<p>Loading 3D engine…</p>'; setTimeout(boot, 300); return; } ART3D.init($('stage3d')); saveSet(); ART3D.setMotion(SET.motion); draw(); }
boot();
window.__EQ = {get S(){return S;}, set S(v){S=v;}, draw, C, get BAT(){return BAT;}, PARTY, get APP(){return APP;}, set APP(v){APP=v;}};
window.drawApp = draw;

