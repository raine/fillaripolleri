use crate::types::*;
use chrono::{DateTime, Utc};
use feed_rs::model::Feed;
use lazy_static::lazy_static;
use postgres::Row;
use regex::Regex;
use serde_derive::{Deserialize, Serialize};

pub mod db;
pub mod page;

pub use db::*;

pub use self::page::TopicTag;

/// Represents a topic parsed from RSS feed XML. Saved to database as topic and topic_snapshot.
/// Single topic may have multiple snapshots. New snapshots is created every time FeedTopic for
/// specific topic contains unseen subject and message.
#[derive(Debug)]
pub struct FeedTopic {
    pub guid: Guid,
    pub category_id: CategoryId,
    pub date: DateTime<Utc>,
    pub link: String,
    pub subject: String,
    pub message: String,
}

#[derive(Debug)]
pub struct Topic {
    pub guid: Guid,
    pub category_id: CategoryId,
    pub date: DateTime<Utc>,
    pub tag: Option<TopicTag>,
}

impl From<Row> for Topic {
    fn from(row: Row) -> Self {
        Self {
            guid: row.get("guid"),
            date: row.get("date"),
            category_id: row.get("category_id"),
            tag: row.get("tag"),
        }
    }
}

#[derive(Debug, Deserialize, Serialize, PartialEq, Eq)]
pub struct TopicSnapshot {
    pub id: i32,
    pub guid: Guid,
    pub link: String,
    pub subject: String,
    pub message: String,
    pub created_at: DateTime<Utc>,
}

/// Struct for topic with all of its snapshots as retrieved from the database. These are parsed to
/// Items which contain information such as price and location.
#[derive(Debug, Serialize, Deserialize)]
pub struct TopicWithSnapshots {
    pub guid: Guid,
    pub category_id: CategoryId,
    pub date: DateTime<Utc>,
    pub tag: Option<TopicTag>,
    pub created_at: DateTime<Utc>,
    pub snapshots: Vec<TopicSnapshot>,
}

impl From<Row> for TopicWithSnapshots {
    fn from(row: Row) -> Self {
        Self {
            guid: row.get("guid"),
            created_at: row.get("created_at"),
            date: row.get("date"),
            tag: row.get("tag"),
            category_id: row.get("category_id"),
            snapshots: serde_json::from_value(row.get("snapshots"))
                .expect("snapshots column should contain valid json"),
        }
    }
}

pub fn parse_topics_from_feed(feed: &Feed) -> Vec<FeedTopic> {
    let category_id = parse_category_id_from_feed(feed);
    let topics: Vec<FeedTopic> = feed
        .entries
        .iter()
        .map(|entry| {
            let guid = entry.id.parse().expect("guid should be integer");
            let date = entry
                .published
                .expect("feed item should have published date");
            let link = entry
                .links
                .get(0)
                .expect("feed item should have a link")
                .href
                .clone();
            let subject = entry
                .title
                .as_ref()
                .expect("feed item should have title")
                .content
                .clone();
            let mut message = entry
                .summary
                .as_ref()
                .expect("feed item should have summary")
                .content
                .clone();

            // The previous node.js version of the scraper produces messages that don't have a
            // trailing new-line. To be backward compatible with the current data, and not have
            // database get duplicated with snapshots with only newline added, removing trailing
            // new line here.
            if message.ends_with('\n') {
                message.truncate(message.len() - 1);
            }

            FeedTopic {
                category_id,
                guid,
                date,
                link,
                subject,
                message,
            }
        })
        .collect();

    topics
}

pub fn parse_category_id_from_feed(feed: &Feed) -> CategoryId {
    lazy_static! {
        static ref RE: Regex = Regex::new(r"https://www.fillaritori.com/forum/(\d+)-.*").unwrap();
    }

    let link_href = &feed
        .links
        .get(0)
        .expect("feed should contain link to forum")
        .href;
    let caps = RE.captures(link_href).unwrap();
    let id = caps
        .get(1)
        .expect("id should exist in url")
        .as_str()
        .parse::<i32>()
        .expect("id should be an integer");

    id
}
