# Use Node.js base image
# Use Node.js base image
FROM node:18-alpine
#
#WORKDIR /back-end/api-service
#COPY package*.json ./
#RUN npm install
#COPY . .

# Set the working directory inside the container
WORKDIR /back-end

# Install necessary system dependencies
RUN apk add --no-cache bash nodejs npm supervisor ffmpeg

# Copy project files into the container
COPY ./api-service /back-end/api-service
COPY ./video-service /back-end/video-service
COPY supervisord.conf /etc/supervisord.conf

# Install dependencies for both services
RUN cd /back-end/api-service && npm install --production
RUN cd /back-end/video-service && npm install --production

# Expose the necessary ports
EXPOSE 3000 4000

# Start Supervisor to manage services
CMD ["supervisord", "-c", "/etc/supervisord.conf"]

#WORKDIR /app
#
## Copy package.json and package-lock.json
#COPY package.json package-lock.json ./
#
## Install dependencies
#RUN npm install --production
#
## Install FFmpeg and other dependencies
#RUN apk add --no-cache ffmpeg
#
## Copy the rest of the application code
#COPY . .
#
## Expose the port the video service runs on
#EXPOSE 4000
#
## Start the video service
#CMD ["node", "videoProcessor.js"]
##>>>>>>> 739231a82ca879f6c48df9de207be24c3883fb04
