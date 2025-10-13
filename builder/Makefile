SRC := $(wildcard ../src/*.ts ../types/*.ts)

PKG_DST := ../dist/package.json
MJS_DST := ../dist/html-ele.mjs
CJS_DST := ../dist/html-ele.cjs
MINJS_DST := ../dist/html-ele.min.js
TEST_DST := ../build/test.browser.js
CHAI_DST := ../build/chai.browser.js

MJS_CONFIG := ./rollup-mjs.config.ts
CJS_CONFIG := ./rollup-cjs.config.ts
MINJS_CONFIG := ./rollup-minjs.config.ts
TEST_CONFIG := ./rollup-test.config.ts

ALL := $(MJS_DST) $(CJS_DST) $(MINJS_DST) $(PKG_DST) $(TEST_DST) $(CHAI_DST)

####

all: $(ALL)

$(PKG_DST):
	@mkdir -p $(dir $@)
	echo '{"type":"commonjs"}' > $@
	@ls -l $@
	@echo ""

$(MJS_DST): $(MJS_CONFIG) $(SRC)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@ls -l $@
	[ "$$(wc -c < $@)" -lt 10000 ]
	@echo ""

$(CJS_DST): $(CJS_CONFIG) $(SRC)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@ls -l $@
	[ "$$(wc -c < $@)" -lt 10000 ]
	@echo ""

$(MINJS_DST): $(MINJS_CONFIG) $(SRC) $(PKG_DST)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@ls -l $@
	[ "$$(wc -c < $@)" -lt 10000 ]
	@echo ""

$(TEST_DST): $(TEST_CONFIG) $(SRC) $(PKG_DST)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@ls -l $@
	[ "$$(wc -c < $@)" -lt 100000 ]
	@echo ""

$(CHAI_DST): ../node_modules/chai/register-assert.js ../node_modules/chai/index.js
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup --input $< --format iife --file $@
	@ls -l $@
	[ "$$(wc -c < $@)" -lt 200000 ]
	@echo ""

test: all
	 node -e 'Promise.resolve().then(()=>import("$(MJS_DST)")).then(ele => ele.EN`<div/>`.outerHTML === `<div/>`).then(v => process.exit(+!v))'
	 node -e 'Promise.resolve().then(()=>require("$(CJS_DST)")).then(ele => ele.EN`<div/>`.outerHTML === `<div/>`).then(v => process.exit(+!v))'
	 node -e 'Promise.resolve().then(()=>require("$(MINJS_DST)")).then(ele => ele.EN`<div/>`.outerHTML === `<div/>`).then(v => process.exit(+!v))'
	../node_modules/.bin/tsc --noEmit
	node --test ../test/*.test.ts

####

clean:
	/bin/rm -fr $(ALL)

.PHONY: all clean test
