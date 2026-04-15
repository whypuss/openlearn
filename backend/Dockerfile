FROM rust:1.86-slim-bookworm AS builder

ARG OPENROUTER_API_KEY
ENV OPENROUTER_API_KEY=${OPENROUTER_API_KEY}

WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*
COPY Cargo.toml Cargo.lock* ./
COPY openlearn.db ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release && rm -rf src

COPY src/ ./src/
RUN touch src/main.rs && cargo build --release

FROM debian:bookworm-slim
ARG OPENROUTER_API_KEY
ENV OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates libssl3 curl && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/openlearn_backend /usr/local/bin/
COPY --from=builder /app/openlearn.db /app/openlearn.db
WORKDIR /app
EXPOSE 8080
CMD ["openlearn_backend"]
