const ELEMENT_NODE = 1

const isElementNode = (node: Node): node is Element => (node.nodeType === ELEMENT_NODE)

export const onlyElement = <T extends HTMLElement>(fragment: DocumentFragment, tagName?: string): T => {
    const elem = fragment?.firstElementChild as T
    if (!elem) {
        throw new Error(`firstElementChild not found`)
    }

    const childElementCount = fragment?.childElementCount
    if (childElementCount > 1) {
        const tags = childrenTagNames(fragment, 5).join(", ")
        throw new Error(`Multiple children: ${tags}`)
    }

    if (tagName && elem?.tagName !== tagName) {
        throw new Error(`Invalid tagName: ${elem.tagName.toLowerCase()} != ${tagName.toLowerCase()}`)
    }

    return elem
}

const childrenTagNames = (parent: ParentNode, limit: number): string[] => {
    const tags: string[] = []
    for (const node of parent.childNodes) {
        if (isElementNode(node)) {
            tags.push(node.tagName.toLowerCase())
        }
        if (tags.length > limit) {
            tags.shift()
            tags.push("...")
            break
        }
    }
    return tags
}
