const express = require('express');
const taskController = require('../controllers/taskController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/project/:projectId', requireAuth, taskController.getByProject);
router.post(
  '/project/:projectId',
  requireAuth,
  requireRole('project_manager', 'app_support'),
  taskController.create
);
router.put('/:id', requireAuth, requireRole('project_manager', 'app_support'), taskController.update);
router.delete('/:id', requireAuth, requireRole('project_manager', 'app_support'), taskController.remove);

module.exports = router;
