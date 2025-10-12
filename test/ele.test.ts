import "./jsdom-helper.ts"
import {strict as assert} from "node:assert"
import {describe, it} from "node:test"
import {DIV, ELE} from "../src/index.ts"

describe("ELE", () => {
    it("ELE`...`", () => {
        const node = ELE`
            <div class="foo"></div>
        `

        assert.equal(node.tagName, "DIV")
        assert.equal(node.className, "foo")
    })

    it("DIV`...`", () => {
        const node = DIV`
            <div class="bar"></div>
        `

        assert.equal(node.tagName, "DIV")
        assert.equal(node.className, "bar")
    })

    it("ELE`<div>${...}</div>`", () => {
        // language=HTML
        const fn = (v: any) => ELE`
            <div>${v}</div>
        `

        assert.equal(fn("foo").outerHTML, `<div>foo</div>`)
        assert.equal(fn("<br>").outerHTML, `<div>&lt;br&gt;</div>`)
        assert.equal(fn({outerHTML: "<br>"}).outerHTML, `<div><br></div>`)
        assert.equal(fn(document.createElement("br")).outerHTML, `<div><br></div>`)
    })

    it("ELE`<div>${...}</div>`", () => {
        assert.equal(ELE`<div>${3.14}</div>`.outerHTML, `<div>3.14</div>`)
        assert.equal(ELE`<div>${null}</div>`.outerHTML, `<div></div>`)
        assert.equal(ELE`<div>${false}</div>`.outerHTML, `<div></div>`)

        /* @ts-expect-error */
        assert.equal(ELE`<div>${true}</div>`.outerHTML, `<div>true</div>`)
    })

    it("ELE`<div>${...} ${...}</div>`", () => {
        const BR = (id: number | string) => ELE`<br id="${id}">`

        // language=HTML
        const e = ELE`
            <div>${BR(1)}${BR(2)}</div>
        `

        assert.equal(e.outerHTML, `<div><br id="1"><br id="2"></div>`)
    })

    it("ELE`<div>${...} ${...} ${...}</div>`", () => {
        const BR = (id: number | string) => ELE`<br id="${id}">`

        // language=HTML
        const e = ELE`
            <div>${BR(1)}${BR(2)}${BR(3)}</div>
        `

        assert.equal(e.outerHTML, `<div><br id="1"><br id="2"><br id="3"></div>`)
    })

    it(`multiple elements`, () => {
        // language=HTML
        assert.throws(() => ELE`
            <div class="foo"></div>
            <p class="bar"></p>
        `, /Multiple children:/)
    })

    it(`plain text`, () => {
        // language=HTML
        assert.throws(() => ELE`
            plain text
        `, /firstElementChild not found/)
    })

    it(`comment only`, () => {
        // language=HTML
        assert.throws(() => ELE`
            <!-- comment -->
        `, /firstElementChild not found/)
    })
})
