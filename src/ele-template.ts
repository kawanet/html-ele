import type {ENode} from "html-ele"
import {htmlFragment} from "./html-fragment.ts"

// EV is intentionally not exported from the public type contract; redefine
// it here so the runtime side has its own copy. Keep in sync with
// types/html-ele.d.ts.
type EV = string | number | false | undefined | null | ENode | ENode[] | Node;

export type TemplateArguments = [TemplateStringsArray, ...EV[]];

const AMP = {"<": "&lt;", "&": "&amp;", ">": "&gt;", "\"": "&quot;", "'": "&apos;"}

const escapeHTML = (v: string): string => v.replace(/([<&>"'])/g, ($1: keyof typeof AMP) => AMP[$1])

const isTemplateStringsArray = (v: any): v is TemplateStringsArray => (v && v.raw && (v.raw.length > 0))

const isENode = (v: any): v is ENode => (v && "string" === typeof (v as ENode).outerHTML)

const isNode = (v: any): v is Node => (v && "number" === typeof (v as Node).nodeType)

const DATA_KEY = "ele"

let id = 0

const toString = function (this: ENode) {
    return this.outerHTML
}

interface eleTemplate {
    (t: TemplateStringsArray, args: TemplateArguments, useENode: true): ENode

    (t: TemplateStringsArray, args: TemplateArguments, useENode?: false): DocumentFragment
}

export const eleTemplate = ((t, args, useENode) => {
    if (!isTemplateStringsArray(t)) {
        throw new Error(`Invalid Template Literals: ${t && t[0]}`)
    }

    const templates: Record<string, Node> = {}

    const insert = (e: Node) => {
        const key = "#" + (++id)
        templates[key] = e
        return `<template data-${DATA_KEY}="${key}"></template>`
    }

    // stringify function with escaping feature
    const $$ = (v: EV): string => {
        if ("string" === typeof v) {
            return escapeHTML(v)
        } else if ("number" === typeof v) {
            return escapeHTML(String(v))
        } else if (v == null || v === false) {
            return ""
        } else if (!useENode && isNode(v)) {
            return insert(v)
        } else if (isENode(v)) {
            return v.outerHTML
        } else if (Array.isArray(v)) {
            return v.map($$).join("") // recursive call
        } else {
            return escapeHTML(String(v)) // default behaviour
        }
    }

    // template literals
    const TL$$ = (t: TemplateStringsArray, args: TemplateArguments): string => {
        const size = t.length
        if (size === 1) {
            return t[0]
        } else if (size === 2) {
            return t[0] + $$(args[1]) + t[1]
        } else {
            let str = t[0]
            for (let i = 1; i < size; i++) {
                str += $$(args[i] as EV)
                str += t[i]
            }
            return str
        }
    }

    const html = TL$$(t, args)

    if (useENode) {
        return {outerHTML: html, toString}
    }

    const elem = htmlFragment(html)

    if (Object.keys(templates).length > 0) {
        elem.querySelectorAll<HTMLTemplateElement>("template").forEach(e => {
            const target = templates[e.dataset[DATA_KEY]]
            if (target) e.replaceWith(target)
        })
    }

    return elem
}) as eleTemplate
