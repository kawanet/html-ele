// Browser polyfill of the small `node:test` + `node:assert/strict`
// API surface that html-ele's tests actually use. Bundled to
// `build/test-shim.browser.js` (IIFE) and loaded from `test/test.html`
// before the bundled tests run.
//
// Replaces the previous mocha + chai pair: chai 6 dropped its UMD
// browser bundle, requiring a custom rollup of `register-assert.js`
// just to ship `globalThis.assert`. The combined runtime cost was
// ~200 KB of dependencies for the four symbols `describe`, `it`,
// `assert.equal`, `assert.throws`.

(() => {
    const stack: string[] = [];

    const root = (): HTMLElement => {
        let el = document.getElementById("results");
        if (!el) {
            el = document.createElement("ul");
            el.id = "results";
            document.body.appendChild(el);
        }
        return el;
    };

    const append = (text: string, color: string): void => {
        const li = document.createElement("li");
        li.textContent = text;
        li.style.color = color;
        root().appendChild(li);
    };

    // Lifecycle hooks. The current tests only use these in
    // `test/jsdom-helper.ts` to lazily install jsdom when `document`
    // is absent (Node-side run), so in the browser the callback's
    // body is a no-op via its own `documentNotExist` guard. Invoking
    // synchronously and ignoring any returned Promise is therefore
    // safe here. `after` is a no-op since the browser test page is
    // discarded after the run.
    (globalThis as any).before = (fn: () => unknown): void => {
        try {
            fn();
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            append("✘ before(): " + msg, "red");
        }
    };

    (globalThis as any).after = (_fn: () => unknown): void => {
        // intentionally a no-op
    };

    (globalThis as any).describe = (name: string, fn: () => void): void => {
        stack.push(name);
        try {
            fn();
        } finally {
            stack.pop();
        }
    };

    (globalThis as any).it = (name: string, fn: () => void): void => {
        const label = [...stack, name].join(" › ");
        try {
            fn();
            append("✔ " + label, "green");
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            append("✘ " + label + ": " + msg, "red");
        }
    };

    (globalThis as any).assert = {
        // node:assert/strict-compatible `equal` (uses ===, like strict mode).
        equal(actual: unknown, expected: unknown, message?: string): void {
            if (actual !== expected) {
                throw new Error(message || `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
            }
        },

        // Verifies `block` throws. If `expected` is a RegExp the thrown
        // message must match it; if it is an Error subclass the thrown
        // value must be an instance of it. With no `expected` any throw
        // counts.
        throws(block: () => void, expected?: RegExp | (new (...args: unknown[]) => Error)): void {
            let thrown: unknown;
            try {
                block();
            } catch (e) {
                thrown = e;
            }
            if (thrown === undefined) {
                throw new Error("expected to throw, did not");
            }
            if (expected instanceof RegExp) {
                const msg = thrown instanceof Error ? thrown.message : String(thrown);
                if (!expected.test(msg)) {
                    throw new Error(`thrown message ${JSON.stringify(msg)} did not match ${expected}`);
                }
            } else if (typeof expected === "function") {
                if (!(thrown instanceof expected)) {
                    throw new Error(`thrown is not an instance of ${expected.name}`);
                }
            }
        },
    };
})();
