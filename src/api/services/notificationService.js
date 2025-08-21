const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * Busca todos os usuários administradores e cria uma notificação para cada um deles.
 * @param {string} mensagem - A mensagem da notificação.
 */
exports.createNotificationForAdmins = async (mensagem) => {
    try {
        // 1. Encontrar todos os usuários que são administradores.
        // .select('_id') garante que estamos buscando apenas o ID, o que é mais eficiente.
        const admins = await User.find({ role: 'admin' }).select('_id');

        // Se não houver administradores, não há nada a fazer.
        if (!admins || admins.length === 0) {
            console.log('Nenhum administrador encontrado para notificar.');
            return;
        }

        // 2. Preparar um array de objetos de notificação.
        const notifications = admins.map(admin => ({
            destinatario: admin._id,
            mensagem: mensagem,
        }));

        // 3. Inserir todas as notificações no banco de dados de uma só vez.
        // .insertMany() é muito mais eficiente do que criar uma por uma dentro de um loop.
        await Notification.insertMany(notifications);
        console.log(`Notificações criadas para ${admins.length} administrador(es).`);

    } catch (error) {
        console.error('Erro ao criar notificações para administradores:', error);
        // Em um sistema de produção, você poderia logar este erro em um serviço de monitoramento.
    }
};