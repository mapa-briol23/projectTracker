const express = require('express');
const projectController = require('../controllers/projectController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', requireAuth, projectController.getAll);
router.get('/:id', requireAuth, projectController.getById);
router.post('/', requireAuth, requireRole('project_manager'), projectController.create);
router.put('/:id', requireAuth, requireRole('project_manager'), projectController.update);
router.delete('/:id', requireAuth, requireRole('project_manager'), projectController.remove);

module.exports = router;
