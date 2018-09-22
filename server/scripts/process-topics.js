import 'dotenv/config'
import log from '../lib/logger'
import * as L from 'partial.lenses'
import * as R from 'ramda'
import { pgp, db, sql } from '../lib/db'
import toReadable from '../lib/to-readable'
import QueryStream from 'pg-query-stream'
import { processTopic, sanitizeTopicRow } from '../lib/topic'
import { upsertItems } from '../lib/item'
import fromNodeStream from 'kefir-node-stream'
import * as K from 'kefir'
import snakeCase from 'lodash.snakecase'

const snakefyKeys = L.modify(L.keys, snakeCase)
const queryFileString = (qf) =>
  qf[pgp.as.ctf.toPostgres]()

const qs = new QueryStream(queryFileString(sql('topics.sql')))
db.stream(qs, (s) => {
  fromNodeStream(toReadable(s))
    .map(
      R.pipe(
        sanitizeTopicRow,
        processTopic,
        snakefyKeys,
        L.modify('title', R.toUpper)
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
})
