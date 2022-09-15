use crate::types::*;
use chrono::{DateTime, Utc};

pub struct Item {
    guid: Guid,
    timestamp: DateTime<Utc>,
    category_id: CategoryId,
    title: String,
    link: String,
    sold: bool,
    price: u32,
}
