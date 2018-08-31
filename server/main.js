import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import log from './lib/logger'
import config from './lib/config'
import { db, sql } from './lib/db'
import processItem from './lib/process-item'

const app = express()
const port = config.PORT

app.use(cors())

const asyncRoute = (fn) => (req, res, next) =>
  fn(req, res, next).catch(next)

app.get('/items', asyncRoute((req, res, next) =>
  db.any(sql('topics.sql'))
    .then((items) => items.map(processItem))
    .then((items) => res.json(items))
))

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

app.listen(port, () => {
  log.info(`Listening at ${port}`)
})
