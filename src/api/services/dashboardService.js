const Transaction = require('../models/Transaction');
const Appointment = require('../models/Appointment');

/**
 * Fornece um resumo financeiro e de contagem de transações para um determinado período.
 * Atende aos feedbacks #1 (dashboards semanais) e parte do #3 (comparação online/presencial).
 * @param {Date} startDate - A data de início do período.
 * @param {Date} endDate - A data de fim do período.
 * @returns {Promise<Object>} Um objeto com os dados agregados.
 */
exports.getFinancialSummary = async (startDate, endDate) => {
    const summary = await Transaction.aggregate([
        // Estágio 1: Filtrar as transações para o período desejado.
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate }
            }
        },
        // Estágio 2: Agrupar por tipo ('online' vs 'presencial') e calcular totais.
        {
            $group: {
                _id: '$tipo', // Agrupa por 'online' ou 'presencial'
                totalRevenue: { $sum: '$valor' }, // Soma o valor de todas as transações no grupo
                totalTransactions: { $sum: 1 } // Conta o número de transações no grupo
            }
        }
    ]);

    // Formata a saída para ser mais amigável para o frontend
    let totalRevenue = 0;
    let totalTransactions = 0;
    const breakdown = {
        online: { revenue: 0, count: 0 },
        presencial: { revenue: 0, count: 0 }
    };

    summary.forEach(item => {
        if (item._id === 'online' || item._id === 'presencial') {
            breakdown[item._id].revenue = item.totalRevenue;
            breakdown[item._id].count = item.totalTransactions;
            totalRevenue += item.totalRevenue;
            totalTransactions += item.totalTransactions;
        }
    });

    return { totalRevenue, totalTransactions, breakdown };
};

/**
 * Fornece uma contagem de agendamentos por status para um determinado período.
 * @param {Date} startDate - A data de início do período.
 * @param {Date} endDate - A data de fim do período.
 * @returns {Promise<Object>} Um objeto com as contagens.
 */
exports.getAppointmentSummary = async (startDate, endDate) => {
    const summary = await Appointment.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    const appointmentCounts = {
        pendente: 0,
        confirmado: 0,
        cancelado: 0,
        concluido: 0,
        total: 0
    };

    summary.forEach(item => {
        if (appointmentCounts.hasOwnProperty(item._id)) {
            appointmentCounts[item._id] = item.count;
        }
    });

    appointmentCounts.total = Object.values(appointmentCounts).reduce((sum, count) => sum + count, 0);

    return appointmentCounts;
};