#!/usr/bin/env node
// Assembles index.html from src/libs.html (three.js, peerjs, mqtt: never edited)
// + src/app.html (the game) with every /*@@include file@@*/ marker expanded from src/parts/.
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, 'src');
const libs = fs.readFileSync(path.join(dir, 'libs.html'), 'utf8');
let app = fs.readFileSync(path.join(dir, 'app.html'), 'utf8');
app = app.replace(/\/\*@@include ([\w.\-]+)@@\*\//g, (_, f) => fs.readFileSync(path.join(dir, 'parts', f), 'utf8'));
fs.writeFileSync(path.join(__dirname, 'index.html'), libs + app);
console.log('built index.html', ((libs.length + app.length) / 1024 | 0) + ' KB');
