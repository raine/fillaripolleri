import * as qs from 'querystring'
import * as L from 'partial.lenses'
import * as R from 'ramda'
import * as U from 'karet.util'

const parse = R.when(
  R.is(String),
  R.pipe(
    R.replace(/^\?/, ''),
    qs.parse
  )
)

const format = R.when(
  R.is(Object),
  R.pipe(
    qs.stringify,
    (x) => (x !== '' ? `?${x}` : '')
  )
)

export default L.iso(parse, format)
