var path = require('path'),
  METHODS = require('./METHODS.js'),
  defaults = require('defaults'),
  StringUtils = require('./StringUtils'),
  async = require('async'),
  EventEmitter = require('events').EventEmitter,
  util = require('util')

var methodNameMatcher = /^(create|retrieve|remove|update|patch)/

var namesToMethods = {
  'create': METHODS.POST,
  'retrieve': METHODS.GET,
  'remove': METHODS.DELETE,
  'update': METHODS.PUT,
  'patch': METHODS.PATCH
}

var ResourceProcessor = function(options) {
  EventEmitter.call(this)

  this._options = defaults(options, {
    /**
     * In order to support :id or {id} form url arguments, pass a function here
     * that will return arguments in the format you desire.
     * @param id
     * @returns {string}
     */
    idFormatter: function(id) {
      return '{' + id + '}'
    },

    optionsSender: function(opts, request) {
      request.reply(opts)
    },

    preProcessor: function(resource, callback) {
      callback(undefined, resource)
    }
  })

  this._logger = this._options.logger || {
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: function() {}
  }
}
util.inherits(ResourceProcessor, EventEmitter)

ResourceProcessor.prototype.process = function(resourceDefinitions, callback) {
  var output = []

  resourceDefinitions.forEach(function(resourceDefinition) {
    this._process(resourceDefinition, output)
  }.bind(this))

  var tasks = output.map(function(resource) {
    return this._options.preProcessor.bind(null, resource)
  }.bind(this))

  async.parallel(tasks, callback)
}

ResourceProcessor.prototype._process = function(resourceDefinition, output) {
  var pathComponent = resourceDefinition.name.substr(0, 1).toLowerCase() + resourceDefinition.name.substr(1)

  if(!resourceDefinition.singleton) {
    pathComponent = StringUtils.pluralise(pathComponent)
  }

  path = '/' + pathComponent

  if(resourceDefinition.parentPath) {
    path = resourceDefinition.parentPath + path
  }

  // store which methods are available on which URLs
  var availableMethods = {}
  var individualUrl

  for(var key in resourceDefinition.resource) {
    var method

    try {
      method = resourceDefinition.resource[key]
    } catch(e) {
      continue
    }

    if(typeof method !== 'function') {
      continue
    }

    var matches = key.match(methodNameMatcher)

    if(!matches) {
      continue
    }

    var resourcePath

    // the path to listen on
    if(this._requiresId(key)) {
      resourcePath = path + '/' + this._options.idFormatter(StringUtils.singularise(pathComponent) + 'Id')
      individualUrl = resourcePath
    } else {
      resourcePath = path
    }

    if(resourceDefinition.singleton) {
      individualUrl = resourcePath
    }

    // what method to expect
    var httpMethod = namesToMethods[matches[0]]

    // make sure we record availability
    if(!availableMethods[resourcePath]) {
      availableMethods[resourcePath] = []
    }

    // store that this method is available on this path
    if(availableMethods[resourcePath].indexOf(httpMethod) == -1) {
      availableMethods[resourcePath].push(httpMethod)
    }

    // add resource to list
    output.push({
      method: httpMethod,
      path: resourcePath,
      handler: resourceDefinition.resource[key].bind(resourceDefinition.resource)
    })

    this._logger.info('Columbo', httpMethod, resourcePath)
  }

  for(var resourcePath in availableMethods) {
    this._logger.info('Columbo', METHODS.OPTIONS, resourcePath)

    output.push({
      method: METHODS.OPTIONS,
      path: resourcePath,
      handler: this._options.optionsSender.bind(this, availableMethods[resourcePath])
    })
  }

  if(resourceDefinition.subResources.length > 0) {
    resourceDefinition.subResources.forEach(function(subResourceDefinition) {
      subResourceDefinition.parentPath = individualUrl
      this._process(subResourceDefinition, output)
    }.bind(this))
  }

  return output
}

ResourceProcessor.prototype._requiresId = function(methodName) {
  return methodName == 'retrieve' || methodName == 'update' || methodName == 'remove' || methodName == 'patch'
}

module.exports = ResourceProcessor
