import fetch from 'isomorphic-fetch'
import lonlng from 'lonlng'
import qs from 'qs'

const mapzenUrl = 'https://search.mapzen.com/v1'
const searchUrl = `${mapzenUrl}/search`
const reverseUrl = `${mapzenUrl}/reverse`

export function search (apiKey, text, {boundary, focusLatlng, format} = {}, fetchOptions = {}) {
  if (!text) return Promise.resolve([])

  const query = {
    api_key: apiKey,
    sources: 'gn,oa,osm,wof',
    text
  }

  if (focusLatlng) {
    const {lat, lng} = lonlng(focusLatlng)
    query['focus.point.lat'] = lat
    query['focus.point.lon'] = lng
  }

  if (boundary) {
    if (boundary.country) query['boundary.country'] = boundary.country
    if (boundary.rect) {
      const min = lonlng(boundary.rect.minLatlng)
      const max = lonlng(boundary.rect.maxLatlng)
      query['boundary.rect.min_lat'] = min.lat
      query['boundary.rect.min_lon'] = min.lng
      query['boundary.rect.max_lat'] = max.lat
      query['boundary.rect.max_lon'] = max.lng
    }
    if (boundary.circle) {
      const {lat, lng} = lonlng(boundary.circle.latlng)
      query['boundary.circle.lat'] = lat
      query['boundary.circle.lon'] = lng
      query['boundary.circle.radius'] = boundary.circle.radius
    }
  }

  return run(searchUrl, query, format, fetchOptions)
}

export function reverse (apiKey, latlng, {format} = {}, fetchOptions = {}) {
  const {lng, lat} = lonlng(latlng)
  return run(reverseUrl, {
    api_key: apiKey,
    'point.lat': lat,
    'point.lon': lng
  }, format, fetchOptions)
}

function run (url, query, format, fetchOptions) {
  return fetch(`${url}?${qs.stringify(query)}`, fetchOptions)
    .then(res => res.json())
    .then(json => { return json && json.features && format ? json.features.map(split) : json })
}

function split ({geometry, properties}) {
  return Object.assign({}, properties, {
    address: `${properties.label}${properties.postalcode ? ' ' + properties.postalcode : ''}`,
    latlng: lonlng.fromCoordinates(geometry.coordinates)
  })
}
