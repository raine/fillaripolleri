import 'dotenv/config'
import log from '../lib/logger'
import { pgp, sql } from '../lib/db'
import processTopicsWithQuery from '../lib/process-topics'

processTopicsWithQuery(pgp.as.format(sql('topics.sql'), { where: '' }))
  .onError((err) => {
    log.error(err)
  })
  .onEnd(() => {
    log.info('done')
    pgp.end()
  })
