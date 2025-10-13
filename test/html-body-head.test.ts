import "./jsdom-helper.ts"
import {strict as assert} from "node:assert"
import {describe, it} from "node:test"
import {ele} from "html-ele"

describe("HTMLHtmlElement", () => {
    /**
     * As <html> element is the root element of HTML document,
     * it needs a special treatment when parsing.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/html
     */
    it(`<html>`, () => {
        const HTML = ele("html")

        // language=HTML
        const node = (HTML`
            <html lang="ja" data-foo data-bar="Bar" data-buz="Buz" class="bar buz">
            <body>
            Hello, Velem!
            </body>
            </html>
        `)

        assert.equal(node.tagName, "HTML")
        assert.equal(node.getAttribute("lang"), "ja")
        assert.equal(node.getAttribute("not-found"), null)
        assert.equal(node.dataset.foo, "")
        assert.equal(node.dataset.bar, "Bar")
        assert.equal(node.classList.contains("bar"), true)
        assert.equal(node.querySelector("body")?.tagName, "BODY")
    })

    it(`<head>`, () => {
        const HEAD = ele("head")

        // language=HTML
        const node = (HEAD`
            <head class="foo"></head>
        `)

        assert.equal(node.tagName, "HEAD")
        assert.equal(node.className, "foo")
        assert.equal(node.outerHTML, `<head class="foo"></head>`)
        assert.equal(node.childElementCount, 0)
    })

    it(`<body>`, () => {
        const BODY = ele("body")

        // language=HTML
        const node = (BODY`
            <body class="bar"></body>
        `)

        assert.equal(node.tagName, "BODY")
        assert.equal(node.className, "bar")
        assert.equal(node.outerHTML, `<body class="bar"></body>`)
        assert.equal(node.childElementCount, 0)
    })
})
