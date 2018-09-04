import 'dotenv/config'
import { db, pgp } from '../lib/db'

const topicSnapshotId = process.argv[2]

db.oneOrNone(
  `SELECT message
     FROM topic_snapshot
    WHERE id = $1`,
  [topicSnapshotId]
)
.then(({ message }) => {
  console.log(message)
})
.finally(() => {
  pgp.end()
})
