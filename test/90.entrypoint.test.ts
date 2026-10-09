import type * as declared from "html-ele"
import {strict as assert} from "node:assert"
import {test} from "node:test"
import * as m from "../src/index.ts"

const isNodeJS = "undefined" !== typeof process && !!process?.versions?.node

const createRequire = async (path: string) => {
    const {createRequire} = await import("node:module")
    return createRequire(path)
}

const resolvePath = async (name: string, path: string) => {
    const require = await createRequire(import.meta.url)
    const {join, dirname} = await import("node:path")
    return join(dirname(require.resolve(name)), path)
}

// tsc fails here when a name declared in the published .d.ts is missing
// from the runtime entry -- the surface check derives from the declarations.
const runtime: typeof declared = m
void runtime

test("import entry (.mjs)", () => {
    // entries
    assert.equal(typeof m.ele, "function")
    assert.equal(typeof m.ELE, "function")
    assert.equal(typeof m.HTML, "function")
    assert.equal(typeof m.EN, "function")
})

test("require entry (.cjs)", {skip: !isNodeJS}, async () => {
    const require = await createRequire(import.meta.url)
    const m: typeof declared = require("html-ele")
    // entries
    assert.equal(typeof m.ele, "function")
    assert.equal(typeof m.ELE, "function")
    assert.equal(typeof m.HTML, "function")
    assert.equal(typeof m.EN, "function")
})

test("minified entry (.min.js)", {skip: !isNodeJS}, async () => {
    const require = await createRequire(import.meta.url)
    const m: typeof declared = require(await resolvePath("html-ele", "html-ele.min.js"))
    // entries
    assert.equal(typeof m.ele, "function")
    assert.equal(typeof m.ELE, "function")
    assert.equal(typeof m.HTML, "function")
    assert.equal(typeof m.EN, "function")
})
