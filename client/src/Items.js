import * as React from 'karet'
import * as U from 'karet.util'
import * as R from 'kefir.ramda'

import style from './Items.scss'

import Item from './Item'

const Items = ({ items, searchCategory, isLastPage }) => {
  const endOfListText = U.ifElse(R.and(isLastPage, R.isEmpty(items)), 'No results', 'End of the list')

  return (
    <div className={style.items}>
      {U.mapElemsWithIds(
        'id',
        (item, id) => {
          const { category, categoryId, title, timestamp, link, price, sold, location } = U.destructure(item)
          return <Item key={id} {...{
            id,
            category,
            categoryId,
            title,
            timestamp,
            link,
            price,
            sold,
            location,

            searchCategory
          }} />
        },
        items
      )}
      {U.when(
        isLastPage,
        <div className={style.endOfResults}>
          <span className={style.box}>
            {endOfListText}
          </span>
        </div>
      )}
    </div>
  )
}

export default Items
