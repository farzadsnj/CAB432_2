const express = require('express');
const router = express.Router();
const pexelController = require('../api-service/controllers/pexelController');
const { verifyToken } = require('../api-service/controllers/authController');

router.get('/videos', verifyToken, pexelController.getPopularVideos);

module.exports = router;
