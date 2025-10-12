# ε𝑳ε - HTMLElement from type-safe template literals

[![Node.js CI](https://github.com/kawanet/html-ele/workflows/Node.js%20CI/badge.svg?branch=main)](https://github.com/kawanet/html-ele/actions/)
[![npm version](https://img.shields.io/npm/v/html-ele)](https://www.npmjs.com/package/html-ele)
[![gzip size](https://img.badgesize.io/https://unpkg.com/html-ele/dist/html-ele.min.js?compression=gzip)](https://unpkg.com/html-ele/dist/html-ele.min.js)

## SYNOPSIS

```typescript
import {ELE, EN, HTML, type ENode} from "html-ele"

interface Context {
    name: string;
    options: Option[];
}

interface Option {
    value: string;
    selected: string;
    label: string;
}

// language=HTML
const toElement = (ctx: Context): HTMLElement => ELE`
    <select name="${ctx.name}">
        ${ctx.options.map(v => EN`<option value="${v.value}" ${v.selected}>${v.label}</option>`)}
    </select>
`;

document.querySelector<HTMLElement>("#here").replaceChildren(toElement(context));

// language=HTML
const toFragment = (ctx: Context): DocumentFragment => HTML`
    <select name="${ctx.name}">
        ${ctx.options.map(v => EN`<option value="${v.value}" ${v.selected}>${v.label}</option>`)}
    </select>
`;

document.querySelector<HTMLElement>("#there").replaceChildren(toFragment(context));

// language=HTML
const toENode = (ctx: Context): ENode => EN`
    <select name="${ctx.name}">
        ${ctx.options.map(v => EN`<option value="${v.value}" ${v.selected}>${v.label}</option>`)}
    </select>
`;

document.querySelector<HTMLElement>("#another").innerHTML = toENode(context);
```

## Template literal tags

- Template literal with `ELE` tag returns an [HTMLElement](https://developer.mozilla.org/docs/Web/API/HTMLElement) object
- Template literal with `HTML` tag returns a [DocumentFragment](https://developer.mozilla.org/docs/Web/API/DocumentFragment) object
- Template literal with `EN` tag returns an `ENode`, ele's Enveloped-Node, object as below

```typescript
interface ENode {
    outerHTML: string;
}
```

## USAGE

See [html-ele.d.ts](https://github.com/kawanet/html-ele/blob/main/types/html-ele.d.ts) for detail.

Template variables:

```js
const render = (ctx) => EN`<p>Hello, ${ctx.name}!</p>`;

render({name: "Ken"}); // => '<p>Hello, Ken!</p>'
```

HTML special characters escaped per default for safe:

```js
const render = (ctx) => EN`<p>${ctx.html}</p>`;

render({html: 'first line<br>second line'}); // => '<p>first line＆lt;br＆gt;second line</p>'
```

HTML special characters unescaped with `EN` filter function like `dangerouslySetInnerHTML` does:

```js
const render = (ctx) => EN`<p>${EN(ctx.html)}</p>`;

render({html: 'first line<br>second line'}) // => '<p>first line<br>second line</p>'
```

Conditional section for plain string:

```js
const render = (ctx) => EN`<div class="${(ctx.value >= 10) && 'is-many'}">${ctx.value}</div>`;

render({value: 10}); // => '<div class="is-many">10</div>'
```

Conditional section with `EN` tag template literals for HTML elements:

```js
const render = (ctx) => EN`<div>${!ctx.hidden && EN`<img src="${ctx.src}">`}</div>`;

render({src: "image.png", hidden: false}); // => '<div><img src="image.png"></div>'
```

Loop sections with nested `EN` tag template literals:

```js
// language=HTML
const render = (ctx) => ELE`
    <table>
        ${ctx.rows.map(row => EN`
            <tr class="${row.className}">
                ${row.cols.map(col => EN`
                    <td class="${col.className}">${col.v}</td>
                `)}
            </tr>
        `)}
    </table>
`;
```

## EMPTY VALUES

html-ele accepts `string`, `number` values and `ENode`s within the template literals.
It outputs empty string `""` when one of `null`, `undefined` or `false` value is given.
Note that it doesn't accept the primitive `true` value, on the other hand.
Specify strings to output explicitly, instead.

```js
// DON'T
const render = (ctx) => EN`<span>${ctx.bool}</span>`;
render({bool: false}); // => '<span></span>' (the false value cause an empty string)

// DO
const render = (ctx) => EN`<span>${ctx.bool ? "YES" : "NO"}</span>`;
render({bool: true}); // => '<span>YES</span>'
render({bool: false}); // => '<span>NO</span>'
```

```js
// DON'T
const render = (ctx) => EN`<span>${ctx.bool || "it is falsy"}</span>`;
render({bool: false}); // => '<span>it is falsy</span>'

// DO
const render = (ctx) => EN`<span>${!ctx.bool && "it is falsy"}</span>`;
const render = (ctx) => EN`<span>${ctx.bool ? "" : "it is falsy"}</span>`;
render({bool: true}); // => '<span></span>'
render({bool: false}); // => '<span>it is falsy</span>'
```

## LINKS

- https://github.com/kawanet/telesy
- https://github.com/kawanet/html-ele
- https://www.npmjs.com/package/html-ele
