import '../public/reboot.css'
import '../public/main.scss'

import * as React from 'karet'
import * as ReactDOM from 'react-dom'
import * as R from 'kefir.ramda'
import * as U from 'karet.util'
import * as L from 'partial.lenses'
import { location, scroll } from './window'
import searchParamsL from './search-params'
import App from './App'

const params = U.view(['search', searchParamsL], location)
const items = U.atom([])
const state = U.atom({
  searchQuery: '',
  category: '',
  lastPage: false
})

state.log()

ReactDOM.render(
  <React.Fragment>
    <App
      items={items}
      params={params}
      searchQuery={U.view('searchQuery', state)}
      category={U.view('category', state)}
      lastPage={U.view('lastPage', state)}
    />
  </React.Fragment>,
  document.getElementById('root')
)
