use std::io::{self, Read};

use crate::http::HttpClient;
use eyre::Result;
use postgres_derive::{FromSql, ToSql};
use select::document::Document;
use select::predicate::{Attr, Class, Name, Predicate};
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[allow(clippy::large_enum_variant)]
#[derive(Error, Debug)]
pub enum TagParseError {
    #[error("unknown tag: {0}")]
    UnknownTag(String),
    #[error("tag element not found")]
    TagElementNotFound,
    #[error(transparent)]
    DocumentParseError(#[from] io::Error),
    #[error(transparent)]
    UreqError(#[from] eyre::Report),
}

#[derive(Debug, PartialEq, Eq, FromSql, ToSql, Deserialize, Serialize)]
#[postgres(name = "topic_tag")]
pub enum TopicTag {
    ForSale,
    Reserved,
    Sold,
    GivingAway,
    WantToBuy,
    Bought,
    Renting,
    Invalid,
    Trading,
}

impl TryFrom<&str> for TopicTag {
    type Error = TagParseError;

    fn try_from(s: &str) -> Result<Self, Self::Error> {
        match s {
            "Myydään" => Ok(Self::ForSale),
            "Varattu" => Ok(Self::Reserved),
            "Myyty" => Ok(Self::Sold),
            "Lahjoitetaan" => Ok(Self::GivingAway),
            "Ostetaan" => Ok(Self::WantToBuy),
            "Ostettu" => Ok(Self::Bought),
            "Vuokrataan" => Ok(Self::Renting),
            "Vaihdetaan" => Ok(Self::Trading),
            "Ei_voimassa" => Ok(Self::Invalid),
            _ => Err(TagParseError::UnknownTag(s.to_owned())),
        }
    }
}
//
// Topic "tags", such as whether the item is for sale or not, are only available in the html of the
// topic page.
pub fn fetch_topic_page_tag(http: &mut HttpClient, url: &str) -> Result<TopicTag, TagParseError> {
    let reader = http.get_as_reader(url)?;
    parse_topic_page_tag(reader)
}

fn parse_topic_page_tag(reader: Box<dyn Read + Send + Sync>) -> Result<TopicTag, TagParseError> {
    let doc = Document::from_read(reader)?;
    let tag_link_predicate = Predicate::and(Class("ipsBadge"), Attr("rel", "tag"));
    let tag_node = doc
        .find(tag_link_predicate.descendant(Name("span")))
        .next()
        .ok_or(TagParseError::TagElementNotFound)?;

    TopicTag::try_from(tag_node.text().as_ref())
}

#[cfg(test)]
mod tests {
    use super::*;
    use pretty_assertions::assert_eq;

    #[test]
    fn parse_for_sale_tag() -> Result<()> {
        let html = Box::new(std::fs::File::open("./test_data/229081.html")?);
        let tag = parse_topic_page_tag(html)?;
        assert_eq!(tag, TopicTag::ForSale);
        Ok(())
    }
}
