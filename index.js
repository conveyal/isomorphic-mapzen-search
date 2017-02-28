/* globals fetch */

import lonlat from '@conveyal/lonlat'
import qs from 'qs'

if (typeof (fetch) === 'undefined') {
  require('isomorphic-fetch')
}

const mapzenUrl = 'https://search.mapzen.com/v1'
const autocompleteUrl = `${mapzenUrl}/autocomplete`
const reverseUrl = `${mapzenUrl}/reverse`
const searchUrl = `${mapzenUrl}/search`

/**
 * Search for and address using
 * Mapzen's {@link https://mapzen.com/documentation/search/autocomplete/|Autocomplete}
 * service.
 *
 * @param {Object} $0
 * @param  {string} $0.apiKey                     The Mapzen API key
 * @param  {Object} $0.boundary
 * @param  {Object} $0.focusPoint
 * @param  {boolean} $0.format
 * @param {boolean} $0.includeQueryInResponse     If true, return query object in output of resolved Promise
 * @param  {string} $0.layers                     a comma-separated list of
 *   {@link https://mapzen.com/documentation/search/autocomplete/#layers|layer types}
 * @param  {string} [$0.sources='gn,oa,osm,wof']
 * @param  {string} $0.text                       query text
 * @return {Promise}                              A Promise that'll get resolved with the autocomplete result
 */
export function autocomplete ({
  apiKey,
  boundary,
  focusPoint,
  format,
  includeQueryInResponse,
  layers,
  sources = 'gn,oa,osm,wof',
  text
}) {
  // build query
  const query = {
    api_key: apiKey,
    sources,
    text
  }

  if (layers) {
    query.layers = layers
  }

  if (focusPoint) {
    const {lat, lon} = lonlat(focusPoint)
    query['focus.point.lat'] = lat
    query['focus.point.lon'] = lon
  }

  if (boundary) {
    if (boundary.country) query['boundary.country'] = boundary.country
    if (boundary.rect) {
      query['boundary.rect.min_lat'] = boundary.rect.minLat
      query['boundary.rect.min_lon'] = boundary.rect.minLon
      query['boundary.rect.max_lat'] = boundary.rect.maxLat
      query['boundary.rect.max_lon'] = boundary.rect.maxLon
    }
    /* Circle currently not supported in autocomplete
    if (boundary.circle) {
      const {lat, lon} = lonlat(boundary.circle.centerPoint)
      query['boundary.circle.lat'] = lat
      query['boundary.circle.lon'] = lon
      query['boundary.circle.radius'] = boundary.circle.radius
    }
    */
  }

  return run({
    format,
    includeQueryInResponse,
    query,
    url: autocompleteUrl
  })
}

/**
 * Search for an address using
 * Mapzen's {@link https://mapzen.com/documentation/search/search/|Search}
 * service.
 *
 * @param {Object} $0
 * @param {string} $0.apiKey                    The Mapzen API key
 * @param {Object} $0.boundary
 * @param {Object} $0.focusPoint
 * @param {boolean} $0.format
 * @param {boolean} $0.includeQueryInResponse   If true, return query object in output of resolved Promise
 * @param {number} [$0.size=10]
 * @param {string} [$0.sources='gn,oa,osm,wof']
 * @param {string} $0.text                      The address text to query for
 * @return {Promise}                            A Promise that'll get resolved with search result
 */
export function search ({
  apiKey,
  boundary,
  focusPoint,
  format,
  includeQueryInResponse,
  size = 10,
  sources = 'gn,oa,osm,wof',
  text
}) {
  if (!text) return Promise.resolve([])

  const query = {
    api_key: apiKey,
    size,
    sources,
    text
  }

  if (focusPoint) {
    const {lat, lon} = lonlat(focusPoint)
    query['focus.point.lat'] = lat
    query['focus.point.lon'] = lon
  }

  if (boundary) {
    if (boundary.country) query['boundary.country'] = boundary.country
    if (boundary.rect) {
      query['boundary.rect.min_lat'] = boundary.rect.minLat
      query['boundary.rect.min_lon'] = boundary.rect.minLon
      query['boundary.rect.max_lat'] = boundary.rect.maxLat
      query['boundary.rect.max_lon'] = boundary.rect.maxLon
    }
    if (boundary.circle) {
      const {lat, lon} = lonlat(boundary.circle.centerPoint)
      query['boundary.circle.lat'] = lat
      query['boundary.circle.lon'] = lon
      query['boundary.circle.radius'] = boundary.circle.radius
    }
  }

  return run({format, includeQueryInResponse, query})
}

/**
 * Reverse geocode using
 * Mapzen's {@link https://mapzen.com/documentation/search/reverse/|Reverse geocoding}
 * service.
 *
 * @param {Object} $0
 * @param {string} $0.apiKey                    The Mapzen API key
 * @param {boolean} $0.format
 * @param {boolean} $0.includeQueryInResponse   If true, return query object in output of resolved Promise
 * @param {{lat: number, lon: number}} $0.point Point to reverse geocode
 * @return {Promise}                            A Promise that'll get resolved with reverse geocode result
 */
export function reverse ({
  apiKey,
  format,
  includeQueryInResponse,
  point
}) {
  const {lon, lat} = lonlat(point)
  return run({
    format,
    includeQueryInResponse,
    query: {
      api_key: apiKey,
      'point.lat': lat,
      'point.lon': lon
    },
    url: reverseUrl
  })
}

function run ({
  format = false,
  query,
  includeQueryInResponse,
  url = searchUrl
}) {
  return fetch(`${url}?${qs.stringify(query)}`)
    .then((res) => res.json())
    .then((json) => {
      let jsonResponse = json
      if (json && json.features && format) {
        jsonResponse = json.features.map(split)
      }

      if (includeQueryInResponse) {
        return {
          query,
          jsonResponse
        }
      } else {
        return jsonResponse
      }
    })
}

function split ({
  geometry,
  properties
}) {
  return Object.assign({}, properties, {
    address: `${properties.label}${properties.postalcode ? ' ' + properties.postalcode : ''}`,
    latlng: lonlat.fromCoordinates(geometry.coordinates)
  })
}
