// Test entry for `make test-shim` — parallels `browser/tests.html`.
// Aliases node:test / node:assert to the local shims via
// module.registerHooks() (same-thread, single-file), then dynamic-
// imports each test file in argv. Dynamic import is required
// because Node only evaluates the entry script — extra positionals
// land in process.argv unused — and each `await` boundary lets the
// shim drain state cleanly between files.

import {registerHooks} from "node:module";
import {dirname, resolve as resolvePath} from "node:path";
import {fileURLToPath, pathToFileURL} from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = pathToFileURL(resolvePath(here, "..") + "/").href;
const ALIAS: Record<string, string> = {
    "node:test": resolvePath(here, "node-test.shim.ts"),
    "node:assert": resolvePath(here, "node-assert.shim.ts"),
};

registerHooks({
    resolve(specifier, context, nextResolve) {
        const target = ALIAS[specifier];
        const parent = context?.parentURL;
        // Only intercept imports from project sources. Dependencies
        // under node_modules (jsdom → undici, etc.) keep resolving
        // to real node:test / node:assert; without this guard, our
        // alias would redirect their imports to the .ts shim files
        // and break their CJS require() chain.
        if (target && parent && parent.startsWith(projectRoot) && !parent.includes("/node_modules/")) {
            return nextResolve(pathToFileURL(target).href, context);
        }
        return nextResolve(specifier, context);
    },
});

for (const f of process.argv.slice(2)) {
    await import(pathToFileURL(resolvePath(process.cwd(), f)).href);
}
