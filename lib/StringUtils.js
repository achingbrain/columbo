var _s = require("underscore.string");

var splitByCapitals = function(string) {
	var output = [];
	var currentString = "";

	// loop through the resource name
	for(var i = 0; i < string.length; i++) {
		if(i > 0 && string.charAt(i) === string.charAt(i).toUpperCase()) {
			if(currentString) {
				output.push(currentString);
			}

			currentString = string.charAt(i);
		} else {
			currentString += string.charAt(i);
		}
	}

	if(currentString) {
		output.push(currentString);
	}

	return output;
}

var singularise = function(string) {
	if(_s.endsWith(string, "ies")) {
		return string.substring(0, string.length - 3) + "y";
	}

	if(_s.endsWith(string, "ses")) {
		return string.substring(0, string.length - 2);
	}

	if(_s.endsWith(string, "s")) {
		return string.substring(0, string.length - 1);
	}

	return string;
}

var pluralise = function(string) {
	if(_s.endsWith(string, "es") || _s.endsWith(string, "ies")) {
		return string;
	}

	if(_s.endsWith(string, "s")) {
		return string + "es";
	}

	if(_s.endsWith(string, "y")) {
		return string.substring(0, string.length - 1) + "ies";
	}

	return string + "s";
}

module.exports = {
	splitByCapitals: splitByCapitals,
	singularise: singularise,
	pluralise: pluralise
};