use eyre::Result;
use tracing::*;

use super::Item;

pub fn make_upsert_item_stmt(
    client: &mut postgres::Client,
) -> Result<postgres::Statement, postgres::Error> {
    client.prepare("
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
        ")
}

pub fn exec_upsert_item_stmt(
    client: &mut postgres::Client,
    stmt: &postgres::Statement,
    item: &Item,
) -> Result<()> {
    client.execute(
        stmt,
        &[
            &item.id,
            &item.timestamp,
            &item.category_id,
            &item.title,
            &item.title,
            &item.link,
            &item.sold,
            &item.price,
            &item.location,
        ],
    )?;
    Ok(())
}

pub fn upsert_item(client: &mut postgres::Client, item: &Item) -> Result<()> {
    let stmt = make_upsert_item_stmt(client)?;
    exec_upsert_item_stmt(client, &stmt, item)?;
    info!(?item, "item upserted");
    Ok(())
}
