#![allow(dead_code, unused_imports, unused_variables)]
use std::str::FromStr;
use std::{net::SocketAddr, sync::Arc};

use axum::extract::Query;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::{routing::get, Router};
use axum::{Extension, Json};
use deadpool_postgres::Pool;
use eyre::Result;
use fillaripolleri_scraper::item::Item;
use serde::{Deserialize, Serialize};
use tokio_postgres::Config;
use tracing::*;

use crate::item::*;

mod config;
mod item;
mod setup;

#[tokio::main]
async fn main() -> Result<()> {
    setup::setup()?;
    let config = config::get_config();
    let addr: SocketAddr = ([0, 0, 0, 0], config.port).into();
    let pg_config = Config::from_str(&config.database_url)?;
    let manager = deadpool_postgres::Manager::new(pg_config, tokio_postgres::NoTls);
    let pool = Pool::builder(manager).build()?;
    let app = Router::new()
        .route("/api/items", get(get_items))
        .layer(Extension(pool));

    info!("Listening at http://{addr}");
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();

    Ok(())
}

const PAGE_SIZE: usize = 50;

#[derive(Deserialize, Debug)]
struct Params {
    s: Option<String>,
    category: Option<i32>,
    after_id: Option<i32>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ItemsResponse {
    items: Vec<Item>,
    is_last_page: bool,
}

async fn get_items(
    params: Query<Params>,
    Extension(pool): Extension<Pool>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let search = params.0.s;
    let category = params.0.category;
    let after_id = params.0.after_id;
    let limit = (PAGE_SIZE + 1) as i32;
    let items = get_latest_items(&pool, limit, search, category, after_id)
        .await
        .map_err(|err| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("something went wrong: {err}"),
            )
        })?;

    // Query returns up to 51 items. If we actually have <= 50 (page size), we know it's the last page.
    let items_len = items.len();
    let is_last_page = items_len <= PAGE_SIZE as usize;
    let page_items = items.into_iter().take(PAGE_SIZE).collect();

    Ok(Json(ItemsResponse {
        items: page_items,
        is_last_page,
    }))
}
