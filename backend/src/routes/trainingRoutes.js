const express = require('express');
const { getRecommendations } = require('../controllers/trainingController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/recommendations', requireAuth, getRecommendations);

module.exports = router;
