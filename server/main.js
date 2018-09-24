import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import log from './lib/logger'
import config from './lib/config'
import { listen, pgp, sql } from './lib/db'
import K from 'kefir'
import itemsR from './routes/items'
import compression from 'compression'
import processTopicsWithQuery from './lib/process-topics'

const app = express()
const port = config.PORT

// app.use(expressPinoLogger({ logger: log }))
app.use(cors())
app.use(compression())
app.use('/items', itemsR)

app.use((err, req, res, next) => {
  if (res.headersSent) {
    next(err)
  } else {
    log.error(err.originalError || err)
    const statusCode = err.statusCode || 500
    const errMsg = err.message || 'Unexpected error'
    log.info({ statusCode, method: req.method, path: req.path }, errMsg)
    res.status(statusCode).json({
      error: errMsg
    })
  }
})

async function main() {
  app.listen(port, () => {
    log.info(`listening at ${port}`)
  })

  ;(await listen())
    .onValue(obj => log.info(obj, 'got notification'))
    .flatMap(() =>
      processTopicsWithQuery(
        pgp.as.format(sql('latest_topics.sql'))
      )
    )
    .onValue(() => {
      log.info('done processing new topics')
    })
    .onError((err) => {
      log.error(err)
    })
}

main()
  .catch(err => {
    log.error(err)
    process.exitCode = 1
  })
