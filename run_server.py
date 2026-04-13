#!/usr/bin/env python3
import os
import subprocess
os.chdir(os.path.dirname(os.path.abspath(__file__)) + "/ai-service")
subprocess.run(["uvicorn", "main:app", "--host", "0.0.0.0", "--port", os.environ.get("PORT", "10000")])
