import * as React from 'karet'
import * as U from 'karet.util'

import style from './Search.scss'

const Search = ({ search }) => (
  <U.Input
    className={style.search}
    type="text"
    value={search}
    placeholder="Type to search"
  />
)

export default Search
