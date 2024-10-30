const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();
const upload = multer({ storage }); // Store file in memory

// Route to generate a pre-signed URL for video upload
router.post('/upload', videoController.generateUploadUrl);

// Route to initiate the transcoding process after the file is uploaded to S3
router.post('/transcode', videoController.processVideo);
router.get('/', videoController.getVideos);

module.exports = router;
