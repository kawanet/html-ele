import {createElement} from "./create-element.ts"

const pickTagName = (code: string): string => ("string" === typeof code) && code.match(/<(?![.-])([A-Z0-9._:-]+)/i)?.[1]?.toUpperCase()

const resultCache: Record<string, [boolean]> = {}

const isAvailableTag = (tagName: string): boolean => (resultCache[tagName] || (resultCache[tagName] = [testAvailability(tagName)]))[0]

const testAvailability = (tagName: string): boolean => (docFragment(`<${tagName}></${tagName}>`).firstElementChild?.tagName.toUpperCase() === tagName)

const docFragment = (code: string): DocumentFragment => {
    const template = createElement<HTMLTemplateElement>("template")
    template.innerHTML = code
    return template.content
}

/**
 * Fallback render using createElement() for any other tags: such as <html>, <head>, <body>, etc.
 */
const docFragmentFB = (code: string): DocumentFragment => {
    const split = code.split(/<((?![.-])[A-Z0-9._:-]+)((?![A-Z0-9._:-])(?:[^>"'/]|"[^"]*"|'[^']*')+)?(?:>(.*?)(?:<\/\1[^<>]*>)|\/>)/sig)

    const fragment = docFragment(split[0])

    for (let i = 0; i < split.length; i += 4) {
        const raw = split[i]
        if (i && raw) {
            const prev = docFragment(raw)
            fragment.appendChild(prev)
        }

        const tagName = split[i + 1]
        if (!tagName) continue
        const attributes = split[i + 2]
        const innerHTML = split[i + 3]

        const elem = createElement(tagName)

        if (attributes) {
            const namedNodeMap = docFragment(`<template ${attributes}/>`)?.firstElementChild?.attributes
            for (const attr of namedNodeMap) {
                elem.setAttribute(attr.name, attr.value)
            }
        }

        if (innerHTML) {
            elem.innerHTML = innerHTML
        }

        fragment.appendChild(elem)
    }

    return fragment
}

export const htmlFragment = (code: string): DocumentFragment => {
    const tagName = pickTagName(code)

    if (!tagName || isAvailableTag(tagName)) {
        return docFragment(code)
    } else {
        return docFragmentFB(code)
    }
}
