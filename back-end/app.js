require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
// routes
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const videoRouter = require('./routes/video');
const pexelsRouter = require('./routes/pexels');

const { setupDynamoDBTable } = require('./models/dynamoDBClient'); // Import table setup

// cors (for inner network/ different ports)
const cors = require('cors');

// others

const { verifyToken } = require('./controllers/authController');

const app = express();
const corsOptions = {
    origin: process.env.ALLOWED_ORIGIN || 'http://n10937668.cab432.com:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
    credentials: true,
};

app.use(cors(corsOptions));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// mongoose.connect(process.env.MONGODB_URI, {
// useNewUrlParser: true,
//     useUnifiedTopology: true,
//     ssl: false,
//     tls: false// Disable SSL
// })
// .then(() => console.log('MongoDB Connected'))
//     .catch(err => console.log(err));

setupDynamoDBTable().then(() => {
    console.log("DynamoDB table is ready.");
}).catch(err => {
    console.error("Error setting up DynamoDB table:", err);
});


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/auth', authRouter);
// app.use('/video', verifyToken, videoRouter);
app.use('/video', videoRouter);
app.use('/pexels', verifyToken, pexelsRouter);



app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({ error: err.message });
});
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;
