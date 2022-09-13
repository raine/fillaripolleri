use chrono::{DateTime, Utc};
use eyre::Result;
use postgres::Row;

#[derive(Debug)]
pub struct Job {
    pub id: i32,
    pub started_at: DateTime<Utc>,
    pub finished_at: Option<DateTime<Utc>>,
}

impl From<Row> for Job {
    fn from(row: Row) -> Self {
        Self {
            id: row.get("id"),
            started_at: row.get("started_at"),
            finished_at: row.get("finished_at"),
        }
    }
}

pub fn create_job(client: &mut postgres::Client) -> Result<Job> {
    let job = client
        .query_one("INSERT INTO job DEFAULT VALUES RETURNING *", &[])
        .map(Job::from)?;

    Ok(job)
}

pub fn mark_job_finished(client: &mut postgres::Client, job_id: i32) -> Result<()> {
    client.execute(
        "UPDATE job SET finished_at = now() WHERE id = $1",
        &[&job_id],
    )?;

    Ok(())
}
