use eyre::Result;
use tracing::*;

use super::Item;

pub fn upsert_item(client: &mut postgres::Client, item: &Item) -> Result<()> {
    client.execute("
        INSERT INTO item (id, timestamp, category_id, title, title_tsvector, link, sold, price, location)
        VALUES ($1, $2, $3, $4, to_tsvector('finnish', $5), $6, $7, $8, $9)
        ON CONFLICT (id)
        DO UPDATE SET (title, title_tsvector, link, sold, price, location, updated_at) = (
          EXCLUDED.title,
          EXCLUDED.title_tsvector,
          EXCLUDED.link,
          EXCLUDED.sold,
          EXCLUDED.price,
          EXCLUDED.location,
          NOW()
        )
    ", &[
        &item.id,
        &item.timestamp,
        &item.category_id,
        &item.title,
        &item.title,
        &item.link,
        &item.sold,
        &item.price,
        &item.location
    ])?;

    info!(?item, "item upserted");
    Ok(())
}
