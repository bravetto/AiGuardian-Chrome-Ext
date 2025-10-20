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
    graphviz \
    graphviz-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 9200

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import neuromorphic_integration; print('Neuromorphic Integration OK')" || exit 1

# Run application
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "9200"]
