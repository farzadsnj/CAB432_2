# Use Node.js Alpine for lightweight image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install --production

# Copy the rest of the app
COPY . .

# Expose port 4000 for this microservice
EXPOSE 4000

# Start the video service
CMD ["npm", "start"]
