#![allow(dead_code, unused_imports, unused_variables)]
use eyre::Result;
use postgres::{Client, NoTls};
use setup::*;
use std::env;
use topic::*;
use tracing::*;

mod config;
mod setup;
mod topic;
mod types;

fn main() -> Result<()> {
    setup()?;
    let guid: i32 = env::args().last().unwrap().parse()?;
    let config = config::get_config();
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
         ORDER BY guid DESC
        ";

    let topic = TopicWithSnapshots::from(conn.query_one(query, &[&guid])?);
    let toml = toml::to_string(&topic).unwrap();
    println!("{}", toml);
    Ok(())
}
