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
const search = U.variable()

// const search = U.thru(
//   params,
//   R.prop('search')
// )

// const debouncedSearch = U.debounce(300, search)

// debouncedSearch
//   .onValue(q => params.modify(
//     q ? R.assoc('search', q) : R.dissoc('search')
//   ))

// const isWindowScrolledToBottom = () =>
//   window.innerHeight + window.scrollY >= document.body.offsetHeight

// const shouldLoadMore = U.thru(
//   scroll,
//   U.mapValue(isWindowScrolledToBottom),
//   U.skipUnless((x) => x),
//   U.skipFirst(1),
//   U.throttle(1000)
// )

const items = U.atom([])

// const s = () =>
//   U.thru(
//     debouncedSearch,
//     U.flatMapLatest(s => fetchItems({ s })),
//     U.mapValue(U.set(items))
//   )

// const loadLoop = () =>
//   U.serially([
//     U.thru(
//       Giphy.random(U.takeFirst(1, apiKey)),
//       R.tap(image => images.modify(R.concat(R.__, image)))
//     ),
//     U.lazy(loadLoop)
//   ])

// const loadMore = () =>
//   U.thru(
//     fetchItems({ s: search.get(), after_id: 123 }),
//     U.mapValue((moreItems) => items.modify(R.concat(R.__, moreItems)))
//   )

// const loadMoreEffect = U.when(shouldLoadMore, U.sink(loadMore()))

ReactDOM.render(
  <React.Fragment>
    <App
      search={search}
      items={items}
      params={params}
    />
  </React.Fragment>,
  document.getElementById('root')
)
