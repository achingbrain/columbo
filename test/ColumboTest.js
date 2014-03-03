var Columbo = require("../lib/Columbo"),
	METHODS = require("../lib/METHODS");

var findResource = function(path, method, resources) {
	var output = null;

	resources.forEach(function(resource) {
		if(resource.path == path && resource.method == method) {
			output = resource;
		}
	});

	return output;
}

module.exports["Columbo"] = {
	"Should discover singleton": function( test ) {
		var columbo = new Columbo({
			resourceDirectory: "./test/resources-singleton"
		});
		var resources = columbo.discover();

		test.equal(4, resources.length);

		test.ok(findResource("/singleton", METHODS.GET, resources));
		test.ok(findResource("/singleton/subs/{subId}", METHODS.GET, resources));

		test.done();
	},

	"Should discover methods": function( test ) {
		var columbo = new Columbo({
			resourceDirectory: "./test/resources-methods"
		});
		var resources = columbo.discover();

		test.equal(8, resources.length);

		test.ok(findResource("/foos", METHODS.OPTIONS, resources));
		test.ok(findResource("/foos", METHODS.GET, resources));
		test.ok(findResource("/foos", METHODS.POST, resources));
		test.ok(findResource("/foos/{fooId}", METHODS.OPTIONS, resources));
		test.ok(findResource("/foos/{fooId}", METHODS.GET, resources));
		test.ok(findResource("/foos/{fooId}", METHODS.PUT, resources));
		test.ok(findResource("/foos/{fooId}", METHODS.PATCH, resources));
		test.ok(findResource("/foos/{fooId}", METHODS.DELETE, resources));

		test.done();
	},

	"Should override id generation": function( test ) {
		var columbo = new Columbo({
			resourceDirectory: "./test/resources-methods",
			idFormatter: function(id) {
				return ":" + id;
			}
		});
		var resources = columbo.discover();

		test.ok(findResource("/foos/:fooId", METHODS.GET, resources));

		test.done();
	},

	"Should support deep nesting": function( test ) {
		var columbo = new Columbo({
			resourceDirectory: "./test/resources-deeplynested"
		});
		var resources = columbo.discover();

		test.ok(findResource("/foos/{fooId}", METHODS.GET, resources));
		test.ok(findResource("/foos/{fooId}/bars/{barId}", METHODS.GET, resources));
		test.ok(findResource("/foos/{fooId}/bars/{barId}/bazs/{bazId}", METHODS.GET, resources));
		test.ok(findResource("/foos/{fooId}/bars/{barId}/bazs/{bazId}/quxs/{quxId}", METHODS.GET, resources));
		test.ok(findResource("/foos/{fooId}/bars/{barId}/bazs/{bazId}/quxs/{quxId}", METHODS.OPTIONS, resources));

		test.done();
	},

	"Should allow compound nouns": function( test ) {
		var columbo = new Columbo({
			resourceDirectory: "./test/resources-compoundnouns"
		});
		var resources = columbo.discover();

		test.ok(findResource("/foos/{fooId}", METHODS.GET, resources));
		test.ok(findResource("/foos/{fooId}/barBazs/{barBazId}", METHODS.GET, resources));
		test.ok(findResource("/foos/{fooId}/barBazs/{barBazId}/quxs/{quxId}", METHODS.GET, resources));

		test.done();
	},

	"Should remove 'Resource' from resource unless it's a ResourceResource": function( test ) {
		var columbo = new Columbo({
			resourceDirectory: "./test/resources-with-resource-in-name"
		});
		var resources = columbo.discover();

		test.ok(findResource("/bazs/{bazId}", METHODS.GET, resources));
		test.ok(findResource("/foos/{fooId}", METHODS.GET, resources));
		test.ok(findResource("/foos/{fooId}/bars/{barId}", METHODS.GET, resources));
		test.ok(findResource("/foos/{fooId}/bars/{barId}/bazs/{bazId}", METHODS.GET, resources));
		test.ok(findResource("/resources/{resourceId}", METHODS.GET, resources));

		test.done();
	}
};
