var StringUtils = require("./StringUtils"),
	_s = require("underscore.string");

var findPathComponents = function(fileName) {
	fileName = fileName.replace(".js", "");

	if(_s.startsWith(fileName, "/")) {
		fileName = fileName.substr(1);
	}

	var paths = StringUtils.splitByCapitals(fileName);
	paths = paths.map(function(string) {
		return string.toLowerCase();
	});

	return paths;
}

module.exports = {
	findPathComponents: findPathComponents
};