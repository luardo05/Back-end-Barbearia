const disponibilidadeService = require('../services/disponibilidadeService');

exports.getAvailableTimes = async (req, res) => {
    try {
        const { data } = req.query;
        if (!data) {
            return res.status(400).json({ status: 'fail', message: 'A data é obrigatória.' });
        }
        const slots = await disponibilidadeService.getAvailableSlotsForDay(data);
        res.status(200).json({ status: 'success', data: { slots } });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: error.message });
    }
};