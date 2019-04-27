MODULE=check-earthquake
FUNCTION_NAME=earthquake
#FUNCTION_NAME=earthquake-AoG-test
all:
	node index.js
	zip -r -q ${MODULE} index.js  node_modules
	aws lambda update-function-code --function-name "${FUNCTION_NAME}" --zip-file fileb://${MODULE}.zip

module-install:
	mkdir node_modules
	npm install actions-on-google
#	npm install aws-sdk
