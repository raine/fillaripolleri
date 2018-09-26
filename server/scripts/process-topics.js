import 'dotenv/config'
import log from '../lib/logger'
import { pgp, sql } from '../lib/db'
import processTopicsWithQuery from '../lib/process-topics'
import * as R from 'ramda'
import * as L from 'partial.lenses'

const whereIdIs = (id) => pgp.as.format('t.guid = $1', id)
const whereIdLt = (id) => pgp.as.format('t.guid < $1', id)
const formatWhere = (conds) => (conds ? `WHERE ${conds}` : '')

processTopicsWithQuery(pgp.as.format(sql('topics.sql'), {
  // where: `WHERE ${whereIdLt(129733)}`
  // where: `WHERE ${whereIdIs(128891)}`
  where: ``
}))
.onError((err) => {
  log.error(err)
  process.exit(1)
})
.onEnd(() => {
  log.info('done')
  pgp.end()
})
