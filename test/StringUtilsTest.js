var StringUtils = require('../lib/StringUtils'),
  expect = require('chai').expect

describe('StringUtils', function() {

  it('should split by capitals', function() {
    expect(StringUtils.splitByCapitals('OneTwoThree')).to.deep.equal(['One', 'Two', 'Three'])
  })

  it('should singularise', function() {
    expect(StringUtils.singularise('foos')).to.equal('foo')
    expect(StringUtils.singularise('libraries')).to.equal('library')
    expect(StringUtils.singularise('glasses')).to.equal('glass')
  })

  it('should pluralise', function() {
    expect(StringUtils.pluralise('library')).to.equal('libraries')
    expect(StringUtils.pluralise('foo')).to.equal('foos')
    expect(StringUtils.pluralise('glass')).to.equal('glasses')
  })
})
