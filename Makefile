SRC = backbone.validator.js
MIN = backbone.validator.min.js

min: ${MIN}

${MIN}: ${SRC}
	uglifyjs ${SRC} > ${MIN}

clean:
	rm -f ${MIN}

.PHONY: clean
