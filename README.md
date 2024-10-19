### Back-End React Project - `README.md`

# Back-End Node.js Project

## Project Setup

This back-end project requires specific AWS credentials and S3 bucket information to run. Follow the steps below to set up and run the project.

### Step 1: Clone the Repository

```bash
git clone [<repository-url>]
cd backend 
```

### Step 2: Create .env File
You will need to create an .env file in the root directory of the project and include the following environment variables:

```bash
ALLOWED_ORIGIN=http://localhost:3000  # Replace with the actual frontend URL if needed
S3_BUCKET_NAME=your-s3-bucket-name
AWS_REGION=your-aws-region
aws_access_key_id=your-aws-access-key-id
aws_secret_access_key=your-aws-secret-access-key
aws_session_token=your-aws-session-token  # Optional, only if you use session tokens
```

### Step 3: Install Dependencies
Install the required packages:


```bash
npm install
```

### Step 4: Run the Project Locally
To run the server in development mode:

```bash
npm run dev
```

To run the server in production mode:

```bash
npm start
```

### Step 5: Docker Deployment
To deploy the back-end using Docker, follow these steps:

Ensure Docker is installed on your machine.
Create a Dockerfile with the following contents:


```bash
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

```

Build and run the Docker container:

```bash

docker build -t backend-app .
docker run -d -p 5000:5000 --env-file .env backend-app

```
---

### Front-End React Project - `README.md`

# Front-End React Project

## Project Setup

This front-end project requires a connection to the back-end API, which is specified using environment variables. Follow the steps below to set up and run the front-end project.

### Step 1: Clone the Repository

```bash
git clone [<repository-url>]
cd frontend
```

Step 2: Create .env File
You will need to create an .env file in the root directory of the project and include the following environment variable:

```bash
REACT_APP_API_URL=http://localhost:5000  # Replace with the actual backend URL if needed
```

Step 3: Install Dependencies
Install the required packages:

```bash
npm install
```

Step 4: Run the Project Locally
To run the React project in development mode:

```bash
npm start
```

Step 5: Docker Deployment

To deploy the front-end using Docker, follow these steps:

Ensure Docker is installed on your machine.
Create a Dockerfile with the following contents:

```bash
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

```

Build and run the Docker container:
```bash
docker build -t frontend-app .
docker run -d -p 3000:3000 --env-file .env frontend-app
```
---



