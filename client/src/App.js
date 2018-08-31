import * as React from 'karet'
import * as U from 'karet.util'
import * as R from 'kefir.ramda'
import Search from './Search'

import './App.scss'

const App = ({ search, items }) => {
  return (
    <div className="app-container">
      <Search search={search} />
      <div>
        {U.ifElse(
          R.is(Array, items),
          U.mapElemsWithIds(
            'id',
            (item, id) => <li key={id}>{U.view('title', item)}</li>,
            items
          ),
          'Fetching...'
        )}
      </div>
    </div>
  )
}

export default App
