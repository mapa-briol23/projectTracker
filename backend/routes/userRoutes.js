const express = require('express');
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', requireAuth, requireRole('project_manager', 'app_support'), userController.getAll);

module.exports = router;
