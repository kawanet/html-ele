// Browser-side shim for `node:test`. Aliased into the test bundle by
// the rollup test config so the test sources can import the same
// names (`describe`, `it`, `before`, `after`) under both Node (real
// node:test) and the browser (this file).
//
// Test results are rendered into `<ul id="results">` on the host
// page (the element is created on demand if absent).

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

// `warn` is for cases where the shim invoked the callback but
// cannot determine a verdict — currently only async callbacks whose
// returned Promise was not awaited. Renders as ⚠ in `darkorange` to
// stand apart from the green ✔ pass and the red ✘ definite fail.
const warn = (label: string, reason: string): void => {
    append("⚠ " + label + ": " + reason, "darkorange");
};

// Detect a thenable (Promise-like) return value. The shim only
// supports synchronous test functions; an async callback's body is
// invoked but its returned Promise is not awaited, so the verdict
// is unknown — we render it via `warn` rather than treat it as a
// pass or a fail.
const isThenable = (v: unknown): boolean =>
    !!v && (typeof v === "object" || typeof v === "function") && typeof (v as {then?: unknown}).then === "function";

export const describe = (name: string, fn: () => void): void => {
    stack.push(name);
    try {
        fn();
    } finally {
        stack.pop();
    }
};

export const it = (name: string, fn: () => unknown): void => {
    const label = [...stack, name].join(" › ");
    try {
        const result = fn();
        if (isThenable(result)) {
            // Swallow any rejection so the browser/jsdom doesn't fire
            // an `unhandledrejection` event on top of the explicit
            // warn row below. The rejection content is discarded on
            // purpose — the actual situation to flag is just that the
            // test is async, not whatever it would have rejected with.
            (result as Promise<unknown>).catch(() => {});
            warn(label, "invoked but not awaited (async tests are not supported by this shim)");
            return;
        }
        append("✔ " + label, "green");
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        append("✘ " + label + ": " + msg, "red");
    }
};

// `before(fn)` is invoked synchronously at registration time. An
// async body's `await` tail is not waited for; we only see what its
// synchronous prefix did. Callers needing different setup on Node
// vs the browser should gate the body on
// `typeof document === "undefined"` rather than writing an `async`
// callback. `after(fn)` is a no-op since the browser test page is
// discarded after the run.
export const before = (fn: () => unknown): void => {
    try {
        const result = fn();
        if (isThenable(result)) {
            // Same rejection-swallow as in `it()` above.
            (result as Promise<unknown>).catch(() => {});
            warn("before()", "invoked but not awaited (async hooks are not supported by this shim)");
        }
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        append("✘ before(): " + msg, "red");
    }
};

export const after = (_fn: () => unknown): void => {
    // intentionally a no-op
};
