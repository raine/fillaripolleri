import * as L from 'partial.lenses'
import * as R from 'ramda'
import queryStream from '../lib/query-stream'
import { processTopic, sanitizeTopicRow } from '../lib/topic'
import { upsertItems } from '../lib/item'
import * as K from 'kefir'
import snakeCase from 'lodash.snakecase'
import log from './logger'

const snakefyKeys = L.modify(L.keys, snakeCase)

// Takes a query that returns topics in the typical structure
const processTopicsWithQuery = (query) =>
  queryStream(query)
    .map(
      R.pipe(
        sanitizeTopicRow,
        processTopic,
        snakefyKeys
      )
    )
    .bufferWithCount(100)
    .onValue((items) => log.info(`upserting ${items.length} items`))
    .flatMapConcat((items) => K.fromPromise(upsertItems(items)))

export default processTopicsWithQuery
