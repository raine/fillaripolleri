import '../public/reboot.css'

import * as React from 'karet'
import * as ReactDOM from 'react-dom'
import * as R from 'ramda'
import * as L from 'partial.lenses'
import * as qs from 'querystring'
import * as U from 'karet.util'
import { location } from './window'
import searchParamsL from './search-params'
import App from './App'
import fetchJSON from './fetch-json'

const params = U.view(['search', searchParamsL], location)
const search = U.atom(params.get().search || '')
const debouncedSearch = U.debounce(300, search)

debouncedSearch
  .onValue(q => params.modify(
    q ? R.assoc('search', q) : R.dissoc('search')
  ))

const items = U.thru(
  debouncedSearch,
  U.flatMapLatest(s =>
    fetchJSON(`http://localhost:3000/items`)
  ),
  U.startWith([])
)

const state = U.molecule({
  search,
  items
})

state.log()

// // This works
// ReactDOM.render(
//   <App
//     search={search}
//     items={items}
//   />,
//   document.getElementById('root')
// )


// This doesn't work (i.e. nothing happens)
ReactDOM.render(
  <App
    search={U.view('search', state)}
    items={U.view('items', state)}
  />,
  document.getElementById('root')
)
