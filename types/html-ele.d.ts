/**
 * εLε - Native HTMLElement builder from type-safe template literals
 *
 * @author kawanet
 * @see https://github.com/kawanet/html-ele
 */

/**
 * A plain object that holds an HTML snippet in its `outerHTML` property,
 * acting as a lightweight stand-in for a real DOM Node. The library refers
 * to this shape as an "Enveloped Node".
 */
declare type ENode = { outerHTML: string };

/**
 * Types that may be interpolated into a template literal.
 *
 * The boolean `true` is intentionally excluded so the type system enforces
 * the safe conditional pattern. `${cond && value}` narrows to `false | value`
 * and type-checks; `${cond || value}` can yield `true` and fails to compile.
 * At runtime, `false`, `null`, and `undefined` all render as an empty string,
 * making `${cond && 'class-name'}` the idiomatic way to conditionally include
 * content.
 */
declare type EV = string | number | false | undefined | null | ENode | ENode[] | Node;

/**
 * @internal
 */
type _C1<A extends EV[]> = A & { [K in keyof A]: _C2<A[K]> };
type _C2<T> = _C3<T, EV>;
type _C3<T, X> = [T] extends [Exclude<EV, number>] ? X : [T] extends [Exclude<EV, ENode | ENode[] | Node>] ? X : never;

/**
 * Parses the template and returns a real `DocumentFragment` containing the
 * resulting nodes.
 *
 * @example
 * const fragment = HTML`<div>${v}</div>` // => DocumentFragment
 */
declare const HTML: <A extends EV[]>(t: TemplateStringsArray, ...args: _C1<[...A]>) => DocumentFragment

/**
 * Parses the template and returns an `ENode` — a plain object whose
 * `outerHTML` holds the rendered HTML. No `document` is required, so this
 * works in any environment (browser, Node.js, Workers, etc.).
 *
 * @example
 * const node = EN`<div>${v}</div>` // => {outerHTML: string}
 */
declare const EN: <A extends EV[]>(t: TemplateStringsArray, ...args: _C1<[...A]>) => { outerHTML: string }

/**
 * Parses the template and returns the first real `HTMLElement` it produces.
 *
 * @example
 * const element = ELE`<div>${v}</div>` // => HTMLElement
 */
declare const ELE: ELE<HTMLElement>

type ELE<T extends HTMLElement = HTMLElement> = <A extends EV[]>(t: TemplateStringsArray, ...args: _C1<[...A]>) => T

/**
 * ε𝑳ε - Creates a custom tag function that returns a specific `HTMLElement`
 * subtype for the given tag name.
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
