use eyre::Result;
use fillaripolleri_scraper::config::*;
use fillaripolleri_scraper::item::Item;
use fillaripolleri_scraper::setup::*;
use fillaripolleri_scraper::topic::get_latest_topics_with_snapshots;
use postgres::{Client, NoTls};

fn main() -> Result<()> {
    setup()?;
    let config = get_config();
    let mut conn =
        Client::connect(&config.database_url, NoTls).expect("failed connecting to the database");

    let topics = get_latest_topics_with_snapshots(&mut conn, "7 days")?;
    for topic in topics {
        let item = Item::from(&topic);
        dbg!(item);
    }
    Ok(())
}
