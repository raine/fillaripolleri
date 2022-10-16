use deadpool_postgres::Pool;
use eyre::Result;
use fillaripolleri_scraper::item::Item;
use postgres_query::{query_dyn, Parameter};

pub(crate) async fn get_latest_items(
    pool: &Pool,
    limit: i32,
    search: Option<String>,
    category: Option<i32>,
    after_id: Option<i32>,
) -> Result<Vec<Item>> {
    let conn = pool.get().await?;
    let mut bindings = Vec::new();
    let mut filters = Vec::new();
    let mut sql = "
        SELECT i.*,
               tc.name AS category
          FROM item i
          JOIN topic_category tc
            ON tc.id = i.category_id
        "
    .to_string();

    if let Some(search) = search.as_ref() {
        filters.push("title_tsvector @@ websearch_to_tsquery('finnish', $search)");
        bindings.push(("search", search as Parameter));
    }

    if let Some(category) = category.as_ref() {
        filters.push("i.category_id = $category");
        bindings.push(("category", category as Parameter));
    }

    if let Some(after_id) = after_id.as_ref() {
        filters.push("i.id < $after_id");
        bindings.push(("after_id", after_id as Parameter));
    }

    if !filters.is_empty() {
        sql += &format!(" WHERE {}", filters.join(" AND "));
    }

    sql += " ORDER BY id DESC";
    sql += " LIMIT $limit::int";
    bindings.push(("limit", &limit as Parameter));

    let query = query_dyn!(&sql, ..bindings)?;
    let stmt = conn.prepare_cached(query.sql()).await?;
    let rows = conn.query(&stmt, query.parameters()).await?;
    Ok(rows.into_iter().map(Item::from).collect())
}
