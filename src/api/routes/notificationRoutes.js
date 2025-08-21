const express = require('express');
const notificationController = require('../controllers/notificationController');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

// Aplica o middleware de proteção a TODAS as rotas neste arquivo.
// Ninguém pode acessar as rotas de notificação sem estar logado.
router.use(protect);

// Rota para buscar as notificações do usuário logado
// GET /api/v1/notifications/
router.get('/', notificationController.getMyNotifications);

// Rota para marcar uma notificação como lida
// PATCH /api/v1/notifications/60d21b4667d0d8992e610c85/read
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;