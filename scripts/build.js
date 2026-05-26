#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Step 1: Patch @cloudflare/next-on-pages dist/index.js on disk BEFORE it's loaded
const nopIndex = path.resolve('node_modules/@cloudflare/next-on-pages/dist/index.js');
let content = fs.readFileSync(nopIndex, 'utf8');
let patched = 0;

// esbuild external #1 (worker.js bundling)
var e1 = 'external: ["node:*", "./__next-on-pages-dist__/*", "cloudflare:*"]';
var e1p = 'external: ["node:*", "./__next-on-pages-dist__/*", "cloudflare:*", "async_hooks"]';
if (content.indexOf(e1) !== -1) {
  content = content.split(e1).join(e1p);
  console.log('[build] Patched esbuild #1 external (worker.js)');
  patched++;
}

// esbuild external #2 (edge functions: relative path version)
var e2 = 'external: ["node:*", `${relativeNopDistPath}/*`, "*.wasm", "cloudflare:*"]';
var e2p = 'external: ["node:*", `${relativeNopDistPath}/*`, "*.wasm", "cloudflare:*", "async_hooks"]';
if (content.indexOf(e2) !== -1) {
  content = content.split(e2).join(e2p);
  console.log('[build] Patched esbuild #2 external (edge functions)');
  patched++;
}

// esbuild external #2 variant (maybe already patched with one of the above)
var e2b = 'external: ["node:*", '; // fallback check
if (patched < 2) {
  // try minified version
  var e2min = 'external:["node:*","';
  var idx = content.indexOf(e2min, 439000);
  if (idx !== -1 && content.indexOf('async_hooks', idx) === -1) {
    var endIdx = content.indexOf(']', idx);
    content = content.substring(0, endIdx) + ',"async_hooks"' + content.substring(endIdx);
    console.log('[build] Patched esbuild #2 external (minified edge functions)');
    patched++;
  }
}

if (patched > 0) {
  fs.writeFileSync(nopIndex, content, 'utf8');
  console.log('[build] @cloudflare/next-on-pages patched successfully (' + patched + ' changes)');
} else {
  console.log('[build] No patching needed (async_hooks already in externals)');
}

// Step 2: Run our prebuild script (creates polyfills, patches next/vercel files)
require(path.resolve('scripts/patch-async-hooks'));

// Step 3: Now spawn @cloudflare/next-on-pages (will use patched dist/index.js)
var binDir = path.resolve('node_modules/@cloudflare/next-on-pages/bin');
var child = spawn(process.execPath, [
  path.join(binDir, '..', 'dist', 'index.js'),
  ...process.argv.slice(2)
], {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('exit', function(code) {
  process.exit(code === undefined || code === null ? 0 : code);
});
