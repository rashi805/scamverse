const express = require('express');
const {
  getAnalytics,
  listAllScenarios,
  createScenario,
  updateScenario,
  deleteScenario,
  listAllReports,
  listUsers,
  updateUserRole,
} = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth, requireRole('admin'));

router.get('/analytics', getAnalytics);

router.get('/scenarios', listAllScenarios);
router.post('/scenarios', createScenario);
router.put('/scenarios/:id', updateScenario);
router.delete('/scenarios/:id', deleteScenario);

router.get('/reports', listAllReports);

router.get('/users', listUsers);
router.patch('/users/:id/role', updateUserRole);

module.exports = router;
