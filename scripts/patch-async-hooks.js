const fs = require('fs');
const path = require('path');

const polyfill = `module.exports = {
  createHook: () => ({ enable: () => {}, disable: () => {} }),
  AsyncLocalStorage: class {
    constructor() { this._store = undefined; }
    getStore() { return this._store; }
    run(store, cb, ...args) {
      const prev = this._store;
      this._store = store;
      try { return cb(...args); }
      finally { this._store = prev; }
    }
    enterWith(store) { this._store = store; }
    disable() {}
  },
  AsyncResource: class {
    constructor() {}
    bind(fn) { return fn; }
    runInAsyncScope(fn) { return fn(); }
    emitDestroy() {}
    asyncId() { return 0; }
    triggerAsyncId() { return 0; }
  },
  executionAsyncId: () => 0,
  executionAsyncResource: () => ({}),
  triggerAsyncId: () => 0,
};`;

// Polyfill locations (relative to patched files)
const polyfillLocations = [
  { file: 'node_modules/next/dist/server/async-hooks-polyfill.js', relative: './async-hooks-polyfill' },
  { file: 'node_modules/next/dist/server/web/sandbox/async-hooks-polyfill.js', relative: './async-hooks-polyfill' },
];

// Files to patch: [filePath, replacement require path]
const patches = [
  { file: 'node_modules/next/dist/server/node-environment.js', polyfillFile: polyfillLocations[0] },
  { file: 'node_modules/next/dist/server/web/sandbox/context.js', polyfillFile: polyfillLocations[1] },
];

// Create polyfill files
for (const loc of polyfillLocations) {
  const fullPath = path.resolve(loc.file);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, polyfill, 'utf8');
  console.log(`[patch] Created polyfill: ${loc.file}`);
}

// Patch files
for (const { file, polyfillFile } of patches) {
  if (!fs.existsSync(file)) {
    console.log(`[patch] File not found: ${file}`);
    continue;
  }

  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  const patterns = [
    /require\(["']async_hooks["']\)/g,
    /require\(["']node:async_hooks["']\)/g,
  ];

  for (const pattern of patterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, `require("${polyfillFile.relative}")`);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`[patch] Patched: ${file}`);
  } else {
    console.log(`[patch] No changes needed: ${file}`);
  }
}

console.log('[patch] Done');
