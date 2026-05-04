import sucrase from "@rollup/plugin-sucrase"
import type {RollupOptions} from "rollup"
import {showFiles} from "./show-files.ts"

const rollupConfig: RollupOptions = {
    input: "./test-shim.ts",

    output: {
        file: "../build/test-shim.browser.js",
        format: "iife",
    },

    plugins: [
        sucrase({
            exclude: ["node_modules/**"],
            transforms: ["typescript"],
        }),

        showFiles(),
    ],
}

export default rollupConfig
