import * as React from 'karet'
import * as U from 'karet.util'
import * as R from 'kefir.ramda'
import Search from './Search'
import Items from './Items'
import fetchJSON from './fetch-json'

import * as W from './window'
import * as E from './element'

import style from './App.scss'

const App = ({ search, items, params }) => {
  const debouncedSearch = U.skipFirst(1, U.debounce(300, search))

  const needMore = R.lte(
    E.offsetHeight(document.body),
    R.add(300, R.add(W.innerHeight, W.scrollY))
  )

  const modifySearchParamsEffect = (q) =>
    params.modify(q ? R.assoc('search', q) : R.dissoc('search'))

  const fetchAndUpdateItems = (s) =>
    R.tap(U.set(items), fetchJSON('/items', { s }))

  const getSearchedItems =
    U.thru(
      debouncedSearch,
      U.flatMapLatest(s => fetchJSON('/items', { s })),
      U.mapValue(U.set(items))
    )

  const initSearchQueryFromParams = 
    U.thru(
      params,
      U.takeFirst(1),
      R.propOr('', 'search'),
      R.tap(x => search.set(x))
    )

  const fetchInitialItemsEffect  =
    U.thru(
      search,
      U.takeFirst(1),
      U.flatMapLatest(fetchAndUpdateItems)
    )

  return (
    <div className={style.appContainer}>
      <Search search={search} />
      <Items items={items} />

      {U.consume(modifySearchParamsEffect, debouncedSearch)}
      {U.sink(getSearchedItems)}
      {U.sink(initSearchQueryFromParams)}
      {U.sink(fetchInitialItemsEffect )}
      {/* {loadMoreEffect} */}
    </div>
  )
}

export default App

// const loadLoop = () =>
//   U.serially([
//     U.thru(
//       Giphy.random(U.takeFirst(1, apiKey)),
//       R.tap((image) => images.modify(R.concat(R.__, image)))
//     ),
//     U.lazy(loadLoop)
//   ])

// const loadEffect = U.when(needMore, U.sink(loadLoop()))
