use std::env;

#[derive(Debug)]
pub struct Config {
    pub database_url: String,
}

pub fn get_config() -> Config {
    Config {
        database_url: get_env("DATABASE_URL"),
    }
}

fn get_env(k: &str) -> String {
    env::var(k).unwrap_or_else(|_| panic!("environment variable {k} should be defined"))
}
