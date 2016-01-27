import fetch from 'isomorphic-fetch'
import qs from 'qs'

const mapzenUrl = 'https://search.mapzen.com/v1'
const searchUrl = `${mapzenUrl}/search`
const reverseUrl = `${mapzenUrl}/reverse`

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

  return fetch(`${searchUrl}?${qs.stringify(query)}`)
    .then(res => res.json())
    .then(json => {
      if (!json || !json.features) throw new Error('No features found.')

      return format ? json.features.map(split) : json
    })
}

export function reverse (api_key, latlng, {format} = {}) {
  const query = qs.stringify({
    api_key,
    'point.lat': latlng.lat,
    'point.lon': latlng.lng
  })

  return fetch(`${reverseUrl}?${query}`)
    .then(res => res.json())
    .then(json => {
      if (!json || !json.features) throw new Error('No features found.')

      return format ? json.features.map(split) : json
    })
}

function split ({geometry, properties}) {
  return Object.assign({}, properties, {
    fullAddress: properties.label,
    latlng: {
      lat: parseFloat(geometry.coordinates[1]),
      lng: parseFloat(geometry.coordinates[0])
    }
  })
}
