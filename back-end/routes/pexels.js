const express = require('express');
const router = express.Router();
const pexelController = require('../controllers/pexelController');
const { verifyToken } = require('../controllers/authController');

router.get('/videos', verifyToken, pexelController.getPopularVideos);

module.exports = router;
