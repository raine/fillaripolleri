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

db.stream(
  new QueryStream(
    pgp.as.format(sql('topics.sql'), { where: '' })
  ),
  (stream) => {
    fromNodeStream(toReadable(stream))
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
  })
