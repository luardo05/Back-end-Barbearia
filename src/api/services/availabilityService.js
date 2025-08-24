const Availability = require('../models/Availability');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');

/**
 * Busca a configuração de disponibilidade para uma data específica.
 * Se nenhuma configuração personalizada existir, retorna um padrão com base no dia da semana.
 * @param {string} dateString - A data no formato "YYYY-MM-DD".
 */
exports.getAvailabilityForDate = async (dateString) => {
    // --- CORREÇÃO APLICADA ---
    // Criamos a data como UTC para evitar problemas de fuso horário.
    // '2025-08-05' vira '2025-08-05T00:00:00.000Z'.
    const searchDate = new Date(`${dateString}T00:00:00.000Z`);

    let availability = await Availability.findOne({ date: searchDate });

    // Se não houver configuração específica salva, geramos um padrão dinamicamente.
    if (!availability) {
        const dayOfWeek = searchDate.getUTCDay(); // Usamos getUTCDay() que retorna 0(Dom)-6(Sáb) em UTC.
        
        // Regra padrão: Indisponível no Domingo (0)
        if (dayOfWeek === 0) {
            return {
                date: searchDate,
                status: 'indisponivel',
                slots: []
            };
        } else { // Regra padrão: Disponível nos outros dias
            return {
                date: searchDate,
                status: 'disponivel',
                slots: [
                    { start: '09:00', end: '12:00' },
                    { start: '14:00', end: '18:00' }
                ]
            };
        }
    }
    
    return availability;
};

/**
 * Salva ou atualiza a configuração de disponibilidade para um dia.
 * @param {object} availabilityData - Os dados a serem salvos.
 */
exports.setAvailability = async (availabilityData) => {
    const { date, status, slots } = availabilityData;
    const searchDate = new Date(`${date}T00:00:00.000Z`);

    return await Availability.findOneAndUpdate(
        { date: searchDate },
        { status, slots, date: searchDate },
        { new: true, upsert: true, runValidators: true }
    );
};

/**
 * Busca todas as configurações de disponibilidade salvas para um mês/ano.
 * @param {number} year - O ano.
 * @param {number} month - O mês (1-12).
 */
exports.getAvailabilityForMonth = async (year, month) => {
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1));
    endDate.setUTCMilliseconds(endDate.getUTCMilliseconds() - 1);

    // 1. Busca todas as regras PERSONALIZADAS salvas para o mês.
    const customRules = await Availability.find({
        date: { $gte: startDate, $lte: endDate }
    });

    // Converte para um mapa para busca rápida (DateString -> Rule)
    const rulesMap = new Map(customRules.map(rule => [rule.date.toISOString().split('T')[0], rule]));

    // 2. Itera por todos os dias do mês e constrói a resposta final.
    const finalMonthAvailability = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(Date.UTC(year, month - 1, day));
        const dateString = currentDate.toISOString().split('T')[0];
        
        // 3. Verifica se existe uma regra personalizada para este dia.
        if (rulesMap.has(dateString)) {
            // Se sim, usa a regra salva.
            finalMonthAvailability.push(rulesMap.get(dateString));
        } else {
            // Se não, aplica a regra PADRÃO do backend.
            const dayOfWeek = currentDate.getUTCDay();
            const defaultStatus = (dayOfWeek === 0) ? 'indisponivel' : 'disponivel';
            finalMonthAvailability.push({
                date: currentDate,
                status: defaultStatus,
                // Adicionamos slots padrão se estiver disponível, para consistência
                slots: defaultStatus === 'disponivel' ? [{ start: '09:00', end: '18:00' }] : []
            });
        }
    }

    return finalMonthAvailability;
};

exports.getAvailableSlotsForDay = async (dateString, serviceId) => {
    if (!dateString || !serviceId) {
        throw new Error('Data e ID do serviço são obrigatórios.');
    }

    const service = await Service.findById(serviceId);
    if (!service) {
        throw new Error('Serviço não encontrado.');
    }
    const serviceDuration = service.duracaoEmMinutos;

    // A função agora chama a si mesma (exports) para buscar a configuração do dia
    const dayConfig = await exports.getAvailabilityForDate(dateString);

    if (dayConfig.status === 'indisponivel' || !dayConfig.slots || dayConfig.slots.length === 0) {
        return [];
    }

    const day = new Date(`${dateString}T00:00:00.000Z`);
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);

    const appointmentsOnDay = await Appointment.find({
        data: { $gte: day, $lt: nextDay },
        status: { $in: ['pendente', 'confirmado'] }
    }).populate('servico', 'duracaoEmMinutos');

    const bookedSlots = appointmentsOnDay.map(app => {
        const startTime = new Date(app.data);
        const endTime = new Date(startTime.getTime() + (app.servico.duracaoEmMinutos || 60) * 60000);
        return { start: startTime, end: endTime };
    });

    const slotInterval = 30;
    const allPossibleSlots = [];

    dayConfig.slots.forEach(interval => {
        const [startHour, startMinute] = interval.start.split(':').map(Number);
        const [endHour, endMinute] = interval.end.split(':').map(Number);

        let slotTime = new Date(`${dateString}T00:00:00.000Z`);
        slotTime.setUTCHours(startHour, startMinute);

        let endBlockTime = new Date(`${dateString}T00:00:00.000Z`);
        endBlockTime.setUTCHours(endHour, endMinute);

        while (new Date(slotTime.getTime() + serviceDuration * 60000) <= endBlockTime) {
            allPossibleSlots.push(new Date(slotTime));
            slotTime.setMinutes(slotTime.getMinutes() + slotInterval);
        }
    });

    const availableSlots = allPossibleSlots.filter(candidateSlot => {
        const candidateEndTime = new Date(candidateSlot.getTime() + serviceDuration * 60000);
        return !bookedSlots.some(bookedSlot =>
            (candidateSlot < bookedSlot.end) && (candidateEndTime > bookedSlot.start)
        );
    });
    
    return availableSlots.map(slot =>
        slot.toLocaleTimeString('pt-BR', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' })
    );
};