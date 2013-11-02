var PathUtils = require("../lib/PathUtils");

module.exports["PathUtils"] = {
	"Should find path name": function( test ) {
		test.deepEqual(PathUtils.findPathComponents("Foo.js"), ["foo"]);
		test.deepEqual(PathUtils.findPathComponents("FooBar.js"), ["foo", "bar"]);
		test.deepEqual(PathUtils.findPathComponents("FooBarBaz.js"), ["foo", "bar", "baz"]);

		test.done();
	},

	"Should handle leading slash": function( test ) {
		test.deepEqual(PathUtils.findPathComponents("/Foo.js"), ["foo"]);

		test.done();
	}
};
