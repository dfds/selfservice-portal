APP_IMAGE_NAME=selfservice-portal
BUILD_NUMBER=n/a
OUTPUT_DIR=${PWD}/.output
OUTPUT_DIR_APP=${OUTPUT_DIR}/app
OUTPUT_DIR_MANIFESTS=${OUTPUT_DIR}/manifests

init: restore build

clean:
	@rm -Rf $(OUTPUT_DIR)
	@mkdir $(OUTPUT_DIR)
	@mkdir $(OUTPUT_DIR_APP)
	@mkdir $(OUTPUT_DIR_MANIFESTS)

restore:
	@cd src && npm install

build:
	@cd src && npm run build
	@cp -r ./src/build/* $(OUTPUT_DIR_APP)


container:
	@docker build -t $(APP_IMAGE_NAME) .

manifests:
	@cp -r ./k8s/. $(OUTPUT_DIR_MANIFESTS)
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
