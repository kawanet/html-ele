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

// Detect a thenable (Promise-like) return value. The shim only
// supports synchronous test functions; if a callback returns a
// Promise we hard-fail rather than silently dropping it, since the
// real `node:test` would await it and surface any rejection.
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
            append("✘ " + label + ": async tests are not supported by this shim (got a thenable return value)", "red");
            return;
        }
        append("✔ " + label, "green");
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        append("✘ " + label + ": " + msg, "red");
    }
};

// `before(fn)` is invoked synchronously at registration time. A
// thenable return value is rejected loudly (the shim does not
// await), so callers needing different setup on Node vs the
// browser should gate the body on `typeof document === "undefined"`
// instead of writing an `async` callback. `after(fn)` is a no-op
// since the browser test page is discarded after the run.
export const before = (fn: () => unknown): void => {
    try {
        const result = fn();
        if (isThenable(result)) {
            append("✘ before(): async hooks are not supported by this shim (got a thenable return value)", "red");
        }
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        append("✘ before(): " + msg, "red");
    }
};

export const after = (_fn: () => unknown): void => {
    // intentionally a no-op
};
