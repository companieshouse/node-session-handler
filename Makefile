.PHONY: package-install
package-install:
	npm install

.PHONY: lint
lint:
	npm run lint

.PHONY: build
build:	package-install lint
	npm run build

.PHONY: test-unit
test-unit:
	npm run test
