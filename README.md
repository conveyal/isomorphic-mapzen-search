# isomorphic-mapzen-search
Isomorphic Mapzen search for reuse across our JavaScript libraries. Get an API key [here](https://mapzen.com/developers).

## API

### `search(apiKey, searchText, options = {})`

```js
import {search} from 'isomorphic-mapzen-search'
search(MAPZEN_API_KEY, '1301 U Street NW, Washington, DC', {
  boundary: {
    country: 'US',
    maxLatlng: maxLatlng,
    minLatlng: minLatlng
  },
  circle: {
    centerLatlng: centerLatlng,
    radius: 35 // kilometers
  },
  focusLatlng: {lat: 39.7691, lng: -86.1570},
  format: false // keep as returned GeoJSON
}).then(geojson => {
  console.log(geojson)
}).catch(err => {
  console.error(err)
})
```

### `reverse(apiKey, latlng, options = {})`

```js
import {reverse} from 'isomorphic-mapzen-search'
reverse(MAPZEN_API_KEY, {
  lat: 39.7691,
  lng: -86.1570
}, {
  format: true
}).then(json => {
  console.log(json[0].address)
}).catch(err => {
  console.error(err)
})
```
