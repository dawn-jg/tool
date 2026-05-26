const fs = require('fs');
const path = require('path');

// ====== 0. Patch compiled Next.js runtime files (the root cause of vercel build inlining bare require("async_hooks")) ======
var compiledDir = path.resolve('node_modules/next/dist/compiled/next-server');
var patched = 0;
if (fs.existsSync(compiledDir)) {
  var files = fs.readdirSync(compiledDir).filter(function(f) { return f.endsWith('.js'); });
  for (var i = 0; i < files.length; i++) {
    var fp = path.join(compiledDir, files[i]);
    var content = fs.readFileSync(fp, 'utf8');
    if (content.indexOf('require("async_hooks")') !== -1 || content.indexOf("require('async_hooks')") !== -1) {
      content = content.replace(/require\(["']async_hooks["']\)/g, 'require("node:async_hooks")');
      fs.writeFileSync(fp, content, 'utf8');
      console.log('[patch] Compiled runtime: ' + files[i] + ' (barrier async_hooks -> node:async_hooks)');
      patched++;
    }
  }
}
if (patched === 0) console.log('[patch] No compiled runtime files needed patching');

// ====== 1. Next.js dist files (polyfills + require redirect) ======
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
  if (content.indexOf('require("async_hooks")') !== -1 || content.indexOf("require('async_hooks')") !== -1) {
    content = content.replace(/require\(["']async_hooks["']\)/g, 'require("' + patch.relative + '")');
    modified = true;
  }
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

// ====== 2. @cloudflare/next-on-pages: add bare async_hooks to esbuild externals ======
var nopIndex = 'node_modules/@cloudflare/next-on-pages/dist/index.js';
if (fs.existsSync(nopIndex)) {
  var nopContent = fs.readFileSync(nopIndex, 'utf8');

  var targetStr = 'build3.onResolve({ filter: /^(node|cloudflare):/ }, ({ kind, path: path2 }) => {\n      return kind === "require-call" ? { path: path2, namespace: "built-in-modules" } : void 0;\n    });';
  var newResolver = 'build3.onResolve({ filter: /^(node|cloudflare):/ }, ({ kind, path: path2 }) => {\n' +
    '      return kind === "require-call" ? { path: path2, namespace: "built-in-modules" } : void 0;\n' +
    '    });\n' +
    '    build3.onResolve({ filter: /^async_hooks$/ }, () => ({ path: "node:async_hooks", namespace: "built-in-modules" }));';

  if (nopContent.indexOf(targetStr) !== -1) {
    nopContent = nopContent.split(targetStr).join(newResolver);
    console.log('[patch] @cloudflare/next-on-pages: added async_hooks resolver to builtInModulesPlugin');
  } else {
    console.error('[patch] WARNING: could not find builtInModulesPlugin onResolve pattern');
  }

  fs.writeFileSync(nopIndex, nopContent, 'utf8');
  console.log('[patch] @cloudflare/next-on-pages index.js patched successfully');
}

console.log('[patch] Done. Patched ' + patched + ' compiled runtime files');
