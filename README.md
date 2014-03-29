# Columbo

>> RIMMER: You can scoff, Lister.  That's nothing new.  They laughed at Galileo.  They laughed at Edison.  They laughed at Columbo.  
>> LISTER: Who's Columbo?  
>> RIMMER: The man with the dirty mac who discovered America.  
>
> Red Dwarf [Season 1, Episode 4](http://www.ladyofthecake.com/rdscripts/season1/Waitingf.txt)

Discovers REST resources in js files named by convention.  Is it a good idea?  I don't know.  Either way, it makes setting up a REST interface pretty easy.

## Usage

### URLs

Put your resource classes in a folder (the default is name is `resources`).  Follow the convention:

```
Library.js
LibraryBook.js
```

or

```
LibraryResource.js
LibraryBookResource.js
```

This will generate resources for the following URLs:

```
/libraries
/libraries/{libraryId}/books
/libraries/{libraryId}/books/{bookId}
```

### Methods

HTTP Methods are determined by the methods exposed on your resource classes.  An OPTIONS resource is generated dynamically.

Your methods should accept whatever arguments your web framework requires.

```javascript
LibraryBook = function() {

};

LibraryBook.prototype.retrieve = function() {
	// generates GET with a URL parameter named 'id'
};

LibraryBook.prototype.retrieveAll = function() {
	// generates GET with no URL parameter
};

LibraryBook.prototype.retrieveOne = function() {
	// generates GET with no URL parameter (intended for singletons, do no use with retrieve and retrieveAll)
};

LibraryBook.prototype.create = function() {
	// generates POST
};

LibraryBook.prototype.update = function() {
	// generates PUT
};

LibraryBook.prototype.patch = function() {
	// generates PATCH
};

LibraryBook.prototype.remove = function() {
	// generates DELETE
};
```

### API

```javascript
var Columbo = require("columbo");

// all options are, well, optional
var columbo = new Columbo({
	// The path to the resources directory
	resourceDirectory: "./resources",

	// All files in `resourceDirectory` will be `require`d - pass a function here
	// to override how the resources are created.  `resource` will be whatever is
	// returned from `require` and `name` is the camelised name of the file
	resourceCreator: function(resource, name) {
		return new resource()
	},

	// In order to support :id or {id} form url arguments, pass a function here
	// that will return arguments in the format you desire.
	idFormatter: function(id) {
		return "{" + id + "}";
	},

	// Responder for OPTIONS requests - the first argument will be an array of
	// strings corresponding to HTTP verbs, subsequent arguments are supplied by
	// your web framework of choice.
	optionsSender: function(opts, request) {
		request.reply(opts);
	},

	// Optionally pass in a logger (e.g. Winston) - defaults to console.
	logger: {}
});

// Discover resources
var resources = columbo.discover();
```

Above `resources` will be an array:

```javascript
[
	{
		method: String,		// e.g. GET
		path: String,		// e.g. /foo
		handler: Function	// a bound function - the method on the resource class
	}, ...
]
```

You can then use it with [Hapi](http://spumko.github.io)

```javascript
var columbo = new Columbo();

var server = Hapi.createServer("0.0.0.0", 80);
server.addRoutes(columbo.discover());
server.start();
```

Or with [Express](http://expressjs.com):

```
var app = express();
...
var columbo = new Columbo({
	idFormatter: function(id) {
		return ":" + id;
	},
	optionsSender: function(options, request, response) {
		response.json(options);
	}
});
columbo.discover().forEach(function(resource) {
	app[resource.method.toLowerCase()](resource.path, resource.handler);
});
```

Etc, etc.

### Todo

 - Framework agnostic argument validation
 - OPTIONS is a little half baked
