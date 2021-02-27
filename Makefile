SensorEndpoint = SensorEndpoint/bundle.js
WebAppServer = WebApp/bundle.js
# clasp complains if you have files named bundle.js AND bundle.html
WebAppClient = WebApp/client_bundle.html

serverSrcDir = lib/server
clientSrcDir = lib/client

all: $(SensorEndpoint) $(WebAppServer) $(WebAppClient)

$(SensorEndpoint) $(WebAppServer): $(wildcard $(serverSrcDir)/*.js)
	cat $(serverSrcDir)/*.js | tee $(SensorEndpoint) >$(WebAppServer)

$(WebAppClient): $(wildcard $(clientSrcDir)/*) \
								$(wildcard $(clientSrcDir)/js/*) \
								$(wildcard $(clientSrcDir)/css/*)
	inline --entry $(clientSrcDir)/index.html \
	  --output $(WebAppClient) --javascript $(clientSrcDir)/js --css $(clientSrcDir)/css

push: $(wildcard SensorEndpoint/*) $(wildcard WebApp/*)
	cd SensorEndpoint; clasp push
	cd WebApp; clasp push
	touch push
