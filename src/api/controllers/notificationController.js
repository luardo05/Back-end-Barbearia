const notificationService = require('../services/notificationService');

// Busca todas as notificações do usuário logado
exports.getMyNotifications = (req, res) => {
    res.status(200).json(res.paginatedResults);
};

// Marca uma notificação como lida
exports.markAsRead = async (req, res) => {
    try {
        const notification = await notificationService.markAsRead(req.params.id, req.user.id);
        res.status(200).json({
            status: 'success',
            data: { notification }
        });
    } catch (error) {
        res.status(404).json({ status: 'fail', message: error.message });
    }
};