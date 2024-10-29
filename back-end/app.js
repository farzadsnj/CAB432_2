require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

// Import routes
const indexRouter = require('./api-service/routes/index');
const authRouter = require('./api-service/routes/auth');
const videoRouter = require('./api-service/routes/video');
const pexelsRouter = require('./api-service/routes/pexels');

// Import setup and middleware
const { setupDynamoDBTable } = require('./api-service/models/dynamoDBClient');
const { verifyToken } = require('./api-service/controllers/authController');

// Initialize Express app
const app = express();

// Configure CORS
const corsOptions = {
    origin: process.env.ALLOWED_ORIGIN || 'http://n10937668.cab432.com:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
    credentials: true,
};
app.use(cors(corsOptions));

// Setup public directory for static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Initialize DynamoDB table setup
setupDynamoDBTable()
    .then(() => console.log("DynamoDB table is ready."))
    .catch(err => console.error("Error setting up DynamoDB table:", err));

// View engine setup
app.set('views', path.join(__dirname, 'api-service','views'));
app.set('view engine', 'pug');

// Middleware for parsing requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Route registration
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/video', videoRouter); // Optional token verification disabled for now
app.use('/pexels', verifyToken, pexelsRouter);

// Handle 404 errors (unknown routes)
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

// Error handler middleware
app.use((error, req, res, next) => {
    res.status(error.status || 500).json({ error: error.message });
});

// Serve index.html for all unmatched routes (Single Page Application behavior)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Export the app for use in bin/www.js
module.exports = app;
