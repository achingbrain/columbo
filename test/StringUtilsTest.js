var StringUtils = require("../lib/StringUtils");

module.exports["StringUtils"] = {
	"Should split by capitals": function( test ) {
		test.deepEqual(StringUtils.splitByCapitals("OneTwoThree"), ["One", "Two", "Three"]);

		test.done();
	},

	"Should singularise": function( test ) {
		test.equal(StringUtils.singularise("foos"), "foo");
		test.equal(StringUtils.singularise("libraries"), "library");
		test.equal(StringUtils.singularise("glasses"), "glass");

		test.done();
	},

	"Should pluralise": function( test ) {
		test.equal(StringUtils.pluralise("library"), "libraries");
		test.equal(StringUtils.pluralise("foo"), "foos");
		test.equal(StringUtils.pluralise("glass"), "glasses");

		test.done();
	}
};
