// Self-reference via the package name so `tsc --noEmit` resolves these
// types through `package.json` `exports` — the same path an external
// consumer would take. If the `exports.types` mapping ever breaks, the
// build fails here.
import type * as declared from "html-ele"
import {eleTemplate, type TemplateArguments} from "./ele-template.ts"
import {onlyElement} from "./only-element.ts"

export type ENode = declared.ENode

/**
 * ε𝑳ε
 */

export const ele: typeof declared.ele = <T extends HTMLElement>(tagName: string) => {
    if (tagName) tagName = tagName.toUpperCase()

    const tag: declared.ELE<T> = function (t, ..._args): T {
        const fragment = eleTemplate(t, arguments as unknown as TemplateArguments)
        return onlyElement<T>(fragment, tagName)
    }

    return tag
}

export const ELE: typeof declared.ELE = /*#__PURE__*/ ele(null as string)

export const HTML: typeof declared.HTML = function (t, ..._args) {
    return eleTemplate(t as TemplateStringsArray, arguments as unknown as TemplateArguments)
}

export const EN: typeof declared.EN = function (t, ..._args) {
    return eleTemplate(t as TemplateStringsArray, arguments as unknown as TemplateArguments, true)
}
