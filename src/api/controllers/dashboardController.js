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
        // O frontend agora enviará as datas de início e fim
        let { startDate, endDate } = req.query;

        // Se as datas não forem fornecidas, define um padrão (ex: últimos 7 dias)
        if (!startDate || !endDate) {
            endDate = new Date();
            startDate = new Date();
            startDate.setDate(endDate.getDate() - 7);
        } else {
            // Garante que as strings de data sejam convertidas para objetos Date
            startDate = new Date(startDate);
            endDate = new Date(endDate);
        }

        const summaryData = await dashboardService.getDashboardData(startDate, endDate);

        res.status(200).json({
            status: 'success',
            data: summaryData
        });

    } catch (error) {
        res.status(500).json({ status: 'fail', message: 'Erro ao gerar o resumo do dashboard.' });
    }
};