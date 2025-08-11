// File: src/api/models/Appointment.js
const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    cliente: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', // Referência ao modelo User
        required: [true, 'O cliente é obrigatório.']
    },
    servico: {
        type: mongoose.Schema.ObjectId,
        ref: 'Service', // Referência ao modelo Service
        required: [true, 'O serviço é obrigatório.']
    },
    data: {
        type: Date,
        required: [true, 'A data e hora do agendamento são obrigatórias.']
    },
    status: {
        type: String,
        enum: ['pendente', 'confirmado', 'cancelado', 'concluido'],
        default: 'pendente'
    },
    notas: { // Campo opcional para o cliente adicionar alguma observação
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Appointment', AppointmentSchema);