import "./jsdom-helper.ts"
import {strict as assert} from "node:assert"
import {describe, it} from "node:test"
import {ele} from "html-ele"

describe("HTMLTableElement", () => {
    it(`<table>`, () => {
        const TABLE = ele("table")

        // language=HTML
        const node = (TABLE`
            <table class="foo"></table>
        `)

        assert.equal(node.tagName, "TABLE")
        assert.equal(node.className, "foo")
        assert.equal(node.childElementCount, 0)
    })

    it(`<thead>`, () => {
        const THEAD = ele("thead")

        // language=HTML
        const node = (THEAD`
            <thead class="bar"></thead>
        `)

        assert.equal(node.tagName, "THEAD")
        assert.equal(node.className, "bar")
        assert.equal(node.childElementCount, 0)
    })

    it(`<tbody>`, () => {
        const TBODY = ele("tbody")

        // language=HTML
        const node = (TBODY`
            <tbody class="buz"></tbody>
        `)

        assert.equal(node.tagName, "TBODY")
        assert.equal(node.className, "buz")
        assert.equal(node.childElementCount, 0)
    })

    it(`<tfoot>`, () => {
        const TFOOT = ele("tfoot")

        // language=HTML
        const node = (TFOOT`
            <tfoot class="qux"></tfoot>
        `)

        assert.equal(node.tagName, "TFOOT")
        assert.equal(node.className, "qux")
        assert.equal(node.childElementCount, 0)
    })

    it(`<tr>`, () => {
        const TR = ele("tr")

        // language=HTML
        const node = (TR`
            <tr class="quux"></tr>
        `)

        assert.equal(node.tagName, "TR")
        assert.equal(node.className, "quux")
        assert.equal(node.childElementCount, 0)
    })

    it(`<th>`, () => {
        const TH = ele("th")

        // language=HTML
        const node = (TH`
            <th class="quuux"></th>
        `)

        assert.equal(node.tagName, "TH")
        assert.equal(node.className, "quuux")
        assert.equal(node.childElementCount, 0)
    })

    it(`<td>`, () => {
        const TD = ele("td")

        // language=HTML
        const node = (TD`
            <td class="quuuux"></td>
        `)

        assert.equal(node.tagName, "TD")
        assert.equal(node.className, "quuuux")
        assert.equal(node.childElementCount, 0)
    })
})
