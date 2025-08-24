const express = require('express');
const notificationController = require('../controllers/notificationController');
const { protect } = require('../../middleware/authMiddleware');
const { paginate } = require('../../middleware/paginationMiddleware');
const Notification = require('../models/Notification');

const router = express.Router();

// Aplica o middleware de proteção a TODAS as rotas neste arquivo.
// Ninguém pode acessar as rotas de notificação sem estar logado.
router.use(protect);

const filterByUser = (req) => ({ destinatario: req.user.id });
// Rota para buscar as notificações do usuário logado
// GET /api/v1/notifications/
router.get('/',
    paginate(Notification, null, { createdAt: -1 }, filterByUser), // Ordena da mais recente para a mais antiga
    notificationController.getMyNotifications
);

// Rota para marcar uma notificação como lida
// PATCH /api/v1/notifications/60d21b4667d0d8992e610c85/read
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;