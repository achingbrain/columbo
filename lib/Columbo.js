var defaults = require("defaults"),
	ResourceDiscoverer = require("./ResourceDiscoverer"),
	ResourceProcessor = require("./ResourceProcessor");

var Columbo = function(options) {
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
		},

		/**
		 * In order to support :id or {id} form url arguments, pass a function here
		 * that will return arguments in the format you desire.
		 * @param id
		 * @returns {string}
		 */
		idFormatter: function(id) {
			return "{" + id + "}";
		},

		optionsSender: function(opts, request) {
			request.reply(opts);
		}
	});
};

Columbo.prototype.discover = function() {
	var discoverer = new ResourceDiscoverer({
		resourceDirectory: this._options.resourceDirectory,
		resourceCreator: this._options.resourceCreator
	});
	var processor = new ResourceProcessor({
		idFormatter: this._options.idFormatter,
		optionsSender: this._options.optionsSender
	});

	return processor.process(discoverer.discover());
};

module.exports = Columbo;