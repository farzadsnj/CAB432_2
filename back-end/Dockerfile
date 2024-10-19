# backend/Dockerfile

# Use Node.js base image
#FROM node:18
FROM node:18-alpine

# Set the working directory
WORKDIR /app


# Copy only package.json and package-lock.json first
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm install --production


# Copy the rest of the app
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
