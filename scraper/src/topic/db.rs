use crate::types::*;
use eyre::Result;
use postgres::types::Type;
use tracing::*;

use super::{page::TopicTag, FeedTopic, Topic, TopicWithSnapshots};

pub fn get_topic_by_guid(client: &mut postgres::Client, guid: Guid) -> Result<Option<Topic>> {
    let row = client.query_opt("SELECT * FROM topic WHERE guid = $1", &[&guid])?;
    Ok(row.map(Topic::from))
}

pub fn create_topic(
    client: &mut postgres::Client,
    topic: &FeedTopic,
    tag: &TopicTag,
) -> Result<Option<Topic>> {
    let mut tx = client.transaction()?;
    let maybe_topic = match tx.query_opt("SELECT 1 FROM topic WHERE guid = $1", &[&topic.guid])? {
        Some(_) => None,
        None => Some(
            tx.query_one(
                "
                    INSERT INTO topic (category_id, guid, date, tag)
                    VALUES ($1, $2, $3, $4)
                    RETURNING *
                    ",
                &[&topic.category_id, &topic.guid, &topic.date, &tag],
            )
            .map(Topic::from)?,
        ),
    };
    tx.commit()?;
    Ok(maybe_topic)
}

pub fn update_topic_tag(client: &mut postgres::Client, guid: &Guid, tag: &TopicTag) -> Result<()> {
    client.execute("UPDATE topic SET tag = $1 WHERE guid = $2", &[&tag, &guid])?;
    Ok(())
}

pub fn create_topic_snapshot(client: &mut postgres::Client, topic: &FeedTopic) -> Result<bool> {
    let mut tx = client.transaction()?;
    let row = tx.query_opt(
        "
        SELECT *
          FROM topic_snapshot
         WHERE guid = $1
           AND subject = $2
           AND message = $3
        ",
        &[&topic.guid, &topic.subject, &topic.message],
    )?;
    let mut created = false;
    if row.is_none() {
        info!(topic.guid, "creating a new topic_snapshot");
        tx.execute(
            "
            INSERT INTO topic_snapshot (guid, link, subject, message)
            VALUES ($1, $2, $3, $4)
            ",
            &[&topic.guid, &topic.link, &topic.subject, &topic.message],
        )?;
        created = true;
    }
    tx.commit()?;
    Ok(created)
}

pub fn get_topic_with_snapshots(
    client: &mut postgres::Client,
    guid: &Guid,
) -> Result<Option<TopicWithSnapshots>> {
    let stmt = client.prepare_typed(
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
         WHERE t.guid = $1
         GROUP BY t.guid
        ",
        &[Type::INT4],
    )?;

    let maybe_row = client.query_opt(&stmt, &[&guid])?;
    Ok(maybe_row.map(TopicWithSnapshots::from))
}
