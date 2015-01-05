var ResourceProcessor = require('../lib/ResourceProcessor'),
  METHODS = require('../lib/METHODS'),
  Bar = require('./resources-process/Bar'),
  Foo = require('./resources-process/Foo'),
  FooBaz = require('./resources-process/FooBaz'),
  expect = require('chai').expect

describe('ResourceProcessor', function() {

  it('should process resources', function() {
    var resourceDefinitions = [{
      fullName: 'Bar',
      name: 'Bar',
      file: 'Bar.js',
      resource: new Bar(),
      subResources: [],
      singleton: true,
      parent: null
    }, {
      fullName: 'Foo',
      name: 'Foo',
      file: 'Foo.js',
      resource: new Foo(),
      subResources: [{
        fullName: 'FooBaz',
        name: 'Baz',
        file: 'FooBaz.js',
        resource: new FooBaz(),
        subResources: [],
        singleton: false,
        parent: null
      }],
      singleton: false,
      parent: null
    }]

    // circular dependency, omnomnom
    resourceDefinitions[1].subResources[0].parent = resourceDefinitions[1]

    var resourceProcessor = new ResourceProcessor()
    var resources = resourceProcessor.process(resourceDefinitions)

    // should have three resources - /bar, /foo/{fooId} and /foo/{fooId}/baz and OPTIONS for them
    expect(resources.length).to.equal(6)

    expect(resources[0].path).to.equal('/bar')
    expect(resources[0].method).to.equal(METHODS.GET)
    expect(resources[1].path).to.equal('/bar')
    expect(resources[1].method).to.equal(METHODS.OPTIONS)
    expect(resources[2].path).to.equal('/foos/{fooId}')
    expect(resources[2].method).to.equal(METHODS.GET)
    expect(resources[3].path).to.equal('/foos/{fooId}')
    expect(resources[3].method).to.equal(METHODS.OPTIONS)
  })
})
