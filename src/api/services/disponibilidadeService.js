const Appointment = require('../models/Appointment');
const Service = require('../models/Service');

exports.getAvailableSlotsForDay = async (dateString) => {
    const day = new Date(dateString);
    day.setHours(0, 0, 0, 0); // Zera a hora para o início do dia

    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1); // Pega o dia seguinte para o intervalo

    // 1. Busca todos os agendamentos para o dia selecionado
    const appointmentsOnDay = await Appointment.find({
        data: { $gte: day, $lt: nextDay },
        status: { $in: ['pendente', 'confirmado'] }
    }).populate('servico');

    // 2. Mapeia os horários já ocupados
    const bookedSlots = appointmentsOnDay.map(app => {
        const startTime = new Date(app.data);
        const endTime = new Date(startTime.getTime() + app.servico.duracaoEmMinutos * 60000);
        return { start: startTime, end: endTime };
    });

    // 3. Define o horário de trabalho e o intervalo dos slots (ex: 30 min)
    const openingHour = 9;
    const closingHour = 18;
    const slotInterval = 30; // em minutos
    const allPossibleSlots = [];

    let currentSlotTime = new Date(day);
    currentSlotTime.setHours(openingHour, 0, 0, 0);

    while (currentSlotTime.getHours() < closingHour) {
        allPossibleSlots.push(new Date(currentSlotTime));
        currentSlotTime.setMinutes(currentSlotTime.getMinutes() + slotInterval);
    }

    // 4. Filtra os slots possíveis, removendo os que conflitam com os já agendados
    const availableSlots = allPossibleSlots.filter(slot => {
        const slotEnd = new Date(slot.getTime() + slotInterval * 60000);
        
        // Verifica se o slot está livre
        return !bookedSlots.some(booked => 
            (slot < booked.end) && (slotEnd > booked.start)
        );
    });

    // 5. Formata os slots para retornar apenas a hora (ex: "09:30")
    return availableSlots.map(slot => 
        slot.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    );
};