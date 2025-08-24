const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    valor: {
        type: Number,
        required: [true, 'O valor da transação é obrigatório.']
        // O valor agora pode ser positivo ou negativo
    },
    descricao: {
        type: String,
        required: [true, 'A descrição da transação é obrigatória.']
    },
    tipo: {
        type: String,
        enum: ['online', 'presencial'],
        required: true
    },
    agendamento: {
        type: mongoose.Schema.ObjectId,
        ref: 'Appointment'
    },
    cliente: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Transaction', TransactionSchema);