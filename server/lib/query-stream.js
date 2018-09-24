import * as K from 'kefir'
import toReadable from '../lib/to-readable'
import QueryStream from 'pg-query-stream'
import fromNodeStream from 'kefir-node-stream'
import { db } from './db'

const queryStream = (query) =>
  K.stream((emitter) =>
    db.stream(new QueryStream(query), (stream) =>
      fromNodeStream(toReadable(stream))
        .onValue((val) => emitter.emit(val))
        .onError((err) => emitter.error(err))
        .onEnd(() => emitter.end())
    )
  )

export default queryStream
