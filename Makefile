all:
#	node index.js
	zip -r -q check-earthquake.zip index.js node_modules
	aws lambda update-function-code --function-name "earthquake-AoG-test" --zip-file fileb://check-earthquake.zip

module-install:
	mkdir node_modules
	npm install actions-on-google
#	npm install aws-sdk
