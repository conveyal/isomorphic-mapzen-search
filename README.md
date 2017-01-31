# isomorphic-mapzen-search
Isomorphic Mapzen search for reuse across our JavaScript libraries. Get an API key [here](https://mapzen.com/developers). Coordinates must be anything that can be parsed by [lonlng](https://github.com/conveyal/lonlng).

## API

### `search({apiKey, text, ...options})`

```js
import {search} from 'isomorphic-mapzen-search'
search({
  apiKey: MAPZEN_API_KEY,
  text: '1301 U Street NW, Washington, DC',
  focusPoint: {lat: 39.7691, lon: -86.1570},
  boundary: {
    country: 'US',
    rect: {
      minLon: minLon,
      minLat: minLat,
      maxLon: maxLon,
      maxLat: maxLat
    },
    circle: {
      centerPoint: centerLonLat,
      radius: 35 // kilometers
    }
  },
  format: false // keep as returned GeoJSON
}).then((geojson) => {
  console.log(geojson)
}).catch((err) => {
  console.error(err)
})
```

### `reverse({apiKey, point, format})`

```js
import {reverse} from 'isomorphic-mapzen-search'
reverse({
  apiKey: MAPZEN_API_KEY,
  point: {
    lat: 39.7691,
    lng: -86.1570
  },
  format: true
}).then((json) => {
  console.log(json[0].address)
}).catch((err) => {
  console.error(err)
})
```
