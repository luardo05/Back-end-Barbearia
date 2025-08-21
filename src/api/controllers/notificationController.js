const notificationService = require('../services/notificationService');

// Busca todas as notificações do usuário logado
exports.getMyNotifications = async (req, res) => {
    try {
        const notifications = await notificationService.getNotificationsForUser(req.user.id);
        res.status(200).json({
            status: 'success',
            results: notifications.length,
            data: { notifications }
        });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: 'Erro ao buscar as notificações.' });
    }
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