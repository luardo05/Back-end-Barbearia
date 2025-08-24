const User = require('../models/User');
const Notification = require('../models/Notification');
const { getIO } = require('../../socketManager');

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

/**
 * Busca todas as notificações de um usuário específico, ordenadas da mais recente para a mais antiga.
 * @param {string} userId - O ID do usuário destinatário.
 * @returns {Promise<Array>} Um array de notificações.
 */
exports.getNotificationsForUser = async (userId) => {
    return await Notification.find({ destinatario: userId }).sort({ createdAt: -1 });
};

/**
 * Marca uma notificação específica como lida, garantindo que o usuário seja o dono da notificação.
 * @param {string} notificationId - O ID da notificação a ser marcada.
 * @param {string} userId - O ID do usuário que está fazendo a requisição.
 * @returns {Promise<Object>} A notificação atualizada.
 */
exports.markAsRead = async (notificationId, userId) => {
    // A condição { destinatario: userId } é uma camada de segurança crucial.
    // Ela garante que um usuário não possa marcar a notificação de outro como lida.
    const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, destinatario: userId },
        { lida: true },
        { new: true }
    );

    if (!notification) {
        throw new Error('Notificação não encontrada ou você não tem permissão para modificá-la.');
    }

    return notification;
};

/**
 * Verifica os aniversariantes do dia, cria notificações persistentes
 * e envia notificações em tempo real se estiverem online.
 */
exports.sendBirthdayNotifications = async () => {
    console.log('⏰ Executando verificação de aniversários...');
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // getMonth() é 0-11
    const currentDay = today.getDate();

    try {
        // Usa a pipeline de agregação do MongoDB para encontrar os aniversariantes
        // de forma eficiente, sem precisar buscar todos os usuários.
        const aniversariantes = await User.aggregate([
            {
                $match: {
                    $expr: {
                        $and: [
                            { $eq: [{ $month: '$dataNascimento' }, currentMonth] },
                            { $eq: [{ $dayOfMonth: '$dataNascimento' }, currentDay] }
                        ]
                    }
                }
            }
        ]);

        if (aniversariantes.length === 0) {
            console.log('Nenhum aniversariante hoje.');
            return;
        }

        console.log(`🎂 Encontrado(s) ${aniversariantes.length} aniversariante(s) hoje!`);

        const io = getIO();

        for (const user of aniversariantes) {
            const message = `Feliz aniversário, ${user.nome}! 🎉 Use o cupom ANIVERSARIO10 para 10% de desconto hoje.`;

            // 1. Cria a notificação persistente no banco de dados
            await Notification.create({
                destinatario: user._id,
                mensagem: message
            });

            // 2. Envia a notificação em tempo real se o usuário estiver online
            io.to(user._id.toString()).emit('new_notification', { message });

            // 3. (Opcional) Notifica os admins
            await exports.createNotificationForAdmins(`Hoje é o aniversário de ${user.nome}.`);
            io.to('admins').emit('info_notification', { message: `Lembrete: Hoje é o aniversário de ${user.nome}.` });
        }

    } catch (error) {
        console.error('Erro ao processar notificações de aniversário:', error);
    }
};