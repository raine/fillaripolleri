# Step 1: Install cargo-chef
FROM rust:1.70.0-slim-bookworm as chef
WORKDIR /workspace
RUN cargo install --locked cargo-chef@0.1.62

# Step 2: Compute a recipe file
FROM chef AS planner
COPY Cargo.toml Cargo.lock ./
COPY scraper/Cargo.toml ./scraper/Cargo.toml
COPY scraper/src ./scraper/src
COPY server/Cargo.toml ./server/Cargo.toml
COPY server/src ./server/src
RUN cargo chef prepare --recipe-path recipe.json --bin server

# Step 3: Cache project dependencies
FROM chef as cacher
WORKDIR /workspace
COPY --from=planner /workspace/scraper/Cargo.toml /workspace/scraper/Cargo.toml
COPY --from=planner /workspace/recipe.json recipe.json
RUN --mount=type=cache,target=/home/root/.cargo/git \
    --mount=type=cache,target=/home/root/.cargo/registry \
    cargo chef cook --release --recipe-path recipe.json --bin server

# Step 4: Build the binary
FROM rust:1.70.0-slim-bookworm as builder
WORKDIR /workspace
COPY Cargo.toml Cargo.lock ./
COPY scraper/Cargo.toml ./scraper/Cargo.toml
COPY scraper/src ./scraper/src
COPY server/Cargo.toml ./server/Cargo.toml
COPY server/src ./server/src
COPY --from=cacher /workspace/target /workspace/target
COPY --from=cacher $CARGO_HOME $CARGO_HOME
RUN --mount=type=cache,target=/home/root/.cargo/git \
    --mount=type=cache,target=/home/root/.cargo/registry \
    cargo build --release

# Step 5: Create the final image with binary
FROM debian:bookworm-slim
WORKDIR /workspace
COPY --from=builder /workspace/target/release/server .
CMD ["./server"]
