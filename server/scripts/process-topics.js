import 'dotenv/config'
import log from '../lib/logger'
import * as L from 'partial.lenses'
import * as R from 'ramda'
import { pgp, sql } from '../lib/db'
import queryStream from '../lib/query-stream'
import { processTopic, sanitizeTopicRow } from '../lib/topic'
import { upsertItems } from '../lib/item'
import * as K from 'kefir'
import snakeCase from 'lodash.snakecase'

const snakefyKeys = L.modify(L.keys, snakeCase)

queryStream(pgp.as.format(sql('topics.sql'), { where: '' }))
  .map(
    R.pipe(
      sanitizeTopicRow,
      processTopic,
      snakefyKeys
    )
  )
  .bufferWithCount(100)
  .flatMapConcat((items) => K.fromPromise(upsertItems(items)))
  .onError((err) => {
    log.error(err)
  })
  .onEnd(() => {
    pgp.end()
  })
