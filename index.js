import fetch from 'isomorphic-fetch'
import qs from 'qs'

const mapzen_url = 'https://search.mapzen.com/v1'
const search_url = `${mapzen_url}/search`
const reverse_url = `${mapzen_url}/reverse`

export function search (api_key, text, {boundary, focus_latlng, format} = {}) {
  if (!text) return Promise.resolve([])

  const query = {
    api_key,
    text
  }

  if (focus_latlng) {
    query['focus.point.lat'] = focus_latlng.lat
    query['focus.point.lon'] = focus_latlng.lng
  }

  if (boundary) {
    if (boundary.country) query['boundary.country'] = boundary.country
    if (boundary.rect) {
      query['boundary.rect.min_lat'] = boundary.rect.min_lat
      query['boundary.rect.min_lon'] = boundary.rect.min_lon
      query['boundary.rect.max_lat'] = boundary.rect.max_lat
      query['boundary.rect.max_lon'] = boundary.rect.max_lon
    }
    if (boundary.circle) {
      query['boundary.circle.lat'] = boundary.circle.lat
      query['boundary.circle.lon'] = boundary.circle.lon
      query['boundary.circle.radius'] = boundary.circle.radius
    }
  }

  return run(search_url, query, format)
}

export function reverse (api_key, latlng, {format} = {}) {
  return run(reverse_url, {
    api_key,
    'point.lat': latlng.lat,
    'point.lon': latlng.lng
  }, format)
}

function run (url, query, format) {
  return fetch(`${url}?${qs.stringify(query)}`)
    .then(res => res.json())
    .then(json => {
      return json && json.features && format ? json.features.map(split) : json
    })
}

function split ({geometry, properties}) {
  return Object.assign({}, properties, {
    address: properties.label,
    latlng: {
      lat: parseFloat(geometry.coordinates[1]),
      lng: parseFloat(geometry.coordinates[0])
    }
  })
}
