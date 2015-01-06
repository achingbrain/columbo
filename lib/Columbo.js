var defaults = require('defaults'),
  ResourceDiscoverer = require('./ResourceDiscoverer'),
  ResourceProcessor = require('./ResourceProcessor'),
  EventEmitter = require('events').EventEmitter,
  util = require('util'),
  async = require('async')

var Columbo = function(options) {
  EventEmitter.call(this)

  this._options = defaults(options, {
    /**
     * The path to the resources directory
     */
    resourceDirectory: './resources',

    /**
     * `resource` will be whatever is returned from `require` and `name` is the camelised name of the file
     */
    resourceCreator: function(resource, name, callback) {
      callback(undefined, new resource())
    },

    /**
     * In order to support :id or {id} form url arguments, pass a function here
     * that will return arguments in the format you desire.
     */
    idFormatter: function(id) {
      return '{' + id + '}'
    },

    /**
     * The first argument will be an array of strings corresponding to HTTP verbs, subsequent arguments
     * are supplied by your web framework of choice.
     */
    optionsSender: function(opts, request) {
      request.reply(opts)
    },

    /**
     * This will be called for every resource found - if you need to edit the resource definition, do
     * it here then pass it to the callback
     */
    preProcessor: function(resource, callback) {
      callback(undefined, resource)
    },

    /**
     * A logging object to use
     */
    logger: {
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: function() {}
    }
  })
}
util.inherits(Columbo, EventEmitter)

Columbo.prototype.discover = function(callback) {
  var discoverer = new ResourceDiscoverer({
    resourceDirectory: this._options.resourceDirectory,
    resourceCreator: this._options.resourceCreator,
    logger: this._options.logger
  })
  var processor = new ResourceProcessor({
    idFormatter: this._options.idFormatter,
    optionsSender: this._options.optionsSender,
    preProcessor: this._options.preProcessor,
    logger: this._options.logger
  })

  discoverer.on('error', this.emit.bind(this, 'error'))
  processor.on('error', this.emit.bind(this, 'error'))

  async.waterfall([
    discoverer.discover.bind(discoverer),
    processor.process.bind(processor),
  ], function(error, resources) {
    callback(error, resources)
  })
}

module.exports = Columbo
