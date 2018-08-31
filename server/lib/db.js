import config from './config'
import path from 'path'
import * as R from 'ramda'
import camelizeColumnNames from './camelize-column-names'
import pgPromise from 'pg-promise'

export const pgp = pgPromise({
  receive: (data) => {
    camelizeColumnNames(data)
  }
})

export const db = pgp(config.DATABASE_URL)

export const sql = R.memoize((file) => {
  const filePath = path.join(__dirname, '..', 'sql', file)
  const queryFile = new pgp.QueryFile(filePath, { minify: true })
  if (queryFile.error) {
    throw queryFile.error
  } else {
    return queryFile
  }
})
