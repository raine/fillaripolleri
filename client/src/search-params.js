import * as qs from 'querystring'
import * as L from 'partial.lenses'
import * as R from 'ramda'

const parse = R.pipe(
  R.replace(/^\?/, ''),
  qs.parse
)

const format = R.pipe(
  qs.stringify,
  (x) => x !== '' ? `?${x}` : ''
)

export default L.iso(parse, format)
