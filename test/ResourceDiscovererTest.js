var ResourceDiscoverer = require('../lib/ResourceDiscoverer'),
  expect = require('chai').expect

describe('ResourceDiscoverer', function() {
  it('should discover resources', function(done) {
    var resourceDiscoverer = new ResourceDiscoverer({
      resourceDirectory: './test/resources-discover'
    })
    var resources = resourceDiscoverer.discover(function(error, resources) {
      expect(error).to.not.exist()
      // should have two resources - /foo and /bar
      expect(resources.length).to.equal(2)

      expect(resources[0].name).to.equal('Bar')
      expect(resources[1].name).to.equal('Foo')

      expect(resources[1].subResources[0].name).to.equal('Baz')
      expect(resources[1].subResources[0].fullName).to.equal('FooBaz')

      done()
    })
  })

  it('should emit error when creating resource fails', function(done) {
    var resourceDiscoverer = new ResourceDiscoverer({
      resourceDirectory: './test/resources-discover',
      resourceCreator: function(resource, name, callback) {
        setImmediate(callback.bind(null, new Error('Urk!')))
      }
    })
    var resources = resourceDiscoverer.discover(function(error, resources) {
      expect(error).to.be.ok
      expect(error.message).to.contain('Urk!')

      done()
    })
  })
})
