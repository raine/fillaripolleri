use std::env;

#[derive(Debug)]
pub(crate) struct Config {
    pub database_url: String,
    pub port: u16,
}

pub(crate) fn get_config() -> Config {
    Config {
        database_url: get_env("DATABASE_URL"),
        port: get_env("PORT").parse().unwrap(),
    }
}

fn get_env(k: &str) -> String {
    env::var(k).unwrap_or_else(|_| panic!("environment variable {k} should be defined"))
}
