import "./jsdom-helper.ts"
import {strict as assert} from "node:assert"
import {describe, it} from "node:test"
import {ele} from "html-ele"

describe("TypeScript", () => {
    it(`type guard`, () => {
        let num: number = 0
        const oh = {outerHTML: "foo"}
        const DIV = ele("div")

        // language=HTML
        assert.equal(DIV`
            <div>${num && oh}</div>
        `.outerHTML.trim(), "<div>0</div>") // not guarded yet

        // language=HTML
        assert.equal(/* @ts-expect-error */ DIV`
            <div>${num || [oh]}</div>
        `.outerHTML.trim(), "<div>foo</div>")

        // language=HTML
        assert.equal(DIV`
            <div>${num && [oh]}</div>
        `.outerHTML.trim(), "<div>0</div>") // not guarded yet

        // language=HTML
        assert.equal(/* @ts-expect-error */ DIV`
            <div>${num || oh}</div>
        `.outerHTML.trim(), "<div>foo</div>")

        // language=HTML
        assert.equal(DIV`
            <div>${!num && oh}</div>
        `.outerHTML.trim(), "<div>foo</div>")

        // language=HTML
        assert.equal(/* @ts-expect-error */ DIV`
            <div>${!num || oh}</div>
        `.outerHTML.trim(), "<div>true</div>")
    })
})
