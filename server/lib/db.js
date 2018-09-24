import config from './config'
import path from 'path'
import * as R from 'ramda'
import camelizeColumnNames from './camelize-column-names'
import pgPromise from 'pg-promise'
import log from './logger'
import K from 'kefir'

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


let connection

const onNotification = (data) =>
  log.info({ data }, 'got notification')

const onConnectionLost = (err, e) => {
  log.error(err, 'connection lost')
  connection = null
  client.removeListener('notification', onNotification)
  reconnect(5000, 10)
    .then(() => log.info('reconnected'))
    .catch(() => {
      log.err('connection lost too many times')
      process.exit()
    })
}


let emitter
const reconnect = (delay, maxAttempts) => {
  delay = delay > 0 ? parseInt(delay) : 0
  maxAttempts = maxAttempts > 0 ? parseInt(maxAttempts) : 1
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      db.connect({ direct: true, onLost: onConnectionLost })
        .then((obj) => {
          connection = obj // global connection is now available
          resolve(obj)

          obj.client.on('notification', (data) => {
            emitter.emit(data)
          })

          connection.none('LISTEN $1~', 'job_completed').catch((err) => {
            log.info(err)
          })
        })
        .catch((err) => {
          log.error(err)
          if (--maxAttempts) {
            reconnect(delay, maxAttempts)
              .then(resolve)
              .catch(reject)
          } else {
            reject(err)
          }
        })
    }, delay)
  })
}

export const listen = () => {
  const stream = K.stream(e => {
    emitter = e
  })
  return reconnect()
    .then((obj) => {
      log.info('listening to db notifications')
      return stream
    })
    .catch((er) => {
      log.error(err, 'failed to connect')
    })
}
