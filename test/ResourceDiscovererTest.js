var ResourceDiscoverer = require('../lib/ResourceDiscoverer'),
  expect = require('chai').expect

describe('ResourceDiscoverer', function() {
  it('should discover resources', function() {
    var resourceDiscoverer = new ResourceDiscoverer({
      resourceDirectory: './test/resources-discover'
    })
    var resources = resourceDiscoverer.discover()

    // should have two resources - /foo and /bar
    expect(resources.length).to.equal(2)

    expect(resources[0].name).to.equal('Bar')
    expect(resources[1].name).to.equal('Foo')

    expect(resources[1].subResources[0].name).to.equal('Baz')
    expect(resources[1].subResources[0].fullName).to.equal('FooBaz')
  })
})
