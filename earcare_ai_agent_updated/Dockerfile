# Use official Python image
FROM python:3.10

# Set working directory
WORKDIR /app

# Copy backend files
COPY ./backend /app/backend
COPY ./frontend-react /app/frontend-react

# Install dependencies
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Expose port and run server
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]