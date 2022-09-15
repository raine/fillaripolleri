use eyre::Result;
use feed_rs::model::Feed;
use feed_urls::FEED_URLS;
use job::*;
use postgres::{Client, NoTls};
use setup::*;
use std::{thread::sleep, time::Duration};
use topic::*;
use tracing::*;

mod config;
mod feed_urls;
mod item;
mod job;
mod setup;
mod topic;
mod types;

fn fetch_feed(url: &str) -> Result<Feed> {
    info!(url, "getting feed");
    let req = ureq::get(url);
    let res = req.call()?;
    let reader = res.into_reader();
    let feed = feed_rs::parser::parse(reader)?;
    Ok(feed)
}

fn main() -> Result<()> {
    setup()?;
    let config = config::get_config();
    info!("fillaripolleri scraper started");
    let mut conn =
        Client::connect(&config.database_url, NoTls).expect("failed connecting to the database");

    let job = create_job(&mut conn)?;
    for feed_url in FEED_URLS {
        let feed = fetch_feed(feed_url).unwrap();
        let topics = parse_topics_from_feed(&feed);
        let mut new_topics = 0;
        let mut new_topic_snapshots = 0;
        for topic in topics {
            if create_topic(&mut conn, &topic)? {
                new_topics += 1;
            }
            if create_topic_snapshot(&mut conn, &topic)? {
                new_topic_snapshots += 1;
            }
        }

        info!(feed_url, new_topics, new_topic_snapshots, "feed processed");
        sleep(Duration::from_secs(1))
    }

    mark_job_finished(&mut conn, job.id)?;
    info!("scraping feeds completed");
    Ok(())
}
