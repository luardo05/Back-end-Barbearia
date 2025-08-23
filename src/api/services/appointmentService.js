const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const notificationService = require('./notificationService');// Usaremos para notificar o ADM
const { getIO } = require('../../socketManager');

// Lógica para criar um agendamento
const bookAppointment = async (clienteId, servicoId, data) => {
    // 1. Obter a duração do serviço para calcular o horário final
    const service = await Service.findById(servicoId);
    if (!service) {
        throw new Error('Serviço não encontrado.');
    }

    const startTime = new Date(data);
    const endTime = new Date(startTime.getTime() + service.duracaoEmMinutos * 60000);

    // 2. Verificar se já existe um agendamento conflitante
    const existingAppointment = await Appointment.findOne({
        data: {
            $lt: endTime, // Menor que o horário de término do novo agendamento
            $gte: startTime // Maior ou igual ao horário de início do novo agendamento
        },
        status: { $in: ['pendente', 'confirmado'] } // Apenas conflita com agendamentos ativos
    });

    if (existingAppointment) {
        throw new Error('Este horário já está ocupado. Por favor, escolha outro.');
    }

    // 3. Se não houver conflito, criar o agendamento
    const newAppointment = await Appointment.create({
        cliente: clienteId,
        servico: servicoId,
        data: startTime,
    });

    // EMISSÃO DO EVENTO SOCKET.IO
    const io = getIO();
    const clientUser = await User.findById(clienteId).select('nome');
    // Emitimos o evento para a sala 'admins'
    io.to('admins').emit('new_appointment', {
        message: `Novo agendamento de ${clientUser.nome} para ${service.nome}.`,
        appointment: newAppointment
    });

    return newAppointment;
};

// Exporta a função para o CLIENTE logado usar
exports.createAppointmentForClient = async (clienteId, servicoId, data) => {
    return bookAppointment(clienteId, servicoId, data);
};

// Exporta a função para o ADMIN usar (Feedback #3)
exports.createAppointmentByAdmin = async (clienteId, servicoId, data) => {
    return bookAppointment(clienteId, servicoId, data);
};

// Busca os agendamentos de um cliente específico
exports.getAppointmentsForUser = async (userId) => {
    return await Appointment.find({ cliente: userId }).populate('servico');
};

// Busca TODOS os agendamentos (para o admin)
exports.getAllAppointments = async () => {
    return await Appointment.find().populate('cliente', 'nome').populate('servico');
};

// Atualiza o status de um agendamento (admin)
exports.updateAppointmentStatus = async (appointmentId, status) => {
    const appointment = await Appointment.findByIdAndUpdate(appointmentId, { status }, { new: true });
    if (!appointment) {
        throw new Error('Agendamento não encontrado.');
    }

    // EMISSÃO DO EVENTO SOCKET.IO
    const io = getIO();
    const clientId = appointment.cliente.toString();
    // Emitimos o evento para a sala privada do cliente
    io.to(clientId).emit('status_update', {
        message: `O status do seu agendamento foi atualizado para: ${status}`,
        appointment: appointment
    });

    return appointment;
};

// Cancela um agendamento (cliente)
exports.cancelAppointmentByUser = async (appointmentId, userId) => {
    const appointment = await Appointment.findOne({ _id: appointmentId, cliente: userId });

    if (!appointment) {
        throw new Error('Agendamento não encontrado ou você não tem permissão para cancelá-lo.');
    }

    if (appointment.status !== 'pendente' && appointment.status !== 'confirmado') {
        throw new Error('Este agendamento não pode mais ser cancelado.');
    }

    appointment.status = 'cancelado';
    await appointment.save();
    return appointment;
};