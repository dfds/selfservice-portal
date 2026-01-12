## Run Playwright tests
.PHONY: test
test:
	npm test
.PHONY: default
default: help

.PHONY: format
format: ## Runs prettier
	@npx prettier . --write

.PHONY: stylecheck
stylecheck: ## checks formatting and linting
	@npx prettier . --check
	@npx eslint src/ --no-fix --max-warnings 0

.PHONY: help
help: ## Shows this list
	@grep -F -h "##" $(MAKEFILE_LIST) | sed -e 's/\(\:.*\#\#\)/\:\ /' | grep -F -v grep -F | sed -e 's/\\$$//' | sed -e 's/##//'
