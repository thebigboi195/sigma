// Assembles src/ into one self-contained, playable dist/index.html (no build tools needed: `node build.mjs`).
import fs from 'node:fs';
import path from 'node:path';
const S = p => fs.readFileSync(path.join('src', p), 'utf8');
const js = fs.readdirSync('src/js').filter(f => f.endsWith('.js')).sort().map(f => `/* ---- ${f} ---- */\n` + S('js/' + f)).join('\n');
const vendor = ['three.min.js', 'peerjs.min.js', 'mqtt.min.js'].map(f => `<script>${f === 'three.min.js' ? '/**\n * @license\n * Copyright 2010-2021 Three.js Authors\n * SPDX-License-Identifier: MIT\n */\n' : ''}${S('vendor/' + f)}</script>`).join('\n');
const html = `${S('head.html')}${vendor}\n${S('config.html')}<style>\n${S('style.css')}</style>\n${S('body.html')}<script>\n${js}\n</script>\n\n</html>\n`;
fs.mkdirSync('dist', {recursive: true});
fs.writeFileSync('dist/index.html', html);
console.log(`dist/index.html  ${(html.length / 1024).toFixed(0)} KB`);
