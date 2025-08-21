const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const Notification = require('../models/Notification'); // Usaremos para notificar o ADM

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

    // 4. (Opcional, mas recomendado) Criar uma notificação para o admin
    // Esta lógica pode ser mais complexa (ex: buscar todos os admins)
    // Por agora, vamos assumir que temos um ID de admin fixo ou uma lógica para encontrá-lo
    // await Notification.create({ destinatario: 'ID_DO_ADMIN', mensagem: 'Novo agendamento recebido.' });

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
    // Aqui também poderíamos criar uma notificação para o cliente sobre a mudança de status
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