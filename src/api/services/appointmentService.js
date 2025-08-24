const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const Notification = require('../models/Notification');
const notificationService = require('./notificationService');// Usaremos para notificar o ADM
const { getIO } = require('../../socketManager');

const Transaction = require('../models/Transaction'); // <-- Importa o modelo Transaction
const serviceService = require('./serviceService'); // <-- Importa o serviceService para usar a função de preço

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

    // --- LÓGICA DE NOTIFICAÇÃO PARA ADMINS ---
    const clientUser = await User.findById(clienteId).select('nome');
    const clientName = clientUser ? clientUser.nome : 'Um cliente';
    const messageForAdmin = `Novo agendamento recebido de ${clientName} para o serviço "${service.nome}".`;

    // 4.1 Persiste a notificação no banco de dados para os admins
    await notificationService.createNotificationForAdmins(messageForAdmin);
    
    // 4.2 Emite o evento de socket para os admins online
    const io = getIO();
    io.to('admins').emit('new_appointment', {
        message: messageForAdmin,
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
    return await Appointment.find().populate('cliente', 'nome').populate('servico').sort({ data: -1 });;
};

// Atualiza o status de um agendamento (admin)
exports.updateAppointmentStatus = async (appointmentId, status) => {
    // 1. Buscamos o agendamento ANTES de qualquer alteração
    const appointment = await Appointment.findById(appointmentId).populate('servico').populate('cliente');
    if (!appointment) {
        throw new Error('Agendamento não encontrado.');
    }

    const oldStatus = appointment.status; // <-- Guardamos o status antigo
    const newStatus = status;

    // Se o status não mudou, não faz nada
    if (oldStatus === newStatus) {
        return appointment;
    }

    // 2. Atualiza o status
    appointment.status = newStatus;
    await appointment.save();

    // 3. --- LÓGICA FINANCEIRA DE TRANSAÇÕES ---
    const precoFinal = await serviceService.getPrecoParaData(appointment.servico._id, appointment.data);

    // CASO 1: Agendamento se tornou CONCLUÍDO
    // Cria uma transação positiva (crédito)
    if (newStatus === 'concluido') {
        await Transaction.create({
            valor: precoFinal,
            descricao: `Conclusão do serviço: ${appointment.servico.nome}`,
            tipo: 'online',
            agendamento: appointment._id,
            cliente: appointment.cliente._id
        });
    }

    // CASO 2: Agendamento ERA concluído e foi alterado (ESTORNO)
    // Cria uma transação negativa (débito) para anular a anterior
    if (oldStatus === 'concluido' && newStatus !== 'concluido') {
        await Transaction.create({
            valor: -precoFinal, // <-- Valor negativo
            descricao: `Estorno de serviço (${newStatus}): ${appointment.servico.nome}`,
            tipo: 'online',
            agendamento: appointment._id,
            cliente: appointment.cliente._id
        });
    }

    // --- LÓGICA DE NOTIFICAÇÃO (já existente) ---
    const clientId = appointment.cliente._id.toString();
    const message = `O status do seu agendamento foi atualizado para: ${status.toUpperCase()}`;
    await Notification.create({ destinatario: clientId, mensagem: message });
    const io = getIO();
    io.to(clientId).emit('status_update', { message: message, appointment: appointment });

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

    // BÔNUS: Notificar o admin sobre o cancelamento
    const clientUser = await User.findById(userId).select('nome');
    const messageForAdmin = `O cliente ${clientUser.nome} cancelou seu agendamento.`;
    await notificationService.createNotificationForAdmins(messageForAdmin);
    const io = getIO();
    io.to('admins').emit('appointment_cancelled', { message: messageForAdmin });
    
    return appointment;
};