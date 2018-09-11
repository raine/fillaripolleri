import * as React from 'karet'
import * as U from 'karet.util'
import * as R from 'kefir.ramda'
import * as L from 'partial.lenses'
import Search from './Search'
import Items from './Items'
import fetchJSON from './fetch-json'

import * as W from './window'
import * as E from './element'

import style from './App.scss'

import categories from '../categories.json'

const App = ({ searchQuery, category, items, params, lastPage }) => {
  const debouncedSearch = U.debounce(300, searchQuery)
  const hasItems = R.gt(R.length(items), 0)
  const scrolledNearBottom = R.lte(
    E.offsetHeight(document.body),
    R.add(300, R.add(W.innerHeight, W.scrollY))
  )

  const all = R.reduce(R.and, true)
  const needMore = all([
    hasItems,
    R.not(lastPage),
    U.skipFirst(1, scrolledNearBottom)
  ])

  const modifySearchParamsEffect = ({ search, category }) => {
    U.holding(() => {
      lastPage.set(false)
      params.modify(R.pipe(
        R.merge(R.__, { search, category }),
        R.pickBy(Boolean)
      ))
    })
  }

  const fetchAndUpdateItems = (s) =>
    R.tap(U.set(items), fetchJSON('/items', { s }))

  const getSearchedItems =
    U.thru(
      U.template({
        searchQuery: debouncedSearch,
        category
      }),
      U.skipFirst(1),
      U.flatMapLatest(({searchQuery, category}) =>
        fetchJSON('/items', {
          s: searchQuery,
          category
        })),
      U.mapValue(U.set(items))
    )

  const initSearchQueryFromParams = 
    U.thru(
      params,
      U.takeFirst(1),
      R.propOr('', 'search'),
      R.tap(x => searchQuery.set(x))
    )

  const fetchInitialItemsEffect =
    U.thru(
      searchQuery,
      U.takeFirst(1),
      U.flatMapLatest(fetchAndUpdateItems)
    ) 

  const lastItemIdL = [L.last, 'id']

  const loadLoop = () =>
    U.serially([
      U.thru(
        U.template({ searchQuery, items, category }),
        U.flatMapSerial(({ searchQuery, items, category }) =>
          fetchJSON('/items', {
            s: searchQuery,
            after_id: L.get(lastItemIdL, items),
            category 
          })),
        U.consume(moreItems => {
          U.holding(() => {
            // TODO: response could say if there is more
            if (moreItems.length < 50) lastPage.set(true)
            items.modify(R.concat(R.__, moreItems))
          })
        })
      ),
      U.lazy(loadLoop)
    ])

  const loadMoreEffect = U.when(needMore, U.sink(loadLoop()))

  return (
    <div className={style.appContainer}>
      <Search
        query={searchQuery}
        category={category}
      />
      <Items items={items} />

      {U.consume(modifySearchParamsEffect, U.skipFirst(1, U.template({
        search: debouncedSearch,
        category
      })))}

      {U.sink(getSearchedItems)}
      {U.sink(initSearchQueryFromParams)}
      {U.sink(fetchInitialItemsEffect )}
      {loadMoreEffect}
      {U.sink(U.show('needMore', needMore))}
    </div>
  )
}

export default App
