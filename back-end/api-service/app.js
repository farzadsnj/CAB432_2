require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan'); // For request logging

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

// Use Morgan for logging HTTP requests
app.use(morgan('dev'));

// Configure CORS with dynamic origin handling
const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [process.env.ALLOWED_ORIGIN, 'http://localhost:3000'];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
    credentials: true,
};
app.use(cors(corsOptions));

// Setup static file directories
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Initialize DynamoDB table setup
setupDynamoDBTable()
    .then(() => console.log('DynamoDB table is ready.'))
    .catch(err => console.error('Error setting up DynamoDB table:', err));

// View engine setup for rendering templates (using Pug)
app.set('views', path.join(__dirname, 'api-service', 'views'));
app.set('view engine', 'pug');

// Middleware for parsing incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Route registration for API endpoints
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/video', videoRouter); // Token verification temporarily disabled
app.use('/pexels', verifyToken, pexelsRouter);

// Handle 404 errors (unknown routes)
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

// Global error handler middleware
app.use((error, req, res, next) => {
    console.error(`Error: ${error.message}`);
    res.status(error.status || 500).json({ error: error.message });
});

// Serve index.html for unmatched routes (Single Page Application)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Export the app for use in bin/www.js
module.exports = app;
