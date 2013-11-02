var ResourceProcessor = require("../lib/ResourceProcessor"),
	METHODS = require("../lib/METHODS"),
	Bar = require("./resources-process/Bar"),
	Foo = require("./resources-process/Foo"),
	FooBaz = require("./resources-process/FooBaz");

module.exports["ResourceProcessor"] = {
	"Should process resources": function( test ) {
		var resourceDefinitions = [{
			fullName: "Bar",
			name: "Bar",
			file: "Bar.js",
			resource: new Bar(),
			subResources: [],
			singleton: true,
			parent: null
		}, {
			fullName: "Foo",
			name: "Foo",
			file: "Foo.js",
			resource: new Foo(),
			subResources: [{
				fullName: "FooBaz",
				name: "Baz",
				file: "FooBaz.js",
				resource: new FooBaz(),
				subResources: [],
				singleton: false,
				parent: null
			}],
			singleton: false,
			parent: null
		}];

		// circular dependency, omnomnom
		resourceDefinitions[1].subResources[0].parent = resourceDefinitions[1];

		var resourceProcessor = new ResourceProcessor();
		var resources = resourceProcessor.process(resourceDefinitions);

		// should have three resources - /bar, /foo/{fooId} and /foo/{fooId}/baz and OPTIONS for them
		test.equal(6, resources.length);

		test.ok(resources[0].path, "/bar");
		test.ok(resources[0].method, METHODS.GET);
		test.ok(resources[1].path, "/bar");
		test.ok(resources[1].method, METHODS.OPTIONS);
		test.ok(resources[2].path, "/foos/{fooId}");
		test.ok(resources[2].method, METHODS.GET);
		test.ok(resources[3].path, "/foos/{fooId}");
		test.ok(resources[3].method, METHODS.OPTIONS);

		test.done();
	}
};
