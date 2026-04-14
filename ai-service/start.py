#!/usr/bin/env python3
"""Wrapper to run uvicorn with proper import paths for ai-service."""
import os
import shutil

# ai-service has hyphen, which Python can't import directly.
# Copy to ai_service (underscore) for import purposes.
src = "/app"
dst = "/app/ai_service"

if not os.path.exists(dst):
    os.makedirs(dst, exist_ok=True)
    # Copy only package files (skip Dockerfile, start.py, etc.)
    for item in ["__init__.py", "main.py", "db.py", "hf_inference.py", "auth.py", "schemas.py"]:
        src_path = os.path.join(src, item)
        if os.path.exists(src_path):
            shutil.copy2(src_path, os.path.join(dst, item))
    # Copy routers dir
    shutil.copytree("/app/routers", "/app/ai_service/routers", dirs_exist_ok=True)
    # Copy hidden files
    for item in os.listdir(src):
        if item.startswith('.') and item not in ('.', '..'):
            src_path = os.path.join(src, item)
            if os.path.isfile(src_path):
                shutil.copy2(src_path, os.path.join(dst, item))

os.chdir("/app")
os.environ["PYTHONPATH"] = "/app"
os.execvp("uvicorn", [
    "uvicorn",
    "ai_service.main:app",
    "--host", "0.0.0.0",
    "--port", os.environ.get("PORT", "8080"),
])
