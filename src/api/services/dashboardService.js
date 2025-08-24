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
    // Usamos Promise.all para executar todas as consultas de forma concorrente,
    // o que melhora significativamente a performance.
    const [summaryData, appointmentStatusSummary, dailyRevenue, dailyAppointments, totalEstornos] = await Promise.all([

        // Consulta 1: Agregação de resumo financeiro geral (para os "cards").
        Transaction.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            { $group: {
                _id: '$tipo', // Agrupa por 'online' vs 'presencial'
                totalRevenue: { $sum: '$valor' }, // Soma todos os valores (incluindo negativos de estornos)
                totalTransactions: { $sum: 1 }
            }}
        ]),
        
        // Consulta 2: Resumo de contagem de agendamentos POR STATUS (para os cards).
        Appointment.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            { $group: {
                _id: '$status',
                count: { $sum: 1 }
            }}
        ]),

        // Consulta 3: Faturamento agrupado POR DIA (para o gráfico de receita).
        Transaction.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate }, valor: { $gt: 0 } } }, // Considera apenas entradas de dinheiro (créditos)
            { $group: {
                // Agrupa pela data, formatada como "YYYY-MM-DD" para consistência
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" } },
                dailyRevenue: { $sum: '$valor' }
            }},
            { $sort: { _id: 1 } } // Ordena os resultados por data, do mais antigo para o mais novo
        ]),
        
        // Consulta 4: Contagem de agendamentos agrupados POR DIA (para o gráfico de agendamentos).
        Appointment.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } }, // Filtra por data de CRIAÇÃO do agendamento
            { $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" } },
                dailyCount: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]),

        // Consulta 5: Agregação para somar apenas os valores negativos (estornos).
        Transaction.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate }, valor: { $lt: 0 } } }, // Filtra apenas valores < 0
            { $group: {
                _id: null, // Agrupa todos os resultados em um único documento
                totalValue: { $sum: '$valor' }
            }}
        ])
    ]);

    // --- Processa os resultados para os CARDS de resumo ---
    
    // Processamento financeiro
    let totalRevenue = 0;

    const estornosValue = totalEstornos.length > 0 ? Math.abs(totalEstornos[0].totalValue) : 0;
    
    // Calcula a receita bruta (faturamento líquido + valor estornado)
    const receitaBruta = totalRevenue + estornosValue;

    const breakdown = { online: { revenue: 0, count: 0 }, presencial: { revenue: 0, count: 0 } };
    summaryData.forEach(item => {
        if (item._id) { // Garante que não processe grupos nulos
            breakdown[item._id] = { revenue: item.totalRevenue, count: item.totalTransactions };
            totalRevenue += item.totalRevenue;
        }
    });

    // Calcula a taxa (porcentagem) de faturamento
    const onlinePercentage = totalRevenue > 0 ? ((breakdown.online.revenue / totalRevenue) * 100).toFixed(1) : 0;
    const presencialPercentage = totalRevenue > 0 ? ((breakdown.presencial.revenue / totalRevenue) * 100).toFixed(1) : 0;

    // Processamento dos status de agendamento
    const appointmentCounts = { pendente: 0, confirmado: 0, cancelado: 0, concluido: 0, total: 0 };
    appointmentStatusSummary.forEach(item => {
        if (appointmentCounts.hasOwnProperty(item._id)) {
            appointmentCounts[item._id] = item.count;
            appointmentCounts.total += item.count;
        }
    });

    // --- Processa os dados para os GRÁFICOS ---
    const chartLabels = [];
    const revenueData = [];
    const appointmentData = [];
    
    // Itera por cada dia no intervalo de datas solicitado.
    let currentDate = new Date(startDate);
    // Adiciona um dia ao endDate para garantir que o último dia seja incluído no loop
    let loopEndDate = new Date(endDate);
    loopEndDate.setDate(loopEndDate.getDate() + 1);

    while (currentDate < loopEndDate) {
        const dateString = currentDate.toISOString().split('T')[0];
        
        // Formata a label para o eixo X do gráfico (ex: "15/08")
        chartLabels.push(new Date(currentDate).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: '2-digit' }));
        
        // Encontra o faturamento para o dia atual. Se não houver, o valor é 0.
        const revenueForDay = dailyRevenue.find(d => d._id === dateString);
        revenueData.push(revenueForDay ? revenueForDay.dailyRevenue : 0);
        
        // Encontra a contagem de agendamentos para o dia atual. Se não houver, o valor é 0.
        const appointmentsForDay = dailyAppointments.find(d => d._id === dateString);
        appointmentData.push(appointmentsForDay ? appointmentsForDay.dailyCount : 0);
        
        // Avança para o próximo dia
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Retorna o objeto final que o controller enviará como resposta.
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