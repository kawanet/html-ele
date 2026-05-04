// Browser-side shim for `node:assert`. Aliased into the test bundle
// by the rollup test config. Tests source-import as
// `import {strict as assert} from "node:assert"`, so this file
// exports `strict` matching that surface.

export const strict = {
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
