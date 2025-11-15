# Use an official Python 3.10 slim image
FROM python:3.10-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file first to leverage Docker cache
COPY requirements.txt requirements.txt

# Install Python dependencies
# --no-cache-dir keeps the image slim
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your backend code into the container
COPY . .

# Expose the port uvicorn will run on
EXPOSE 8000

# The command to run your app
# 0.0.0.0 makes it accessible from other Docker containers
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]