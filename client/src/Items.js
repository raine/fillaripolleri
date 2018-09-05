import * as React from 'karet'
import * as U from 'karet.util'
import * as R from 'kefir.ramda'

import Item from './Item'

const Items = ({ items }) => (
  <div className="items">
    {U.mapElemsWithIds(
      'id',
      (item, id) => {
        const { category, title, timestamp, link, price, sold } = U.destructure(item)
        return <Item key={id} {...{
          id,
          category,
          title,
          timestamp,
          link,
          price,
          sold
        }} />
      },
      items
    )}
  </div>
)

export default Items
