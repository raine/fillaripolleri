import { Router } from 'express'
import * as R from 'ramda'
import { db, pgp, sql } from '../lib/db'
import asyncRoute from '../lib/async-route'

const router = new Router()

// const removeSnapshotMessages = L.set([snapshotsL, 'message'], '[REDACTED]')

const whereTitleLike = (str) =>
  pgp.as.format('title ILIKE $1', [`%${str}%`])

const whereIdIs = (id) => pgp.as.format('i.id = $1', id)
const whereIdLt = (id) => pgp.as.format('i.id < $1', id)

const whereCategoryIdEq = (category) =>
  pgp.as.format('i.category_id = $1', category)

const and = (conds) => conds.filter((x) => x).join(' AND ')
const formatWhere = (conds) => (conds ? `WHERE ${conds}` : '')

const PAGE_SIZE = 50

router.get(
  '/',
  asyncRoute((req, res) => {
    const search = req.query.s
    const category = req.query.category
    const afterId = req.query.after_id
    const id = req.query.id
    const query = sql('latest_items.sql')
    const where = formatWhere(
      and([
        search ? whereTitleLike(search) : null,
        category ? whereCategoryIdEq(category) : null,
        afterId ? whereIdLt(afterId) : null,
        id ? whereIdIs(id) : null
      ])
    )

    return db
      .any(query, { where, limit: PAGE_SIZE + 1 })
      .then((items) => {
        const init = R.take(PAGE_SIZE, items)
        const isLastPage = items.length < PAGE_SIZE
        res.json({ items: init, isLastPage })
      })
  })
)

export default router
