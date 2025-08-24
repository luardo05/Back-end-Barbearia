const Transaction = require('../models/Transaction');
const Appointment = require('../models/Appointment');

/**
 * Fornece um resumo financeiro e de contagem de transações para um determinado período.
 * Atende aos feedbacks #1 (dashboards semanais) e parte do #3 (comparação online/presencial).
 * @param {Date} startDate - A data de início do período.
 * @param {Date} endDate - A data de fim do período.
 * @returns {Promise<Object>} Um objeto com os dados agregados.
 */

exports.getDashboardData = async (startDate, endDate) => {
    // Executa todas as consultas de agregação em paralelo para melhor performance
    const [summaryData, appointmentStatusSummary, dailyRevenue, dailyAppointments, totalEstornos] = await Promise.all([
        // Consulta 1: Resumo financeiro por tipo (online/presencial)
        Transaction.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            { $group: {
                _id: '$tipo',
                totalRevenue: { $sum: '$valor' },
                totalTransactions: { $sum: 1 }
            }}
        ]),
        
        // Consulta 2: Resumo de agendamentos por status
        Appointment.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            { $group: {
                _id: '$status',
                count: { $sum: 1 }
            }}
        ]),

        // Consulta 3: Faturamento agrupado por dia (para o gráfico)
        Transaction.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate }, valor: { $gt: 0 } } },
            { $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" } },
                dailyRevenue: { $sum: '$valor' }
            }},
            { $sort: { _id: 1 } }
        ]),
        
        // Consulta 4: Agendamentos agrupados por dia (para o gráfico)
        Appointment.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            { $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" } },
                dailyCount: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]),

        // Consulta 5: Soma de todos os estornos (valores negativos)
        Transaction.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate }, valor: { $lt: 0 } } },
            { $group: {
                _id: null,
                totalValue: { $sum: '$valor' }
            }}
        ])
    ]);

    // --- Processa os resultados para os CARDS de resumo ---
    
    // 1. Processamento financeiro (ORDEM CORRIGIDA)
    let totalRevenue = 0; // Faturamento LÍQUIDO
    const breakdown = { online: { revenue: 0, count: 0 }, presencial: { revenue: 0, count: 0 } };
    summaryData.forEach(item => {
        if (item._id) {
            breakdown[item._id] = { revenue: item.totalRevenue, count: item.totalTransactions };
            totalRevenue += item.totalRevenue;
        }
    });

    const estornosValue = totalEstornos.length > 0 ? Math.abs(totalEstornos[0].totalValue) : 0;
    
    // A receita bruta é o faturamento líquido + o valor absoluto dos estornos.
    const receitaBruta = totalRevenue + estornosValue;

    // 2. Cálculo de porcentagens
    const onlinePercentage = receitaBruta > 0 ? ((breakdown.online.revenue / receitaBruta) * 100).toFixed(1) : 0;
    const presencialPercentage = receitaBruta > 0 ? ((breakdown.presencial.revenue / receitaBruta) * 100).toFixed(1) : 0;

    // 3. Processamento dos status de agendamento
    const appointmentCounts = { pendente: 0, confirmado: 0, cancelado: 0, concluido: 0, total: 0 };
    appointmentStatusSummary.forEach(item => {
        if (appointmentCounts.hasOwnProperty(item._id)) {
            appointmentCounts[item._id] = item.count;
            appointmentCounts.total += item.count;
        }
    });

    // --- Processa os dados para os GRÁFICOS ---
    const chartLabels = [], revenueData = [], appointmentData = [];
    let currentDate = new Date(startDate);
    let loopEndDate = new Date(endDate);
    loopEndDate.setDate(loopEndDate.getDate() + 1);

    while (currentDate < loopEndDate) {
        const dateString = currentDate.toISOString().split('T')[0];
        chartLabels.push(new Date(currentDate).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: '2-digit' }));
        
        const revenueForDay = dailyRevenue.find(d => d._id === dateString);
        revenueData.push(revenueForDay ? revenueForDay.dailyRevenue : 0);
        
        const appointmentsForDay = dailyAppointments.find(d => d._id === dateString);
        appointmentData.push(appointmentsForDay ? appointmentsForDay.dailyCount : 0);
        
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Retorna o objeto final
    return {
        summary: {
            totalRevenue,
            receitaBruta,
            totalEstornos: estornosValue,
            totalTransactions: (breakdown.online.count || 0) + (breakdown.presencial.count || 0),
            revenueBreakdown: breakdown,
            revenuePercentage: {
                online: onlinePercentage,
                presencial: presencialPercentage
            },
            appointmentCounts
        },
        charts: {
            labels: chartLabels,
            revenue: revenueData,
            appointments: appointmentData
        }
    };
};