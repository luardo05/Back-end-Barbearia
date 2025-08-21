const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { protect, restrictTo } = require('../../middleware/authMiddleware');

const router = express.Router();

// Protege todas as rotas de dashboard. Apenas admins logados podem acessá-las.
router.use(protect);
router.use(restrictTo('admin'));

// GET /api/v1/dashboard/summary?period=week  (ou month, ou day)
router.get('/summary', dashboardController.getSummary);

module.exports = router;