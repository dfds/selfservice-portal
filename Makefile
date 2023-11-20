APP_IMAGE_NAME=selfservice-portal
BUILD_NUMBER=n/a
OUTPUT_DIR=$(subst " ",\ ,${PWD})/.output
OUTPUT_DIR_APP=${OUTPUT_DIR}/app
OUTPUT_DIR_MANIFESTS=${OUTPUT_DIR}/manifests
MIN_NODE_VERSION = 16.0.0

.PHONY: default
default: help

.PHONY: init
init: clean restore build ## Remove all generated files, install and update, and build

.PHONY: clean
clean: ## Remove all generated files
	@rm -Rf "$(OUTPUT_DIR)"
	@mkdir "$(OUTPUT_DIR)"
	@mkdir "$(OUTPUT_DIR_APP)"
	@mkdir "$(OUTPUT_DIR_MANIFESTS)"

.PHONY: restore
restore: ## Install and update npm dependencies
	@cd src && npm install

.PHONY: check-node-version
check-node-version: ## Verify node version dependencies
	@if [ "$(shell node -v | cut -c2-)" \< "$(MIN_NODE_VERSION)" ]; then \
		echo "Error: Node.js version must be >= $(MIN_NODE_VERSION)"; \
		exit 1; \
	fi

.PHONY: build
build: check-node-version ## Build and copy build artifacts over
	@cd src && REACT_APP_DATE_OF_RELEASE="$(shell date -u +"%Y-%m-%d %H:%M") UTC" npm run build
	@cp -r ./src/build/* "$(OUTPUT_DIR_APP)"

.PHONY: container
container: ## Build docker image
	@docker build -t $(APP_IMAGE_NAME) .

.PHONY: manifests
manifests: ## Copy manifests over and update build number
	@cp -r ./k8s/. "$(OUTPUT_DIR_MANIFESTS)"
	@find "$(OUTPUT_DIR_MANIFESTS)" -type f -name '*.yml' | xargs sed -i 's:{{BUILD_NUMBER}}:${BUILD_NUMBER}:g'

.PHONY: ci
ci: clean restore build container manifests ## Build from scratch

.PHONY: deliver
deliver: ci ## Build from scratch and push containers
	@sh ./tools/push-container.sh "${APP_IMAGE_NAME}" "${BUILD_NUMBER}"

.PHONY: dev
dev: ## Run the portal locally, listening for updates
	@cd src && npm run start

.PHONY: runcontainer
runcontainer: clean build container ## Run the portal in a container
	@docker run -it --rm -p 8080:80 selfservice-portal

.PHONY: setup-pre-commit-hook
setup-pre-commit-hook:
	@sh ./setup-pre-commit-hook.sh

.PHONY: pre-commit-hook
pre-commit-hook:
	@sh ./.git/hooks/pre-commit

.PHONY: format
format: ## Runs prettier
	@npx prettier . --write

.PHONY: stylecheck
stylecheck: ## checks formatting and linting
	@npx prettier src/ --check
	@npx eslint src/src/ --no-fix --max-warnings 0

.PHONY: help
help: ## Shows this list
	@grep -F -h "##" $(MAKEFILE_LIST) | sed -e 's/\(\:.*\#\#\)/\:\ /' | grep -F -v grep -F | sed -e 's/\\$$//' | sed -e 's/##//'
