use eyre::Result;
use fillaripolleri_scraper::config::*;
use fillaripolleri_scraper::setup::*;
use fillaripolleri_scraper::topic::*;
use postgres::{Client, NoTls};
use std::env;

fn main() -> Result<()> {
    setup()?;
    let guid: i32 = env::args().last().unwrap().parse()?;
    let config = get_config();
    let mut conn =
        Client::connect(&config.database_url, NoTls).expect("failed connecting to the database");

    let query = "
        SELECT t.guid,
               t.category_id,
               t.date,
               t.created_at,
               jsonb_agg(ts.* ORDER BY ts.id) AS snapshots
          FROM topic t
          JOIN topic_snapshot ts
            ON ts.guid = t.guid
         WHERE t.guid = $1
         GROUP BY t.guid
        ";

    let topic = TopicWithSnapshots::from(conn.query_one(query, &[&guid])?);
    // let toml = toml::to_string(&topic).unwrap();
    println!("{:#?}", topic);
    Ok(())
}
