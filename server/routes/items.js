import { Router } from 'express'
import * as L from 'partial.lenses'
import * as R from 'ramda'
import { db, pgp, sql } from '../lib/db'
import asyncRoute from '../lib/async-route'
import { processTopic } from '../lib/topic'
import log from '../lib/logger'

const router = new Router()

// const removeSnapshotMessages = L.set([snapshotsL, 'message'], '[REDACTED]')

const whereSubjectLike = (str) =>
  pgp.as.format('subject ILIKE $1', [`%${str}%`])

const whereGuidIs = (id) => pgp.as.format('t.guid = $1', id)
const whereGuidLt = (id) => pgp.as.format('t.guid < $1', id)

const whereCategoryIdEq = (category) =>
  pgp.as.format('t.category_id = $1', category)

const and = (conds) => conds.filter((x) => x).join(' AND ')
const formatWhere = (conds) => (conds ? `WHERE ${conds}` : '')

const PAGE_SIZE = 50

router.get(
  '/',
  asyncRoute((req, res, next) => {
    const search = req.query.s
    const category = req.query.category
    const afterId = req.query.after_id
    const id = req.query.id
    const query = sql('latest_topics.sql')
    const where = formatWhere(
      and([
        search ? whereSubjectLike(search) : null,
        category ? whereCategoryIdEq(category) : null,
        afterId ? whereGuidLt(afterId) : null,
        id ? whereGuidIs(id) : null
      ])
    )

    return db
      .any(query, { where, limit: PAGE_SIZE + 1 })
      .then((topics) => {
        const init = R.take(PAGE_SIZE, topics)
        const isLastPage = topics.length < PAGE_SIZE
        const items = R.pipe(
          R.map(
            R.pipe(
              sanitizeTopicRow,
              // R.tap((t) => log.debug(t, 'processing topic')),
              processTopic,
              // R.tap((t) => log.debug(t, 'processed topic'))
            )
          ),
          R.filter(L.get(['title', R.length, (x) => x >= 5]))
        )(init)

        res.json({ items, isLastPage })
      })
  })
)

export default router
