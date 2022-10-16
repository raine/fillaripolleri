use eyre::Result;
use fillaripolleri_scraper::config::*;
use fillaripolleri_scraper::feed::*;
use fillaripolleri_scraper::http::HttpClient;
use fillaripolleri_scraper::item::*;
use fillaripolleri_scraper::job::*;
use fillaripolleri_scraper::setup::*;
use fillaripolleri_scraper::topic::page::{fetch_topic_page_tag, TopicTag};
use fillaripolleri_scraper::topic::*;
use postgres::{Client, NoTls};
use tracing::*;

macro_rules! unwrap_topic_tag_or_return {
    ($e:expr) => {
        match $e {
            Ok(tag) => tag,
            Err(err) => {
                error!("failed to get topic tag: {err}");
                return Ok(());
            }
        }
    };
}

fn handle_feed_topic(
    http: &mut HttpClient,
    conn: &mut Client,
    feed_topic: &FeedTopic,
) -> Result<()> {
    if let Some(topic) = get_topic_by_guid(conn, feed_topic.guid)? {
        match topic.tag {
            Some(TopicTag::WantToBuy) | Some(TopicTag::Bought) => {
                info!(?topic, "skipping a known buy listing");
                return Ok(());
            }
            // Topic exists in db with tag, do nothing.
            Some(_) => {}
            // Topic exists in db without a tag, update tag.
            // This path applies to topics created in past before tags became a thing.
            None => {
                info!(?topic, "existing topic without tag, fetching tag");
                let tag = unwrap_topic_tag_or_return!(fetch_topic_page_tag(http, &feed_topic.link));
                update_topic_tag(conn, &topic.guid, &tag)?;
                info!(?topic.guid, "topic tag updated");
            }
        }
    } else {
        let tag = unwrap_topic_tag_or_return!(fetch_topic_page_tag(http, &feed_topic.link));
        if let Some(topic) = create_topic(conn, feed_topic, &tag)? {
            info!(?topic, "topic created");
        }

        // Add want-to-buy listings to database (above) so that they can be skipped in future, but
        // don't create topic snapshots for them.
        if tag == TopicTag::WantToBuy || tag == TopicTag::Bought {
            return Ok(());
        }
    }

    if create_topic_snapshot(conn, feed_topic)? {
        let topic_with_snapshots = get_topic_with_snapshots(conn, &feed_topic.guid)?
            .expect("this query should always return something");
        let item = NewItem::from(&topic_with_snapshots);
        upsert_item(conn, &item)?;
    }

    Ok(())
}

fn main() -> Result<()> {
    setup()?;
    let config = get_config();
    info!("fillaripolleri scraper started");
    let mut http = HttpClient::new();
    let mut conn =
        Client::connect(&config.database_url, NoTls).expect("failed connecting to the database");

    let job = create_job(&mut conn)?;
    for feed_url in FEED_URLS {
        let feed = fetch_feed(&mut http, feed_url).unwrap();
        let feed_topics = parse_topics_from_feed(&feed);
        for feed_topic in feed_topics {
            handle_feed_topic(&mut http, &mut conn, &feed_topic)?;
        }

        info!(feed_url, "feed processed");
    }

    mark_job_finished(&mut conn, job.id)?;
    info!("scraping feeds completed");
    Ok(())
}
