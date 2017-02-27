/* globals describe, expect, it */

const nock = require('nock')

const geocoder = require('../index.js')
const mockReverseResult = require('./mock-reverse-result.json')
const mockSearchResult = require('./mock-search-result.json')
const mockKey = 'test-key'

describe('autocomplete', () => {
  it('should successfully autocomplete', (done) => {
    nock('https://search.mapzen.com/')
      .get(/v1\/autocomplete/)
      .reply(200, mockSearchResult)

    let numResultsHandled = 0

    const resultsHandler = (result) => {
      numResultsHandled++
      expect(numResultsHandled).toEqual(1)
      expect(result).toMatchSnapshot()
      expect(result.features[0].properties.label).toEqual('Takoma, Takoma Park, MD, USA')
      done()
    }

    const autocomplete = new geocoder.Autocomplete({
      apiKey: mockKey,
      resultsHandler
    })

    autocomplete.query({
      text: 'anywhere'
    })

    autocomplete.query({
      text: '123 abc st'
    })
  })
})

describe('search', () => {
  const searchQuery = '123 abc st'

  it('should successfully geocode', async () => {
    nock('https://search.mapzen.com/')
      .get(/v1\/search/)
      .reply(200, mockSearchResult)

    const result = await geocoder.search({apiKey: mockKey, text: searchQuery})
    expect(result.features[0].geometry.coordinates[0]).toEqual(-77.023104)
  })

  it('should successfully geocode and format', async () => {
    nock('https://search.mapzen.com/')
      .get(/v1\/search/)
      .reply(200, mockSearchResult)

    const result = await geocoder.search({apiKey: mockKey, format: true, text: searchQuery})
    expect(result).toMatchSnapshot()
    expect(result[0].address).toEqual('Takoma, Takoma Park, MD, USA')
  })
})

describe('reverse', () => {
  const reverseQuery = { lat: 38.976745, lng: -77.023104 }

  it('should successfully reverse geocode', async () => {
    nock('https://search.mapzen.com/')
      .get(/v1\/reverse/)
      .reply(200, mockReverseResult)

    const result = await geocoder.reverse({apiKey: mockKey, point: reverseQuery})
    expect(result.features[0].geometry.coordinates[0]).toEqual(-77.023104)
  })

  it('should successfully reverse geocode and format', async () => {
    nock('https://search.mapzen.com/')
      .get(/v1\/reverse/)
      .reply(200, mockReverseResult)

    const result = await geocoder.reverse({apiKey: mockKey, format: true, point: reverseQuery})
    expect(result).toMatchSnapshot()
    expect(result[0].address).toEqual('Takoma, Takoma Park, MD, USA')
  })
})
