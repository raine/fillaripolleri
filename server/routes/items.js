import { Router } from 'express'
import * as L from 'partial.lenses'
import * as R from 'ramda'
import { db, pgp, sql } from '../lib/db'
import asyncRoute from '../lib/async-route'
import { processTopic, findLastUnsoldSnapshot } from '../lib/topic'
import camelCase from 'lodash.camelcase'
import { DateTime } from 'luxon'

const router = new Router()

const camelizeKeys = L.modify(L.keys, camelCase)
const snapshotsL = ['snapshots', L.elems]
const removeSnapshotMessages = L.set([snapshotsL, 'message'], undefined)
const camelizeSnapshotKeys = L.modify(snapshotsL, camelizeKeys)
const parseSnapshotDates = L.modify([snapshotsL, 'createdAt'], DateTime.fromISO)
const dateToDateTime = L.modify('date', DateTime.fromJSDate)

const sanitizeTopicRow = R.pipe(
  camelizeSnapshotKeys,
  removeSnapshotMessages,
  parseSnapshotDates,
  dateToDateTime
)

router.get(
  '/',
  asyncRoute((req, res, next) => {
    const search = req.query.s
    const query = sql('latest_topics.sql')
    const where = search
      ? pgp.as.format('WHERE subject ILIKE $1', [`%${search}%`])
      : ''

    return db
      .any(query, { where })
      .then(
        R.map(
          R.pipe(
            sanitizeTopicRow,
            processTopic
          )
        )
      )
      .then((items) => {
        res.json(items)
      })
  })
)

export default router
