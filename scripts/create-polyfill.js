const fs = require("fs");
const path = require("path");

const targetDir = path.join(__dirname, "..", "node_modules", "async_hooks");
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const polyfill = `module.exports = {
  createHook: () => ({ enable: () => {}, disable: () => {} }),
  executionAsyncId: () => 0,
  executionAsyncResource: () => ({}),
  triggerAsyncId: () => 0,
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
    constructor() { this._asyncResource = {}; }
    bind(fn) { return fn.bind(this); }
    runInAsyncScope(fn, thisArg, ...args) { return fn.apply(thisArg, args); }
    emitDestroy() {}
    asyncId() { return 0; }
    triggerAsyncId() { return 0; }
    static bind(fn) { return fn; }
  },
};
`;

fs.writeFileSync(path.join(targetDir, "index.js"), polyfill, "utf8");
fs.writeFileSync(
  path.join(targetDir, "package.json"),
  JSON.stringify({ name: "async_hooks", version: "1.0.0", private: true, main: "index.js" }, null, 2),
  "utf8"
);

console.log("[polyfill] async_hooks polyfill created");
