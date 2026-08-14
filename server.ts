import { AsyncLocalStorage } from "node:async_hooks";

// Next.js expects AsyncLocalStorage as a global (normally set up by its own
// CLI bootstrap). A custom server bypasses that bootstrap, so polyfill it
// here — via dynamic import below — before `next` is ever imported, since
// static imports are hoisted above this statement otherwise.
(globalThis as { AsyncLocalStorage?: unknown }).AsyncLocalStorage ??= AsyncLocalStorage;

void import("./src/server/main");
