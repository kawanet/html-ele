/**
 * εLε - Native HTMLElement builder from type-safe template literals
 *
 * @author kawanet
 * @see https://github.com/kawanet/html-ele
 */

/**
 * Enveloped Node, which contains an HTML code snippet in its `outerHTML` property.
 */
declare type ENode = { outerHTML: string };

/**
 * Allowed types for template literal interpolations.
 * Note that the boolean value `true` is intentionally excluded here.
 */
declare type EV = string | number | false | undefined | null | ENode | ENode[] | Node;

/**
 * @internal
 */
type _C1<A extends EV[]> = A & { [K in keyof A]: _C2<A[K]> };
type _C2<T> = _C3<T, EV>;
type _C3<T, X> = [T] extends [Exclude<EV, number>] ? X : [T] extends [Exclude<EV, ENode | ENode[] | Node>] ? X : never;

/**
 * Parse the HTML template and return a DocumentFragment.
 *
 * @example
 * const fragment = HTML`<div>${v}</div>` // => DocumentFragment
 */
declare const HTML: <A extends EV[]>(t: TemplateStringsArray, ...args: _C1<[...A]>) => DocumentFragment

/**
 * Parse the HTML template and return an enveloped Node.
 *
 * @example
 * const fragment = EN`<div>${v}</div>` // => {outerHTML: string}
 */
declare const EN: <A extends EV[]>(t: TemplateStringsArray, ...args: _C1<[...A]>) => { outerHTML: string }

/**
 * Parse the HTML template and return its first HTMLElement.
 *
 * @example
 * const element = ELE`<div>${v}</div>` => HTMLElement
 */
declare const ELE: ELE<HTMLElement>

type ELE<T extends HTMLElement = HTMLElement> = <A extends EV[]>(t: TemplateStringsArray, ...args: _C1<[...A]>) => T

/**
 * ε𝑳ε - Helper for creating a custom template literal tag function.
 *
 * @example
 * const DIV = ele("div")
 * const div = DIV`<div>${v}</div>` // => HTMLDivElement
 */
export const ele: ele

interface ele {
    <N extends keyof HTMLElementTagNameMap>(tagName: N): ELE<HTMLElementTagNameMap[N]>;

    <T extends HTMLElement = HTMLElement>(tagName: string): ELE<T>
}
