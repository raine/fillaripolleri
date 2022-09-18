use eyre::Result;
use std::io::Read;
use std::thread::sleep;
use std::time::{Duration, Instant};
use tracing::info;

pub struct HttpClient {
    last_req_at: Option<Instant>,
}

impl HttpClient {
    pub fn new() -> Self {
        Self { last_req_at: None }
    }

    fn rate_limit(&mut self) {
        if let Some(t) = self.last_req_at {
            let since_last = Instant::now().duration_since(t);
            let time_to_sleep = Duration::from_secs(1).saturating_sub(since_last);
            if !time_to_sleep.is_zero() {
                info!("last request {since_last:?} ago, sleeping for {time_to_sleep:?}");
                sleep(time_to_sleep);
            }
        }
    }

    pub fn get_as_reader(&mut self, url: &str) -> Result<Box<dyn Read + Send + Sync>> {
        self.rate_limit();
        info!(url, "GET");
        let req = ureq::get(url);
        let res = req.call()?;
        self.last_req_at = Some(Instant::now());
        Ok(res.into_reader())
    }
}

impl Default for HttpClient {
    fn default() -> Self {
        Self::new()
    }
}
