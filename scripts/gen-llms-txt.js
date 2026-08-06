const fs = require('fs');
const src = fs.readFileSync('lib/tools-data.ts', 'utf8');
const lines = src.split('\n');
const cats = {};
let currentCat = null;
for (const line of lines) {
  const cm = line.match(/slug: '([^']+)', nameKey: 'cat\.([^']+)'/);
  if (cm) { currentCat = cm[1]; cats[currentCat] = []; continue; }
  const tm = line.match(/slug: '([^']+)', category: '([^']+)', nameKey: 'tool\.([^']+)'/);
  if (tm && cats[tm[2]]) { cats[tm[2]].push(tm[1]); }
}
const catNames = {
  'developer-tools':'Developer Tools', 'text-tools':'Text Tools', 'image-tools':'Image Tools',
  'data-tools':'Data Tools', 'generators':'Generators', 'validators':'Validators',
  'utilities':'Utilities', 'network-tools':'Network Tools', 'fun-tools':'Fun & Tests'
};
let out = '# Tooltip.cc\n\n> Free online tools that run entirely in your browser. Privacy-first: no upload, no signup, no tracking of your data.\n\n';
out += '## What is Tooltip.cc?\n\nTooltip.cc is a collection of 80+ free online tools for developers, designers and everyday users. All tools run locally in your browser using JavaScript - your data never leaves your device. Categories include JSON formatting, Base64 encoding, regex testing, image compression, QR code generation, password generation, IP lookup, DNS lookup, speed testing and more.\n\n';
out += '## Tools\n\n';
for (const [cat, tools] of Object.entries(cats)) {
  out += '### ' + (catNames[cat] || cat) + '\n\n';
  for (const t of tools) {
    out += '- [' + t + '](https://tooltip.cc/' + cat + '/' + t + ')\n';
  }
  out += '\n';
}
fs.writeFileSync('public/llms.txt', out, 'utf8');
console.log('written public/llms.txt,', out.length, 'chars, cats:', Object.keys(cats).length, 'tools:', Object.values(cats).reduce((a, b) => a + b.length, 0));
