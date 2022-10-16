use eyre::Result;
use fillaripolleri_scraper::config::*;
use fillaripolleri_scraper::item::*;
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

    let topic = get_topic_with_snapshots(&mut conn, &guid)?.expect("topic with guid should exist");
    let item = NewItem::from(&topic);
    dbg!(item);
    Ok(())
}
