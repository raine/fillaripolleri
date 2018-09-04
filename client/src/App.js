import * as React from 'karet'
import * as U from 'karet.util'
import * as R from 'kefir.ramda'
import Search from './Search'
import Items from './Items'

import style from './App.scss'

const App = ({ search, items }) => {
  return (
    <div className={style.appContainer}>
      <Search search={search} />
      <Items items={items} />
    </div>
  )
}

export default App
