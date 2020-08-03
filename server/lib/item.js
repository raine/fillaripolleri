import { db, pgp } from '../lib/db'

const ON_CONFLICT = `ON CONFLICT (id)
   DO UPDATE SET (title, link, frame_size_cm, frame_size_tshirt, sold, price, location) = (
      EXCLUDED.title,
      EXCLUDED.link,
      EXCLUDED.frame_size_cm,
      EXCLUDED.frame_size_tshirt,
      EXCLUDED.sold,
      EXCLUDED.price,
      EXCLUDED.location)`

const cs = new pgp.helpers.ColumnSet(
  [
    'id',
    'timestamp',
    'category_id',
    'title',
    'link',
    'frame_size_cm',
    'frame_size_tshirt',
    'sold',
    'price',
    'location'
  ],
  { table: 'item' }
)

export const upsertItems = (items) =>
  db.none(pgp.helpers.insert(items, cs) + ' ' + ON_CONFLICT)
