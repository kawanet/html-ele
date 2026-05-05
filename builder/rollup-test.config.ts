import alias from "@rollup/plugin-alias"
import commonjs from "@rollup/plugin-commonjs"
import multiEntry from "@rollup/plugin-multi-entry"
import nodeResolve from "@rollup/plugin-node-resolve"
import sucrase from "@rollup/plugin-sucrase"
import type {RollupOptions} from "rollup"
import {fileURLToPath} from "node:url"
import {showFiles} from "./show-files.ts"

const rollupConfig: RollupOptions = {
    input: "../test/*.test.ts",

    output: {
        file: "../browser/run-tests.js",
        format: "iife",
        // `test/jsdom-helper.ts` uses a dynamic `import("jsdom")` so
        // jsdom only loads on Node. Rollup would normally turn that
        // into a separate chunk, which IIFE output cannot represent;
        // force everything into a single bundle so the alias to
        // `jsdom.shim.ts` lands inline alongside the rest.
        inlineDynamicImports: true,
    },

    treeshake: false,

    plugins: [
        // Redirect `node:test` / `node:assert` to the browser shims,
        // `html-ele` to the published `browser/import.js` (a 5-line
        // CJS bridge to the namespace global `ele` set by the IIFE
        // in `dist/html-ele.min.js` — see browser/import.js), and
        // `jsdom` to a no-op shim (jsdom is Node-only and the
        // browser already has a real `document`, so jsdom-helper.ts
        // never actually calls into it at runtime under a browser).
        // The same import statements therefore resolve to:
        //   - real `node:test` / `node:assert` / `html-ele` / `jsdom`
        //     under `node --test` (Node + the package's own dist),
        //   - the local shims / global bridge in the browser bundle,
        // exercising the published `.min.js` instead of inlining the
        // source via nodeResolve.
        alias({
            entries: [
                {find: "node:test", replacement: fileURLToPath(new URL("./node-test.shim.ts", import.meta.url))},
                {find: "node:assert", replacement: fileURLToPath(new URL("./node-assert.shim.ts", import.meta.url))},
                {find: "html-ele", replacement: fileURLToPath(new URL("../browser/import.js", import.meta.url))},
                {find: "jsdom", replacement: fileURLToPath(new URL("./jsdom.shim.ts", import.meta.url))},
            ],
        }),

        multiEntry(),

        nodeResolve({
            browser: true,
            preferBuiltins: false,
        }),

        // Required so rollup can interpret `browser/import.js`'s
        // `exports.ele = ele.ele` syntax (the file is CJS so it can
        // also serve browserify users — see browser/package.json).
        commonjs(),

        sucrase({
            exclude: ["node_modules/**"],
            transforms: ["typescript"],
        }),

        showFiles(),
    ],
}

export default rollupConfig
