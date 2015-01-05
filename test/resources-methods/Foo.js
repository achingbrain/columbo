
Foo = function() {

}

Foo.prototype.retrieve = function(request) {
  request.reply({})
}

Foo.prototype.retrieveAll = function(request) {
  request.reply([])
}

Foo.prototype.create = function(request) {
  request.reply({})
}

Foo.prototype.update = function(request) {
  request.reply({})
}

Foo.prototype.patch = function(request) {
  request.reply({})
}

Foo.prototype.remove = function(request) {
  request.reply({})
}

Foo.prototype.toString = function() {
  return 'Foo resource'
}

module.exports = Foo