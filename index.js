import lonlat from '@conveyal/lonlat'
import qs from 'qs'

let fetch = (
  typeof window === 'object'
    ? window.fetch
    : (
      typeof global === 'object'
        ? global.fetch
        : undefined))
if (!fetch) {
  fetch = require('isomorphic-fetch')
}

const mapzenUrl = 'https://search.mapzen.com/v1'
const searchUrl = `${mapzenUrl}/search`
const reverseUrl = `${mapzenUrl}/reverse`

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
  url = searchUrl
}) {
  return fetch(`${url}?${qs.stringify(query)}`)
    .then((res) => res.json())
    .then((json) => { return json && json.features && format ? json.features.map(split) : json })
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
