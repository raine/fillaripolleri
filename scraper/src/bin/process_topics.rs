use deadpool_postgres::Pool;
use eyre::Result;
use fillaripolleri_scraper::config::*;
use fillaripolleri_scraper::item::*;
use fillaripolleri_scraper::setup::*;
use fillaripolleri_scraper::topic::TopicWithSnapshots;
use par_stream::prelude::*;
use postgres_types::ToSql;
use std::str::FromStr;
use std::time::Instant;
use tokio_postgres::Config;

const NO_PARAMS: Vec<&dyn ToSql> = Vec::new();

#[tokio::main]
async fn main() -> Result<()> {
    setup()?;
    let config = get_config();
    let pg_config = Config::from_str(&config.database_url)?;
    let manager = deadpool_postgres::Manager::new(pg_config, tokio_postgres::NoTls);
    let pool = Pool::builder(manager).build()?;

    let conn = pool.get().await.unwrap();
    let query = conn
        .prepare(
            "
            SELECT t.guid,
                   t.category_id,
                   t.date,
                   t.created_at,
                   t.tag,
                   jsonb_agg(ts.* ORDER BY ts.id) AS snapshots
              FROM topic t
              JOIN topic_snapshot ts
                ON ts.guid = t.guid
             WHERE t.date >= '2020-01-13 00:00:00.000000+02'
               AND ((t.tag IS DISTINCT FROM 'WantToBuy'
                 AND t.tag IS DISTINCT FROM 'Bought'))
             GROUP BY t.guid
            ",
        )
        .await?;

    let start = Instant::now();
    let row_stream = conn.query_raw(&query, NO_PARAMS).await?;
    row_stream
        .try_par_map(None, |row| {
            move || {
                let topic = TopicWithSnapshots::from(row);
                let item = Item::from(&topic);
                Ok((topic, item))
            }
        })
        .try_par_for_each(None, |(topic, item)| async move {
            print_row(&topic, &item);
            Ok(())
        })
        .await?;

    println!("took {:?}", start.elapsed());
    Ok(())
}

fn print_row(topic: &TopicWithSnapshots, item: &Item) {
    println!(
        "{} {} {} {}",
        item.timestamp,
        item.id,
        topic.snapshots.len(),
        item.title
    );
}
