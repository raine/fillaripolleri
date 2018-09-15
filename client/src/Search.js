import * as React from 'karet'
import * as U from 'karet.util'
import * as R from 'kefir.ramda'
import categories from '../categories.json'

import style from './Search.scss'

const Search = ({ query, category }) => {
  return (
    <div className={style.searchControlContainer}>
      <U.Input
        className={style.search}
        type="text"
        value={query}
        placeholder="Hae"
      />
      <U.Select className={style.categorySelect} value={category}>
        <option value={''}>Kaikki osastot</option>
        {U.thru(
          categories,
          R.map(({ id, name }) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))
        )}
      </U.Select>
    </div>
  )
}

export default Search
