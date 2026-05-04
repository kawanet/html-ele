import alias from "@rollup/plugin-alias"
import multiEntry from "@rollup/plugin-multi-entry";
import nodeResolve from "@rollup/plugin-node-resolve"
import sucrase from "@rollup/plugin-sucrase"
import type {RollupOptions} from "rollup"
import {fileURLToPath} from "node:url"
import {showFiles} from "./show-files.ts"

const rollupConfig: RollupOptions = {
    input: "../test/**/*.ts",

    output: {
        file: "../test/test.browser.js",
        format: "iife",
        // `html-ele` resolves to the global `ele` exposed by
        // `dist/html-ele.min.js`'s IIFE; other imports (`node:test`,
        // `node:assert`) are aliased to local stub files below and so
        // bundle inline rather than coming in as externals.
        globals: {
            "html-ele": "ele",
        },
    },

    external: [
        "jsdom",
        "html-ele",
    ],

    treeshake: false,

    plugins: [
        // Redirect node:test / node:assert imports to the browser
        // shims in `builder/`. Tests can therefore use identical
        // source under both `node --test` (real node:*) and the
        // browser (these shims).
        alias({
            entries: [
                {find: "node:test", replacement: fileURLToPath(new URL("./node-test.shim.ts", import.meta.url))},
                {find: "node:assert", replacement: fileURLToPath(new URL("./node-assert.shim.ts", import.meta.url))},
            ],
        }),

        multiEntry(),

        nodeResolve({
            browser: true,
            preferBuiltins: false,
        }),

        sucrase({
            exclude: ["node_modules/**"],
            transforms: ["typescript"],
        }),

        showFiles(),
    ],
}

export default rollupConfig
