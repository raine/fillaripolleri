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

const items = U.atom([])
const state = U.atom({
  search: {
    query: '',
    category: ''
  },
  isLastPage: false
})

state.log()

ReactDOM.render(
  <App
    items={items}
    search={U.view('search', state)}
    category={U.view('category', state)}
    isLastPage={U.view('isLastPage', state)}
  />,
  document.getElementById('root')
)
