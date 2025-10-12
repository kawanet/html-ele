/**
 * Override the global `document` object when running on Node.js environment.
 *
 * @example
 * const {JSDOM} = await import("jsdom")
 * globalThis.document = new JSDOM().window.document
 */
export const createElement = <T extends HTMLElement>(tagName: string) => document.createElement(tagName) as T
