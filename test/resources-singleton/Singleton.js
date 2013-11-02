var LOG = require("winston");

Singleton = function() {

};

Singleton.prototype.retrieveOne = function(request) {
	request.reply([]);
};

module.exports = Singleton;