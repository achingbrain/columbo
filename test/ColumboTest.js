var Columbo = require('../lib/Columbo'),
  METHODS = require('../lib/METHODS'),
  expect = require('chai').expect

var findResource = function(path, method, resources) {
  var output = null

  resources.forEach(function(resource) {
    if(resource.path == path && resource.method == method) {
      output = resource
    }
  })

  return output
}

describe('Columbo', function() {
  it('Should discover singleton', function(done) {
    var columbo = new Columbo({
      resourceDirectory: './test/resources-singleton'
    })
    columbo.discover(function(error, resources) {
      expect(error).to.not.exist()
      expect(resources.length).to.equal(4)
      expect(findResource('/singleton', METHODS.GET, resources)).to.be.ok
      expect(findResource('/singleton/subs/{subId}', METHODS.GET, resources)).to.be.ok

      done()
    })
  })

  it('Should discover methods', function(done) {
    var columbo = new Columbo({
      resourceDirectory: './test/resources-methods'
    })
    columbo.discover(function(error, resources) {
      expect(error).to.not.exist()
      expect(resources.length).to.equal(8)

      expect(findResource('/foos', METHODS.OPTIONS, resources)).to.be.ok
      expect(findResource('/foos', METHODS.GET, resources)).to.be.ok
      expect(findResource('/foos', METHODS.POST, resources)).to.be.ok
      expect(findResource('/foos/{fooId}', METHODS.OPTIONS, resources)).to.be.ok
      expect(findResource('/foos/{fooId}', METHODS.GET, resources)).to.be.ok
      expect(findResource('/foos/{fooId}', METHODS.PUT, resources)).to.be.ok
      expect(findResource('/foos/{fooId}', METHODS.PATCH, resources)).to.be.ok
      expect(findResource('/foos/{fooId}', METHODS.DELETE, resources)).to.be.ok
      done()
    })
  })

  it('should override id generation', function(done) {
    var columbo = new Columbo({
      resourceDirectory: './test/resources-methods',
      idFormatter: function(id) {
        return ':' + id
      }
    })

    columbo.discover(function(error, resources) {
      expect(error).to.not.exist()
      expect(findResource('/foos/:fooId', METHODS.GET, resources)).to.be.ok

      done()
    })
  })

  it('should support deep nesting', function(done) {
    var columbo = new Columbo({
      resourceDirectory: './test/resources-deeplynested'
    })
    columbo.discover(function(error, resources) {
      expect(error).to.not.exist()
      expect(findResource('/foos/{fooId}', METHODS.GET, resources)).to.be.ok
      expect(findResource('/foos/{fooId}/bars/{barId}', METHODS.GET, resources)).to.be.ok
      expect(findResource('/foos/{fooId}/bars/{barId}/bazs/{bazId}', METHODS.GET, resources)).to.be.ok
      expect(findResource('/foos/{fooId}/bars/{barId}/bazs/{bazId}/quxs/{quxId}', METHODS.GET, resources)).to.be.ok
      expect(findResource('/foos/{fooId}/bars/{barId}/bazs/{bazId}/quxs/{quxId}', METHODS.OPTIONS, resources)).to.be.ok

      done()
    })
  })

  it('should allow compound nouns', function(done) {
    var columbo = new Columbo({
      resourceDirectory: './test/resources-compoundnouns'
    })
    columbo.discover(function(error, resources) {
      expect(error).to.not.exist()
      expect(findResource('/foos/{fooId}', METHODS.GET, resources)).to.be.ok
      expect(findResource('/foos/{fooId}/barBazs/{barBazId}', METHODS.GET, resources)).to.be.ok
      expect(findResource('/foos/{fooId}/barBazs/{barBazId}/quxs/{quxId}', METHODS.GET, resources)).to.be.ok

      done()
    })
  })

  it('should remove \'Resource\' from resource unless it\'s a ResourceResource', function(done) {
    var columbo = new Columbo({
      resourceDirectory: './test/resources-with-resource-in-name'
    })
    columbo.discover(function(error, resources) {
      expect(error).to.not.exist()
      expect(findResource('/bazs/{bazId}', METHODS.GET, resources)).to.be.ok
      expect(findResource('/foos/{fooId}', METHODS.GET, resources)).to.be.ok
      expect(findResource('/foos/{fooId}/bars/{barId}', METHODS.GET, resources)).to.be.ok
      expect(findResource('/foos/{fooId}/bars/{barId}/bazs/{bazId}', METHODS.GET, resources)).to.be.ok
      expect(findResource('/resources/{resourceId}', METHODS.GET, resources)).to.be.ok

      done()
    })
  })

  it('should discover capitals', function(done) {
    var columbo = new Columbo({
      resourceDirectory: './test/resources-capitals'
    })
    columbo.discover(function(error, resources) {
      expect(error).to.not.exist()
      expect(resources.length).to.equal(4)
      expect(findResource('/foo', METHODS.GET, resources)).to.be.ok
      expect(findResource('/foo/bar', METHODS.GET, resources)).to.be.ok

      done()
    })
  })
})

