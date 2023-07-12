# Step 1: Install cargo-chef
FROM rust:1.70.0-slim-bookworm as chef
WORKDIR /app
RUN --mount=type=cache,target=/home/root/.cargo/registry \
    cargo install cargo-chef

# Step 2: Compute a recipe file
FROM chef AS planner
COPY Cargo.toml Cargo.lock ./
COPY src ./src
RUN cargo chef prepare --recipe-path recipe.json

# Step 3: Cache project dependencies
FROM chef as cacher
WORKDIR /app
COPY --from=planner /app/recipe.json recipe.json
RUN --mount=type=cache,target=/home/root/.cargo/git \
    --mount=type=cache,target=/home/root/.cargo/registry \
    cargo chef cook --release --recipe-path recipe.json

# Step 4: Build the binary
FROM rust:1.70.0-slim-bookworm as builder
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
COPY src ./src
COPY --from=cacher /app/target target
COPY --from=cacher $CARGO_HOME $CARGO_HOME
RUN --mount=type=cache,target=/home/root/.cargo/git \
    --mount=type=cache,target=/home/root/.cargo/registry \
    cargo build --release

# Step 5: Create the final image with binary and deps
FROM debian:bookworm-slim
WORKDIR /app
COPY --from=builder /app/target/release/fillaripolleri_scraper .
COPY --from=builder /app/target/release/process_topics .
RUN apt-get update && apt-get install -y \
  # For healthchecks
  curl \
  && rm -rf /var/lib/apt/lists/*
CMD ["./fillaripolleri_scraper"]
