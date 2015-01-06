var fs = require('fs'),
  path = require('path'),
  _s = require('underscore.string'),
  defaults = require('defaults'),
  StringUtils = require('./StringUtils'),
  EventEmitter = require('events').EventEmitter,
  util = require('util'),
  async = require('async')

var ResourceDiscoverer = function(options) {
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
    }
  })

  this._logger = this._options.logger || {
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: function() {}
  }
}
util.inherits(ResourceDiscoverer, EventEmitter)

ResourceDiscoverer.prototype.discover = function(callback) {
  var tasks = []

  var resources = []
  var files = fs.readdirSync(this._options.resourceDirectory)

  if(!files) {
    this.emit('error', new Error('Could not read directory ' + this._options.resourceDirectory))

    return
  }

  files.sort(function(a, b) {
    var nameA = a == 'Resource.js' ? a : a.replace('Resource.js', '.js')
    var nameB = b == 'Resource.js' ? b : b.replace('Resource.js', '.js')

    return nameA > nameB
  })

  files.forEach(function(file) {

    tasks.push(function(callback) {
      var resourceFile = this._options.resourceDirectory + '/' + file

      // only interested in javascript files
      if(!this._isJavaScriptFile(resourceFile)) {
        return
      }

      this._logger.info('Columbo Loading %s as a resource', resourceFile)

      // load resource
      var resource = require(path.resolve(resourceFile))

      // not a constructor so ignore it
      if(typeof resource !== 'function') {
        return
      }

      var name = file.substring(0, 1).toLowerCase() + file.substring(1, file.length - 3)

      this._options.resourceCreator(resource, name, function(error, instance) {
        if(error) {
          callback(error)

          return
        }

        // make sure we're not a singleton and a not-pluralton
        if(instance['retrieveOne'] && (instance['retrieveAll'] || instance['retrieve'])) {
          throw new Error('A singleton resource should only implement retrieveOne - not retrieveAll and/or retrieve')
        }

        var fullName = file.substr(0, file.length - 3)

        if(_s.endsWith(fullName, 'Resource') && fullName != 'Resource') {
          fullName = fullName.substr(0, fullName.length - 8)
        }

        this._placeInHierarchy({
          fullName: fullName,
          file: resourceFile.replace(this._options.resourceDirectory + '/', ''),
          resource: instance,
          subResources: [],
          singleton: instance['retrieveOne'] ? true : false
        }, resources)

        callback()
      }.bind(this))
    }.bind(this))
  }.bind(this))

  async.parallel(tasks, function(error) {
    if(error) return callback(error)

    callback(error, resources)
  })
}

ResourceDiscoverer.prototype._isJavaScriptFile = function(resourceFile) {
  var fileStats = fs.statSync(resourceFile)

  return fileStats.isFile() && _s.endsWith(resourceFile, '.js')
}

ResourceDiscoverer.prototype._placeInHierarchy = function(resourceDefinition, resources, parentResource) {
  for(var i = 0; i < resources.length; i++) {
    if(_s.startsWith(resourceDefinition.fullName, resources[i].fullName)) {
      this._placeInHierarchy(resourceDefinition, resources[i].subResources, resources[i])

      return
    }
  }

  resourceDefinition.parent = parentResource

  var name = resourceDefinition.file.substr(0, resourceDefinition.file.length - 3)

  if(_s.endsWith(name, 'Resource') && name != 'Resource') {
    name = name.substr(0, name.length - 8)
  }

  if(parentResource && _s.startsWith(name, parentResource.fullName)) {
    name = name.replace(parentResource.fullName, '')
  }

  if(name.toUpperCase() == name) {
    name = name.toLowerCase()
  }

  resourceDefinition.name = name

  resources.push(resourceDefinition)
}

module.exports = ResourceDiscoverer
