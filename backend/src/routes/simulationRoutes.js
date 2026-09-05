const express = require('express');
const { listScenarios, startSimulation, submitDecision } = require('../controllers/simulationController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, listScenarios);
router.post('/:id/start', requireAuth, startSimulation);
router.post('/session/:sessionId/decide', requireAuth, submitDecision);

module.exports = router;
