# isomorphic-mapzen-search
Isomorphic Mapzen search for reuse across our JavaScript libraries. Get an API key [here](https://mapzen.com/developers).

## API

### `search(api_key, search_text, options = {})`

```js
import {search} from 'isomorphic-mapzen-search'
search(MAPZEN_API_KEY, '1301 U Street NW, Washington, DC', {
  boundary: { // See all parameters here: https://mapzen.com/documentation/search/search/#narrow-your-search
    country: 'US'
  },
  focus_latlng: {lat: 39.7691, lng: -86.1570},
  format: false // keep as returned GeoJSON
}).then(geojson => {
  console.log(geojson)
}).catch(err => {
  console.error(err)
})
```

### `reverse(api_key, latlng, options = {})`

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
