import multiEntry from "@rollup/plugin-multi-entry";
import nodeResolve from "@rollup/plugin-node-resolve"
import sucrase from "@rollup/plugin-sucrase"
import type {RollupOptions} from "rollup"
import {showFiles} from "./show-files.ts"

const rollupConfig: RollupOptions = {
    input: "../test/**/*.ts",

    output: {
        file: "../build/test.browser.js",
        format: "iife",
        // Globals point at bindings that test-shim.ts installs on
        // `globalThis` (assert, describe, it). Tests import from the
        // node:* modules; rollup treats those module references as the
        // runtime expressions below.
        globals: {
            "node:assert": "{strict: assert}",
            "node:test": "{describe, it, before, after}",
            "html-ele": "ele",
        },
    },

    external: [
        "jsdom",
        "html-ele",
        "node:assert",
        "node:test",
    ],

    treeshake: false,

    plugins: [
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
