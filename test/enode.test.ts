import "./jsdom-helper.ts"
import {strict as assert} from "node:assert"
import {describe, it} from "node:test"
import {EN} from "../src/index.ts"

describe("ENode", () => {
    const equal = (actual: ReturnType<typeof EN>, expected: string) => {
        assert.equal(typeof actual, "object", expected)
        assert.equal(typeof (actual && actual.outerHTML), "string", expected)
        assert.equal(actual.outerHTML, expected)
        assert.equal(String(actual), expected)
    }

    it("no variable", () => {
        equal(EN``, "")
        equal(EN`foo`, "foo")
    })

    it("strings", () => {
        equal(EN`foo-${"bar"}-buz`, "foo-bar-buz")
        equal(EN`foo-${"bar"}-${"buz"}-qux`, "foo-bar-buz-qux")
        equal(EN`foo-${"bar"}-${"buz"}-${"qux"}-quux`, "foo-bar-buz-qux-quux")
        equal(EN`foo-${"bar"}${"buz"}${"qux"}-quux`, "foo-barbuzqux-quux")
    })

    it("numbers", () => {
        equal(EN`[${0}]`, "[0]")
        equal(EN`[${0}${0.1}]`, "[00.1]")
        equal(EN`[${0}${0.1}${-2}]`, "[00.1-2]")
    })

    it("empty values", () => {
        equal(EN`[${""}-${null}-${undefined}-${false}]`, "[---]")
    })

    it("escapes", () => {
        equal(EN`<input name="&" value="'">`, `<input name="&" value="'">`)
        equal(EN`[${`<input name="&" value="'">`}]`, `[&lt;input name=&quot;&amp;&quot; value=&quot;&apos;&quot;&gt;]`)
    })

    it("outerHTML", () => {
        equal(EN`[${({outerHTML: "<foo>"})}]`, "[<foo>]")
        equal(EN`[${[{outerHTML: "<bar>"}]}]`, "[<bar>]")
        equal(EN`[${[{outerHTML: "<buz>"}, {outerHTML: "<qux>"}]}]`, "[<buz><qux>]")
    })
})
