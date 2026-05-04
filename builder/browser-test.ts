// Browser-side stub for `node:test`. Aliased into the test bundle by
// `rollup-test.config.ts` so the test sources can import the same
// names (`describe`, `it`, `before`, `after`) under both Node (real
// node:test) and the browser (this file).
//
// Test results are rendered into `<ul id="results">` in
// `test/test.html`.

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

export const describe = (name: string, fn: () => void): void => {
    stack.push(name);
    try {
        fn();
    } finally {
        stack.pop();
    }
};

export const it = (name: string, fn: () => void): void => {
    const label = [...stack, name].join(" › ");
    try {
        fn();
        append("✔ " + label, "green");
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        append("✘ " + label + ": " + msg, "red");
    }
};

// `before` / `after` are used by `test/jsdom-helper.ts` only to
// install jsdom when `document` is missing (Node-side run). In the
// browser the callback's body is a no-op via its own
// `documentNotExist` guard, so synchronous invocation (and ignoring
// any returned Promise) is safe. `after` is a no-op since the
// browser test page is discarded after the run.
export const before = (fn: () => unknown): void => {
    try {
        fn();
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        append("✘ before(): " + msg, "red");
    }
};

export const after = (_fn: () => unknown): void => {
    // intentionally a no-op
};
