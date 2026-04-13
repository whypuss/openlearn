#!/bin/bash
cd "$(dirname "$0")/ai-service"
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-10000}
