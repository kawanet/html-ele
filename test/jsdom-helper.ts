import {after, before} from "node:test"

const documentNotExist = ("undefined" === typeof document)

before(async () => {
    if (documentNotExist) {
        const {JSDOM} = await import("jsdom")
        globalThis.document = new JSDOM().window.document
    }
})

after(() => {
    if (documentNotExist) {
        delete globalThis.document
    }
})
