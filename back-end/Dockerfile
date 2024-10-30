# Use Node.js base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --production

# Install FFmpeg and other dependencies
RUN apk add --no-cache ffmpeg

# Copy the rest of the application code
COPY . .

# Expose the port the video service runs on
EXPOSE 4000

# Start the video service
CMD ["node", "videoProcessor.js"]
