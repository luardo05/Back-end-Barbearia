const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema({
    // A data específica, com a hora zerada, para representar o dia inteiro.
    // Usaremos um índice para otimizar as buscas por data.
    date: {
        type: Date,
        required: true,
        unique: true, // Só pode haver uma configuração de disponibilidade por dia.
        index: true
    },
    // O status geral do dia.
    status: {
        type: String,
        enum: ['disponivel', 'indisponivel'],
        required: true,
        default: 'disponivel'
    },
    // Um array de intervalos de tempo em que o trabalho é realizado.
    // Ex: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }]
    slots: [{
        start: { type: String, required: true },
        end: { type: String, required: true },
        _id: false // Não precisa de ID para cada slot
    }]
});

module.exports = mongoose.model('Availability', AvailabilitySchema);