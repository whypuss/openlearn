FROM rust:1.86-slim-bookworm AS builder

WORKDIR /app
COPY Cargo.toml Cargo.lock* ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release && rm -rf src

COPY src/ ./src/
RUN touch src/main.rs && cargo build --release

FROM debian-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates libssl3 curl && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/openlearn_backend /usr/local/bin/
EXPOSE 8080
CMD ["openlearn_backend"]
