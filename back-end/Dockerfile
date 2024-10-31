# Use a lightweight Node.js image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /back-end

# Install necessary system dependencies
RUN apk add --no-cache bash nodejs npm supervisor

# Copy project files into the container
COPY . .

# Install dependencies for both services
RUN cd /back-end/api-service && npm install --production
RUN cd /back-end/video-service && npm install --production

# Expose the necessary ports
EXPOSE 3000 4000

# Start Supervisor to manage services
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
