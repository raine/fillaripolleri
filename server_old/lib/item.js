import { db, pgp } from '../lib/db'

const ON_CONFLICT = `ON CONFLICT (id)
   DO UPDATE SET (title, title_tsvector, link, frame_size_cm, frame_size_tshirt, sold, price, location) = (
      EXCLUDED.title,
      EXCLUDED.title_tsvector,
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
    {
      name: 'title_tsvector',
      mod: '^' // format as raw text
    },
    'link',
    'frame_size_cm',
    'frame_size_tshirt',
    'sold',
    'price',
    'location'
  ],
  { table: 'item' }
)

export const upsertItems = (items) => {
  const query =
    pgp.helpers.insert(
      items.map((item) => ({
        ...item,
        title_tsvector: pgp.as.format(`to_tsvector('finnish', $1)`, item.title)
      })),
      cs
    ) +
    ' ' +
    ON_CONFLICT

  return db.none(query)
}
