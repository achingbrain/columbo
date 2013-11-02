var LOG = require("winston"),
	fs = require("fs"),
	path = require("path"),
	_s = require("underscore.string"),
	METHODS = require("./METHODS.js"),
	defaults = require("defaults"),
	StringUtils = require("./StringUtils"),
	PathUtils = require("./PathUtils");

var ResourceDiscoverer = function(options) {
	this._options = defaults(options, {
		/**
		 * The path to the resources directory
		 */
		resourceDirectory: "./resources",

		/**
		 * `resource` will be whatever is returned from `require` and `name` is the camelised name of the file
		 */
		resourceCreator: function(resource, name) {
			return new resource()
		}
	});
};

ResourceDiscoverer.prototype.discover = function() {
	var resources = [];
	var files = fs.readdirSync(this._options.resourceDirectory);

	if(!files) {
		throw "Could not read directory " + directory;
	}

	files.forEach(function(file) {
		var resourceFile = this._options.resourceDirectory + "/" + file;

		// only interested in javascript files
		if(!this._isJavaScriptFile(resourceFile)) {
			return;
		}

		LOG.debug("Columbo", "Loading", resourceFile, "as a resource");

		// load resource
		var resource = require(path.resolve(resourceFile));

		// not a constructor so ignore it
		if(typeof resource !== "function") {
			return;
		}

		LOG.debug("Columbo", "Loaded");

		var instance = this._options.resourceCreator(resource, file.substring(0, 1).toLowerCase() + file.substring(1, file.length - 3));

		// make sure we're not a singleton and a not-pluralton
		if(instance["retrieveOne"] && (instance["retrieveAll"] || instance["retrieve"])) {
			throw new Error("A singleton resource should only implement retrieveOne - not retrieveAll and/or retrieve");
		}

		var name = file.substr(0, file.length - 3);
		var nameSplit = StringUtils.splitByCapitals(name);

		this._placeInHierarchy({
			fullName: file.substr(0, file.length - 3),
			name: nameSplit[nameSplit.length - 1],
			file: resourceFile.replace(this._options.resourceDirectory + "/", ""),
			resource: instance,
			subResources: [],
			singleton: instance["retrieveOne"] ? true : false
		}, resources);
	}.bind(this));

	return resources;
}

ResourceDiscoverer.prototype._isJavaScriptFile = function(resourceFile) {
	var fileStats = fs.statSync(resourceFile);

	return fileStats.isFile() && _s.endsWith(resourceFile, ".js");
}

ResourceDiscoverer.prototype._placeInHierarchy = function(resourceDefinition, resources, parentResource) {
	for(var i = 0; i < resources.length; i++) {
		if(_s.startsWith(resourceDefinition.fullName, resources[i].fullName)) {
			this._placeInHierarchy(resourceDefinition, resources[i].subResources, resources[i]);

			return;
		}
	}

	resourceDefinition.parent = parentResource;

	resources.push(resourceDefinition);
}

module.exports = ResourceDiscoverer;