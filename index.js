import fetch from 'isomorphic-fetch'
import lonlng from 'lonlng'
import qs from 'qs'

const mapzen_url = 'https://search.mapzen.com/v1'
const search_url = `${mapzen_url}/search`
const reverse_url = `${mapzen_url}/reverse`

export function search (api_key, text, {boundary, focusLatlng, format} = {}) {
  if (!text) return Promise.resolve([])

  const query = {
    api_key,
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

  return run(search_url, query, format)
}

export function reverse (api_key, latlng, {format} = {}) {
  const {lng, lat} = lonlng(latlng)
  return run(reverse_url, {
    api_key,
    'point.lat': lat,
    'point.lon': lng
  }, format)
}

function run (url, query, format) {
  return fetch(`${url}?${qs.stringify(query)}`)
    .then(res => res.json())
    .then(json => { return json && json.features && format ? json.features.map(split) : json })
}

function split ({geometry, properties}) {
  return Object.assign({}, properties, {
    address: properties.label,
    latlng: lonlng.fromCoordinates(geometry.coordinates)
  })
}
