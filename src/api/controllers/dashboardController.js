const dashboardService = require('../services/dashboardService');

const getDateRange = (period) => {
    const endDate = new Date();
    const startDate = new Date();

    if (period === 'week') {
        startDate.setDate(endDate.getDate() - 7);
    } else if (period === 'month') {
        startDate.setMonth(endDate.getMonth() - 1);
    } else { // Padrão para 'day' ou qualquer outro valor
        startDate.setDate(endDate.getDate() - 1);
    }

    return { startDate, endDate };
};


exports.getSummary = async (req, res) => {
    try {
        const period = req.query.period || 'week'; // Padrão para 'week' se não for fornecido
        const { startDate, endDate } = getDateRange(period);

        const financialSummary = await dashboardService.getFinancialSummary(startDate, endDate);
        const appointmentSummary = await dashboardService.getAppointmentSummary(startDate, endDate);

        res.status(200).json({
            status: 'success',
            data: {
                period,
                financialSummary,
                appointmentSummary
            }
        });

    } catch (error) {
        res.status(500).json({ status: 'fail', message: 'Erro ao gerar o resumo do dashboard.' });
    }
};