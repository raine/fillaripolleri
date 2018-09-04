import * as React from 'karet'
import * as U from 'karet.util'

const Search = ({ search }) =>
  <U.Input type="text" value={search} placeholder="Type to search" />

export default Search
