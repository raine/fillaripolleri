import * as React from 'karet'
import * as U from 'karet.util'
import * as R from 'kefir.ramda'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'

import style from './Item.scss'

TimeAgo.locale(en)

const ONE_HOUR = 3600 * 1000

const timeAgo = new TimeAgo('en-US')
const parseDate = U.lift((str) => new Date(str))
const formatDate = U.lift((date) => timeAgo.format(date, 'twitter'))

const Time = ({ isoDate }) => (
  <time title={isoDate} dateTime={isoDate}>
    {formatDate(parseDate(isoDate))}
  </time>
)

const isNew = R.pipe(
  parseDate,
  (x) => Date.now() - x.getTime() < ONE_HOUR
)

const Item = ({ title, category, timestamp, link, price, sold, location }) => (
  <div className={style.item}>
    <div className={style.title}>
      <a href={link} rel="noreferrer">
        {title}
      </a>
    </div>
    <div className={style.subtitle}>
      <ul>
        <li
          className={U.cns(
            style.timestamp,
            U.when(isNew(timestamp), style.isNew)
          )}
        >
          <Time isoDate={timestamp} />
        </li>
        <li className={style.category}>{category}</li>
        {U.when(price, <li className={style.price}>{price}€</li>)}
        {U.when(location, <li className={style.location}>{location}</li>)}
      </ul>
    </div>
  </div>
)

export default Item
