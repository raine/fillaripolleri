import * as React from 'karet'
import * as U from 'karet.util'
import * as R from 'kefir.ramda'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'

import style from './Item.scss'

TimeAgo.locale(en)

const timeAgo = new TimeAgo('en-US')
const parseDate = U.lift((str) => new Date(str))
const formatDate = U.lift((date) => timeAgo.format(date, 'twitter'))

const Time = ({ isoDate }) => (
  <time title={isoDate} dateTime={isoDate}>
    {formatDate(parseDate(isoDate))}
  </time>
)

const Item = ({ title, category, timestamp, link, price, sold }) => (
  <div className={U.cns(style.item, U.when(sold, style.sold))}>
    <div className={style.title}>
      <a href={link} rel="noreferrer">
        {title}
      </a>
    </div>
    <div className={style.subtitle}>
      <Time isoDate={timestamp} /> · {category} · {price}€
    </div>
  </div>
)

export default Item
