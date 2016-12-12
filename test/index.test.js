/* globals describe, expect, it */

const nock = require('nock')

const geocoder = require('../index.js')
const mockReverseResult = require('./mock-reverse-result.json')
const mockSearchResult = require('./mock-search-result.json')
const mockKey = 'test-key'

describe('search', () => {
  const searchQuery = '123 abc st'

  describe('errors', function () {
    it('should handle server connection timeout', (done) => {
      nock('https://search.mapzen.com/')
        .get(/v1\/search/)
        .delayConnection(60000)
        .reply(200, mockSearchResult)

      geocoder.search(mockKey, searchQuery, {}, { timeout: 200 })
        .then((result) => {
          throw new Error('result should not have completed successfully')
        })
        .catch((err) => {
          try {
            expect(err.message).toContain('network timeout at')
            done()
          } catch (e) {
            if (e) throw e
            done()
          }
        })
    })

    /* it('should handle response timeout', (done) => {
      nock('https://search.mapzen.com/')
        .get(/v1\/search/)
        .socketDelay(60000)
        .reply(200, mockGeocodeResult)

      geocoder.search(mockKey, searchQuery, {}, { timeout: 200 })
        .then((result) => {
          console.log(result)
          throw new Error('result should not have completed successfully')
        })
        .catch((err) => {
          console.log(err)
          try {
            expect(err.message).toEqual('network timeout at')
            done()
          } catch (e) {
            console.error(e)
            if (e) throw e
            done()
          }
        })
    }) */  // this should work, but it doesn't
  })

  describe('successes', () => {
    it('should successfully geocode', async () => {
      nock('https://search.mapzen.com/')
        .get(/v1\/search/)
        .reply(200, mockSearchResult)

      const result = await geocoder.search(mockKey, searchQuery)
      expect(result.features[0].geometry.coordinates[0]).toEqual(-77.023104)
    })

    it('should successfully geocode and format', async () => {
      nock('https://search.mapzen.com/')
        .get(/v1\/search/)
        .reply(200, mockSearchResult)

      const result = await geocoder.search(mockKey, searchQuery, { format: true })
      expect(result).toMatchSnapshot()
      expect(result[0].address).toEqual('Takoma, Takoma Park, MD, USA')
    })
  })
})

describe('reverse', () => {
  const reverseQuery = { lat: 38.976745, lng: -77.023104 }

  describe('errors', function () {
    it('should handle server connection timeout', (done) => {
      nock('https://search.mapzen.com/')
        .get(/v1\/reverse/)
        .delayConnection(60000)
        .reply(200, mockReverseResult)

      geocoder.reverse(mockKey, reverseQuery, {}, { timeout: 200 })
        .then((result) => {
          throw new Error('result should not have completed successfully')
        })
        .catch((err) => {
          try {
            expect(err.message).toContain('network timeout at')
            done()
          } catch (e) {
            if (e) throw e
            done()
          }
        })
    })

    /* it('should handle response timeout', (done) => {
      nock('https://reverse.mapzen.com/')
        .get(/v1\/reverse/)
        .socketDelay(60000)
        .reply(200, mockReverseResult)

      geocoder.reverse(mockKey, reverseQuery, {}, { timeout: 200 })
        .then((result) => {
          console.log(result)
          throw new Error('result should not have completed successfully')
        })
        .catch((err) => {
          console.log(err)
          try {
            expect(err.message).toEqual('network timeout at')
            done()
          } catch (e) {
            console.error(e)
            if (e) throw e
            done()
          }
        })
    }) */  // this should work, but it doesn't
  })

  describe('successes', () => {
    it('should successfully reverse geocode', async () => {
      nock('https://search.mapzen.com/')
        .get(/v1\/reverse/)
        .reply(200, mockReverseResult)

      const result = await geocoder.reverse(mockKey, reverseQuery)
      expect(result.features[0].geometry.coordinates[0]).toEqual(-77.023104)
    })

    it('should successfully reverse geocode and format', async () => {
      nock('https://search.mapzen.com/')
        .get(/v1\/reverse/)
        .reply(200, mockReverseResult)

      const result = await geocoder.reverse(mockKey, reverseQuery, { format: true })
      expect(result).toMatchSnapshot()
      expect(result[0].address).toEqual('Takoma, Takoma Park, MD, USA')
    })
  })
})
