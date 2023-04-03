APP_IMAGE_NAME=selfservice-portal
BUILD_NUMBER=n/a
OUTPUT_DIR=$(subst " ",\ ,${PWD})/.output
OUTPUT_DIR_APP=${OUTPUT_DIR}/app
OUTPUT_DIR_MANIFESTS=${OUTPUT_DIR}/manifests
MIN_NODE_VERSION = 16.0.0


init: clean restore build

clean:
	@rm -Rf "$(OUTPUT_DIR)"
	@mkdir "$(OUTPUT_DIR)"
	@mkdir "$(OUTPUT_DIR_APP)"
	@mkdir "$(OUTPUT_DIR_MANIFESTS)"

restore:
	@cd src && npm install

.PHONY: check-node-version
check-node-version:
	@if [ "$(shell node -v | cut -c2-)" \< "$(MIN_NODE_VERSION)" ]; then \
		echo "Error: Node.js version must be >= $(MIN_NODE_VERSION)"; \
		exit 1; \
	fi


build: TIME=$(shell date -u +"%Y-%m-%d %H:%M")
build: check-node-version
	@cd src && REACT_APP_DATE_OF_RELEASE="$(TIME) UTC" npm run build
	@cp -r ./src/build/* "$(OUTPUT_DIR_APP)"


container:
	@docker build -t $(APP_IMAGE_NAME) .

manifests:
	@cp -r ./k8s/. "$(OUTPUT_DIR_MANIFESTS)"
	@find "$(OUTPUT_DIR_MANIFESTS)" -type f -name '*.yml' | xargs sed -i 's:{{BUILD_NUMBER}}:${BUILD_NUMBER}:g'

deliver:
	@sh ./tools/push-container.sh "${APP_IMAGE_NAME}" "${BUILD_NUMBER}"

ci: clean restore build container manifests
cd: ci deliver

dev:
	@cd src && npm run start

run:
	@cd src && npm run start

runcontainer:
	@docker run -it --rm -p 8080:80 selfservice-portal

reruncontainer: clean build container runcontainer