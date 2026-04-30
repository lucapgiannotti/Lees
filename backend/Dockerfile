FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y sqlite3 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create the data directory for the SQLite DB
RUN mkdir -p /app/data

COPY start.sh .
RUN chmod +x start.sh

EXPOSE 8000

# Run the script
CMD ["./start.sh"]