/* globals fetch */

import lonlat from '@conveyal/lonlat'
import debounce from 'debounce'
import qs from 'qs'

if (typeof (fetch) === 'undefined') {
  require('isomorphic-fetch')
}

const mapzenUrl = 'https://search.mapzen.com/v1'
const autocompleteUrl = `${mapzenUrl}/autocomplete`
const reverseUrl = `${mapzenUrl}/reverse`
const searchUrl = `${mapzenUrl}/search`

export class Autocomplete {
  constructor ({
    apiKey,
    debounceTimeMs = 333,
    formatResults = false,
    minTextLength = 3,
    resultsHandler
  }) {
    this.apiKey = apiKey
    this.debounceTimeMs = debounceTimeMs
    this.formatResults = formatResults
    this.minTextLength = minTextLength
    this.resultsHandler = resultsHandler
    this.queryCache = {}
    this.queryDebouncer = debounce(this._runAutocomplete, debounceTimeMs)
  }

  query (cfg) {
    this.queryDebouncer(cfg)
  }

  _runAutocomplete ({
    boundary,
    focusPoint,
    layers,
    sources = 'gn,oa,osm,wof',
    text
  }) {
    // make sure resultsHandler is set
    if (typeof (this.resultsHandler) !== 'function') {
      return console.error('autocomplete resultsHandler not set')
    }

    // make sure text is queryable
    if (!text || !text.length || text.length < this.minTextLength) {
      return
    }

    // build query
    const query = {
      api_key: this.apiKey,
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

    // set query signature to latest query
    // this is to ensure that results will only get returned
    // for the latest query
    this.curQuery = JSON.stringify(query)

    // return something from cache if it exists
    if (this.queryCache[this.curQuery]) {
      return this.resultsHandler(this.queryCache[this.curQuery])
    }

    run({
      format: this.formatResults,
      query,
      stringifiedQuery: this.curQuery,
      url: autocompleteUrl
    })
      .then((result) => {
        // only fire resultsHandler if query matches the latest
        if (result.stringifiedQuery === this.curQuery) {
          this.resultsHandler(result.jsonResponse)
          this.curQuery = undefined
        }

        // store all results in cache
        this.queryCache[result.stringifiedQuery] = result.jsonResponse
      })
      .catch((err) => {
        console.error('receive error while fetching autocomplete')
        console.error(err)
      })
  }
}

export function search ({
  apiKey,
  boundary,
  focusPoint,
  format,
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

  return run({format, query})
}

export function reverse ({
  apiKey,
  format,
  point
}) {
  const {lon, lat} = lonlat(point)
  return run({
    format,
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
  stringifiedQuery,
  url = searchUrl
}) {
  return fetch(`${url}?${qs.stringify(query)}`)
    .then((res) => res.json())
    .then((json) => {
      let jsonResponse = json
      if (json && json.features && format) {
        jsonResponse = json.features.map(split)
      }

      if (stringifiedQuery) {
        return {
          stringifiedQuery,
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
