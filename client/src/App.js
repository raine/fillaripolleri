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

const spy = (label, o) => {
  o.spy(label)
  return o
}

const App = ({ search, items, isLastPage }) => {
  const searchQuery = U.view('query', search)
  const searchCategory = U.view('category', search)
  const debouncedSearch = U.debounce(300, searchQuery)
  const hasItems = R.gt(R.length(items), 0)
  const scrolledNearBottom = R.lte(
    E.offsetHeight(document.body),
    R.add(300, R.add(W.innerHeight, W.scrollY))
  )

  const lastItemIdL = [L.last, 'id']
  const lastItemId = U.view(lastItemIdL, items)
  const all = R.reduce(R.and, true)
  const needMore = all([
    hasItems,
    R.not(isLastPage),
    U.skipFirst(1, scrolledNearBottom)
  ])

  const modifySearchParamsEffect = ({ searchQuery, searchCategory }) => {
    isLastPage.set(false)
  }

  const fetchAndUpdateItems = (s) =>
    U.thru(
      fetchJSON('/items', { s }),
      U.consume((res) =>
        U.holding(() => {
          items.set(res.items)
          isLastPage.set(res.isLastPage)
        })
      )
    )

  const getSearchedItems = U.thru(
    U.template({
      searchQuery: debouncedSearch,
      searchCategory
    }),
    U.skipFirst(1),
    U.flatMapLatest(({ searchQuery, searchCategory }) =>
      fetchJSON('/items', {
        s: searchQuery,
        category: searchCategory
      })
    ),
    U.consume((res) =>
      U.holding(() => {
        items.set(res.items)
        isLastPage.set(res.isLastPage)
      })
    )
  )

  const fetchInitialItemsEffect = U.thru(
    searchQuery,
    U.takeFirst(1),
    U.flatMapLatest(fetchAndUpdateItems)
  )

  const loadNextPage = () =>
    U.thru(
      U.template({ searchQuery, lastItemId, searchCategory }),
      U.takeFirst(1),
      U.flatMapLatest(({ searchQuery, lastItemId, searchCategory }) =>
        fetchJSON('/items', {
          s: searchQuery,
          after_id: lastItemId,
          category: searchCategory
        })
      )
    )

  const loadMore = () =>
    U.serially([
      U.delay(0, U.takeFirst(1, loadNextPage())),
      U.flatMapLatest(loadMore, U.toObservable())
    ])

  const loadMoreEffect = U.when(
    needMore,
    U.thru(
      loadMore(),
      U.consume((res) =>
        U.holding(() => {
          items.modify(R.concat(R.__, res.items))
          isLastPage.set(res.isLastPage)
        })
      )
    )
  )

  return (
    <div className={style.appContainer}>
      <Search query={searchQuery} category={searchCategory} />
      <Items
        {...{
          items,
          searchCategory,
          isLastPage
        }}
      />
      {U.consume(
        modifySearchParamsEffect,
        U.skipFirst(
          1,
          U.template({
            searchQuery: debouncedSearch,
            searchCategory
          })
        )
      )}

      {U.sink(getSearchedItems)}
      {U.sink(fetchInitialItemsEffect)}
      {loadMoreEffect}
      {U.sink(needMore)}
    </div>
  )
}

export default App
