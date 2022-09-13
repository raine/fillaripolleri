# Step 1: Install cargo-chef
FROM rust:1.63.0-slim-buster as chef
WORKDIR /app
RUN cargo install cargo-chef

# Step 2: Compute a recipe file
FROM chef AS planner
COPY Cargo.toml Cargo.lock ./
COPY src ./src
RUN cargo chef prepare --recipe-path recipe.json

# Step 3: Cache project dependencies
FROM chef as cacher
WORKDIR /app
COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json

# Step 4: Build the binary
FROM rust:1.63.0-slim-buster as builder
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
COPY src ./src
COPY --from=cacher /app/target target
COPY --from=cacher $CARGO_HOME $CARGO_HOME
RUN cargo build --release

# Step 5: Create the final image with binary and deps
FROM debian:buster-slim
WORKDIR /app
COPY --from=builder /app/target/release/fillaripolleri-scraper .
RUN apt-get update && apt-get install -y \
  curl \
  && rm -rf /var/lib/apt/lists/*
CMD ["./fillaripolleri-scraper"]
