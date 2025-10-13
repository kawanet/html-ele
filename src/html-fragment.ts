import {createElement} from "./create-element.ts"

const pickTagName = (code: string): string => {
    const matched = ("string" === typeof code) && code.match(/<(?![.-])([A-Z0-9._:-]+)/i)
    if (matched) return matched[1]
}

const resultCache: Record<string, [boolean]> = {}

const isAvailableTag = (tagName: string): boolean => {
    tagName = tagName.toLowerCase()
    return (resultCache[tagName] || (resultCache[tagName] = [testAvailability(tagName)]))[0]
}

const testAvailability = (tagName: string): boolean => {
    const fragment = docFragment(`<${tagName}></${tagName}>`)
    const elem = fragment && fragment.firstElementChild
    if (elem) return elem.tagName.toLowerCase() === tagName
}

/**
 * Default parser using innerHTML property for most elements like <div>, etc.
 */
const docFragment = (code: string): DocumentFragment => {
    const template = createElement<HTMLTemplateElement>("template")
    template.innerHTML = code
    return template.content
}

/**
 * Fallback parser using createElement() for the other elements like <html>, <head>, <body>, etc.
 * Limitation: The top-level tag must not appear in its nested children to avoid parser errors.
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
            const fragment = docFragment(`<template ${attributes}/>`)
            const parsed = fragment && fragment.firstElementChild
            if (parsed) for (const attr of parsed.attributes) {
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
