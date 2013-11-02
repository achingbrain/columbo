var ResourceDiscoverer = require("../lib/ResourceDiscoverer");

module.exports["ResourceDiscoverer"] = {
	"Should discover resources": function( test ) {
		var resourceDiscoverer = new ResourceDiscoverer({
			resourceDirectory: "./test/resources-discover"
		});
		var resources = resourceDiscoverer.discover();

		// should have two resources - /foo and /bar
		test.equal(2, resources.length);

		test.ok(resources[0].name, "Bar");
		test.ok(resources[1].name, "Foo");
		test.ok(resources[1].subResources[0].name, "Baz");
		test.ok(resources[1].subResources[0].fullName, "FooBaz");

		test.done();
	}
};
