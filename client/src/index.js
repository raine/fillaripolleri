import '../public/reboot.css'
import '../public/main.scss'

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

const API_URL = 'http://localhost:3000'

const queryStringify = L.getInverse(searchParamsL)
const params = U.view(['search', searchParamsL], location)
const search = U.atom(params.get().search || '')
const debouncedSearch = U.debounce(300, search)

debouncedSearch
  .onValue(q => params.modify(
    q ? R.assoc('search', q) : R.dissoc('search')
  ))

const items = U.thru(
  debouncedSearch,
  U.flatMapLatest((s) =>
    fetchJSON(
      `${API_URL}/items${s ? queryStringify({ s }) : ''}`
    )
  ),
  U.startWith([])
)

ReactDOM.render(
  <App
    search={search}
    items={items}
  />,
  document.getElementById('root')
)
