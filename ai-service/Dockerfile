FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
ENV PYTHONPATH=/app
EXPOSE 8080

COPY start.py /usr/local/bin/start.py
RUN chmod +x /usr/local/bin/start.py
CMD ["python3", "/usr/local/bin/start.py"]
