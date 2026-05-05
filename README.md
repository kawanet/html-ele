# ε𝑳ε - html-ele

[![Node.js CI](https://github.com/kawanet/html-ele/actions/workflows/nodejs.yml/badge.svg?branch=main)](https://github.com/kawanet/html-ele/actions/)
[![npm version](https://img.shields.io/npm/v/html-ele)](https://www.npmjs.com/package/html-ele)
[![gzip size](https://img.badgesize.io/https://cdn.jsdelivr.net/npm/html-ele/dist/html-ele.min.js?compression=gzip)](https://cdn.jsdelivr.net/npm/html-ele/dist/html-ele.min.js)

Native `HTMLElement` and `DocumentFragment` builder from type-safe template literals.

- **Small runtime**: Under [3KB](https://cdn.jsdelivr.net/npm/html-ele/dist/html-ele.min.js) minified, under 2KB gzipped.
- **Fast build**: No JSX/TSX transpilers required.
- **XSS-safe**: Automatic escaping prevents injection attacks.
- **Type-safe**: Full TypeScript support for a developer-friendly experience.

## SYNOPSIS

```typescript
import {ELE, EN, type ENode, HTML} from "html-ele"

interface Context {
    name: string;
    country: string;
    countryList: Country[];
}

interface Option {
    value: string;
    label: string;
}

// language=HTML
const inputName = (ctx: Context): ENode => (EN`
    <input type="text" name="name" value="${ctx.name}">
`)

// mounting via innerHTML
document.querySelector<HTMLElement>("#name-outer").innerHTML = inputName(ctx)
```

Special characters in `name` are escaped automatically.

`ele` accepts `ENode` components as well as primitive values such as `string` and `number`.

```typescript
// language=HTML
const selectCountry = (ctx: Context): HTMLElement => (ELE`
    <select name="country">
        ${ctx.countryList.map(v => EN`<option value="${v.value}" ${v.label === ctx.country && "selected"}>${v.label}</option>`)}
    </select>
`)

// building a native HTMLElement object
const $country = selectCountry(ctx)

$country.addEventListener("change", () => (ctx.country = $country.value))

// mounting a native HTMLElement component via replaceChildren()
document.querySelector<HTMLElement>("#country-outer").replaceChildren($country)
```

Both `ELE` and `HTML` tags also accept native DOM nodes such as `HTMLElement` and `DocumentFragment`.

```typescript
// language=HTML
const formView = (ctx: Context): DocumentFragment => (HTML`
    <tr>
        <th>Name</th>
        <td id="name-outer">${inputName(ctx)}</td>
    </tr>
    <tr>
        <th>Country</th>
        <td id="country-outer">${$select}</td>
    </tr>
`)

const $form = formView(ctx)

const $name = $form.querySelector<HTMLInputElement>(`input[name="name"]`)
$name.addEventListener("change", () => (ctx.name = $name.value))

const $country = $form.querySelector<HTMLSelectElement>(`select[name="country"]`)
$country.addEventListener("change", () => (ctx.country = $country.value))

document.querySelector<HTMLElement>("#form-view").replaceChildren($form)
```

## TAGS

See [html-ele.d.ts](https://github.com/kawanet/html-ele/blob/main/types/html-ele.d.ts) for detail.

- `ELE` tag returns an [HTMLElement](https://developer.mozilla.org/docs/Web/API/HTMLElement) object
- `HTML` tag returns a [DocumentFragment](https://developer.mozilla.org/docs/Web/API/DocumentFragment) object
- `EN` tag returns an Enveloped Node — an `ENode` object as shown below

```typescript
interface ENode {
    outerHTML: string;
}
```

Use `ele("tagName")` method to create custom tags that return specific `HTMLElement` types:

```typescript
const DIV = ele("div")
const div = DIV`<div>${v}</div>` // => HTMLDivElement

const INPUT = ele("input")
const input = INPUT`<input type="text" name="email" value="${v}" />` // => HTMLInputElement

const SELECT = ele("select")
const select = SELECT`<select>${v}</select>` // => HTMLSelectElement
```

## TEMPLATING

Template variables:

```js
const render = (ctx) => EN`<p>Hello, ${ctx.name}!</p>`

render({name: "Ken"}); // => '<p>Hello, Ken!</p>'
```

HTML special characters are escaped by default for safety:

```js
const render = (ctx) => EN`<p>${ctx.html}</p>`

render({html: 'first line<br>second line'}); // => '<p>first line＆lt;br＆gt;second line</p>'
```

Conditional section for a plain string:

```js
const render = (ctx) => EN`<div class="${(ctx.value >= 10) && 'is-many'}">${ctx.value}</div>`

render({value: 10}); // => '<div class="is-many">10</div>'
```

Conditional section with `EN` tag template literals for HTML elements:

```js
const render = (ctx) => EN`<div>${!ctx.hidden && EN`<img src="${ctx.src}">`}</div>`

render({src: "image.png", hidden: false}); // => '<div><img src="image.png"></div>'
```

Loop sections with nested `EN` tag template literals:

```js
// language=HTML
const render = (ctx) => (ELE`
    <table>
        ${ctx.rows.map(row => EN`
            <tr class="${row.className}">
                ${row.cols.map(col => EN`
                    <td class="${col.className}">${col.v}</td>
                `)}
            </tr>
        `)}
    </table>
`)
```

## VALUE CONVERSION

Template variables accept primitive values such as `string` and `number`.
At runtime, `null`, `undefined`, and `false` all render as an empty string.

The boolean `true` is intentionally rejected by the type system. This
matters when the left side of `&&` or `||` is a `boolean`:

- `${bool && value}` narrows to `false | value` and type-checks. `false`
  drops out at runtime, leaving just the value when the condition holds.
- `${bool || value}` widens to `boolean | value`. Because `true` is
  excluded from `EV`, this fails to compile.

(For non-boolean operands, both `&&` and `||` are fine as long as every
possible result is an allowed type — for example, `${str || "fallback"}`
works when `str` is `string | undefined`.)

Use the `&&` form when the goal is *conditional inclusion*. To display a
value that depends on a boolean, map it to a string explicitly:

```js
// DON'T
const render = (ctx) => EN`<span>${ctx.bool}</span>`
render({bool: false}); // => '<span></span>' (`false` is rendered as an empty string)

// DO
const render = (ctx) => EN`<span>${ctx.bool ? "YES" : "NO"}</span>`
render({bool: true}); // => '<span>YES</span>'
render({bool: false}); // => '<span>NO</span>'
```

```js
// DON'T (`bool || ...` widens to include `true`, rejected by the type checker)
const render = (ctx) => EN`<span>${ctx.bool || "it is falsy"}</span>`
render({bool: false}); // => '<span>it is falsy</span>'

// DO
const render = (ctx) => EN`<span>${!ctx.bool && "it is falsy"}</span>`
const render = (ctx) => EN`<span>${ctx.bool ? "" : "it is falsy"}</span>`
render({bool: true}); // => '<span></span>'
render({bool: false}); // => '<span>it is falsy</span>'
```

## LINKS

- https://www.npmjs.com/package/html-ele
- https://github.com/kawanet/html-ele
- https://github.com/kawanet/telesy - ele's `EN` tag was forked from telesy's `$$$` tag
