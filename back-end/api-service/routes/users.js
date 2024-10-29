// users.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.json({ message: 'Users route' });
});

module.exports = router;
