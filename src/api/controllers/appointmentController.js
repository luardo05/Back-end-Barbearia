const appointmentService = require('../services/appointmentService');

// Cliente cria seu próprio agendamento
exports.createAppointment = async (req, res) => {
    try {
        const { servicoId, data } = req.body;
        // O ID do cliente vem do usuário logado (anexado pelo middleware 'protect')
        const clienteId = req.user.id;

        const appointment = await appointmentService.createAppointmentForClient(clienteId, servicoId, data);
        res.status(201).json({ status: 'success', data: { appointment } });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// Admin cria um agendamento para um cliente
exports.adminCreateAppointment = async (req, res) => {
    try {
        const { clienteId, servicoId, data } = req.body;
        const appointment = await appointmentService.createAppointmentByAdmin(clienteId, servicoId, data);
        res.status(201).json({ status: 'success', data: { appointment } });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// Cliente busca seus próprios agendamentos
exports.getMyAppointments = async (req, res) => {
    try {
        const appointments = await appointmentService.getAppointmentsForUser(req.user.id);
        res.status(200).json({ status: 'success', results: appointments.length, data: { appointments } });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: 'Erro ao buscar agendamentos.' });
    }
};

// Admin busca todos os agendamentos
exports.getAllAppointments = async (req, res) => {
    try {
        // const appointments = await appointmentService.getAllAppointments();
        // res.status(200).json(res.paginatedResults);
        res.status(200).json(res.paginatedResults);
    } catch (error) {
        res.status(500).json({ status: 'fail', message: 'Erro ao buscar agendamentos.' });
    }
};

// Admin atualiza o status de um agendamento
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const appointment = await appointmentService.updateAppointmentStatus(req.params.id, status);
        res.status(200).json({ status: 'success', data: { appointment } });
    } catch (error) {
        res.status(404).json({ status: 'fail', message: error.message });
    }
};

// Cliente cancela seu próprio agendamento
exports.cancelMyAppointment = async (req, res) => {
    try {
        const appointment = await appointmentService.cancelAppointmentByUser(req.params.id, req.user.id);
        res.status(200).json({ status: 'success', data: { appointment } });
    } catch (error) {
        res.status(403).json({ status: 'fail', message: error.message });
    }
};