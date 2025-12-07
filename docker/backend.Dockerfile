FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
  net-tools \
  arp-scan \
  sshpass \
  openssh-client \
  gcc \
  libc-dev \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY src-backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY src-backend /app

# RUN useradd -m appuser && chown -R appuser:appuser /app
# USER appuser

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]