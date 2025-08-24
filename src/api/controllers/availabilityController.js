const availabilityService = require('../services/availabilityService');

/**
 * Busca a configuração de disponibilidade para um único dia.
 * Usado pelo frontend do cliente para popular a lista de horários.
 */
exports.getAvailabilityForDate = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ status: 'fail', message: 'O parâmetro "date" é obrigatório.' });
        }

        const availability = await availabilityService.getAvailabilityForDate(date);
        res.status(200).json({ status: 'success', data: { availability } });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: `Erro ao buscar disponibilidade: ${error.message}` });
    }
};

/**
 * Busca as configurações de disponibilidade salvas para um mês inteiro.
 * Usado pelo frontend do admin para renderizar o calendário (dias verdes/vermelhos).
 */
exports.getAvailabilityForMonth = async (req, res) => {
    try {
        const year = parseInt(req.query.year, 10);
        const month = parseInt(req.query.month, 10);

        if (!year || !month) {
            return res.status(400).json({ status: 'fail', message: 'Os parâmetros "year" e "month" são obrigatórios.' });
        }

        const availabilities = await availabilityService.getAvailabilityForMonth(year, month);
        res.status(200).json({ status: 'success', data: { availabilities } });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: `Erro ao buscar disponibilidade do mês: ${error.message}` });
    }
};

/**
 * Cria ou atualiza a configuração de disponibilidade para um dia específico.
 * Usado pelo painel do admin para bloquear dias ou editar horários.
 */
exports.setAvailability = async (req, res) => {
    try {
        // Validação básica do corpo da requisição
        const { date, status, slots } = req.body;
        if (!date || !status) {
            return res.status(400).json({ status: 'fail', message: 'Os campos "date" e "status" são obrigatórios.' });
        }
        if (status === 'disponivel' && (!slots || !Array.isArray(slots))) {
            return res.status(400).json({ status: 'fail', message: 'O campo "slots" é obrigatório quando o status é "disponivel".' });
        }

        const updatedAvailability = await availabilityService.setAvailability(req.body);
        res.status(200).json({ status: 'success', data: { availability: updatedAvailability } });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: `Erro ao salvar disponibilidade: ${error.message}` });
    }
};

exports.getAvailableSlots = async (req, res) => {
    try {
        console.log('Recebido em /availability/slots:', req.query); // Pode remover este log agora

        // --- CORREÇÃO APLICADA AQUI ---
        // 'data' foi renomeado para 'date' para corresponder à query string.
        const { date, serviceId } = req.query;

        // Agora esta validação funcionará corretamente.
        if (!date || !serviceId) {
            return res.status(400).json({ status: 'fail', message: 'Os parâmetros "data" e "serviceId" são obrigatórios.' });
        }
        
        // Passamos 'date' (a variável correta) para o serviço.
        const slots = await availabilityService.getAvailableSlotsForDay(date, serviceId);
        res.status(200).json({ status: 'success', data: { slots } });
    } catch (error) {
        console.error("Erro em getAvailableSlots:", error);
        res.status(500).json({ status: 'fail', message: error.message });
    }
};