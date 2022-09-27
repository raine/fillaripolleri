use crate::{html::strip_html, topic::*, types::*};
use chrono::{DateTime, Utc};
use lazy_regex::regex;
use regex::Regex;

pub mod db;
pub use db::*;

#[derive(Debug)]
/// Parsed from TopicWithSnapshots. Used in frontend as data.
pub struct Item {
    pub id: Guid,
    pub timestamp: DateTime<Utc>,
    pub category_id: CategoryId,
    pub title: String,
    pub link: String,
    pub sold: bool,
    pub price: Option<Price>,
    pub location: Option<String>,
}

impl From<&TopicWithSnapshots> for Item {
    fn from(topic: &TopicWithSnapshots) -> Self {
        let last_unsold_snapshot = get_last_unsold_snapshot(topic);
        let link = last_unsold_snapshot.link.to_owned();
        let last_snapshot_message =
            normalize_whitespace(&strip_html(&last_unsold_snapshot.message));
        let parsed_message = parse_message(&last_snapshot_message);
        let title = parse_subject(
            parsed_message.location.as_deref(),
            &last_unsold_snapshot.subject,
        );
        let sold = parse_sold(topic);

        Self {
            id: topic.guid,
            category_id: topic.category_id,
            title,
            link,
            sold,
            timestamp: topic.date,
            price: parsed_message.price,
            location: parsed_message.location,
        }
    }
}

#[derive(Debug, Default, PartialEq)]
struct ParsedMessage {
    price: Option<Price>,
    location: Option<String>,
}

fn get_capture<T>(regex: &Regex, str: &str) -> Option<T>
where
    T: std::str::FromStr,
{
    if let Some(captures) = regex.captures(str) {
        captures.get(1).and_then(|str| str.as_str().parse().ok())
    } else {
        None
    }
}

fn get_last_unsold_snapshot(topic: &TopicWithSnapshots) -> &TopicSnapshot {
    let sold_re = regex!(r"\bmyyty\b"i);
    topic
        .snapshots
        .iter()
        .filter(|s| !sold_re.is_match(&s.subject))
        .last()
        // Fallback to last snapshot in case there is no last unsold snapshot
        .unwrap_or_else(|| topic.snapshots.last().expect("topic should have snapshots"))
}

fn parse_message(message: &str) -> ParsedMessage {
    let plain_text = normalize_whitespace(&strip_html(message));
    let price: Option<Price> = get_capture(regex!(r"(?:Price|Hinta): (\d+)"), &plain_text);
    let location: Option<String> = get_capture(regex!(r"(?:City|Paikkakunta): (\w+)"), &plain_text);
    ParsedMessage { price, location }
}

fn parse_sold(topic: &TopicWithSnapshots) -> bool {
    match topic.tag {
        Some(TopicTag::Sold) | Some(TopicTag::Invalid) => true,
        Some(_) => false,
        None => false,
    }
}

fn strip_dangling_punctuation(subject: &str) -> String {
    subject.trim().trim_end_matches(',').to_string()
}

pub fn normalize_whitespace(str: &str) -> String {
    str.replace('\u{a0}', " ")
}

pub fn parse_subject(maybe_location: Option<&str>, subject: &str) -> String {
    let without_nbsp = normalize_whitespace(subject);
    let decoded = html_escape::decode_html_entities(&without_nbsp);
    let without_city = match maybe_location {
        Some(loc) => decoded.replace(&loc, ""),
        None => decoded.to_string(),
    };
    let selling_re = regex!(r"\(myydään\)"i);
    let without_selling_prefix = selling_re.replace(&without_city, "");

    strip_dangling_punctuation(&without_selling_prefix)
}

#[cfg(test)]
mod tests {
    use super::*;
    use pretty_assertions::assert_eq;
    use std::fs;

    macro_rules! parse_toml_to_topic {
        ($e:expr) => {{
            let toml = fs::read_to_string(format!("./test_data/topic_with_snapshots/{}.toml", $e))
                .unwrap();
            toml::from_str::<TopicWithSnapshots>(&toml).unwrap()
        }};
    }

    macro_rules! parse_toml_to_item {
        ($e:expr) => {{
            let topic_with_snapshots = parse_toml_to_topic!($e);
            Item::from(&topic_with_snapshots)
        }};
    }

    fn parse_toml_to_latest_snapshot_msg(guid: Guid) -> String {
        let mut topic = parse_toml_to_topic!(guid);
        topic.snapshots.pop().unwrap().message
    }

    #[test]
    fn test_parse_subject_html_entities() {
        assert_eq!(
            parse_subject(None, "Test subject with html entities &quot; &amp;"),
            r#"Test subject with html entities " &"#,
        );
    }

    #[test]
    fn test_parse_subject_remove_non_breaking_space() {
        assert_eq!(
            parse_subject(None, "Lake CX 237 Maantiekengät"),
            "Lake CX 237 Maantiekengät"
        );
    }

    #[test]
    fn test_parse_subject_remove_given_location() {
        assert_eq!(
            parse_subject(Some("Helsinki"), "Lake CX 237 Maantiekengät, Helsinki"),
            "Lake CX 237 Maantiekengät"
        );
    }

    #[test]
    fn test_parse_subject_remove_selling() {
        assert_eq!(
            parse_subject(
                Some("Turku"),
                "(Myydään) Silverback Scoop Fatty 2018 Oranssi, M, Turku"
            ),
            r#"Silverback Scoop Fatty 2018 Oranssi, M"#,
        );
    }

    #[test]
    fn test_parse_message_basic() {
        let message = parse_toml_to_latest_snapshot_msg(262350);
        assert_eq!(
            parse_message(&message),
            ParsedMessage {
                price: Some(100),
                location: Some("Helsinki".to_string())
            }
        );
    }

    #[test]
    fn test_parse_message_location() {
        let table = vec![(
            "\n\n<strong>Paikkakunta:</strong> Ilmajoki, Ahonkylä.\n\n",
            "Ilmajoki",
        )];

        for (input, expected) in table {
            assert_eq!(
                parse_message(input),
                ParsedMessage {
                    price: None,
                    location: Some(expected.to_string())
                }
            );
        }
    }

    #[test]
    fn test_simple_fields() {
        let item = parse_toml_to_item!(262350);
        assert_eq!(item.id, 262350);
        assert_eq!(item.category_id, 16);
        assert_eq!(
            item.timestamp,
            DateTime::parse_from_rfc3339("2022-07-01T12:44:41Z").unwrap()
        );
    }

    #[test]
    fn test_link() {
        let item = parse_toml_to_item!(262350);
        assert_eq!(
            item.link,
            "https://www.fillaritori.com/topic/262350-lake%C2%A0cx-237%C2%A0maantiekeng%C3%A4t%C2%A0helsinki/"
        );
    }

    #[test]
    fn test_title() {
        let item = parse_toml_to_item!(262350);
        assert_eq!(item.title, "Lake CX 237 Maantiekengät");
    }

    #[test]
    fn test_sold() {
        let item = parse_toml_to_item!(262350);
        assert_eq!(item.sold, true);
    }

    #[test]
    fn test_price() {
        let item = parse_toml_to_item!(262350);
        assert_eq!(item.price, Some(100));
    }

    #[test]
    fn test_location() {
        let item = parse_toml_to_item!(262350);
        assert_eq!(item.location, Some("Helsinki".to_string()));
    }

    #[test]
    fn test_use_latest_non_sold_snapshot() {
        let item = parse_toml_to_item!(173115);
        assert_eq!(item.title, "Garmin MARQ Expedition multisport älykello");

        let item = parse_toml_to_item!(170926);
        assert_eq!(item.title, r#"Pivot Firebird 27,5" 2018 L-koko"#);

        let item = parse_toml_to_item!(176312);
        assert_eq!(item.title, r#"Canyon Grand Canyon CF 7.9 SL hard tail, M"#);
    }
}
