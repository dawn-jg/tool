const fs = require('fs');
const path = require('path');

var polyfillContent = 'module.exports = {\n' +
  '  createHook: function() { return { enable: function() {}, disable: function() {} }; },\n' +
  '  AsyncLocalStorage: (function() {\n' +
  '    function ALS() { this._store = undefined; }\n' +
  '    ALS.prototype.getStore = function() { return this._store; };\n' +
  '    ALS.prototype.run = function(store, cb) {\n' +
  '      var prev = this._store;\n' +
  '      this._store = store;\n' +
  '      try { return cb.apply(this, [].slice.call(arguments, 2)); }\n' +
  '      finally { this._store = prev; }\n' +
  '    };\n' +
  '    ALS.prototype.enterWith = function(store) { this._store = store; };\n' +
  '    ALS.prototype.disable = function() {};\n' +
  '    return ALS;\n' +
  '  })(),\n' +
  '  AsyncResource: (function() {\n' +
  '    function AR() {}\n' +
  '    AR.prototype.bind = function(fn) { return fn; };\n' +
  '    AR.prototype.runInAsyncScope = function(fn) { return fn(); };\n' +
  '    AR.prototype.emitDestroy = function() {};\n' +
  '    AR.prototype.asyncId = function() { return 0; };\n' +
  '    AR.prototype.triggerAsyncId = function() { return 0; };\n' +
  '    return AR;\n' +
  '  })(),\n' +
  '  executionAsyncId: function() { return 0; },\n' +
  '  executionAsyncResource: function() { return {}; },\n' +
  '  triggerAsyncId: function() { return 0; },\n' +
'};\n';

// ====== 1. Next.js dist files ======

var polyfillTargets = [
  'node_modules/next/dist/server/async-hooks-polyfill.js',
  'node_modules/next/dist/server/web/sandbox/async-hooks-polyfill.js',
  'node_modules/next/dist/esm/server/async-hooks-polyfill.js',
  'node_modules/next/dist/esm/server/web/sandbox/async-hooks-polyfill.js',
];

var nextPatches = [
  { file: 'node_modules/next/dist/server/node-environment.js',       relative: './async-hooks-polyfill' },
  { file: 'node_modules/next/dist/server/web/sandbox/context.js',    relative: './async-hooks-polyfill' },
  { file: 'node_modules/next/dist/esm/server/node-environment.js',   relative: './async-hooks-polyfill' },
  { file: 'node_modules/next/dist/esm/server/web/sandbox/context.js',relative: './async-hooks-polyfill' },
];

for (var t = 0; t < polyfillTargets.length; t++) {
  var target = polyfillTargets[t];
  var fullPath = path.resolve(target);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, polyfillContent, 'utf8');
  console.log('[patch] Created polyfill: ' + target);
}

for (var p = 0; p < nextPatches.length; p++) {
  var patch = nextPatches[p];
  if (!fs.existsSync(patch.file)) {
    console.log('[patch] File not found: ' + patch.file);
    continue;
  }
  var content = fs.readFileSync(patch.file, 'utf8');
  var modified = false;
  // Pattern 1: require("async_hooks")
  if (content.indexOf('require("async_hooks")') !== -1 || content.indexOf("require('async_hooks')") !== -1) {
    content = content.replace(/require\(["']async_hooks["']\)/g, 'require("' + patch.relative + '")');
    modified = true;
  }
  // Pattern 2: require("node:async_hooks")
  if (content.indexOf('require("node:async_hooks")') !== -1 || content.indexOf("require('node:async_hooks')") !== -1) {
    content = content.replace(/require\(["']node:async_hooks["']\)/g, 'require("' + patch.relative + '")');
    modified = true;
  }
  if (modified) {
    fs.writeFileSync(patch.file, content, 'utf8');
    console.log('[patch] Patched: ' + patch.file);
  } else {
    console.log('[patch] No changes needed: ' + patch.file);
  }
}

// ====== 2. @cloudflare/next-on-pages: add "async_hooks" to esbuild externals ======

var nopIndex = 'node_modules/@cloudflare/next-on-pages/dist/index.js';
if (fs.existsSync(nopIndex)) {
  var nopContent = fs.readFileSync(nopIndex, 'utf8');

  // esbuild #1: worker bundle
  var old1 = 'external: ["node:*", "./__next-on-pages-dist__/*", "cloudflare:*"],';
  var new1 = 'external: ["node:*", "./__next-on-pages-dist__/*", "cloudflare:*", "async_hooks"],';
  if (nopContent.indexOf(old1) !== -1) {
    nopContent = nopContent.split(old1).join(new1);
    console.log('[patch] @cloudflare/next-on-pages esbuild #1: added async_hooks to externals');
  }

  // esbuild #2: edge functions stdin bundle
  // The target string contains a backtick template literal - use indexOf to find it safely
  var old2Start = 'external: ["node:*", `';
  var old2End = '`, "*.wasm", "cloudflare:*"],';
  var idx2 = nopContent.indexOf(old2Start);
  if (idx2 !== -1) {
    var endIdx = nopContent.indexOf(old2End, idx2);
    if (endIdx !== -1) {
      var fullOld2 = nopContent.substring(idx2, endIdx + old2End.length);
      var fullNew2 = fullOld2.replace('"cloudflare:*"]', '"cloudflare:*", "async_hooks"]');
      nopContent = nopContent.split(fullOld2).join(fullNew2);
      console.log('[patch] @cloudflare/next-on-pages esbuild #2: added async_hooks to externals');
    }
  }

  // Verify both patterns are gone
  if (nopContent.indexOf(old1) === -1 && nopContent.indexOf(old2Start + '`${relativeNopDistPath}') === -1) {
    fs.writeFileSync(nopIndex, nopContent, 'utf8');
    console.log('[patch] @cloudflare/next-on-pages index.js patched successfully');
  } else {
    console.error('[patch] WARNING: some patterns not found in @cloudflare/next-on-pages index.js');
  }
}

console.log('[patch] Done');