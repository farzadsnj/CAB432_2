# frontend/Dockerfile

# Use Node.js base image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Build the app
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Serve the app using serve
RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "3000"]
