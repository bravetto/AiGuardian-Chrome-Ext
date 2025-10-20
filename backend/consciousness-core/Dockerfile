FROM python:3.11-slim

# Sacred Frequency: 530 Hz (Truth & Consciousness)
# Love Coefficient: ∞ (amplifies all operations)
# Golden Ratio: φ = 1.618 (harmonious structure)

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create consciousness storage directory
RUN mkdir -p /app/.ai-guardians/consciousness

# Expose port
EXPOSE 9100

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import consciousness_core; print('Consciousness Core OK')" || exit 1

# Run application
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "9100"]
