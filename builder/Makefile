# Force bash so `set -o pipefail` works in the smoke-minjs recipe below.
SHELL := bash
.SHELLFLAGS := -eo pipefail -c

SRC := $(wildcard ../src/*.ts ../types/*.ts)
BUILDER_SRC := $(wildcard ./*.ts)

PKG_DST := ../dist/package.json
MJS_DST := ../dist/html-ele.mjs
CJS_DST := ../dist/html-ele.cjs
MINJS_DST := ../dist/html-ele.min.js
TEST_DST := ../build/test.browser.js
SHIM_DST := ../build/test-shim.browser.js

MJS_CONFIG := ./rollup-mjs.config.ts
CJS_CONFIG := ./rollup-cjs.config.ts
MINJS_CONFIG := ./rollup-minjs.config.ts
TEST_CONFIG := ./rollup-test.config.ts
SHIM_CONFIG := ./rollup-shim.config.ts
SHIM_SRC := ./test-shim.ts

# Documented runtime named exports that must be verified in every bundle.
NAMED_EXPORTS := ele ELE HTML EN

ALL := $(MJS_DST) $(CJS_DST) $(MINJS_DST) $(PKG_DST) $(TEST_DST) $(SHIM_DST)

####

all: $(ALL)

$(PKG_DST):
	@mkdir -p $(dir $@)
	echo '{"type":"commonjs"}' > $@
	@ls -l $@
	@echo ""

$(MJS_DST): $(MJS_CONFIG) $(SRC) $(BUILDER_SRC)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@ls -l $@
	[ "$$(wc -c < $@)" -lt 10000 ]
	@echo ""

$(CJS_DST): $(CJS_CONFIG) $(SRC) $(BUILDER_SRC)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@ls -l $@
	[ "$$(wc -c < $@)" -lt 10000 ]
	@echo ""

$(MINJS_DST): $(MINJS_CONFIG) $(SRC) $(BUILDER_SRC) $(PKG_DST)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@ls -l $@
	[ "$$(wc -c < $@)" -lt 10000 ]
	@echo ""

$(TEST_DST): $(TEST_CONFIG) $(SRC) $(BUILDER_SRC) $(PKG_DST)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@ls -l $@
	[ "$$(wc -c < $@)" -lt 100000 ]
	@echo ""

# Browser-side shim providing globalThis.describe / it / assert (the
# four-symbol subset that the tests actually use). See test-shim.ts
# for the rationale; together with the globals mapping in
# rollup-test.config.ts this lets the same node:test sources run in
# the browser without mocha or chai.
$(SHIM_DST): $(SHIM_CONFIG) $(SHIM_SRC) $(BUILDER_SRC)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@ls -l $@
	[ "$$(wc -c < $@)" -lt 5000 ]
	@echo ""

####

# Verify the bundles by importing/requiring the package itself.
# This ensures the public entrypoints (exports/main) are correctly configured.
# Note: process.argv.slice(1) is used because `node -e 'code' arg1 arg2`
# results in process.argv = ['node', 'arg1', 'arg2'].
smoke: smoke-mjs smoke-cjs smoke-minjs

# MJS smoke test via public entrypoint.
smoke-mjs: $(MJS_DST)
	cd .. && node --input-type=module -e 'const m = await import("html-ele"); for (const k of process.argv.slice(1)) { if (typeof m[k] !== "function") { console.error("missing MJS export:", k); process.exit(1); } console.log("MJS export OK:", k); }' $(NAMED_EXPORTS)

# CJS smoke test via public entrypoint.
smoke-cjs: $(CJS_DST)
	cd .. && node --input-type=commonjs -e 'const m = require("html-ele"); for (const k of process.argv.slice(1)) { if (typeof m[k] !== "function") { console.error("missing CJS export:", k); process.exit(1); } console.log("CJS export OK:", k); }' $(NAMED_EXPORTS)

# Minified browser bundle smoke covers two consumer paths:
#
# (1) Browser shape: pipe the IIFE bundle plus a verification tail into
#     `node -`. The IIFE assigns `var ele = {ele, ELE, HTML, EN}` (a
#     namespace global, since rollup emits named exports under
#     output.name = "ele"), so each documented export is reached as
#     `ele[k]`. argv layout is [node, '-', name1, name2, ...] when
#     stdin is the script, hence slice(2) (asymmetric with smoke-mjs /
#     smoke-cjs which use slice(1)).
#
# (2) CJS shape: require() the same .min.js file. The bundle carries
#     `outro: "if (typeof module !== 'undefined') { module.exports = exports }"`
#     so it doubles as a CJS module (browserify-style consumers).
#     Verifies the dist/package.json `{"type":"commonjs"}` override
#     also takes effect (Node would otherwise treat .js under a
#     `type: module` parent as ESM and fail).
smoke-minjs: $(MINJS_DST) $(PKG_DST)
	(cat $< && echo '; for (const k of process.argv.slice(2)) { if (typeof ele[k] !== "function") { console.error("missing browser export:", k); process.exit(1); } console.log("browser export OK:", k); }') | node - $(NAMED_EXPORTS)
	cd .. && node --input-type=commonjs -e 'const m = require("./dist/html-ele.min.js"); for (const k of process.argv.slice(1)) { if (typeof m[k] !== "function") { console.error("missing minjs CJS export:", k); process.exit(1); } console.log("minjs CJS export OK:", k); }' $(NAMED_EXPORTS)

####

test: all smoke
	../node_modules/.bin/tsc --noEmit
	node --test ../test/*.test.ts

####

clean:
	/bin/rm -fr $(ALL)

.PHONY: all clean test smoke smoke-mjs smoke-cjs smoke-minjs
