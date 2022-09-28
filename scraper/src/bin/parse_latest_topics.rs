use eyre::Result;
use fallible_iterator::FallibleIterator;
use fillaripolleri_scraper::config::*;
use fillaripolleri_scraper::item::*;
use fillaripolleri_scraper::setup::*;
use fillaripolleri_scraper::topic::TopicWithSnapshots;
use postgres::types::ToSql;
use postgres::{Client, NoTls};
use rayon::prelude::*;
use std::time::Instant;

const NO_PARAMS: Vec<&dyn ToSql> = Vec::new();

fn main() -> Result<()> {
    setup()?;
    let config = get_config();
    let mut conn =
        Client::connect(&config.database_url, NoTls).expect("failed connecting to the database");

    let query = conn.prepare(
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
         GROUP BY t.guid
         ",
    )?;

    let start = Instant::now();
    conn.query_raw(&query, NO_PARAMS)?
        .iterator()
        .par_bridge()
        .for_each(|res| {
            let topic = TopicWithSnapshots::from(res.unwrap());
            let item = Item::from(&topic);
            print_row(&topic, &item);
        });

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
