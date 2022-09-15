use crate::{topic::TopicWithSnapshots, types::*};
use chrono::{DateTime, Utc};

#[derive(Debug)]
/// Parsed from TopicWithSnapshots. Used in frontend as data.
pub struct Item {
    pub guid: Guid,
    pub timestamp: DateTime<Utc>,
    pub category_id: CategoryId,
    pub title: String,
    pub link: String,
    pub sold: bool,
    pub price: u32,
}

impl From<&TopicWithSnapshots> for Item {
    fn from(topic: &TopicWithSnapshots) -> Self {
        Self {
            guid: topic.guid,
            category_id: topic.category_id,
            title: "".to_string(),
            link: "".to_string(),
            sold: false,
            price: 0,
            timestamp: topic.date,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{topic::*, types::Guid};
    use pretty_assertions::assert_eq;
    use std::fs;

    fn read_test_toml<T>(guid: Guid) -> T
    where
        T: serde::de::DeserializeOwned,
    {
        let str = &fs::read_to_string(format!("./test_data/{}.toml", guid)).unwrap();
        toml::from_str(str).unwrap()
    }

    #[test]
    fn item_from_topic() {
        let topic: TopicWithSnapshots = read_test_toml(271118);
        let item = Item::from(&topic);
        assert_eq!(item.guid, 271118);
        assert_eq!(item.category_id, 16);
        assert_eq!(
            item.timestamp,
            DateTime::parse_from_rfc3339("2022-09-15T06:36:32Z").unwrap()
        );
        assert_eq!(item.sold, false);
    }
}
